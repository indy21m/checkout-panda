'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  useStripe, 
  useElements,
  LinkAuthenticationElement,
  PaymentElement,
  AddressElement,
  PaymentRequestButtonElement
} from '@stripe/react-stripe-js'
import type { 
  StripePaymentElementOptions,
  StripeAddressElementOptions,
  StripeLinkAuthenticationElementOptions,
  PaymentRequest
} from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Lock, ShieldCheck, CreditCard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { PaymentBlockData } from '@/components/builder/checkout-blocks'

interface StripePaymentBlockProps {
  data: PaymentBlockData
  checkoutId: string
  productId?: string
  planId?: string
  orderBumpIds?: string[]
  amount: number
  onPaymentSuccess?: (paymentIntentId: string) => void
  onAnalyticsEvent?: (event: string, data: Record<string, unknown>) => void
}

export function StripePaymentBlock({
  data,
  checkoutId: _checkoutId,
  productId: _productId,
  planId: _planId,
  orderBumpIds: _orderBumpIds = [],
  amount,
  onPaymentSuccess,
  onAnalyticsEvent,
}: StripePaymentBlockProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  
  const [email, setEmail] = React.useState('')
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [paymentRequest, setPaymentRequest] = React.useState<PaymentRequest | null>(null)
  const [canMakePayment, setCanMakePayment] = React.useState(false)
  const [isStripeLoading, setIsStripeLoading] = React.useState(true)
  
  // Track when Stripe Elements are ready
  React.useEffect(() => {
    if (stripe && elements) {
      setIsStripeLoading(false)
    }
  }, [stripe, elements])

  // Initialize payment request for Apple Pay / Google Pay
  React.useEffect(() => {
    if (!stripe || !amount) return

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: data.buttonText || 'Total',
        amount: amount,
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: data.showPhoneField,
    })

    // Check if payment request is available
    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr)
        setCanMakePayment(true)
        onAnalyticsEvent?.('wallet_available', { 
          type: result.applePay ? 'apple_pay' : 'google_pay' 
        })
      }
    })

    // Handle payment request payment
    pr.on('paymentmethod', async (ev) => {
      onAnalyticsEvent?.('wallet_used', { 
        type: ev.paymentMethod.type 
      })
      
      // Confirm the payment with the payment method from the payment request
      const { error } = await stripe.confirmPayment({
        elements: elements!,
        confirmParams: {
          payment_method: ev.paymentMethod.id,
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: 'if_required',
      })

      if (error) {
        ev.complete('fail')
        setErrorMessage(error.message || 'Payment failed')
        onAnalyticsEvent?.('confirm_payment_error', { 
          error: error.message,
          source: 'wallet'
        })
      } else {
        ev.complete('success')
        onPaymentSuccess?.(ev.paymentMethod.id)
        onAnalyticsEvent?.('confirm_payment_success', { 
          source: 'wallet'
        })
        router.push('/checkout/success')
      }
    })
  }, [stripe, amount, data, elements, router, onPaymentSuccess, onAnalyticsEvent])

  // Link Authentication Element options
  const linkOptions: StripeLinkAuthenticationElementOptions = {
    defaultValues: {
      email,
    },
  }

  // Payment Element options
  const paymentOptions: StripePaymentElementOptions = {
    layout: {
      type: 'tabs',
      defaultCollapsed: false,
      // Remove radios option - only supported with 'accordion' layout
    },
    defaultValues: {
      billingDetails: {
        email,
      },
    },
    business: {
      name: 'Checkout Panda',
    },
    fields: {
      billingDetails: {
        email: email ? 'never' : 'auto',
        name: 'auto',
        phone: data.showPhoneField ? 'auto' : 'never',
      },
    },
    wallets: {
      applePay: 'never', // We handle this separately
      googlePay: 'never', // We handle this separately
    },
  }

  // Address Element options for billing
  const addressOptions: StripeAddressElementOptions = {
    mode: 'billing',
    defaultValues: {
      name: '',
      address: {
        country: 'US',
      },
    },
    fields: {
      phone: data.showPhoneField ? 'always' : 'never',
    },
    // Don't set validation.phone - let Stripe handle it based on fields.phone
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)
    onAnalyticsEvent?.('confirm_payment_start', { source: 'form' })

    try {
      // Trigger form validation and submission
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          receipt_email: email,
          payment_method_data: {
            billing_details: {
              email: email || undefined,
            },
          },
        },
        redirect: 'if_required',
      })

      if (error) {
        // Handle specific error types
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setErrorMessage(error.message || 'Please check your payment details')
        } else if (error.code === 'payment_intent_authentication_failure') {
          setErrorMessage('Authentication failed. Please try again.')
          onAnalyticsEvent?.('3ds_failed', { error: error.message })
        } else {
          setErrorMessage('An unexpected error occurred. Please try again.')
        }
        
        onAnalyticsEvent?.('confirm_payment_error', { 
          error: error.message,
          type: error.type,
          source: 'form'
        })
      } else {
        // Payment succeeded
        onAnalyticsEvent?.('confirm_payment_success', { source: 'form' })
        toast.success('Payment successful!')
        router.push('/checkout/success')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setErrorMessage('An unexpected error occurred. Please try again.')
      onAnalyticsEvent?.('confirm_payment_error', { 
        error: 'Unknown error',
        source: 'form'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Show loading state while Stripe initializes
  if (isStripeLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading secure payment form...</p>
          </div>
        </div>
      </motion.div>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Request Button (Apple Pay / Google Pay) */}
        {canMakePayment && paymentRequest && (
          <>
            <div className="space-y-3">
              <PaymentRequestButtonElement 
                options={{ paymentRequest }}
                className="PaymentRequestButton"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">Or pay with card</span>
              </div>
            </div>
          </>
        )}

        {/* Link Authentication for email (enables Stripe Link) */}
        <div>
          <LinkAuthenticationElement 
            options={linkOptions}
            onChange={(e) => {
              if (e.value.email) {
                setEmail(e.value.email)
              }
            }}
          />
        </div>

        {/* Payment Element for card and other payment methods */}
        <div>
          <PaymentElement options={paymentOptions} />
        </div>

        {/* Billing Address (if enabled) */}
        {data.showBillingAddress && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Billing Address</h3>
            <AddressElement options={addressOptions} />
          </div>
        )}

        {/* Company Field (if enabled) */}
        {data.showCompanyField && (
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Company Name {data.collectVAT && '& VAT Number'}
            </label>
            <input
              id="company"
              type="text"
              placeholder={data.collectVAT ? "Company Name / VAT Number" : "Company Name (optional)"}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
          >
            {errorMessage}
          </motion.div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" />
              {data.buttonText || 'Complete Purchase'}
            </span>
          )}
        </Button>

        {/* Security Badges */}
        <div className="space-y-3 pt-4">
          {/* Secure Payment Text */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Lock className="w-4 h-4" />
            <span>{data.secureText || 'Your payment is secured with 256-bit SSL encryption'}</span>
          </div>
          
          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-5 h-5" />
              <span>PCI DSS Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <svg className="w-16 h-5" viewBox="0 0 60 25" fill="currentColor">
                <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-3.06 9.64v9.5h-4.12V5.57h3.76l.08 1.22c.61-1.11 1.9-1.5 2.96-1.5.38 0 .75.05 1.08.14v3.89a3 3 0 0 0-1.21-.17c-.94 0-1.72.32-2.18.91l-.02.02c-.23.27-.35.68-.35 1.43zM15.12 19.9l-.17-.81-.02.02c-.98.85-2.38 1.18-3.68 1.18-2.17 0-4.12-1.32-4.12-3.96 0-3.35 3.03-4.24 6.98-4.24v-.23c0-1.29-.76-1.76-2.2-1.76-1.45 0-2.85.37-3.89.84V7.3c1.1-.4 2.66-.72 4.3-.72 3.5 0 5.78 1.42 5.78 5.4v8.03h-2.98zm-.15-4.87c-2.4 0-3.12.5-3.12 1.47 0 .85.56 1.32 1.53 1.32.98 0 1.59-.48 1.59-.48v-2.31zM2.5 2.2C3.77 2.2 5 2.32 6 2.57V6c-.89-.25-2-.38-2.96-.38-1.88 0-2.1.55-2.1 2.22v12.17H0V7.94C0 3.27 0 2.2 2.5 2.2z"/>
              </svg>
            </div>
          </div>

          {/* Money Back Guarantee (if configured) */}
          {data.showGuarantee && (
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600 font-medium">
                {data.guaranteeText || '30-Day Money Back Guarantee'}
              </p>
            </div>
          )}
        </div>
      </form>
    </motion.div>
  )
}