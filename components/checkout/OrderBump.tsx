'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/currency'
import { Check } from 'lucide-react'
import type { OrderBump as OrderBumpType, Currency } from '@/types'

interface OrderBumpProps {
  orderBump: OrderBumpType
  currency: Currency
  checked: boolean
  onChange: (checked: boolean) => void
}

export function OrderBump({ orderBump, currency, checked, onChange }: OrderBumpProps) {
  return (
    <motion.div
      onClick={() => onChange(!checked)}
      className={cn(
        'relative cursor-pointer rounded-xl border-2 border-dashed p-4 transition-all',
        checked
          ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50'
          : 'border-yellow-200 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 hover:border-yellow-400'
      )}
      whileTap={{ scale: 0.99 }}
    >
      {/* Special Offer Badge */}
      <div className="absolute -top-3 left-4 rounded bg-gradient-to-r from-yellow-400 to-orange-400 px-3 py-1 text-xs font-bold text-yellow-900 shadow-sm">
        SPECIAL OFFER
      </div>

      <div className="mt-2 flex items-start gap-3">
        {/* Checkbox */}
        <div
          className={cn(
            'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors',
            checked
              ? 'border-green-500 bg-green-500'
              : 'border-yellow-400 bg-white hover:border-yellow-500'
          )}
        >
          {checked && <Check className="h-3 w-3 text-white" />}
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="font-semibold text-gray-900">
            Yes! Add {orderBump.title} for just{' '}
            <span className="text-green-600">
              {formatMoney(orderBump.stripe.priceAmount, currency)}
            </span>
            {orderBump.savingsPercent && (
              <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Save {orderBump.savingsPercent}%
              </span>
            )}
          </p>
          <p className="mt-1 text-sm text-gray-600">{orderBump.description}</p>
        </div>
      </div>

      {/* Optional Image */}
      {orderBump.image && (
        <div className="mt-3 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={orderBump.image}
            alt={orderBump.title}
            className="h-16 w-auto rounded object-contain"
          />
        </div>
      )}
    </motion.div>
  )
}
