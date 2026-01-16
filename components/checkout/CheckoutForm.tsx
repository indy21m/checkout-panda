'use client'

import { useState, useCallback } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import type { StripePaymentElementOptions } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries'
import { OrderBump } from './OrderBump'
import { CouponInput } from './CouponInput'
import { Loader2, CreditCard, ChevronRight, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/currency'
import type { Product, PriceBreakdown } from '@/types'

interface CheckoutFormProps {
  product: Product
  includeOrderBump: boolean
  onOrderBumpChange: (include: boolean) => void
  onInitializePayment: (
    email: string,
    firstName?: string,
    lastName?: string,
    country?: string
  ) => Promise<void>
  onPaymentSuccess: (paymentIntentId: string, paymentMethodId: string) => void
  onCouponApplied: (code: string, discountType: 'percent' | 'fixed', discountAmount: number) => void
  clientSecret: string | null
  breakdown: PriceBreakdown | null
  isLoading: boolean
  error: string | null
}

export function CheckoutForm({
  product,
  includeOrderBump,
  onOrderBumpChange,
  onInitializePayment,
  onPaymentSuccess,
  onCouponApplied,
  clientSecret,
  breakdown,
  isLoading,
  error,
}: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()

  // Form state
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [country, setCountry] = useState(DEFAULT_COUNTRY)
  const [address, setAddress] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Handle email blur to initialize payment
  const handleEmailBlur = useCallback(async () => {
    if (!email || hasInitialized) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return
    }

    setHasInitialized(true)
    await onInitializePayment(email, firstName, lastName, country)
  }, [email, firstName, lastName, country, hasInitialized, onInitializePayment])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    // If not initialized, do it now
    if (!clientSecret) {
      await onInitializePayment(email, firstName, lastName, country)
      return
    }

    if (!stripe || !elements) {
      toast.error('Payment system not ready. Please wait...')
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      // Submit the payment form
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setPaymentError(submitError.message || 'Payment validation failed')
        setIsProcessing(false)
        return
      }

      // Confirm the payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/${product.slug}/thank-you`,
          receipt_email: email,
          payment_method_data: {
            billing_details: {
              name: [firstName, lastName].filter(Boolean).join(' ') || undefined,
              email,
              address: {
                line1: address || undefined,
                country: country || undefined,
              },
            },
          },
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        setPaymentError(confirmError.message || 'Payment failed')
        toast.error(confirmError.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!')

        // Get payment method ID for upsells
        const paymentMethodId =
          typeof paymentIntent.payment_method === 'string'
            ? paymentIntent.payment_method
            : paymentIntent.payment_method?.id || ''

        onPaymentSuccess(paymentIntent.id, paymentMethodId)
      }
    } catch (err) {
      console.error('Payment error:', err)
      setPaymentError('An unexpected error occurred')
      toast.error('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Payment element options
  const paymentElementOptions: StripePaymentElementOptions = {
    layout: {
      type: 'accordion',
      defaultCollapsed: false,
      radios: true,
      spacedAccordionItems: true,
    },
    paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
    defaultValues: {
      billingDetails: {
        email,
        name: [firstName, lastName].filter(Boolean).join(' ') || undefined,
      },
    },
    wallets: {
      applePay: 'auto',
      googlePay: 'auto',
    },
  }

  const displayAmount = breakdown?.total ?? product.stripe.priceAmount
  const currency = product.stripe.currency

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
            placeholder="john@example.com"
            required
            className="mt-1"
          />
          <p className="mt-1 text-xs text-gray-500">We&apos;ll send your receipt here</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
              First Name
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
              Last Name
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="country" className="text-sm font-medium text-gray-700">
            Country
          </Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger id="country" className="mt-1">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="address" className="text-sm font-medium text-gray-700">
            Address
          </Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address"
            className="mt-1"
          />
        </div>
      </div>

      {/* Order Bump */}
      {product.orderBump?.enabled && (
        <OrderBump
          orderBump={product.orderBump}
          currency={currency}
          checked={includeOrderBump}
          onChange={onOrderBumpChange}
        />
      )}

      {/* Coupon Input */}
      <CouponInput productSlug={product.slug} onCouponApplied={onCouponApplied} />

      {/* Payment Element */}
      {clientSecret && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Payment Method</Label>
          <PaymentElement options={paymentElementOptions} />
        </div>
      )}

      {/* Error Messages */}
      {(error || paymentError) && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error || paymentError}
        </div>
      )}

      {/* Submit Button - Green for conversion */}
      <Button
        type="submit"
        size="lg"
        disabled={!stripe || isProcessing || isLoading || (!clientSecret && !email)}
        className={cn(
          'relative w-full',
          'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
          'h-14 py-6 text-lg font-bold text-white',
          'shadow-lg shadow-green-500/25 transition-all duration-200 hover:shadow-xl'
        )}
      >
        {isProcessing || isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : !clientSecret && email ? (
          <>
            <ChevronRight className="mr-2 h-5 w-5" />
            Continue to Payment
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            Complete Secure Purchase — {formatMoney(displayAmount, currency)}
          </>
        )}
      </Button>

      {/* Trust Badges - directly under CTA */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Lock className="h-3 w-3 text-green-600" />
          <span>SSL Encrypted</span>
        </div>
        <span className="text-gray-300">•</span>
        <div className="flex items-center gap-1">
          <CreditCard className="h-3 w-3 text-blue-600" />
          <span>Powered by Stripe</span>
        </div>
      </div>
    </form>
  )
}
