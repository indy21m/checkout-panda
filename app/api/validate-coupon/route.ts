import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe/config'
import { getProduct } from '@/config/products'
import type { ValidateCouponResponse } from '@/types'

const requestSchema = z.object({
  code: z.string().min(1),
  productSlug: z.string().min(1),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const data = requestSchema.parse(body)

    // Verify product exists
    const product = getProduct(data.productSlug)
    if (!product) {
      return NextResponse.json(
        { valid: false, error: 'Product not found' } satisfies ValidateCouponResponse,
        { status: 404 }
      )
    }

    try {
      // Retrieve coupon from Stripe
      const coupon = await stripe.coupons.retrieve(data.code.toUpperCase())

      // Check if coupon is valid
      if (!coupon.valid) {
        return NextResponse.json({
          valid: false,
          error: 'This coupon has expired',
        } satisfies ValidateCouponResponse)
      }

      // Check redemption limits
      if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
        return NextResponse.json({
          valid: false,
          error: 'This coupon has reached its maximum redemptions',
        } satisfies ValidateCouponResponse)
      }

      // Check if coupon has expired
      if (coupon.redeem_by && coupon.redeem_by * 1000 < Date.now()) {
        return NextResponse.json({
          valid: false,
          error: 'This coupon has expired',
        } satisfies ValidateCouponResponse)
      }

      // Coupon is valid
      const response: ValidateCouponResponse = {
        valid: true,
        couponId: coupon.id,
        discountType: coupon.percent_off ? 'percent' : 'fixed',
        discountAmount: coupon.percent_off || coupon.amount_off || 0,
        name: coupon.name || undefined,
      }

      return NextResponse.json(response)
    } catch {
      // Coupon not found in Stripe
      return NextResponse.json({
        valid: false,
        error: 'Invalid coupon code',
      } satisfies ValidateCouponResponse)
    }
  } catch (error) {
    console.error('Validate coupon error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { valid: false, error: 'Invalid request data' } satisfies ValidateCouponResponse,
        { status: 400 }
      )
    }

    return NextResponse.json(
      { valid: false, error: 'Failed to validate coupon' } satisfies ValidateCouponResponse,
      { status: 500 }
    )
  }
}
