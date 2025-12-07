'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { StripeProvider } from './StripeProvider'
import { ProductCard } from './ProductCard'
import { PaymentSection } from './PaymentSection'
import { formatMoney } from '@/lib/currency'
import { DEFAULT_COUNTRY } from '@/lib/countries'
import { Star } from 'lucide-react'
import type { Product, PriceBreakdown } from '@/types'

interface CheckoutPageProps {
  product: Product
}

export function CheckoutPage({ product }: CheckoutPageProps) {
  const router = useRouter()

  // Checkout state
  const [includeOrderBump, setIncludeOrderBump] = useState(false)
  const [selectedPriceTierId, setSelectedPriceTierId] = useState<string>(
    product.stripe.pricingTiers?.find((tier) => tier.isDefault)?.id ||
      product.stripe.pricingTiers?.[0]?.id ||
      'default'
  )
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [breakdown, setBreakdown] = useState<PriceBreakdown | null>(null)
  const [couponCode, setCouponCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state - lifted here to survive Stripe Elements remount
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [country, setCountry] = useState(DEFAULT_COUNTRY)
  const [address, setAddress] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Get selected tier for amount calculation
  const selectedTier = product.stripe.pricingTiers?.find((t) => t.id === selectedPriceTierId)
  const baseAmount = selectedTier?.priceAmount ?? product.stripe.priceAmount
  const orderBumpAmount =
    includeOrderBump && product.orderBump?.enabled ? product.orderBump.stripe.priceAmount : 0
  const displayTotal = breakdown?.total ?? baseAmount + orderBumpAmount

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
            priceTierId: selectedPriceTierId,
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
    [product.slug, includeOrderBump, couponCode, selectedPriceTierId]
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

  // Handle pricing tier change - clear stale breakdown and client secret
  const handlePriceTierChange = useCallback((tierId: string) => {
    setSelectedPriceTierId(tierId)
    setBreakdown(null) // Clear stale breakdown so fallback calculation is used
    setClientSecret(null) // Clear client secret to prevent stale payment intent
  }, [])

  // Handle order bump change - clear stale breakdown and client secret
  const handleOrderBumpChange = useCallback((include: boolean) => {
    setIncludeOrderBump(include)
    setBreakdown(null)
    setClientSecret(null)
  }, [])

  // Handle coupon applied
  const handleCouponApplied = useCallback(
    (code: string, discountType: 'percent' | 'fixed', discountAmount: number) => {
      setCouponCode(code)
      // If payment already initialized, update the breakdown
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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Product Card & Testimonials */}
          <div className="space-y-6">
            {/* Product Card */}
            <ProductCard
              product={product}
              selectedPriceTierId={selectedPriceTierId}
              onPriceTierChange={handlePriceTierChange}
              onCouponApplied={handleCouponApplied}
              breakdown={breakdown}
              includeOrderBump={includeOrderBump}
              onOrderBumpChange={handleOrderBumpChange}
              couponCode={couponCode}
            />

            {/* Testimonials */}
            {(product.checkout.testimonials || product.checkout.testimonial) && (
              <div className="space-y-4">
                {product.checkout.testimonials
                  ? product.checkout.testimonials.map((testimonial, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                        {/* Star Rating */}
                        <div className="mb-3 flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-sm leading-relaxed text-gray-700">{testimonial.quote}</p>
                        <div className="mt-4 flex items-center gap-3">
                          {/* Avatar */}
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                            {testimonial.author
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {testimonial.author}
                          </span>
                        </div>
                      </div>
                    ))
                  : product.checkout.testimonial && (
                      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <p className="text-sm leading-relaxed text-gray-700">
                          {product.checkout.testimonial.quote}
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
                            {product.checkout.testimonial.author
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {product.checkout.testimonial.author}
                          </span>
                        </div>
                      </div>
                    )}
              </div>
            )}
          </div>

          {/* Right Column - Payment Section */}
          <div>
            <div className="sticky top-8">
              <StripeProvider
                clientSecret={clientSecret || undefined}
                amount={displayTotal}
                currency={product.stripe.currency}
              >
                <PaymentSection
                  product={product}
                  selectedPriceTierId={selectedPriceTierId}
                  includeOrderBump={includeOrderBump}
                  onInitializePayment={handleInitializePayment}
                  onPaymentSuccess={handlePaymentSuccess}
                  clientSecret={clientSecret}
                  breakdown={breakdown}
                  isLoading={isLoading}
                  error={error}
                  // Form state lifted to parent to survive Elements remount
                  email={email}
                  setEmail={setEmail}
                  fullName={fullName}
                  setFullName={setFullName}
                  country={country}
                  setCountry={setCountry}
                  address={address}
                  setAddress={setAddress}
                  agreedToTerms={agreedToTerms}
                  setAgreedToTerms={setAgreedToTerms}
                />
              </StripeProvider>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white px-4 py-3 shadow-lg lg:hidden">
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
              // Scroll to payment section
              document.getElementById('payment-section')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-bold text-white shadow-sm"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
