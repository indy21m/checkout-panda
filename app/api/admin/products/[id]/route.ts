import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { products, stripePrices, type ProductConfig } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getStripe } from '@/lib/stripe/config'

// Flexible schema that accepts both main products and offer products (bump/upsell/downsell)
// Uses .passthrough() to allow any additional config fields beyond stripe
const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  config: z
    .object({
      stripe: z.object({
        productId: z.string().nullable(),
        priceId: z.string().nullable(),
        priceAmount: z.number().positive(),
        currency: z.enum(['USD', 'EUR', 'DKK']),
        pricingTiers: z
          .array(
            z.object({
              id: z.string(),
              label: z.string(),
              priceId: z.string().nullable(),
              priceAmount: z.number().positive(),
              originalPrice: z.number().optional(),
              isDefault: z.boolean().optional(),
              description: z.string().optional(),
              installments: z
                .object({
                  count: z.number().positive(),
                  intervalLabel: z.string(),
                  amountPerPayment: z.number().positive(),
                })
                .optional(),
            })
          )
          .optional(),
      }),
    })
    .passthrough() // Allow any additional fields (checkout, thankYou for main; title, description for offers)
    .optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params

  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params

  try {
    const body = await request.json()
    const data = updateProductSchema.parse(body)

    // Fetch existing product
    const existing = await db.query.products.findFirst({
      where: eq(products.id, id),
    })

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Merge config with existing
    const updatedConfig = data.config ? { ...existing.config, ...data.config } : existing.config

    // Update product in database
    const updated = await db
      .update(products)
      .set({
        name: data.name ?? existing.name,
        slug: data.slug ?? existing.slug,
        config: updatedConfig as ProductConfig,
        updatedAt: new Date(),
        stripeSyncStatus: 'pending', // Mark as needing sync
      })
      .where(eq(products.id, id))
      .returning()

    // Auto-sync to Stripe
    try {
      await syncProductToStripe(id, data.name ?? existing.name, updatedConfig as ProductConfig)

      // Update sync status to synced
      await db
        .update(products)
        .set({
          stripeSyncStatus: 'synced',
          stripeSyncedAt: new Date(),
        })
        .where(eq(products.id, id))

      // Fetch updated product with new sync status
      const finalProduct = await db.query.products.findFirst({
        where: eq(products.id, id),
      })

      return NextResponse.json({ product: finalProduct, synced: true })
    } catch (syncError) {
      console.error('Stripe sync failed:', syncError)

      // Update sync status to error
      await db.update(products).set({ stripeSyncStatus: 'error' }).where(eq(products.id, id))

      return NextResponse.json({
        product: updated[0],
        synced: false,
        syncError: syncError instanceof Error ? syncError.message : 'Unknown sync error',
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Failed to update product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params

  try {
    // Soft delete by setting isActive to false
    const deleted = await db
      .update(products)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning()

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}

/**
 * Sync product and prices to Stripe
 */
async function syncProductToStripe(
  productId: string,
  productName: string,
  config: ProductConfig
): Promise<void> {
  const stripe = getStripe()

  // Get existing Stripe product ID from database
  const existingProduct = await db.query.products.findFirst({
    where: eq(products.id, productId),
  })

  let stripeProductId = existingProduct?.stripeProductId

  // Create or update Stripe product
  if (stripeProductId) {
    await stripe.products.update(stripeProductId, {
      name: productName,
      metadata: { checkoutPandaId: productId },
    })
  } else {
    const stripeProduct = await stripe.products.create({
      name: productName,
      metadata: { checkoutPandaId: productId },
    })
    stripeProductId = stripeProduct.id

    // Save Stripe product ID
    await db.update(products).set({ stripeProductId }).where(eq(products.id, productId))
  }

  // Sync pricing tiers
  const tiers = config.stripe.pricingTiers ?? []
  const updatedTiers = []

  for (const tier of tiers) {
    // Check if we already have a price for this tier
    const existingPrice = await db.query.stripePrices.findFirst({
      where: eq(stripePrices.id, `${productId}:${tier.id}`),
    })

    let stripePriceId = existingPrice?.stripePriceId

    // If price amount changed or no price exists, create new Stripe price
    if (!stripePriceId || existingPrice?.amount !== tier.priceAmount) {
      const priceParams: Parameters<typeof stripe.prices.create>[0] = {
        product: stripeProductId,
        unit_amount: tier.priceAmount,
        currency: config.stripe.currency.toLowerCase(),
        metadata: {
          checkoutPandaId: productId,
          tierId: tier.id,
        },
      }

      // Add recurring params for installment plans
      if (tier.installments) {
        priceParams.recurring = {
          interval: 'month',
          interval_count: 1,
        }
      }

      const stripePrice = await stripe.prices.create(priceParams)
      stripePriceId = stripePrice.id

      // Upsert price record
      await db
        .insert(stripePrices)
        .values({
          id: `${productId}:${tier.id}`,
          productId,
          tierId: tier.id,
          stripePriceId,
          amount: tier.priceAmount,
          currency: config.stripe.currency,
          isRecurring: !!tier.installments,
          recurringInterval: tier.installments ? 'month' : null,
          recurringCount: tier.installments?.count ?? null,
        })
        .onConflictDoUpdate({
          target: stripePrices.id,
          set: {
            stripePriceId,
            amount: tier.priceAmount,
            isRecurring: !!tier.installments,
            recurringCount: tier.installments?.count ?? null,
          },
        })
    }

    updatedTiers.push({
      ...tier,
      priceId: stripePriceId,
    })
  }

  // Update config with synced Stripe IDs
  const defaultTier = updatedTiers.find((t) => t.isDefault) ?? updatedTiers[0]
  const updatedConfig: ProductConfig = {
    ...config,
    stripe: {
      ...config.stripe,
      productId: stripeProductId,
      priceId: defaultTier?.priceId ?? null,
      pricingTiers: updatedTiers,
    },
  }

  await db.update(products).set({ config: updatedConfig }).where(eq(products.id, productId))
}
