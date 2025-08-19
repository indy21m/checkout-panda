'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Check, X, Loader2, Building2, AlertCircle } from 'lucide-react'
import { api } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { formatVATNumber } from '@/lib/vat'

interface VATFieldProps {
  value: string
  onChange: (value: string) => void
  onValidation?: (result: {
    valid: boolean
    companyName?: string
    companyAddress?: string
    reverseCharge?: boolean
  }) => void
  currency?: string
  amount?: number
  className?: string
  required?: boolean
}

export function VATField({
  value,
  onChange,
  onValidation,
  currency = 'EUR',
  amount = 0,
  className,
  required = false,
}: VATFieldProps) {
  type ValidationResult = {
    valid: boolean
    companyName?: string
    companyAddress?: string
    reverseCharge?: boolean
    error?: string
  }

  const [isValidating, setIsValidating] = React.useState(false)
  const [validationResult, setValidationResult] = React.useState<ValidationResult | null>(null)
  const [hasValidated, setHasValidated] = React.useState(false)

  // VAT validation query
  const validateVAT = api.checkout.validateVAT.useMutation()

  React.useEffect(() => {
    // Handle mutation success
    if (validateVAT.data) {
      setValidationResult(validateVAT.data)
      setHasValidated(true)
      onValidation?.(validateVAT.data)
    }
    // Handle mutation error
    if (validateVAT.error) {
      setValidationResult({
        valid: false,
        error: validateVAT.error.message || 'Validation failed',
      } as ValidationResult)
      setHasValidated(true)
    }
    // Handle mutation settled
    if (validateVAT.isSuccess || validateVAT.isError) {
      setIsValidating(false)
    }
  }, [
    validateVAT.data,
    validateVAT.error,
    validateVAT.isSuccess,
    validateVAT.isError,
    onValidation,
  ])

  // Handle VAT number change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    onChange(newValue)

    // Reset validation if value changes
    if (hasValidated) {
      setHasValidated(false)
      setValidationResult(null)
    }
  }

  // Validate VAT number
  const handleValidate = async () => {
    if (!value || value.length < 8) {
      setValidationResult({
        valid: false,
        error: 'Please enter a valid VAT number',
      })
      setHasValidated(true)
      return
    }

    setIsValidating(true)
    await validateVAT.mutateAsync({ vatNumber: value })
  }

  // Format display value
  const displayValue = React.useMemo(() => {
    return formatVATNumber(value)
  }, [value])

  // Calculate tax savings for reverse charge
  const taxSavings = React.useMemo(() => {
    if (validationResult?.reverseCharge && amount > 0) {
      // Assume 20% VAT for display purposes
      const vatAmount = Math.round(amount * 0.2)
      return vatAmount
    }
    return 0
  }, [validationResult, amount])

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="vat" className="text-sm font-medium text-gray-700">
        EU VAT Number {!required && '(Optional)'}
      </Label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id="vat"
            type="text"
            value={displayValue}
            onChange={handleChange}
            placeholder="DE123456789"
            required={required}
            className={cn(
              'pr-10',
              hasValidated && validationResult?.valid && 'border-green-500 focus:border-green-500',
              hasValidated && !validationResult?.valid && 'border-red-500 focus:border-red-500'
            )}
          />

          {/* Validation status icon */}
          <div className="absolute top-1/2 right-3 -translate-y-1/2">
            {isValidating && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
            {hasValidated && validationResult?.valid && (
              <Check className="h-4 w-4 text-green-500" />
            )}
            {hasValidated && !validationResult?.valid && <X className="h-4 w-4 text-red-500" />}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleValidate}
          disabled={!value || value.length < 8 || isValidating}
        >
          {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Validate'}
        </Button>
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-500">
        Business customers in the EU can enter their VAT number for tax exemption
      </p>

      {/* Validation result */}
      <AnimatePresence mode="wait">
        {hasValidated && validationResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {validationResult.valid ? (
              <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">VAT Number Verified</p>
                    {validationResult.companyName && (
                      <p className="mt-1 text-xs text-green-700">{validationResult.companyName}</p>
                    )}
                    {validationResult.companyAddress && (
                      <p className="text-xs text-green-600">{validationResult.companyAddress}</p>
                    )}
                  </div>
                </div>

                {validationResult.reverseCharge && taxSavings > 0 && (
                  <div className="rounded-md bg-green-100 px-2 py-1">
                    <p className="text-xs font-medium text-green-800">
                      ✓ Reverse charge applies - No VAT will be charged
                    </p>
                    {currency && (
                      <p className="text-xs text-green-700">
                        You save approximately{' '}
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: currency,
                        }).format(taxSavings / 100)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-red-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Invalid VAT Number</p>
                    <p className="mt-1 text-xs text-red-600">
                      {validationResult.error || 'The VAT number could not be verified'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
