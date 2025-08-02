'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CreditCard, Lock, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { api } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface PaymentBlockProps {
  data: {
    showExpressCheckout?: boolean
    fields?: string[]
    buttonText?: string
    securityBadges?: boolean
  }
  styles?: {
    padding?: string
    backgroundColor?: string
    className?: string
  }
  checkoutId: string
  productId: string
  amount: number
}

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function PaymentForm({ 
  data, 
  checkoutId, 
  productId, 
  amount 
}: Omit<PaymentBlockProps, 'styles'>) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  
  const fields = data.fields || ['email', 'card']
  const buttonText = data.buttonText || 'Complete Purchase'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      // Submit the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              email: email,
              name: `${firstName} ${lastName}`.trim(),
            },
          },
        },
        redirect: 'if_required',
      })

      if (error) {
        toast.error(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded - redirect to thank you page
        window.location.href = `/thank-you/${checkoutId}?payment_intent=${paymentIntent.id}`
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
      console.error('Payment error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      {fields.includes('email') && (
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            className="mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      )}

      {/* Name Fields */}
      {fields.includes('name') && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              required
              className="mt-1"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input 
              id="lastName" 
              type="text" 
              placeholder="Doe" 
              required 
              className="mt-1"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Stripe Payment Element */}
      {fields.includes('card') && (
        <div>
          <Label htmlFor="card">Card Information</Label>
          <div className="mt-1">
            <PaymentElement 
              options={{
                layout: 'tabs',
                defaultValues: {
                  billingDetails: {
                    email: email,
                    name: `${firstName} ${lastName}`.trim(),
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        className="w-full"
        size="lg"
        disabled={isProcessing || !stripe || !elements}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          buttonText
        )}
      </Button>

      {/* Security Badges */}
      {data.securityBadges !== false && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Lock className="h-4 w-4" />
          <span>Secure 256-bit SSL encryption</span>
        </div>
      )}
    </form>
  )
}

export function PaymentBlock({ data, styles, checkoutId, productId, amount }: PaymentBlockProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Create payment intent
  const createPaymentIntent = api.payment.createIntent.useMutation()

  useEffect(() => {
    // Create a payment intent when component mounts
    createPaymentIntent.mutate(
      {
        checkoutId,
        productId,
        amount,
      },
      {
        onSuccess: (data) => {
          setClientSecret(data.clientSecret)
          setIsLoading(false)
        },
        onError: (error) => {
          toast.error('Failed to initialize payment')
          console.error('Payment intent error:', error)
          setIsLoading(false)
        },
      }
    )
  }, [checkoutId, productId, amount])

  if (isLoading) {
    return (
      <section
        className={cn('px-6 py-12', styles?.className)}
        style={{
          backgroundColor: styles?.backgroundColor,
          padding: styles?.padding,
        }}
      >
        <div className="container mx-auto max-w-xl">
          <Card variant="glass" className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <span className="ml-2 text-gray-400">Loading payment form...</span>
            </div>
          </Card>
        </div>
      </section>
    )
  }

  if (!clientSecret) {
    return (
      <section
        className={cn('px-6 py-12', styles?.className)}
        style={{
          backgroundColor: styles?.backgroundColor,
          padding: styles?.padding,
        }}
      >
        <div className="container mx-auto max-w-xl">
          <Card variant="glass" className="p-8">
            <div className="text-center text-red-500">
              Failed to load payment form. Please refresh the page.
            </div>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section
      className={cn('px-6 py-12', styles?.className)}
      style={{
        backgroundColor: styles?.backgroundColor,
        padding: styles?.padding,
      }}
    >
      <div className="container mx-auto max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card variant="glass" className="p-8">
            <div className="mb-6 text-center">
              <h3 className="text-2xl font-bold">Payment Information</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Enter your details to complete the purchase
              </p>
            </div>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#0a84ff',
                    colorBackground: '#1f2937',
                    colorSurface: '#374151',
                    colorText: '#f3f4f6',
                    colorDanger: '#ef4444',
                    fontFamily: 'system-ui, sans-serif',
                    borderRadius: '8px',
                  },
                },
              }}
            >
              <PaymentForm 
                data={data} 
                checkoutId={checkoutId}
                productId={productId}
                amount={amount}
              />
            </Elements>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}