'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/currency'
import type { PricingTier, Currency } from '@/types'

interface PricingSelectorProps {
  tiers: PricingTier[]
  selectedTierId: string
  currency: Currency
  onChange: (tierId: string) => void
}

export function PricingSelector({
  tiers,
  selectedTierId,
  currency,
  onChange,
}: PricingSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Choose Your Payment Option</h3>

      {tiers.map((tier) => {
        const isSelected = tier.id === selectedTierId

        return (
          <motion.div
            key={tier.id}
            onClick={() => onChange(tier.id)}
            className={cn(
              'relative cursor-pointer rounded-xl border-2 p-4 transition-all',
              isSelected
                ? 'border-green-500 bg-green-50/50'
                : 'border-gray-200 bg-white hover:border-green-300'
            )}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-start gap-3">
              {/* Radio Circle */}
              <div
                className={cn(
                  'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'
                )}
              >
                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">{tier.label}</h4>

                  {/* Price Display */}
                  <div className="text-right">
                    {tier.originalPrice && (
                      <div className="text-sm text-gray-400 line-through">
                        {formatMoney(tier.originalPrice, currency)}
                      </div>
                    )}
                    <div className="text-lg font-bold text-gray-900">
                      {tier.installments ? (
                        <>
                          {tier.installments.count} ×{' '}
                          {formatMoney(tier.installments.amountPerPayment, currency)}
                          <span className="text-sm font-normal text-gray-500">
                            /{tier.installments.intervalLabel}
                          </span>
                        </>
                      ) : (
                        formatMoney(tier.priceAmount, currency)
                      )}
                    </div>
                  </div>
                </div>

                {/* Total for installments */}
                {tier.installments && (
                  <div className="mt-2 text-xs text-gray-500">
                    {formatMoney(tier.priceAmount, currency)} total
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
