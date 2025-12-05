import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe/config'
import { getProduct } from '@/config/products'
import { calculateTax, validateVATFormat, isEUCountry } from '@/lib/vat'
import type { CreatePaymentIntentResponse, PriceBreakdown } from '@/types'

const requestSchema = z.object({
  productSlug: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  country: z.string().length(2).default('US'),
  vatNumber: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable(),
  includeOrderBump: z.boolean().default(false),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const data = requestSchema.parse(body)

    // Get product configuration
    const product = getProduct(data.productSlug)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Calculate base amount
    let subtotal = product.stripe.priceAmount
    const items: Array<{ name: string; amount: number }> = [
      { name: product.name, amount: product.stripe.priceAmount },
    ]

    // Add order bump if selected and enabled
    if (data.includeOrderBump && product.orderBump?.enabled) {
      subtotal += product.orderBump.stripe.priceAmount
      items.push({
        name: product.orderBump.title,
        amount: product.orderBump.stripe.priceAmount,
      })
    }

    // Validate and apply Stripe coupon
    let discount = 0
    let couponId: string | undefined

    if (data.couponCode) {
      try {
        const coupon = await stripe.coupons.retrieve(data.couponCode)
        if (coupon.valid) {
          couponId = coupon.id
          if (coupon.percent_off) {
            discount = Math.round(subtotal * (coupon.percent_off / 100))
          } else if (coupon.amount_off) {
            // Stripe amount_off is in the coupon's currency
            discount = Math.min(coupon.amount_off, subtotal)
          }
        }
      } catch {
        // Invalid coupon, continue without discount
        console.log(`Invalid coupon code: ${data.couponCode}`)
      }
    }

    const afterDiscount = subtotal - discount

    // Calculate tax (VAT for EU customers)
    const isB2B = data.vatNumber ? validateVATFormat(data.vatNumber) : false
    const isEU = isEUCountry(data.country)

    const taxCalc = calculateTax({
      amount: afterDiscount,
      customerCountry: data.country,
      vatNumber: data.vatNumber,
      isB2B,
      currency: product.stripe.currency,
    })

    const total = taxCalc.total

    // Create or retrieve Stripe customer
    let customerId: string

    const existingCustomers = await stripe.customers.list({
      email: data.email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0 && existingCustomers.data[0]) {
      customerId = existingCustomers.data[0].id
      // Update customer metadata if needed
      await stripe.customers.update(customerId, {
        name: [data.firstName, data.lastName].filter(Boolean).join(' ') || undefined,
        metadata: {
          country: data.country,
          vatNumber: data.vatNumber || '',
        },
      })
    } else {
      const customer = await stripe.customers.create({
        email: data.email,
        name: [data.firstName, data.lastName].filter(Boolean).join(' ') || undefined,
        metadata: {
          country: data.country,
          vatNumber: data.vatNumber || '',
        },
      })
      customerId = customer.id
    }

    // Create payment intent with setup_future_usage to save card for upsells
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: product.stripe.currency.toLowerCase(),
      customer: customerId,
      setup_future_usage: 'off_session', // Save card for one-click upsells
      automatic_payment_methods: { enabled: true },
      metadata: {
        productSlug: data.productSlug,
        productId: product.stripe.productId,
        productName: product.name,
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        country: data.country,
        vatNumber: data.vatNumber || '',
        couponCode: data.couponCode || '',
        couponId: couponId || '',
        includeOrderBump: String(data.includeOrderBump),
        subtotal: String(subtotal),
        discount: String(discount),
        tax: String(taxCalc.taxAmount),
        taxRate: String(taxCalc.taxRate),
        reverseCharge: String(taxCalc.reverseCharge),
        isEU: String(isEU),
      },
    })

    const breakdown: PriceBreakdown = {
      subtotal,
      discount,
      tax: taxCalc.taxAmount,
      taxRate: taxCalc.taxRate,
      total,
      currency: product.stripe.currency,
      reverseCharge: taxCalc.reverseCharge,
      taxLabel: taxCalc.taxLabel,
      items,
    }

    const response: CreatePaymentIntentResponse = {
      clientSecret: paymentIntent.client_secret || '',
      customerId,
      paymentIntentId: paymentIntent.id,
      breakdown,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Create payment intent error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 })
  }
}
