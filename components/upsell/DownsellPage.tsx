'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { SuccessBanner } from './SuccessBanner'
import { TrustBadges } from '@/components/checkout/TrustBadges'
import { formatMoney } from '@/lib/currency'
import { toast } from 'sonner'
import { Check, Loader2 } from 'lucide-react'
import type { Product, Downsell } from '@/types'

interface DownsellPageProps {
  product: Product
  downsell: Downsell
  customerId: string
  paymentMethodId: string
  currentPurchases?: string[]
}

export function DownsellPage({
  product,
  downsell,
  customerId,
  paymentMethodId,
  currentPurchases = ['main'],
}: DownsellPageProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const savingsPercent = downsell.originalPrice
    ? Math.round((1 - downsell.stripe.priceAmount / downsell.originalPrice) * 100)
    : null

  // Handle accepting the downsell
  const handleAccept = useCallback(async () => {
    setIsProcessing(true)

    try {
      const response = await fetch('/api/charge-upsell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          paymentMethodId,
          productSlug: product.slug,
          upsellId: 'downsell',
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Added to your order!')
        const newPurchases = [...currentPurchases, 'downsell']
        const params = new URLSearchParams({
          purchases: newPurchases.join(','),
        })
        router.push(`/${product.slug}/thank-you?${params.toString()}`)
      } else {
        toast.error(data.error || 'Failed to process payment')
        setIsProcessing(false)
      }
    } catch (err) {
      console.error('Downsell error:', err)
      toast.error('Payment failed. Please try again.')
      setIsProcessing(false)
    }
  }, [customerId, paymentMethodId, product.slug, currentPurchases, router])

  // Handle declining
  const handleDecline = useCallback(() => {
    const params = new URLSearchParams({
      purchases: currentPurchases.join(','),
    })
    router.push(`/${product.slug}/thank-you?${params.toString()}`)
  }, [product.slug, currentPurchases, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <TrustBadges variant="compact" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Success Banner */}
        <SuccessBanner productName={product.name} />

        {/* Downsell Offer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3">
            <p className="text-center font-semibold text-white">
              Not ready for the full upgrade? Try this instead...
            </p>
          </div>

          <div className="p-8">
            {/* Title */}
            <h1 className="text-center text-2xl font-bold text-gray-900">
              {downsell.title}
            </h1>
            {downsell.subtitle && (
              <p className="mt-2 text-center text-gray-600">{downsell.subtitle}</p>
            )}

            {/* Pricing */}
            <div className="my-6 flex items-center justify-center gap-4">
              <span className="text-4xl font-bold text-gray-900">
                {formatMoney(downsell.stripe.priceAmount, product.stripe.currency)}
              </span>
              {downsell.originalPrice && (
                <div className="text-left">
                  <span className="text-lg text-gray-400 line-through">
                    {formatMoney(downsell.originalPrice, product.stripe.currency)}
                  </span>
                  {savingsPercent && (
                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                      {savingsPercent}% off
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Benefits */}
            {downsell.benefits.length > 0 && (
              <div className="mb-6 rounded-xl bg-gray-50 p-5">
                <ul className="space-y-2">
                  {downsell.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <Check className="h-3 w-3 text-blue-600" />
                      </div>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {downsell.description && (
              <p className="mb-6 text-center text-sm text-gray-600">{downsell.description}</p>
            )}

            {/* CTA Buttons - Green for conversion */}
            <div className="space-y-3">
              <Button
                onClick={handleAccept}
                disabled={isProcessing}
                size="lg"
                className="h-14 w-full bg-gradient-to-r from-green-500 to-green-600 py-5 text-lg font-bold text-white shadow-lg shadow-green-500/25 hover:from-green-600 hover:to-green-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Yes! Add for {formatMoney(downsell.stripe.priceAmount, product.stripe.currency)}
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={handleDecline}
                disabled={isProcessing}
                className="w-full py-2 text-sm text-gray-400 transition-colors hover:text-gray-600"
              >
                No thanks, take me to my purchase
              </button>
            </div>

            {/* Urgency Text */}
            <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-gray-400">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-orange-400" />
              <span>This offer expires when you leave this page</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
