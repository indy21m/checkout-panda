import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { productOffers, products } from '@/lib/db/schema'
import { eq, and, asc } from 'drizzle-orm'

const linkOfferSchema = z.object({
  productId: z.string().min(1),
  offerId: z.string().min(1),
  role: z.enum(['upsell', 'downsell', 'bump']),
  position: z.number().int().positive().optional(),
  enabled: z.boolean().optional(),
})

const unlinkOfferSchema = z.object({
  productId: z.string().min(1),
  offerId: z.string().min(1),
  role: z.enum(['upsell', 'downsell', 'bump']),
})

const updateOfferLinkSchema = z.object({
  id: z.string().uuid(),
  position: z.number().int().positive().optional(),
  enabled: z.boolean().optional(),
})

/**
 * GET /api/admin/product-offers
 * Get all offer links for a product
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    const offers = await db.query.productOffers.findMany({
      where: eq(productOffers.productId, productId),
      orderBy: [asc(productOffers.position)],
      with: {
        offer: true,
      },
    })

    return NextResponse.json({
      offers: offers.map((link) => ({
        id: link.id,
        offerId: link.offerId,
        offerName: link.offer?.name ?? 'Unknown',
        offerSlug: link.offer?.slug ?? '',
        offerType: link.offer?.type ?? 'upsell',
        role: link.role,
        position: link.position,
        enabled: link.enabled,
        config: link.offer?.config,
        stripeSyncStatus: link.offer?.stripeSyncStatus,
      })),
    })
  } catch (error) {
    console.error('Failed to fetch product offers:', error)
    return NextResponse.json({ error: 'Failed to fetch product offers' }, { status: 500 })
  }
}

/**
 * POST /api/admin/product-offers
 * Link an offer to a product
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const data = linkOfferSchema.parse(body)

    // Verify both products exist
    const [mainProduct, offerProduct] = await Promise.all([
      db.query.products.findFirst({ where: eq(products.id, data.productId) }),
      db.query.products.findFirst({ where: eq(products.id, data.offerId) }),
    ])

    if (!mainProduct) {
      return NextResponse.json({ error: 'Main product not found' }, { status: 404 })
    }

    if (!offerProduct) {
      return NextResponse.json({ error: 'Offer product not found' }, { status: 404 })
    }

    // Validate product types
    if (mainProduct.type !== 'main') {
      return NextResponse.json({ error: 'Can only link offers to main products' }, { status: 400 })
    }

    const validOfferTypes = {
      upsell: ['upsell'],
      downsell: ['downsell'],
      bump: ['bump'],
    }

    if (!validOfferTypes[data.role].includes(offerProduct.type)) {
      return NextResponse.json(
        { error: `Offer product type (${offerProduct.type}) does not match role (${data.role})` },
        { status: 400 }
      )
    }

    // Get the next position if not specified
    let position = data.position
    if (!position) {
      const existingOffers = await db.query.productOffers.findMany({
        where: and(eq(productOffers.productId, data.productId), eq(productOffers.role, data.role)),
      })
      position = existingOffers.length + 1
    }

    // For downsell and bump, ensure only one can be linked
    if (data.role === 'downsell' || data.role === 'bump') {
      const existing = await db.query.productOffers.findFirst({
        where: and(eq(productOffers.productId, data.productId), eq(productOffers.role, data.role)),
        with: {
          offer: true,
        },
      })

      if (existing) {
        // Check if the linked offer product still exists
        if (!existing.offer) {
          // Orphaned link - the offer product was deleted, clean it up
          await db.delete(productOffers).where(eq(productOffers.id, existing.id))
        } else {
          return NextResponse.json(
            { error: `A ${data.role} is already linked to this product. Unlink it first.` },
            { status: 400 }
          )
        }
      }
    }

    const newLink = await db
      .insert(productOffers)
      .values({
        productId: data.productId,
        offerId: data.offerId,
        role: data.role,
        position,
        enabled: data.enabled ?? true,
      })
      .returning()

    return NextResponse.json({ offer: newLink[0] }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    // Handle unique constraint violation
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'This offer is already linked to the product with this role' },
        { status: 400 }
      )
    }

    console.error('Failed to link offer:', error)
    return NextResponse.json({ error: 'Failed to link offer' }, { status: 500 })
  }
}

/**
 * PUT /api/admin/product-offers
 * Update an offer link (position, enabled)
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const data = updateOfferLinkSchema.parse(body)

    const updateData: Partial<{ position: number; enabled: boolean }> = {}
    if (data.position !== undefined) updateData.position = data.position
    if (data.enabled !== undefined) updateData.enabled = data.enabled

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const updated = await db
      .update(productOffers)
      .set(updateData)
      .where(eq(productOffers.id, data.id))
      .returning()

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Offer link not found' }, { status: 404 })
    }

    return NextResponse.json({ offer: updated[0] })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Failed to update offer link:', error)
    return NextResponse.json({ error: 'Failed to update offer link' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/product-offers
 * Unlink an offer from a product
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const data = unlinkOfferSchema.parse(body)

    const deleted = await db
      .delete(productOffers)
      .where(
        and(
          eq(productOffers.productId, data.productId),
          eq(productOffers.offerId, data.offerId),
          eq(productOffers.role, data.role)
        )
      )
      .returning()

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Offer link not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Failed to unlink offer:', error)
    return NextResponse.json({ error: 'Failed to unlink offer' }, { status: 500 })
  }
}
