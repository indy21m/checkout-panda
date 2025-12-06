'use client'

import { useState, useCallback, useEffect } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js'
import type { StripePaymentElementOptions } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries'
import { Loader2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/currency'
import type { Product, PriceBreakdown } from '@/types'

interface PaymentSectionProps {
  product: Product
  selectedPriceTierId: string
  onInitializePayment: (
    email: string,
    firstName?: string,
    lastName?: string,
    country?: string,
    address?: string
  ) => Promise<void>
  onPaymentSuccess: (paymentIntentId: string, paymentMethodId: string) => void
  clientSecret: string | null
  breakdown: PriceBreakdown | null
  isLoading: boolean
  error: string | null
}

export function PaymentSection({
  product,
  selectedPriceTierId,
  onInitializePayment,
  onPaymentSuccess,
  clientSecret,
  breakdown,
  isLoading,
  error,
}: PaymentSectionProps) {
  const stripe = useStripe()
  const elements = useElements()

  // Form state
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [country, setCountry] = useState(DEFAULT_COUNTRY)
  const [address, setAddress] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [isPaymentReady, setIsPaymentReady] = useState(false)

  // Get selected tier for display
  const selectedTier = product.stripe.pricingTiers?.find((t) => t.id === selectedPriceTierId)
  const isInstallment = selectedTier?.installments

  // Calculate display amount
  const displayAmount = breakdown?.total ?? selectedTier?.priceAmount ?? product.stripe.priceAmount
  const currency = product.stripe.currency

  // Initialize payment when we have email and country (for tax calculation)
  const initializePaymentIfNeeded = useCallback(async () => {
    if (!email || clientSecret) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return

    // Parse full name into first/last
    const nameParts = fullName.trim().split(' ')
    const firstName = nameParts[0] || undefined
    const lastName = nameParts.slice(1).join(' ') || undefined

    await onInitializePayment(email, firstName, lastName, country, address)
  }, [email, fullName, country, address, clientSecret, onInitializePayment])

  // Auto-initialize when email is valid
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailRegex.test(email) && !clientSecret && !isLoading) {
      const timer = setTimeout(() => {
        initializePaymentIfNeeded()
      }, 500) // Debounce
      return () => clearTimeout(timer)
    }
    return undefined
  }, [email, clientSecret, isLoading, initializePaymentIfNeeded])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the terms of service')
      return
    }

    // If not initialized, do it now
    if (!clientSecret) {
      const nameParts = fullName.trim().split(' ')
      const firstName = nameParts[0] || undefined
      const lastName = nameParts.slice(1).join(' ') || undefined
      await onInitializePayment(email, firstName, lastName, country, address)
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
              name: fullName || undefined,
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
    layout: 'tabs',
    defaultValues: {
      billingDetails: {
        email,
        name: fullName || undefined,
        address: {
          country: country,
        },
      },
    },
    wallets: {
      applePay: 'auto',
      googlePay: 'auto',
    },
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Payment details</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Payment Element - Always visible */}
        <div className="space-y-2">
          <PaymentElement options={paymentElementOptions} onReady={() => setIsPaymentReady(true)} />
        </div>

        {/* Email (hidden field synced with payment element, or shown if needed) */}
        {!clientSecret && (
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1.5"
            />
          </div>
        )}

        {/* Full Name */}
        <div>
          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
            Full name
          </Label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className="mt-1.5"
          />
        </div>

        {/* Country/Region */}
        <div>
          <Label htmlFor="country" className="text-sm font-medium text-gray-700">
            Country or region
          </Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger id="country" className="mt-1.5">
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

        {/* Address Line 1 */}
        <div>
          <Label htmlFor="address" className="text-sm font-medium text-gray-700">
            Address line 1
          </Label>
          <Input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main Street"
            className="mt-1.5"
          />
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start gap-3 pt-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
            className="mt-0.5"
          />
          <Label htmlFor="terms" className="text-sm leading-relaxed text-gray-600">
            I agree to the{' '}
            <a href="/terms" className="font-medium text-blue-600 hover:underline">
              terms of service
            </a>{' '}
            and have read the{' '}
            <a href="/privacy" className="font-medium text-blue-600 hover:underline">
              privacy policy
            </a>
          </Label>
        </div>

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
          disabled={!stripe || !isPaymentReady || isProcessing || isLoading || !agreedToTerms}
          className={cn(
            'relative w-full',
            'bg-gray-900 hover:bg-gray-800',
            'h-12 py-3 text-base font-semibold text-white',
            'shadow-sm transition-all duration-200',
            'disabled:cursor-not-allowed disabled:bg-gray-300'
          )}
        >
          {isProcessing || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Pay {formatMoney(displayAmount, currency)}
              {isInstallment && '.'}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
