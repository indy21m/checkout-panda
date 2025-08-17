'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, Clock, Zap, Star } from 'lucide-react'
import { api } from '@/lib/trpc/client'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'

interface UpsellRendererProps {
  session: {
    id: string
    currentStep: string | null
    sessionData: {
      productsPurchased: string[]
      totalSpent: number
      customerEmail?: string
      [key: string]: unknown
    }
    funnelData: {
      currentOffer: {
        id: string
        type: 'upsell' | 'downsell'
        productId: string
        product: {
          name: string
          description: string
          price: number
          imageUrl?: string
        }
        headline: string
        subheadline?: string
        bulletPoints?: string[]
        scarcityText?: string
        discountPercent?: number
        timerMinutes?: number
      }
      acceptPath?: string
      declinePath?: string
    } | null
    [key: string]: unknown
  }
}

export function UpsellRenderer({ session }: UpsellRendererProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [timeLeft, setTimeLeft] = useState(
    session.funnelData?.currentOffer.timerMinutes
      ? session.funnelData.currentOffer.timerMinutes * 60
      : 0
  )

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
    return undefined
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAccept = api.checkout.acceptUpsell.useMutation({
    onSuccess: (data) => {
      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })

      // Navigate to next step
      setTimeout(() => {
        if (data.nextPath) {
          router.push(data.nextPath)
        } else {
          router.push(`/thank-you/${session.id}`)
        }
      }, 1500)
    },
  })

  const handleDecline = api.checkout.declineUpsell.useMutation({
    onSuccess: (data) => {
      if (data.nextPath) {
        router.push(data.nextPath)
      } else {
        router.push(`/thank-you/${session.id}`)
      }
    },
  })

  const onAccept = async () => {
    setIsProcessing(true)
    handleAccept.mutate({
      sessionId: session.id,
      offerId: session.funnelData?.currentOffer.id || '',
    })
  }

  const onDecline = async () => {
    setIsProcessing(true)
    handleDecline.mutate({
      sessionId: session.id,
      offerId: session.funnelData?.currentOffer.id || '',
    })
  }

  // Early return after all hooks
  if (!session.funnelData) {
    // Redirect to thank you page if no funnel data
    router.push(`/thank-you/${session.id}`)
    return null
  }

  const offer = session.funnelData.currentOffer
  const displayPrice = offer.discountPercent
    ? Math.round(2999 * (1 - offer.discountPercent / 100)) // Default price - should come from offers
    : 2999 // Default price - should come from offers

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Sticky Header with Timer */}
      {timeLeft > 0 && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-orange-500 to-pink-500 py-3 text-center text-white shadow-lg">
          <div className="flex items-center justify-center gap-2 text-sm font-medium md:text-base">
            <Clock className="h-5 w-5 animate-pulse" />
            <span>Special offer expires in {formatTime(timeLeft)}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl"
        >
          {/* Congratulations Message */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
            >
              <Check className="h-8 w-8 text-green-600" />
            </motion.div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
              Congratulations! Your Order is Confirmed
            </h1>
            <p className="text-gray-600">
              But wait... We have a special one-time offer just for you!
            </p>
          </div>

          {/* Offer Card */}
          <Card variant="glass" className="overflow-hidden">
            {/* Offer Type Badge */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-center">
              <p className="text-sm font-semibold tracking-wider text-white uppercase">
                {offer.type === 'upsell' ? '🎁 EXCLUSIVE UPGRADE' : '💎 SPECIAL OFFER'}
              </p>
            </div>

            <div className="p-8 md:p-12">
              {/* Headline */}
              <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 md:text-4xl">
                {offer.headline}
              </h2>

              {/* Subheadline */}
              {offer.subheadline && (
                <p className="mb-8 text-center text-lg text-gray-600">{offer.subheadline}</p>
              )}

              {/* Product Display */}
              <div className="mb-8 grid gap-8 md:grid-cols-2">
                {/* Product Image */}
                {offer.product.imageUrl && (
                  <div className="flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={offer.product.imageUrl}
                      alt={offer.product.name}
                      className="max-h-64 rounded-lg object-contain shadow-xl"
                    />
                  </div>
                )}

                {/* Product Info */}
                <div className={offer.product.imageUrl ? '' : 'md:col-span-2'}>
                  <h3 className="mb-3 text-2xl font-semibold">{offer.product.name}</h3>
                  <p className="mb-6 text-gray-600">{offer.product.description}</p>

                  {/* Bullet Points */}
                  {offer.bulletPoints && offer.bulletPoints.length > 0 && (
                    <ul className="mb-6 space-y-3">
                      {offer.bulletPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Price Display */}
                  <div className="mb-6">
                    {offer.discountPercent ? (
                      <div className="flex items-center gap-4">
                        <span className="text-2xl text-gray-500 line-through">
                          $29.99
                        </span>
                        <span className="text-primary text-4xl font-bold">
                          ${(displayPrice / 100).toFixed(2)}
                        </span>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                          Save {offer.discountPercent}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-primary text-4xl font-bold">
                        ${(displayPrice / 100).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Scarcity Text */}
                  {offer.scarcityText && (
                    <div className="mb-6 flex items-center gap-2 text-orange-600">
                      <Zap className="h-5 w-5" />
                      <span className="font-medium">{offer.scarcityText}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onAccept}
                  disabled={isProcessing}
                  className="min-w-[200px]"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </div>
                  ) : (
                    <>Yes! Add This To My Order</>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onDecline}
                  disabled={isProcessing}
                  className="text-gray-500 hover:text-gray-700"
                >
                  No thanks, I&apos;ll pass on this deal
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t pt-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>30-Day Money Back Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Rated 4.9/5 by 10,000+ customers</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Skip Link */}
          <div className="mt-6 text-center">
            <button
              onClick={onDecline}
              disabled={isProcessing}
              className="text-sm text-gray-500 underline hover:text-gray-700"
            >
              Skip this offer →
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
