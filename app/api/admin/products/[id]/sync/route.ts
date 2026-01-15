import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, stripePrices, type ProductConfig } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getStripe } from '@/lib/stripe/config'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params

  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, id),
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Mark as syncing
    await db.update(products)
      .set({ stripeSyncStatus: 'pending' })
      .where(eq(products.id, id))

    // Sync to Stripe
    await syncProductToStripe(id, product.name, product.config)

    // Update sync status
    await db.update(products)
      .set({
        stripeSyncStatus: 'synced',
        stripeSyncedAt: new Date(),
      })
      .where(eq(products.id, id))

    // Fetch updated product
    const updated = await db.query.products.findFirst({
      where: eq(products.id, id),
    })

    return NextResponse.json({ product: updated, synced: true })
  } catch (error) {
    console.error('Stripe sync failed:', error)

    // Update sync status to error
    await db.update(products)
      .set({ stripeSyncStatus: 'error' })
      .where(eq(products.id, id))

    return NextResponse.json(
      {
        error: 'Stripe sync failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
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
    await db.update(products)
      .set({ stripeProductId })
      .where(eq(products.id, productId))
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
      await db.insert(stripePrices)
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
  const defaultTier = updatedTiers.find(t => t.isDefault) ?? updatedTiers[0]
  const updatedConfig: ProductConfig = {
    ...config,
    stripe: {
      ...config.stripe,
      productId: stripeProductId,
      priceId: defaultTier?.priceId ?? null,
      pricingTiers: updatedTiers,
    },
  }

  await db.update(products)
    .set({ config: updatedConfig })
    .where(eq(products.id, productId))
}
