'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/currency'
import { Heart, CheckCircle, ChevronDown } from 'lucide-react'
import { PricingSelector } from './PricingSelector'
import { CouponInput } from './CouponInput'
import { OrderBump } from './OrderBump'
import { OrderSummaryModal } from './OrderSummaryModal'
import type { Product, PriceBreakdown } from '@/types'

interface ProductCardProps {
  product: Product
  selectedPriceTierId: string
  onPriceTierChange: (tierId: string) => void
  onCouponApplied: (code: string, discountType: 'percent' | 'fixed', discountAmount: number) => void
  breakdown: PriceBreakdown | null
  includeOrderBump: boolean
  onOrderBumpChange: (checked: boolean) => void
  couponCode: string | null
}

export function ProductCard({
  product,
  selectedPriceTierId,
  onPriceTierChange,
  onCouponApplied,
  breakdown,
  includeOrderBump,
  onOrderBumpChange,
  couponCode,
}: ProductCardProps) {
  const [showAllBenefits, setShowAllBenefits] = useState(false)
  const currency = product.stripe.currency

  // Get current tier info
  const selectedTier = product.stripe.pricingTiers?.find((t) => t.id === selectedPriceTierId)
  const isInstallment = selectedTier?.installments

  // Calculate display amount
  const baseAmount = selectedTier?.priceAmount ?? product.stripe.priceAmount
  const orderBumpAmount =
    includeOrderBump && product.orderBump?.enabled ? product.orderBump.stripe.priceAmount : 0

  // For installments: today = first installment + order bump
  // For one-time: today = total (or base + order bump if no breakdown)
  const displayAmount = isInstallment
    ? (selectedTier.installments?.amountPerPayment ?? product.stripe.priceAmount) + orderBumpAmount
    : (breakdown?.total ?? baseAmount + orderBumpAmount)

  // Calculate next payment date for installments
  const getNextPaymentDate = (): string => {
    const today = new Date()
    const nextDate = new Date(today)
    const intervalLabel = selectedTier?.installments?.intervalLabel ?? 'month'

    if (intervalLabel === 'month') {
      nextDate.setMonth(nextDate.getMonth() + 1)
    } else if (intervalLabel === 'week') {
      nextDate.setDate(nextDate.getDate() + 7)
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1)
    }

    return nextDate.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
  }

  // Show first 7 benefits by default, rest on expand
  const visibleBenefits = showAllBenefits
    ? product.checkout.benefits
    : product.checkout.benefits.slice(0, 7)
  const hasMoreBenefits = product.checkout.benefits.length > 7

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Product Image */}
      {product.checkout.image && (
        <div className="overflow-hidden rounded-t-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.checkout.image}
            alt={product.name}
            className="h-48 w-full object-cover"
          />
        </div>
      )}

      <div className="p-6">
        {/* Product Title & Description */}
        <h2 className="text-xl font-bold text-gray-900">{product.checkout.title}</h2>
        {product.checkout.subtitle && (
          <p className="mt-2 text-sm text-gray-600">{product.checkout.subtitle}</p>
        )}

        {/* Benefits List */}
        {product.checkout.benefits.length > 0 && (
          <div className="mt-4">
            <ul className="space-y-2 text-sm text-gray-700">
              <AnimatePresence initial={false}>
                {visibleBenefits.map((benefit, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2"
                  >
                    <span className="flex-shrink-0">
                      {benefit.startsWith('✅') ||
                      benefit.startsWith('🎁') ||
                      benefit.startsWith('👨') ||
                      benefit.startsWith('🔎') ||
                      benefit.startsWith('🇩🇰') ||
                      benefit.startsWith('📊') ||
                      benefit.startsWith('🍾') ||
                      benefit.startsWith('🍀') ||
                      benefit.startsWith('🚨')
                        ? ''
                        : '•'}
                    </span>
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {hasMoreBenefits && (
              <button
                type="button"
                onClick={() => setShowAllBenefits(!showAllBenefits)}
                className="mt-2 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <span>{showAllBenefits ? 'See less' : 'See more'}</span>
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform', showAllBenefits && 'rotate-180')}
                />
              </button>
            )}
          </div>
        )}

        {/* Order Bump */}
        {product.orderBump && (
          <div className="mt-4">
            <OrderBump
              orderBump={product.orderBump}
              currency={currency}
              checked={includeOrderBump}
              onChange={onOrderBumpChange}
            />
          </div>
        )}

        {/* Trust Badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
            <Heart className="h-3.5 w-3.5 fill-current" />
            <span>30 Day Money Back Guarantee</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>NOT a Subscription</span>
          </div>
        </div>

        {/* Pricing Selector */}
        {product.stripe.pricingTiers && product.stripe.pricingTiers.length > 1 && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <PricingSelector
              tiers={product.stripe.pricingTiers}
              selectedTierId={selectedPriceTierId}
              currency={currency}
              onChange={onPriceTierChange}
            />
          </div>
        )}

        {/* Coupon Input */}
        <div className="mt-4">
          <CouponInput productSlug={product.slug} onCouponApplied={onCouponApplied} />
        </div>

        {/* Total Due Today */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Total due today</span>
              {breakdown?.discount && breakdown.discount > 0 && (
                <p className="text-xs text-green-600">
                  Discount applied: -{formatMoney(breakdown.discount, currency)}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-gray-900">
                {formatMoney(displayAmount, currency)}
              </span>
            </div>
          </div>

          {/* View order details link */}
          <OrderSummaryModal
            product={product}
            breakdown={breakdown}
            includeOrderBump={includeOrderBump}
            couponCode={couponCode}
            selectedPriceTierId={selectedPriceTierId}
          >
            <button type="button" className="mt-1 text-xs text-blue-600 hover:underline">
              View order details
            </button>
          </OrderSummaryModal>

          {/* Next payment date - only shown for installments */}
          {isInstallment && (
            <p className="mt-2 text-sm text-gray-500">Next payment: {getNextPaymentDate()}</p>
          )}
        </div>
      </div>
    </div>
  )
}
