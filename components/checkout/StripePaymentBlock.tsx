'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  useStripe,
  useElements,
  LinkAuthenticationElement,
  PaymentElement,
  AddressElement,
  PaymentRequestButtonElement,
} from '@stripe/react-stripe-js'
import type {
  StripePaymentElementOptions,
  StripeAddressElementOptions,
  StripeLinkAuthenticationElementOptions,
  PaymentRequest,
} from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VATField } from '@/components/checkout/VATField'
import { Lock, ShieldCheck, CreditCard, Tag, ChevronRight, Apple, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/currency'
import type { PaymentBlockData } from '@/components/builder/checkout-blocks'
import type { RouterOutputs } from '@/lib/trpc/api'

type Quote = RouterOutputs['checkout']['quote']

interface StripePaymentBlockProps {
  data: PaymentBlockData
  checkoutId: string
  quote?: Quote | null
  productId?: string
  offerId?: string // Add offerId
  planId?: string
  orderBumpIds?: string[]
  amount: number
  currency?: string
  clientSecret?: string | null
  paymentIntentId?: string | null
  onEmailChange?: (email: string) => void
  onVATChange?: (vatNumber: string) => void
  onCountryChange?: (country: string) => void
  onPaymentInitialize?: (email: string) => void
  onPaymentSuccess?: (paymentIntentId: string) => void
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void
  collectVAT?: boolean
  customerCountry?: string
}

export function StripePaymentBlock({
  data,
  checkoutId: _checkoutId,
  quote,
  productId: _productId,
  planId,
  orderBumpIds: _orderBumpIds = [],
  amount,
  currency = 'USD',
  clientSecret,
  paymentIntentId,
  onEmailChange,
  onVATChange,
  onCountryChange: _onCountryChange,
  onPaymentInitialize,
  onPaymentSuccess,
  onAnalyticsEvent,
  collectVAT = false,
  customerCountry: _customerCountry = 'US',
}: StripePaymentBlockProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()

  // Form state
  const [email, setEmail] = React.useState('')
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [vatNumber, setVatNumber] = React.useState('')
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [paymentRequest, setPaymentRequest] = React.useState<PaymentRequest | null>(null)
  const [canMakePayment, setCanMakePayment] = React.useState(false)
  const [isStripeLoading, setIsStripeLoading] = React.useState(true)
  const [hasInitialized, setHasInitialized] = React.useState(false)
  const [, setVatValidation] = React.useState<{
    valid: boolean
    reverseCharge?: boolean
    companyName?: string
  } | null>(null)

  // Coupon state (if not using quotes)
  const [couponCode, setCouponCode] = React.useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = React.useState(false)

  // Track when Stripe Elements are ready
  React.useEffect(() => {
    if (stripe && elements) {
      setIsStripeLoading(false)
    }
  }, [stripe, elements])

  // Handle email change
  const handleEmailChange = React.useCallback(
    (value: string) => {
      setEmail(value)
      onEmailChange?.(value)
    },
    [onEmailChange]
  )

  // Initialize payment when email is complete
  const handleInitializePayment = React.useCallback(() => {
    if (!email || hasInitialized || clientSecret) return

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setHasInitialized(true)
    onPaymentInitialize?.(email)
    onAnalyticsEvent?.('payment_initialize', { email, amount, currency })
  }, [email, hasInitialized, clientSecret, onPaymentInitialize, onAnalyticsEvent, amount, currency])

  // Initialize payment request for Apple Pay / Google Pay
  React.useEffect(() => {
    if (!stripe || !amount || amount === 0) return

    const pr = stripe.paymentRequest({
      country: 'US', // Should be dynamic based on user location
      currency: currency.toLowerCase(),
      total: {
        label: data.buttonText || 'Total',
        amount: amount,
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: data.showPhoneField,
      requestShipping: data.showBillingAddress,
    })

    // Check if PaymentRequest is available
    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr)
        setCanMakePayment(true)
      }
    })

    // Handle payment method selection
    pr.on('paymentmethod', async (event) => {
      setIsProcessing(true)

      // Initialize payment if not already done
      if (!clientSecret && !hasInitialized) {
        const customerEmail = event.payerEmail || email
        if (customerEmail) {
          handleEmailChange(customerEmail)
          onPaymentInitialize?.(customerEmail)
        }
      }

      // Wait for client secret
      let retries = 0
      while (!clientSecret && retries < 20) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        retries++
      }

      if (!clientSecret) {
        event.complete('fail')
        toast.error('Failed to initialize payment')
        setIsProcessing(false)
        return
      }

      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: event.paymentMethod.id },
        { handleActions: false }
      )

      if (confirmError) {
        event.complete('fail')
        toast.error(confirmError.message || 'Payment failed')
        onAnalyticsEvent?.('payment_failed', {
          error: confirmError.message,
          method: 'payment_request',
        })
      } else {
        event.complete('success')
        onAnalyticsEvent?.('payment_success', {
          method: 'payment_request',
          paymentIntentId,
        })
        if (paymentIntentId) {
          onPaymentSuccess?.(paymentIntentId)
        }
      }

      setIsProcessing(false)
    })

    return () => {
      pr.abort()
    }
  }, [
    stripe,
    amount,
    currency,
    data,
    clientSecret,
    hasInitialized,
    email,
    handleEmailChange,
    onPaymentInitialize,
    onPaymentSuccess,
    onAnalyticsEvent,
    paymentIntentId,
  ])

  // Handle payment submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      toast.error('Payment system not ready')
      return
    }

    // Initialize payment if needed
    if (!clientSecret) {
      handleInitializePayment()
      toast.info('Initializing payment...')
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)
    onAnalyticsEvent?.('payment_attempt', { amount, currency })

    try {
      // Submit payment
      const { error: submitError } = await elements.submit()

      if (submitError) {
        setErrorMessage(submitError.message || 'An error occurred')
        setIsProcessing(false)
        onAnalyticsEvent?.('payment_error', { error: submitError.message })
        return
      }

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          receipt_email: email,
          payment_method_data: {
            billing_details: {
              name: `${firstName} ${lastName}`.trim() || undefined,
              email: email,
            },
          },
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        setErrorMessage(confirmError.message || 'Payment failed')
        onAnalyticsEvent?.('payment_failed', { error: confirmError.message })
      } else if (paymentIntent) {
        onAnalyticsEvent?.('payment_success', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        })

        // Redirect to success page
        if (onPaymentSuccess) {
          onPaymentSuccess(paymentIntent.id)
        } else {
          router.push(`/checkout/success?payment_intent=${paymentIntent.id}`)
        }
      }
    } catch (error) {
      console.error('Payment error:', error)
      setErrorMessage('An unexpected error occurred')
      onAnalyticsEvent?.('payment_error', { error: 'unexpected' })
    } finally {
      setIsProcessing(false)
    }
  }

  // Apply coupon to quote
  const handleApplyCoupon = React.useCallback(async () => {
    if (!couponCode.trim() || !quote) {
      toast.error('Please enter a coupon code')
      return
    }

    setIsApplyingCoupon(true)
    onAnalyticsEvent?.('coupon_attempt', { code: couponCode })

    try {
      // Here you would call an API to apply the coupon to the quote
      // For now, we'll just show a message
      toast.info('Coupon functionality coming soon')
    } catch (error) {
      console.error('Coupon error:', error)
      toast.error('Failed to apply coupon')
    } finally {
      setIsApplyingCoupon(false)
    }
  }, [couponCode, quote, onAnalyticsEvent])

  // Payment element options
  const paymentElementOptions: StripePaymentElementOptions = {
    layout: 'tabs',
    defaultValues: {
      billingDetails: {
        email,
        name: `${firstName} ${lastName}`.trim() || undefined,
      },
    },
    fields: {
      billingDetails: {
        email: 'auto', // Email is always collected
        name: 'auto', // Name is always collected
        phone: data.showPhoneField ? 'auto' : 'never',
        address: data.showBillingAddress ? 'auto' : 'never',
      },
    },
    wallets: {
      applePay: 'auto',
      googlePay: 'auto',
    },
  }

  // Link authentication options
  const linkOptions: StripeLinkAuthenticationElementOptions = {
    defaultValues: {
      email,
    },
  }

  // Address element options
  const addressOptions: StripeAddressElementOptions = {
    mode: 'billing',
    defaultValues: {
      name: `${firstName} ${lastName}`.trim() || undefined,
    },
  }

  // Determine if we're in subscription mode
  const isSubscription = quote?.meta?.planInterval || planId

  return (
    <div className="space-y-6">
      {/* Circle-style Header */}
      <div className="text-center lg:text-left">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          {isSubscription ? 'Start Your Subscription' : 'Complete Your Purchase'}
        </h2>
        <p className="text-gray-600">
          {isSubscription
            ? quote?.meta?.trialDays
              ? `Try free for ${quote.meta.trialDays} days, then ${formatMoney(amount, currency)} per ${quote.meta.planInterval}`
              : `${formatMoney(amount, currency)} per ${quote?.meta?.planInterval || 'month'}`
            : `Secure checkout powered by Stripe`}
        </p>
      </div>

      {/* Express Checkout - Apple Pay / Google Pay */}
      {canMakePayment && paymentRequest && (
        <div className="border-b border-gray-200 pb-6">
          <div className="mb-3">
            <p className="text-center text-sm text-gray-600">Express checkout</p>
          </div>
          <PaymentRequestButtonElement options={{ paymentRequest }} className="w-full" />
        </div>
      )}

      {/* Main Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email & Name Fields */}
        {!clientSecret && (
          <div className="space-y-4">
            {/* Email field - always shown */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleInitializePayment}
                placeholder="john@example.com"
                required
                className="mt-1"
              />
              <p className="mt-1 text-xs text-gray-500">We&apos;ll send your receipt here</p>
            </div>

            {/* Name fields - always shown */}
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

            {/* VAT Field for EU customers */}
            {collectVAT && (
              <VATField
                value={vatNumber}
                onChange={(value) => {
                  setVatNumber(value)
                  onVATChange?.(value)
                }}
                onValidation={(result) => {
                  setVatValidation(result)
                  onAnalyticsEvent?.('vat_validation', {
                    valid: result.valid,
                    reverseCharge: result.reverseCharge,
                  })
                }}
                currency={currency}
                amount={amount}
              />
            )}
          </div>
        )}

        {/* Link Authentication (Stripe Link) */}
        {clientSecret && (
          <div>
            <LinkAuthenticationElement options={linkOptions} />
          </div>
        )}

        {/* Payment Element */}
        {clientSecret && (
          <div>
            <Label className="mb-3 block text-sm font-medium text-gray-700">Payment Method</Label>
            <PaymentElement options={paymentElementOptions} />
          </div>
        )}

        {/* Billing Address */}
        {clientSecret && data.showBillingAddress && (
          <div>
            <Label className="mb-3 block text-sm font-medium text-gray-700">Billing Address</Label>
            <AddressElement options={addressOptions} />
          </div>
        )}

        {/* Coupon Code (if not using quotes) */}
        {!quote && data.enableCoupons && (
          <div className="rounded-lg bg-gray-50 p-4">
            <Label htmlFor="coupon" className="text-sm font-medium text-gray-700">
              Have a promo code?
            </Label>
            <div className="mt-2 flex gap-2">
              <Input
                id="coupon"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="SAVE20"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleApplyCoupon}
                disabled={isApplyingCoupon || !couponCode}
              >
                {isApplyingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
              </Button>
            </div>
          </div>
        )}

        {/* Applied Coupon Display */}
        {quote?.meta?.couponCode && (
          <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Coupon {quote.meta.couponCode} applied
              </span>
              <span className="text-sm text-green-600">
                (-{formatMoney(quote.discount || 0, quote.currency)})
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {errorMessage}
          </motion.div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          disabled={!stripe || isProcessing || isStripeLoading || (!clientSecret && !email)}
          className={cn(
            'relative w-full',
            'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
            'font-semibold text-white',
            'shadow-lg transition-all duration-200 hover:shadow-xl'
          )}
        >
          {isProcessing ? (
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
              {data.buttonText || `Pay ${formatMoney(amount, currency)}`}
            </>
          )}
        </Button>

        {/* Security Badges */}
        <div className="flex items-center justify-center gap-4 pt-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            <span>SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            <span>PCI Compliant</span>
          </div>
          <div className="flex items-center gap-1">
            <Apple className="h-3 w-3" />
            <span>Apple Pay Ready</span>
          </div>
        </div>

        {/* Terms */}
        {data.secureText && <p className="text-center text-xs text-gray-500">{data.secureText}</p>}
      </form>
    </div>
  )
}
