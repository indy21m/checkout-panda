'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Download, Mail, ArrowRight, Heart } from 'lucide-react'
import confetti from 'canvas-confetti'
import Link from 'next/link'

interface ThankYouRendererProps {
  session: {
    id: string
    sessionData: {
      productsPurchased: string[]
      totalSpent: number
      customerEmail?: string
      bumpsAccepted: string[]
      upsellsAccepted: string[]
    }
    products: Array<{
      id: string
      name: string
      description: string | null
      [key: string]: unknown
    }>
    [key: string]: unknown
  }
}

export function ThankYouRenderer({ session }: ThankYouRendererProps) {
  useEffect(() => {
    // Fire confetti on mount
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  const totalItems =
    session.sessionData.productsPurchased.length +
    session.sessionData.bumpsAccepted.length +
    session.sessionData.upsellsAccepted.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
            className="mb-8 text-center"
          >
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </motion.div>

          {/* Thank You Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12 text-center"
          >
            <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
              Thank You for Your Purchase!
            </h1>
            <p className="text-xl text-gray-600">Your order has been successfully processed.</p>
          </motion.div>

          {/* Order Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card variant="glass" className="mb-8 p-8">
              <h2 className="mb-6 text-2xl font-semibold">Order Summary</h2>

              {/* Email */}
              {session.sessionData.customerEmail && (
                <div className="mb-6 flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Confirmation sent to:</p>
                    <p className="font-medium">{session.sessionData.customerEmail}</p>
                  </div>
                </div>
              )}

              {/* Products */}
              <div className="mb-6 space-y-4">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">
                  Your Products ({totalItems})
                </h3>
                {session.products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-start gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50"
                  >
                    <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-green-500" />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.description && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Total Paid</span>
                  <span className="text-primary text-2xl font-bold">
                    ${(session.sessionData.totalSpent / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card variant="glass" className="p-8">
              <h2 className="mb-6 text-2xl font-semibold">What Happens Next?</h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-primary/10 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Check Your Email</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      We&apos;ve sent you a confirmation email with your receipt and access details.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary/10 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Access Your Products</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Click the button below to access your dashboard and download your products.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-primary/10 text-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Need Help?</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Our support team is here to help. Contact us at support@example.com
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button variant="primary" size="lg" className="flex-1">
                  <Download className="mr-2 h-5 w-5" />
                  Access Your Products
                </Button>
                <Link href="/" className="flex-1">
                  <Button variant="secondary" size="lg" className="w-full">
                    Continue Shopping
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>

          {/* Footer Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-12 text-center text-gray-500"
          >
            <p className="flex items-center justify-center gap-2">
              Made with <Heart className="h-4 w-4 text-red-500" fill="currentColor" /> by Your
              Company
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
