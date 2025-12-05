'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { StripeProvider } from './StripeProvider'
import { CheckoutForm } from './CheckoutForm'
import { ProductInfo } from './ProductInfo'
import { OrderSummary } from './OrderSummary'
import { Guarantee } from './Guarantee'
import { TrustBadges } from './TrustBadges'
import { Lock } from 'lucide-react'
import { formatMoney } from '@/lib/currency'
import type { Product, PriceBreakdown } from '@/types'

interface CheckoutPageProps {
  product: Product
}

export function CheckoutPage({ product }: CheckoutPageProps) {
  const router = useRouter()

  // Checkout state
  const [includeOrderBump, setIncludeOrderBump] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null)
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate display total
  const displayTotal = breakdown?.total ?? product.stripe.priceAmount

  // Initialize payment (called when email is entered)
  const handleInitializePayment = useCallback(
    async (email: string, firstName?: string, lastName?: string, country?: string) => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productSlug: product.slug,
            email,
            firstName,
            lastName,
            country: country || 'US',
            includeOrderBump,
            couponCode,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to initialize payment')
        }

        setClientSecret(data.clientSecret)
        setCustomerId(data.customerId)
        setBreakdown(data.breakdown)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Payment initialization failed')
      } finally {
        setIsLoading(false)
      }
    },
    [product.slug, includeOrderBump, couponCode]
  )

  // Handle successful payment
  const handlePaymentSuccess = useCallback(
    (paymentIntentId: string, paymentMethodId: string) => {
      // Redirect to upsell or thank you page
      const hasUpsells = product.upsells && product.upsells.length > 0

      if (hasUpsells && customerId) {
        // Pass credentials for one-click upsell
        const params = new URLSearchParams({
          customer_id: customerId,
          payment_method: paymentMethodId,
          purchases: includeOrderBump ? 'main,bump' : 'main',
        })
        router.push(`/${product.slug}/upsell-1?${params.toString()}`)
      } else {
        // Go directly to thank you
        const params = new URLSearchParams({
          payment_intent: paymentIntentId,
          purchases: includeOrderBump ? 'main,bump' : 'main',
        })
        router.push(`/${product.slug}/thank-you?${params.toString()}`)
      }
    },
    [product.slug, product.upsells, customerId, includeOrderBump, router]
  )

  // Handle coupon applied
  const handleCouponApplied = useCallback(
    (code: string, discountType: 'percent' | 'fixed', discountAmount: number) => {
      setCouponCode(code)
      // If payment already initialized, we need to recreate the payment intent
      // The form will handle this on next submit
      if (breakdown) {
        let newDiscount = 0
        if (discountType === 'percent') {
          newDiscount = Math.round(breakdown.subtotal * (discountAmount / 100))
        } else {
          newDiscount = Math.min(discountAmount, breakdown.subtotal)
        }
        setBreakdown({
          ...breakdown,
          discount: newDiscount,
          total: breakdown.subtotal - newDiscount + breakdown.tax,
        })
      }
    },
    [breakdown]
  )

  // Determine if there are upsells (for step indicator)
  const hasUpsells = product.upsells && product.upsells.length > 0
  const totalSteps = hasUpsells ? 2 : 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Secure Checkout</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-sm text-gray-500 sm:block">
                Step 1 of {totalSteps}
              </span>
              <TrustBadges variant="compact" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left Column - Product Info & Form */}
          <div className="space-y-8 lg:col-span-3">
            {/* Product Info */}
            <ProductInfo product={product} />

            {/* Checkout Form with Stripe */}
            <div id="checkout-form" className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
              <StripeProvider
                clientSecret={clientSecret || undefined}
                amount={displayTotal}
                currency={product.stripe.currency}
              >
                <CheckoutForm
                  product={product}
                  includeOrderBump={includeOrderBump}
                  onOrderBumpChange={setIncludeOrderBump}
                  onInitializePayment={handleInitializePayment}
                  onPaymentSuccess={handlePaymentSuccess}
                  onCouponApplied={handleCouponApplied}
                  clientSecret={clientSecret}
                  breakdown={breakdown}
                  isLoading={isLoading}
                  error={error}
                />
              </StripeProvider>
            </div>

            {/* Guarantee - positioned after payment form for trust */}
            {product.checkout.guarantee && (
              <Guarantee
                text={product.checkout.guarantee}
                days={product.checkout.guaranteeDays}
              />
            )}

            {/* Single Testimonial - only shown on checkout, brief */}
            {product.checkout.testimonial && (
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-sm italic text-gray-600">
                  &ldquo;{product.checkout.testimonial.quote}&rdquo;
                </p>
                <p className="mt-2 text-xs font-medium text-gray-900">
                  — {product.checkout.testimonial.author}
                  {product.checkout.testimonial.role && (
                    <span className="text-gray-500">, {product.checkout.testimonial.role}</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <OrderSummary
                product={product}
                includeOrderBump={includeOrderBump}
                breakdown={breakdown}
                couponCode={couponCode}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6 pb-24 lg:pb-6">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <TrustBadges variant="full" />
          <p className="mt-4 text-xs text-gray-500">
            Your payment is secured by Stripe. We never store your card details.
          </p>
        </div>
      </footer>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-3 shadow-lg lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm">
            <span className="text-gray-500">Total:</span>{' '}
            <span className="text-lg font-bold text-gray-900">
              {formatMoney(displayTotal, product.stripe.currency)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              // Scroll to payment form
              document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-sm font-bold text-white shadow-lg"
          >
            Complete Purchase
          </button>
        </div>
      </div>
    </div>
  )
}
