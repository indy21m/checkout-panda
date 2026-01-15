import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import type Stripe from 'stripe'
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
  priceTierId: z.string().optional(),
})

/**
 * Detects placeholder Stripe IDs that haven't been replaced with real ones.
 * Real Stripe IDs follow specific patterns:
 * - price_XXXXXXXXXXXXXX (14+ alphanumeric chars after underscore)
 * - prod_XXXXXXXXXXXXXX
 */
function isPlaceholderStripeId(id: string): boolean {
  // Real Stripe IDs have at least 14 characters after the prefix
  // and only contain alphanumeric characters
  const realPricePattern = /^price_[A-Za-z0-9]{14,}$/
  const realProdPattern = /^prod_[A-Za-z0-9]{14,}$/

  if (id.startsWith('price_') && !realPricePattern.test(id)) {
    return true // It's a placeholder like 'price_3month_266dkk'
  }
  if (id.startsWith('prod_') && !realProdPattern.test(id)) {
    return true // It's a placeholder like 'prod_InvestingDK'
  }

  return false
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const data = requestSchema.parse(body)

    // Get product configuration
    const product = getProduct(data.productSlug)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Determine which price to use based on selected tier
    let selectedPrice: { priceId: string; priceAmount: number }
    let isInstallmentPlan = false
    let installmentDetails: { count: number; amountPerPayment: number } | undefined

    if (data.priceTierId && product.stripe.pricingTiers) {
      const selectedTier = product.stripe.pricingTiers.find((tier) => tier.id === data.priceTierId)
      if (selectedTier) {
        selectedPrice = {
          priceId: selectedTier.priceId,
          priceAmount: selectedTier.priceAmount,
        }
        if (selectedTier.installments) {
          isInstallmentPlan = true
          installmentDetails = {
            count: selectedTier.installments.count,
            amountPerPayment: selectedTier.installments.amountPerPayment,
          }
        }
      } else {
        // Fallback to default
        selectedPrice = {
          priceId: product.stripe.priceId,
          priceAmount: product.stripe.priceAmount,
        }
      }
    } else {
      // No tier selected, use default
      selectedPrice = {
        priceId: product.stripe.priceId,
        priceAmount: product.stripe.priceAmount,
      }
    }

    // Calculate base amount
    let subtotal = selectedPrice.priceAmount
    const items: Array<{ name: string; amount: number }> = [
      {
        name: isInstallmentPlan
          ? `${product.name} (${installmentDetails!.count} payments)`
          : product.name,
        amount: selectedPrice.priceAmount,
      },
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

    // Branch: Create Subscription for installments, PaymentIntent for one-time
    let clientSecret: string
    let paymentIntentId: string

    if (isInstallmentPlan && installmentDetails) {
      // For installment plans: Create Stripe Subscription

      // IMPORTANT: Check for placeholder price IDs before attempting Stripe API call
      if (isPlaceholderStripeId(selectedPrice.priceId)) {
        return NextResponse.json(
          {
            error:
              'Installment payments are not yet configured. Please use the one-time payment option, or contact support.',
            details:
              'The recurring price ID needs to be set up in Stripe Dashboard and configured in the product settings.',
          },
          { status: 400 }
        )
      }

      // If order bump is included, add it as a one-time invoice item on first payment
      if (data.includeOrderBump && product.orderBump?.enabled) {
        await stripe.invoiceItems.create({
          customer: customerId,
          amount: product.orderBump.stripe.priceAmount,
          currency: product.stripe.currency.toLowerCase(),
          description: product.orderBump.title,
        })
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: selectedPrice.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          productSlug: data.productSlug,
          productId: product.stripe.productId,
          productName: product.name,
          priceId: selectedPrice.priceId,
          priceTierId: data.priceTierId || '',
          isInstallmentPlan: 'true',
          installmentCount: String(installmentDetails.count),
          paymentsProcessed: '0',
          autoCancel: 'true', // Flag for webhook to auto-cancel after final payment
          email: data.email,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          country: data.country,
          vatNumber: data.vatNumber || '',
          couponCode: data.couponCode || '',
          couponId: couponId || '',
          includeOrderBump: String(data.includeOrderBump),
        },
      })

      const invoice = subscription.latest_invoice as unknown as {
        payment_intent: Stripe.PaymentIntent
      }
      const paymentIntent = invoice.payment_intent

      clientSecret = paymentIntent.client_secret || ''
      paymentIntentId = paymentIntent.id
    } else {
      // For one-time payments: Create PaymentIntent (existing logic)
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
          priceId: selectedPrice.priceId,
          priceTierId: data.priceTierId || '',
          isInstallmentPlan: 'false',
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

      clientSecret = paymentIntent.client_secret || ''
      paymentIntentId = paymentIntent.id
    }

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
      clientSecret,
      customerId,
      paymentIntentId,
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
