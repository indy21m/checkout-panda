/**
 * VAT validation and tax calculation utilities
 * Supports EU VAT validation via VIES and reverse charge mechanism
 */

import { z } from 'zod'

// EU country codes and their standard VAT rates (as of 2025)
export const EU_VAT_RATES: Record<string, number> = {
  AT: 20, // Austria
  BE: 21, // Belgium
  BG: 20, // Bulgaria
  HR: 25, // Croatia
  CY: 19, // Cyprus
  CZ: 21, // Czech Republic
  DK: 25, // Denmark
  EE: 22, // Estonia
  FI: 25.5, // Finland
  FR: 20, // France
  DE: 19, // Germany
  GR: 24, // Greece
  HU: 27, // Hungary
  IE: 23, // Ireland
  IT: 22, // Italy
  LV: 21, // Latvia
  LT: 21, // Lithuania
  LU: 17, // Luxembourg
  MT: 18, // Malta
  NL: 21, // Netherlands
  PL: 23, // Poland
  PT: 23, // Portugal
  RO: 19, // Romania
  SK: 20, // Slovakia
  SI: 22, // Slovenia
  ES: 21, // Spain
  SE: 25, // Sweden
}

// VAT number formats by country
const VAT_FORMATS: Record<string, RegExp> = {
  AT: /^ATU\d{8}$/,
  BE: /^BE0\d{9}$/,
  BG: /^BG\d{9,10}$/,
  HR: /^HR\d{11}$/,
  CY: /^CY\d{8}[A-Z]$/,
  CZ: /^CZ\d{8,10}$/,
  DK: /^DK\d{8}$/,
  EE: /^EE\d{9}$/,
  FI: /^FI\d{8}$/,
  FR: /^FR[A-Z0-9]{2}\d{9}$/,
  DE: /^DE\d{9}$/,
  GR: /^EL\d{9}$/,
  HU: /^HU\d{8}$/,
  IE: /^IE\d{7}[A-Z]{1,2}$/,
  IT: /^IT\d{11}$/,
  LV: /^LV\d{11}$/,
  LT: /^LT(\d{9}|\d{12})$/,
  LU: /^LU\d{8}$/,
  MT: /^MT\d{8}$/,
  NL: /^NL\d{9}B\d{2}$/,
  PL: /^PL\d{10}$/,
  PT: /^PT\d{9}$/,
  RO: /^RO\d{2,10}$/,
  SK: /^SK\d{10}$/,
  SI: /^SI\d{8}$/,
  ES: /^ES[A-Z0-9]\d{7}[A-Z0-9]$/,
  SE: /^SE\d{12}$/,
}

export interface VATValidationResult {
  valid: boolean
  vatNumber?: string
  countryCode?: string
  companyName?: string
  companyAddress?: string
  reverseCharge?: boolean
  error?: string
}

export interface TaxCalculation {
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  reverseCharge: boolean
  taxLabel: string
  currency: string
}

/**
 * Validate VAT number format
 */
export function validateVATFormat(vatNumber: string): boolean {
  const normalized = vatNumber.toUpperCase().replace(/[\s\-\.]/g, '')
  const countryCode = normalized.substring(0, 2)
  const format = VAT_FORMATS[countryCode]

  return format ? format.test(normalized) : false
}

/**
 * Extract country code from VAT number
 */
export function extractCountryFromVAT(vatNumber: string): string | null {
  const normalized = vatNumber.toUpperCase().replace(/[\s\-\.]/g, '')
  const countryCode = normalized.substring(0, 2)

  return VAT_FORMATS[countryCode] ? countryCode : null
}

/**
 * Check if country is in EU
 */
export function isEUCountry(countryCode: string): boolean {
  return countryCode in EU_VAT_RATES
}

/**
 * Validate VAT number via VIES (EU VAT validation service)
 * Note: In production, this should call the actual VIES API
 * For now, we'll do format validation and return mock data
 */
export async function validateVATNumber(vatNumber: string): Promise<VATValidationResult> {
  const normalized = vatNumber.toUpperCase().replace(/[\s\-\.]/g, '')

  // Basic format validation
  if (!validateVATFormat(normalized)) {
    return {
      valid: false,
      error: 'Invalid VAT number format',
    }
  }

  const countryCode = extractCountryFromVAT(normalized)
  if (!countryCode) {
    return {
      valid: false,
      error: 'Invalid country code',
    }
  }

  try {
    // In production, call VIES API here
    // For development, we'll simulate the response

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock successful validation for testing
    // In production, replace with actual VIES API call
    if (normalized.includes('INVALID')) {
      return {
        valid: false,
        vatNumber: normalized,
        countryCode,
        error: 'VAT number not found in VIES database',
      }
    }

    return {
      valid: true,
      vatNumber: normalized,
      countryCode,
      companyName: 'Example Company B.V.',
      companyAddress: '123 Business Street, Amsterdam, Netherlands',
      reverseCharge: true, // B2B transaction eligible for reverse charge
    }
  } catch (error) {
    console.error('VIES validation error:', error)
    return {
      valid: false,
      error: 'Unable to validate VAT number. Please try again later.',
    }
  }
}

/**
 * Calculate tax for a transaction
 *
 * IMPORTANT: For EU B2C sales, prices displayed to consumers MUST be VAT-inclusive
 * by law. This function assumes prices are already VAT-inclusive and does NOT
 * add additional tax on top.
 *
 * The subtotal IS the total - no tax is added.
 */
export function calculateTax({
  amount,
  customerCountry: _customerCountry, // Reserved for future use (country-specific VAT logic)
  businessCountry = 'DK', // Business is in Denmark
  vatNumber,
  isB2B = false,
  currency = 'USD',
}: {
  amount: number // Amount in minor units (cents) - VAT INCLUSIVE
  customerCountry: string
  businessCountry?: string
  vatNumber?: string | null
  isB2B?: boolean
  currency?: string
}): TaxCalculation {
  // For B2B with valid VAT number in EU (not same country) - reverse charge
  // In this case, the business would need to handle VAT differently
  // But for simplicity, we're treating all prices as final (VAT-inclusive)
  if (isB2B && vatNumber && validateVATFormat(vatNumber)) {
    const vatCountry = extractCountryFromVAT(vatNumber)

    // Cross-border B2B in EU - reverse charge notation
    if (vatCountry && vatCountry !== businessCountry && isEUCountry(vatCountry)) {
      return {
        subtotal: amount,
        taxRate: 0,
        taxAmount: 0,
        total: amount,
        reverseCharge: true,
        taxLabel: 'VAT Reverse Charge',
        currency,
      }
    }
  }

  // For all other cases: price is VAT-inclusive, no additional tax
  // This applies to:
  // - EU B2C customers (VAT included in displayed price)
  // - Non-EU customers (no EU VAT applies)
  // - B2B without valid VAT number (treated as B2C)
  return {
    subtotal: amount,
    taxRate: 0,
    taxAmount: 0,
    total: amount, // No additional tax - price is VAT-inclusive
    reverseCharge: false,
    taxLabel: 'VAT Included',
    currency,
  }
}

/**
 * Format VAT number for display
 */
export function formatVATNumber(vatNumber: string): string {
  const normalized = vatNumber.toUpperCase().replace(/[\s\-\.]/g, '')

  // Add spacing for readability
  if (normalized.length > 4) {
    return normalized.replace(/(.{2})(.{4})(.*)/, '$1 $2 $3').trim()
  }

  return normalized
}

/**
 * Get VAT rate for a country
 */
export function getVATRate(countryCode: string): number {
  return EU_VAT_RATES[countryCode] || 0
}

/**
 * Schema for VAT validation input
 */
export const vatValidationSchema = z.object({
  vatNumber: z.string().min(8).max(20),
  countryCode: z.string().length(2).optional(),
})

/**
 * Schema for tax calculation input
 */
export const taxCalculationSchema = z.object({
  amount: z.number().positive(),
  customerCountry: z.string().length(2),
  businessCountry: z.string().length(2).optional(),
  vatNumber: z.string().optional().nullable(),
  isB2B: z.boolean().optional(),
  currency: z.string().length(3).optional(),
})
