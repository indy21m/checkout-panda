import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe/config'
import { getProductFromDb } from '@/config/products'
import type { ChargeUpsellResponse, StripeConfig } from '@/types'

const requestSchema = z.object({
  customerId: z.string().min(1),
  paymentMethodId: z.string().min(1),
  productSlug: z.string().min(1),
  upsellId: z.string().min(1), // Can be offer product ID, slug, 'upsell-1', 'upsell-2', or 'downsell'
})

/**
 * Try to find offer product directly from database (unified architecture)
 */
async function findOfferProductFromDb(offerId: string): Promise<{
  stripe: StripeConfig
  title: string
  type: 'upsell' | 'downsell' | 'bump'
} | null> {
  try {
    const { db } = await import('@/lib/db')
    const { products } = await import('@/lib/db/schema')
    const { eq, or } = await import('drizzle-orm')

    // Try to find offer product by ID or slug
    const offerProduct = await db.query.products.findFirst({
      where: or(eq(products.id, offerId), eq(products.slug, offerId)),
    })

    if (offerProduct && offerProduct.type !== 'main' && offerProduct.isActive) {
      return {
        stripe: {
          productId: offerProduct.config.stripe.productId ?? offerProduct.stripeProductId ?? '',
          priceId: offerProduct.config.stripe.priceId ?? '',
          priceAmount: offerProduct.config.stripe.priceAmount,
          currency: offerProduct.config.stripe.currency,
        },
        title: offerProduct.config.title ?? offerProduct.name,
        type: offerProduct.type as 'upsell' | 'downsell' | 'bump',
      }
    }
  } catch (error) {
    console.error('Error finding offer product from DB:', error)
  }
  return null
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const data = requestSchema.parse(body)

    // First, try to find the offer product directly (unified architecture)
    let offerConfig = await findOfferProductFromDb(data.upsellId)

    // If not found directly, get the main product and look in its assembled offers
    if (!offerConfig) {
      const product = await getProductFromDb(data.productSlug)
      if (!product) {
        return NextResponse.json(
          { success: false, error: 'Product not found' } satisfies ChargeUpsellResponse,
          { status: 404 }
        )
      }

      // Check upsells (these may be assembled from linked offer products)
      const upsell = product.upsells?.find(
        (u) => u.id === data.upsellId || u.slug === data.upsellId
      )
      if (upsell) {
        offerConfig = {
          stripe: upsell.stripe,
          title: upsell.title,
          type: 'upsell',
        }
      }

      // Check downsell
      if (!offerConfig && product.downsell?.enabled) {
        if (data.upsellId === 'downsell' || data.upsellId === product.downsell.slug) {
          offerConfig = {
            stripe: product.downsell.stripe,
            title: product.downsell.title,
            type: 'downsell',
          }
        }
      }
    }

    if (!offerConfig) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' } satisfies ChargeUpsellResponse,
        { status: 404 }
      )
    }

    // Create and immediately confirm payment intent with saved payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: offerConfig.stripe.priceAmount,
      currency: offerConfig.stripe.currency.toLowerCase(),
      customer: data.customerId,
      payment_method: data.paymentMethodId,
      off_session: true,
      confirm: true,
      metadata: {
        productSlug: data.productSlug,
        upsellId: data.upsellId,
        type: offerConfig.type,
        productId: offerConfig.stripe.productId,
        productName: offerConfig.title,
      },
    })

    if (paymentIntent.status === 'succeeded') {
      const response: ChargeUpsellResponse = {
        success: true,
        paymentIntentId: paymentIntent.id,
      }
      return NextResponse.json(response)
    }

    // Handle cases where payment requires additional action
    if (paymentIntent.status === 'requires_action') {
      const response: ChargeUpsellResponse = {
        success: false,
        error: 'Payment requires additional authentication',
        requiresAction: true,
      }
      return NextResponse.json(response, { status: 400 })
    }

    const response: ChargeUpsellResponse = {
      success: false,
      error: `Payment status: ${paymentIntent.status}`,
    }
    return NextResponse.json(response, { status: 400 })
  } catch (error) {
    console.error('Charge upsell error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' } satisfies ChargeUpsellResponse,
        { status: 400 }
      )
    }

    // Handle Stripe card errors
    if (error && typeof error === 'object' && 'type' in error) {
      const stripeError = error as { type: string; message?: string; code?: string }
      if (stripeError.type === 'StripeCardError') {
        return NextResponse.json({
          success: false,
          error: stripeError.message || 'Card was declined',
        } satisfies ChargeUpsellResponse)
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to process upsell payment' } satisfies ChargeUpsellResponse,
      { status: 500 }
    )
  }
}
