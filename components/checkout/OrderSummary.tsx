'use client'

import { useState } from 'react'
import { formatMoney } from '@/lib/currency'
import { Tag, ShieldCheck, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product, PriceBreakdown } from '@/types'

interface OrderSummaryProps {
  product: Product
  includeOrderBump: boolean
  breakdown: PriceBreakdown | null
  couponCode: string | null
  selectedPriceTierId: string
  /** When true, renders a simplified view without collapsible behavior (for modals) */
  isModal?: boolean
}

/**
 * Calculate the next payment date based on interval
 */
function getNextPaymentDate(intervalLabel: string): Date {
  const today = new Date()
  const nextDate = new Date(today)

  if (intervalLabel === 'month') {
    nextDate.setMonth(nextDate.getMonth() + 1)
  } else if (intervalLabel === 'week') {
    nextDate.setDate(nextDate.getDate() + 7)
  } else {
    // Default to monthly
    nextDate.setMonth(nextDate.getMonth() + 1)
  }

  return nextDate
}

/**
 * Format date as "Jan 6, 2026"
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Get the final payment month/year
 */
function getFinalPaymentDate(intervalLabel: string, count: number): string {
  const today = new Date()
  const finalDate = new Date(today)

  if (intervalLabel === 'month') {
    finalDate.setMonth(finalDate.getMonth() + count - 1)
  } else if (intervalLabel === 'week') {
    finalDate.setDate(finalDate.getDate() + (count - 1) * 7)
  }

  return finalDate.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export function OrderSummary({
  product,
  includeOrderBump,
  breakdown,
  couponCode,
  selectedPriceTierId,
  isModal = false,
}: OrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // In modal mode, always show expanded content
  const showContent = isModal || isExpanded
  const currency = product.stripe.currency

  // Get selected tier info
  const selectedTier = product.stripe.pricingTiers?.find((t) => t.id === selectedPriceTierId)
  const isInstallment = !!selectedTier?.installments
  const installmentCount = selectedTier?.installments?.count ?? 0
  const installmentAmount = selectedTier?.installments?.amountPerPayment ?? 0
  const intervalLabel = selectedTier?.installments?.intervalLabel ?? 'month'

  // Order bump amount
  const orderBumpAmount =
    includeOrderBump && product.orderBump?.enabled ? product.orderBump.stripe.priceAmount : 0

  // Calculate amounts based on whether it's installment or one-time
  let todayTotal: number
  let displayItems: Array<{ name: string; amount: number }> = []

  if (isInstallment) {
    // For installments: today's payment = first installment + order bump
    todayTotal = installmentAmount + orderBumpAmount
    displayItems = [
      {
        name: `${product.name} (${installmentCount} payments)`,
        amount: selectedTier?.priceAmount ?? product.stripe.priceAmount,
      },
    ]
    if (orderBumpAmount > 0 && product.orderBump) {
      displayItems.push({
        name: product.orderBump.title,
        amount: orderBumpAmount,
      })
    }
  } else {
    // For one-time: use breakdown or calculate
    const baseAmount = selectedTier?.priceAmount ?? product.stripe.priceAmount
    todayTotal = breakdown?.total ?? baseAmount + orderBumpAmount

    displayItems = breakdown?.items ?? [{ name: product.name, amount: baseAmount }]

    // Add order bump if not in breakdown
    if (orderBumpAmount > 0 && product.orderBump && !breakdown) {
      displayItems.push({
        name: product.orderBump.title,
        amount: orderBumpAmount,
      })
    }
  }

  // Calculate subtotal and other values
  const subtotal = breakdown?.subtotal ?? displayItems.reduce((sum, item) => sum + item.amount, 0)
  const discount = breakdown?.discount ?? 0
  const tax = breakdown?.tax ?? 0
  const taxLabel = breakdown?.taxLabel ?? 'Tax'
  const reverseCharge = breakdown?.reverseCharge ?? false

  // Next payment date for installments
  const nextPaymentDate = getNextPaymentDate(intervalLabel)
  const finalPaymentDate = getFinalPaymentDate(intervalLabel, installmentCount)

  return (
    <div className={cn(!isModal && 'rounded-2xl border border-gray-100 bg-white shadow-lg')}>
      {/* Mobile Collapsible Header - hidden in modal mode */}
      {!isModal && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between border-b border-gray-100 p-4 transition-colors hover:bg-gray-50 lg:hidden"
          aria-expanded={isExpanded}
          aria-controls="order-summary-content"
          aria-label={isExpanded ? 'Hide order summary' : 'Show order summary'}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {isExpanded ? 'Hide' : 'Show'} order summary
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-gray-400 transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          </div>
          <span className="text-lg font-bold text-gray-900">
            {formatMoney(todayTotal, currency)}
          </span>
        </button>
      )}

      {/* Desktop Header (always visible) - hidden in modal mode (modal has its own header) */}
      {!isModal && (
        <h3 className="hidden p-6 pb-0 text-xl font-bold text-gray-900 lg:block">
          Complete Your Purchase
        </h3>
      )}

      {/* Content - always visible in modal mode */}
      <div
        id="order-summary-content"
        className={cn(
          isModal ? 'pt-2' : 'p-6 pt-2 lg:pt-6',
          !isModal && !showContent && 'hidden lg:block'
        )}
      >
        {isInstallment ? (
          /* ============================================
             INSTALLMENT PAYMENT DISPLAY (Circle-style)
             ============================================ */
          <>
            {/* Today's installment */}
            <div className="flex justify-between border-b border-gray-100 py-3">
              <span className="font-medium text-gray-900">
                Today&apos;s installment (1st of {installmentCount})
              </span>
              <span className="font-semibold text-gray-900">
                {formatMoney(todayTotal, currency)}
              </span>
            </div>

            {/* Order bump included note */}
            {orderBumpAmount > 0 && product.orderBump && (
              <div className="flex justify-between border-b border-gray-100 py-2 text-sm">
                <span className="pl-2 text-gray-500">Includes: {product.orderBump.title}</span>
                <span className="text-gray-500">+{formatMoney(orderBumpAmount, currency)}</span>
              </div>
            )}

            {/* Next monthly installment */}
            <div className="border-b border-gray-100 py-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">
                  Next {intervalLabel}ly installment (2nd of {installmentCount})
                </span>
                <span className="font-semibold text-gray-900">
                  {formatMoney(installmentAmount, currency)}
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {intervalLabel.charAt(0).toUpperCase() + intervalLabel.slice(1)}ly installment on{' '}
                {formatDate(nextPaymentDate)}
              </div>
            </div>

            {/* Remaining installments */}
            {installmentCount > 2 && (
              <div className="border-b border-gray-100 py-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">
                    Remaining {intervalLabel}ly installments ({installmentCount - 2})
                  </span>
                  <span className="font-semibold text-gray-900">
                    {formatMoney(installmentAmount * (installmentCount - 2), currency)}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  Standard {intervalLabel}ly installment ({installmentCount - 2}) &nbsp;&nbsp;
                  {installmentCount - 2}x {formatMoney(installmentAmount, currency)}
                </div>
              </div>
            )}

            {/* Payment schedule note */}
            <div className="border-b border-gray-100 py-3 text-sm text-gray-500">
              Payment schedule: {intervalLabel.charAt(0).toUpperCase() + intervalLabel.slice(1)}ly
              on the {new Date().getDate()}th until {finalPaymentDate}.
            </div>

            {/* Total due today */}
            <div className="flex justify-between pt-4">
              <span className="text-lg font-semibold text-gray-900">Total due today</span>
              <span className="text-xl font-bold text-gray-900">
                {formatMoney(todayTotal, currency)}
              </span>
            </div>
          </>
        ) : (
          /* ============================================
             ONE-TIME PAYMENT DISPLAY
             ============================================ */
          <>
            {/* Line Items */}
            <div className="space-y-3 border-b border-gray-100 pb-4">
              {displayItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name}</span>
                  <span className="font-medium text-gray-900">
                    {formatMoney(item.amount, currency)}
                  </span>
                </div>
              ))}
            </div>

            {/* Subtotal */}
            <div className="flex justify-between border-b border-gray-100 py-3 text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">{formatMoney(subtotal, currency)}</span>
            </div>

            {/* Coupon Discount */}
            {discount > 0 && (
              <div className="flex items-center justify-between border-b border-gray-100 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">
                    Discount {couponCode && <span className="font-medium">({couponCode})</span>}
                  </span>
                </div>
                <span className="font-medium text-green-600">
                  -{formatMoney(discount, currency)}
                </span>
              </div>
            )}

            {/* Tax */}
            {tax > 0 && (
              <div className="flex justify-between border-b border-gray-100 py-3 text-sm">
                <span className="text-gray-600">{taxLabel}</span>
                <span className="text-gray-900">{formatMoney(tax, currency)}</span>
              </div>
            )}

            {/* Reverse Charge Note */}
            {reverseCharge && (
              <div className="border-b border-gray-100 py-3">
                <p className="text-xs text-gray-500">
                  VAT reverse charge applies. Tax will be self-assessed by the buyer.
                </p>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between pt-4">
              <span className="text-lg font-semibold text-gray-900">Total due today</span>
              <span className="text-xl font-bold text-gray-900">
                {formatMoney(todayTotal, currency)}
              </span>
            </div>
          </>
        )}

        {/* Trust Badge */}
        {!isModal && (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <span>Secure checkout - Your data is encrypted</span>
          </div>
        )}
      </div>
    </div>
  )
}
