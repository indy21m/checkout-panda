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
  /** When true, renders a simplified view without collapsible behavior (for modals) */
  isModal?: boolean
}

export function OrderSummary({
  product,
  includeOrderBump,
  breakdown,
  couponCode,
  isModal = false,
}: OrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // In modal mode, always show expanded content
  const showContent = isModal || isExpanded
  const currency = product.stripe.currency

  // Calculate amounts from breakdown or defaults
  const items = breakdown?.items ?? [{ name: product.name, amount: product.stripe.priceAmount }]
  const subtotal = breakdown?.subtotal ?? product.stripe.priceAmount
  const discount = breakdown?.discount ?? 0
  const tax = breakdown?.tax ?? 0
  const taxLabel = breakdown?.taxLabel ?? 'Tax'
  const total = breakdown?.total ?? product.stripe.priceAmount
  const reverseCharge = breakdown?.reverseCharge ?? false

  // Add order bump to items if not in breakdown
  const displayItems = [...items]
  if (includeOrderBump && product.orderBump?.enabled && !breakdown) {
    displayItems.push({
      name: product.orderBump.title,
      amount: product.orderBump.stripe.priceAmount,
    })
  }

  // Calculate display totals
  const displaySubtotal =
    includeOrderBump && product.orderBump?.enabled && !breakdown
      ? subtotal + product.orderBump.stripe.priceAmount
      : subtotal

  const displayTotal =
    includeOrderBump && product.orderBump?.enabled && !breakdown
      ? total + product.orderBump.stripe.priceAmount
      : total

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
              className={cn('h-4 w-4 text-gray-400 transition-transform', isExpanded && 'rotate-180')}
            />
          </div>
          <span className="text-lg font-bold text-gray-900">
            {formatMoney(displayTotal, currency)}
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
          <span className="font-medium text-gray-900">
            {formatMoney(displaySubtotal, currency)}
          </span>
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
            <span className="font-medium text-green-600">-{formatMoney(discount, currency)}</span>
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
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900">
            {formatMoney(displayTotal, currency)}
          </span>
        </div>

        {/* Trust Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          <span>Secure checkout - Your data is encrypted</span>
        </div>
      </div>
    </div>
  )
}
