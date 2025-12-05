'use client'

import { useState, useCallback } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import type { StripePaymentElementOptions } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    await onInitializePayment(email, firstName, lastName)
  }, [email, firstName, lastName, hasInitialized, onInitializePayment])

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
      await onInitializePayment(email, firstName, lastName)
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
    layout: 'tabs',
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
      <div className="text-center lg:text-left">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Complete Your Purchase</h2>
        <p className="text-gray-600">Secure checkout powered by Stripe</p>
      </div>

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

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        disabled={!stripe || isProcessing || isLoading || (!clientSecret && !email)}
        className={cn(
          'relative w-full',
          'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
          'py-6 text-lg font-semibold text-white',
          'shadow-lg transition-all duration-200 hover:shadow-xl'
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
            <CreditCard className="mr-2 h-5 w-5" />
            Pay {formatMoney(displayAmount, currency)}
          </>
        )}
      </Button>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <Lock className="h-3 w-3" />
        <span>Your payment is secured with 256-bit SSL encryption</span>
      </div>
    </form>
  )
}
