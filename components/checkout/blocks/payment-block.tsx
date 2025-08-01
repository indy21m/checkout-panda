'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CreditCard, Lock } from 'lucide-react'
import { useState } from 'react'

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
}

export function PaymentBlock({ data, styles }: PaymentBlockProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const fields = data.fields || ['email', 'card']
  const buttonText = data.buttonText || 'Complete Purchase'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // TODO: Implement Stripe payment processing
    setTimeout(() => {
      setIsProcessing(false)
      alert('Payment processing will be implemented with Stripe integration')
    }, 2000)
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
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" type="text" placeholder="Doe" required className="mt-1" />
                  </div>
                </div>
              )}

              {/* Card Element Placeholder */}
              {fields.includes('card') && (
                <div>
                  <Label htmlFor="card">Card Information</Label>
                  <div className="mt-1 rounded-md border border-gray-300 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-900">
                    <CreditCard className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-500">Stripe Elements will be integrated here</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
