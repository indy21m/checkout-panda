'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Zap, Percent } from 'lucide-react'
import { useCheckoutStore } from '@/stores/checkout-store'

interface BumpBlockProps {
  data: {
    productId?: string
    headline: string
    description?: string
    imageUrl?: string
    badge?: string
    originalPrice?: number
    discountedPrice?: number
    discountPercent?: number
    features?: string[]
    urgencyText?: string
    checkboxText?: string
  }
  styles?: {
    padding?: string
    backgroundColor?: string
    className?: string
  }
  bumpId?: string
}

export function BumpBlock({ data, styles, bumpId }: BumpBlockProps) {
  const { selectedBumps, toggleBump, setAvailableBumps, availableBumps } = useCheckoutStore()
  const [isChecked, setIsChecked] = useState(false)

  // Generate bump ID if not provided
  const actualBumpId = bumpId || `bump-${data.productId || Date.now()}`

  // Register this bump in the store
  useEffect(() => {
    if (data.productId && data.discountedPrice) {
      const existingBump = availableBumps.find((b) => b.id === actualBumpId)
      if (!existingBump) {
        setAvailableBumps([
          ...availableBumps,
          {
            id: actualBumpId,
            productId: data.productId,
            name: data.headline,
            price: data.discountedPrice,
            originalPrice: data.originalPrice,
            discountPercent: data.discountPercent,
          },
        ])
      }
    }
  }, [actualBumpId, data, availableBumps, setAvailableBumps])

  // Sync with store state
  useEffect(() => {
    setIsChecked(selectedBumps.includes(actualBumpId))
  }, [selectedBumps, actualBumpId])

  const handleCheckChange = (_checked: boolean) => {
    toggleBump(actualBumpId)
  }

  const showDiscount = data.discountPercent && data.discountPercent > 0
  const displayPrice = showDiscount ? data.discountedPrice : data.originalPrice

  return (
    <section
      className={cn('px-6 py-8', styles?.className)}
      style={{
        backgroundColor: styles?.backgroundColor,
        padding: styles?.padding,
      }}
    >
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            variant="glass"
            className={cn(
              'relative overflow-hidden p-6 transition-all',
              isChecked && 'shadow-xl ring-2 shadow-purple-500/20 ring-purple-500'
            )}
          >
            {/* Badge */}
            {data.badge && (
              <div className="absolute top-6 -right-8 rotate-12">
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-1 text-sm font-bold text-white shadow-lg">
                  {data.badge}
                </div>
              </div>
            )}

            {/* Urgency Text */}
            {data.urgencyText && (
              <div className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-orange-400">
                <Zap className="h-4 w-4 animate-pulse" />
                <span>{data.urgencyText}</span>
              </div>
            )}

            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <div className="pt-1">
                <Checkbox
                  id={actualBumpId}
                  checked={isChecked}
                  onCheckedChange={handleCheckChange}
                  className="h-6 w-6 data-[state=checked]:border-purple-500 data-[state=checked]:bg-purple-500"
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <label htmlFor={actualBumpId} className="cursor-pointer">
                  {/* Headline */}
                  <h3 className="mb-2 text-lg font-bold text-white">
                    {data.checkboxText || 'Yes! Add this to my order'}
                  </h3>

                  {/* Main Content */}
                  <div className="flex gap-6">
                    {/* Image */}
                    {data.imageUrl && (
                      <div className="hidden flex-shrink-0 md:block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={data.imageUrl}
                          alt={data.headline}
                          className="h-32 w-32 rounded-lg object-cover shadow-md"
                        />
                      </div>
                    )}

                    {/* Text Content */}
                    <div className="flex-1">
                      <h4 className="mb-2 font-semibold text-gray-200">{data.headline}</h4>

                      {data.description && (
                        <p className="mb-3 text-sm text-gray-400">{data.description}</p>
                      )}

                      {/* Features */}
                      {data.features && data.features.length > 0 && (
                        <ul className="mb-3 space-y-1">
                          {data.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Plus className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-400" />
                              <span className="text-gray-300">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Price */}
                      <div className="flex items-center gap-3">
                        {showDiscount && data.originalPrice && (
                          <>
                            <span className="text-sm text-gray-500 line-through">
                              ${(data.originalPrice / 100).toFixed(2)}
                            </span>
                            <span className="flex items-center gap-1 rounded-full bg-green-900/30 px-2 py-1 text-xs font-semibold text-green-400">
                              <Percent className="h-3 w-3" />
                              {data.discountPercent}% OFF
                            </span>
                          </>
                        )}
                        {displayPrice && (
                          <span className="text-2xl font-bold text-purple-400">
                            ${(displayPrice / 100).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Selection Animation */}
            {isChecked && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-2 -right-2"
              >
                <div className="rounded-full bg-purple-500 p-2">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
