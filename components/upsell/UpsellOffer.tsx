'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/currency'
import { Check, Loader2, Zap } from 'lucide-react'
import type { Upsell, Currency } from '@/types'

interface UpsellOfferProps {
  upsell: Upsell
  currency: Currency
  onAccept: () => Promise<void>
  onDecline: () => void
  isProcessing: boolean
}

export function UpsellOffer({
  upsell,
  currency,
  onAccept,
  onDecline,
  isProcessing,
}: UpsellOfferProps) {
  const savingsPercent = upsell.originalPrice
    ? Math.round((1 - upsell.stripe.priceAmount / upsell.originalPrice) * 100)
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
    >
      {/* Urgency Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-3">
        <div className="flex items-center justify-center gap-2">
          <Zap className="h-5 w-5 text-white" />
          <p className="text-center font-semibold text-white">
            WAIT! One-Time Exclusive Offer
          </p>
        </div>
      </div>

      <div className="p-8">
        {/* Title */}
        <h1 className="text-center text-2xl font-bold text-gray-900 md:text-3xl">
          {upsell.title}
        </h1>
        {upsell.subtitle && (
          <p className="mt-2 text-center text-gray-600">{upsell.subtitle}</p>
        )}

        {/* Image */}
        {upsell.image && (
          <div className="my-6 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={upsell.image}
              alt={upsell.title}
              className="max-h-48 rounded-lg object-contain"
            />
          </div>
        )}

        {/* Pricing */}
        <div className="my-8 flex items-center justify-center gap-4">
          <span className="text-4xl font-bold text-gray-900 md:text-5xl">
            {formatMoney(upsell.stripe.priceAmount, currency)}
          </span>
          {upsell.originalPrice && (
            <div className="text-left">
              <span className="text-xl text-gray-400 line-through">
                {formatMoney(upsell.originalPrice, currency)}
              </span>
              {savingsPercent && (
                <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                  Save {savingsPercent}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Benefits */}
        {upsell.benefits.length > 0 && (
          <div className="mb-8 rounded-xl bg-gray-50 p-6">
            <h3 className="mb-4 font-semibold text-gray-900">What You&apos;ll Get:</h3>
            <ul className="space-y-3">
              {upsell.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Description */}
        {upsell.description && (
          <p className="mb-8 text-center text-gray-600">{upsell.description}</p>
        )}

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            onClick={onAccept}
            disabled={isProcessing}
            size="lg"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 py-6 text-lg font-bold text-white shadow-lg shadow-green-500/25 hover:from-green-600 hover:to-green-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Adding to your order...
              </>
            ) : (
              <>
                Yes! Add for {formatMoney(upsell.stripe.priceAmount, currency)}
              </>
            )}
          </Button>

          <button
            type="button"
            onClick={onDecline}
            disabled={isProcessing}
            className="w-full py-3 text-sm text-gray-400 transition-colors hover:text-gray-600"
          >
            No thanks, I&apos;ll pass on this exclusive offer
          </button>
        </div>

        {/* Urgency Text - always show expiry warning */}
        <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-gray-400">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-orange-400" />
          <span>
            {upsell.urgencyText || 'This offer expires when you leave this page'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
