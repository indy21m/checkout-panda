'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Check, Tag, Shield, Clock } from 'lucide-react'
import { formatMoney } from '@/lib/currency'
import type { RouterOutputs } from '@/lib/trpc/api'

type Quote = RouterOutputs['checkout']['quote']

interface OrderSummaryProps {
  quote?: Quote | null
  className?: string
  // Legacy props for backward compatibility
  product?: {
    name: string
    price: string
    comparePrice?: string
    type?: string
    badge?: string
    features?: string[]
  }
  orderBumps?: Array<{
    selected: boolean
    data: {
      title: string
      price: string
    }
  }>
  coupon?: {
    code: string
    discountAmount: number
  }
  tax?: {
    rate: number
    amount: number
  }
}

export function OrderSummary({
  quote,
  className,
  // Legacy props - ignored when quote is provided
  product,
  orderBumps = [],
  coupon,
  tax,
}: OrderSummaryProps) {
  // Use quote data if available (new flow)
  if (quote) {
    const currency = quote.currency || 'USD'
    const hasDiscount = (quote.discount || 0) > 0
    const hasTax = (quote.tax || 0) > 0
    const isSubscription = quote.meta?.planInterval
    
    // Format renewal date for subscriptions
    const getNextRenewalDate = () => {
      const date = new Date()
      const interval = quote.meta?.planInterval
      if (interval === 'month') {
        date.setMonth(date.getMonth() + 1)
      } else if (interval === 'year') {
        date.setFullYear(date.getFullYear() + 1)
      } else if (interval === 'week') {
        date.setDate(date.getDate() + 7)
      }
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6",
          className
        )}
      >
        {/* Order Summary Header */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        
        {/* Line Items from Quote */}
        {quote.lineItems && quote.lineItems.length > 0 && (
          <div className="space-y-3 pb-4 border-b border-gray-200">
            {quote.lineItems
              .filter(item => item.type !== 'discount' && item.type !== 'tax')
              .map((item, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.label}</p>
                    {item.type === 'plan' && quote.meta?.trialDays && quote.meta.trialDays > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        {quote.meta.trialDays} day free trial
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatMoney(item.amount, currency)}
                    </div>
                    {isSubscription && item.type === 'plan' && (
                      <div className="text-xs text-gray-500">/{quote.meta?.planInterval}</div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
        
        {/* Price Breakdown */}
        <div className="py-4 space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">
              {formatMoney(quote.subtotal, currency)}
            </span>
          </div>
          
          {/* Discount */}
          {hasDiscount && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {quote.meta?.couponCode ? `Discount (${quote.meta.couponCode})` : 'Discount'}
              </span>
              <span className="font-medium text-green-600">
                -{formatMoney(quote.discount || 0, currency)}
              </span>
            </div>
          )}
          
          {/* Tax */}
          {hasTax && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {quote.meta?.reverseCharge ? 'VAT (Reverse Charge)' : 'Tax'}
              </span>
              <span className="font-medium text-gray-900">
                {formatMoney(quote.tax || 0, currency)}
              </span>
            </div>
          )}
        </div>
        
        {/* Total */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg font-semibold text-gray-900">
                {quote.total === 0 ? 'Free' : 'Total'}
              </span>
              {isSubscription && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {quote.meta?.trialDays && quote.meta.trialDays > 0
                    ? `Starts after ${quote.meta.trialDays} day trial`
                    : `Renews ${getNextRenewalDate()}`}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {quote.total === 0 ? 'Free' : formatMoney(quote.total, currency)}
              </div>
              {isSubscription && quote.total > 0 && (
                <div className="text-sm text-gray-500">per {quote.meta?.planInterval}</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Trust Badges */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4" />
            <span>Secure Checkout</span>
            <span className="text-gray-300">•</span>
            <span>SSL Encrypted</span>
            <span className="text-gray-300">•</span>
            <span>PCI Compliant</span>
          </div>
        </div>
        
        {/* Guarantee Badge */}
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                30-Day Money Back Guarantee
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                Try risk-free. Full refund if not satisfied.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }
  
  // Legacy flow (backward compatibility)
  // Calculate prices (convert from string format to cents)
  const parsePrice = (price: string): number => {
    return parseInt(price.replace(/[^0-9]/g, '')) * 100
  }
  
  const productPrice = product ? parsePrice(product.price) : 0
  const bumpTotal = orderBumps
    .filter((b) => b.selected)
    .reduce((sum, bump) => sum + parsePrice(bump.data.price), 0)
  
  const subtotal = productPrice + bumpTotal
  const discount = coupon?.discountAmount || 0
  const taxAmount = tax?.amount || 0
  const total = subtotal - discount + taxAmount
  
  // Format currency
  const formatCurrency = (cents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }
  
  // Format date for subscription renewal
  const getNextRenewalDate = () => {
    const date = new Date()
    if (product?.type === 'subscription') {
      date.setMonth(date.getMonth() + 1)
    }
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6",
        className
      )}
    >
      {/* Order Summary Header */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
      
      {/* Product Details */}
      {product && (
        <div className="space-y-4 pb-4 border-b border-gray-200">
          <div className="space-y-3">
            {/* Product Name & Price */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{product.name}</h4>
                {product.badge && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full mt-1">
                    <Tag className="w-3 h-3" />
                    {product.badge}
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {formatCurrency(productPrice)}
                </div>
                {product.comparePrice && (
                  <div className="text-sm text-gray-400 line-through">
                    {product.comparePrice}
                  </div>
                )}
                {product.type === 'subscription' && (
                  <div className="text-xs text-gray-500">/month</div>
                )}
              </div>
            </div>
            
            {/* Product Features */}
            {product.features && product.features.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  What&apos;s Included:
                </p>
                <ul className="space-y-1.5">
                  {product.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {product.features.length > 3 && (
                    <li className="text-sm text-blue-600 font-medium pl-6">
                      +{product.features.length - 3} more benefits
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Order Bumps */}
      {orderBumps.length > 0 && orderBumps.some(b => b.selected) && (
        <div className="py-4 border-b border-gray-200 space-y-3">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            Add-ons:
          </p>
          {orderBumps.filter(b => b.selected).map((bump, i) => (
            <div key={i} className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{bump.data.title}</p>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {formatCurrency(parsePrice(bump.data.price))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Price Breakdown */}
      <div className="py-4 space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
        </div>
        
        {/* Discount */}
        {coupon && discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Discount ({coupon.code})
            </span>
            <span className="font-medium text-green-600">
              -{formatCurrency(discount)}
            </span>
          </div>
        )}
        
        {/* Tax */}
        {tax && taxAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Tax ({(tax.rate * 100).toFixed(2)}%)
            </span>
            <span className="font-medium text-gray-900">{formatCurrency(taxAmount)}</span>
          </div>
        )}
      </div>
      
      {/* Total */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-semibold text-gray-900">Total</span>
            {product?.type === 'subscription' && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Renews {getNextRenewalDate()}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(total)}
            </div>
            {product?.type === 'subscription' && (
              <div className="text-sm text-gray-500">per month</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Trust Badges */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield className="w-4 h-4" />
          <span>Secure Checkout</span>
          <span className="text-gray-300">•</span>
          <span>SSL Encrypted</span>
          <span className="text-gray-300">•</span>
          <span>PCI Compliant</span>
        </div>
      </div>
      
      {/* Guarantee Badge */}
      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">
              30-Day Money Back Guarantee
            </p>
            <p className="text-xs text-green-700 mt-0.5">
              Try risk-free. Full refund if not satisfied.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}