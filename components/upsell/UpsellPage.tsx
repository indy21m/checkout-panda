'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { UpsellOffer } from './UpsellOffer'
import { SuccessBanner } from './SuccessBanner'
import { TrustBadges } from '@/components/checkout/TrustBadges'
import { toast } from 'sonner'
import type { Product, Upsell } from '@/types'

interface UpsellPageProps {
  product: Product
  upsell: Upsell
  customerId: string
  paymentMethodId: string
  currentPurchases?: string[]
  currentStep?: number
  totalSteps?: number
}

export function UpsellPage({
  product,
  upsell,
  customerId,
  paymentMethodId,
  currentPurchases = ['main'],
  currentStep = 1,
  totalSteps = 1,
}: UpsellPageProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  // Handle accepting the upsell
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
          upsellId: upsell.id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Added to your order!')

        // Update purchases list
        const newPurchases = [...currentPurchases, upsell.id]

        // Determine next step
        const nextUpsellIndex = product.upsells
          ? product.upsells.findIndex((u) => u.id === upsell.id) + 1
          : 0
        const hasMoreUpsells = product.upsells && nextUpsellIndex < product.upsells.length

        if (hasMoreUpsells && product.upsells) {
          // Go to next upsell
          const nextUpsell = product.upsells[nextUpsellIndex]
          const params = new URLSearchParams({
            customer_id: customerId,
            payment_method: paymentMethodId,
            purchases: newPurchases.join(','),
          })
          router.push(`/${product.slug}/${nextUpsell?.slug}?${params.toString()}`)
        } else {
          // Go to thank you
          const params = new URLSearchParams({
            purchases: newPurchases.join(','),
          })
          router.push(`/${product.slug}/thank-you?${params.toString()}`)
        }
      } else {
        toast.error(data.error || 'Failed to process payment')
        setIsProcessing(false)
      }
    } catch (err) {
      console.error('Upsell error:', err)
      toast.error('Payment failed. Please try again.')
      setIsProcessing(false)
    }
  }, [customerId, paymentMethodId, product, upsell, currentPurchases, router])

  // Handle declining the upsell
  const handleDecline = useCallback(() => {
    // Check if there's a downsell
    if (product.downsell?.enabled) {
      const params = new URLSearchParams({
        customer_id: customerId,
        payment_method: paymentMethodId,
        purchases: currentPurchases.join(','),
      })
      router.push(`/${product.slug}/downsell?${params.toString()}`)
    } else {
      // Go to thank you
      const params = new URLSearchParams({
        purchases: currentPurchases.join(','),
      })
      router.push(`/${product.slug}/thank-you?${params.toString()}`)
    }
  }, [product, customerId, paymentMethodId, currentPurchases, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <TrustBadges variant="compact" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Success Banner */}
        <SuccessBanner productName={product.name} />

        {/* Upsell Offer */}
        <div className="mt-8">
          <UpsellOffer
            upsell={upsell}
            currency={product.stripe.currency}
            onAccept={handleAccept}
            onDecline={handleDecline}
            isProcessing={isProcessing}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-3xl px-4 text-center text-xs text-gray-500">
          Your card will be charged immediately. No additional card entry required.
        </div>
      </footer>
    </div>
  )
}
