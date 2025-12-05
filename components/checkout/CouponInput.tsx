'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Tag, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CouponInputProps {
  productSlug: string
  onCouponApplied: (code: string, discountType: 'percent' | 'fixed', discountAmount: number) => void
}

export function CouponInput({ productSlug, onCouponApplied }: CouponInputProps) {
  const [code, setCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const [discountDisplay, setDiscountDisplay] = useState<string | null>(null)

  const handleValidate = async () => {
    if (!code.trim()) return

    setIsValidating(true)
    setError(null)
    setIsValid(null)

    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase(), productSlug }),
      })

      const data = await response.json()

      if (data.valid) {
        setIsValid(true)
        setAppliedCode(data.couponId || code.toUpperCase())

        const displayText =
          data.discountType === 'percent'
            ? `${data.discountAmount}% off`
            : `$${(data.discountAmount / 100).toFixed(2)} off`
        setDiscountDisplay(displayText)

        onCouponApplied(data.couponId || code.toUpperCase(), data.discountType, data.discountAmount)
      } else {
        setIsValid(false)
        setError(data.error || 'Invalid coupon code')
      }
    } catch {
      setIsValid(false)
      setError('Failed to validate coupon')
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemove = () => {
    setCode('')
    setIsValid(null)
    setError(null)
    setAppliedCode(null)
    setDiscountDisplay(null)
  }

  // If coupon is applied, show success state
  if (appliedCode && isValid) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">{appliedCode}</span>
          <span className="text-sm text-green-600">({discountDisplay})</span>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="rounded p-1 text-green-600 transition-colors hover:bg-green-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className={cn(
              'pr-10',
              isValid === true && 'border-green-500',
              isValid === false && 'border-red-500'
            )}
          />
          {isValid !== null && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2">
              {isValid ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleValidate}
          disabled={!code.trim() || isValidating}
        >
          {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
