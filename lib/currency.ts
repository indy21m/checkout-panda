// Currency types and utilities
import crypto from 'crypto'

// Database only supports these currencies
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'DKK'] as const
export type Currency = (typeof SUPPORTED_CURRENCIES)[number]

// Currency configuration - only includes database-supported currencies
export const CURRENCY_CONFIG = {
  USD: {
    symbol: '$',
    locale: 'en-US',
    name: 'US Dollar',
    decimalPlaces: 2,
  },
  EUR: {
    symbol: '€',
    locale: 'de-DE', // Using German locale for EUR formatting
    name: 'Euro',
    decimalPlaces: 2,
  },
  DKK: {
    symbol: 'kr',
    locale: 'da-DK',
    name: 'Danish Krone',
    decimalPlaces: 2,
  },
} as const

/**
 * Format a price amount in the specified currency
 * @param amount - Amount in smallest currency unit (cents, øre)
 * @param currency - Currency code (USD, EUR, DKK)
 * @param locale - Optional locale override
 */
export function formatPrice(amount: number, currency: Currency = 'USD', locale?: string): string {
  const config = CURRENCY_CONFIG[currency]
  const formatter = new Intl.NumberFormat(locale || config.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
  })

  // Convert from smallest unit to main unit
  return formatter.format(amount / 100)
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_CONFIG[currency].symbol
}

/**
 * Get locale for currency
 */
export function getCurrencyLocale(currency: Currency): string {
  return CURRENCY_CONFIG[currency].locale
}

/**
 * Validate if a currency is supported
 */
export function isSupportedCurrency(currency: string): currency is Currency {
  return SUPPORTED_CURRENCIES.includes(currency as Currency)
}

/**
 * Parse a formatted price string back to cents
 * @param formattedPrice - Formatted price string (e.g., "$10.00", "€10,00")
 * @param currency - Currency code
 */
export function parsePriceToSmallestUnit(formattedPrice: string, currency: Currency): number {
  // Remove currency symbols and non-numeric characters except decimal separators
  const cleanedPrice = formattedPrice.replace(/[^\d.,\-]/g, '').replace(/\s/g, '')

  // Handle different decimal separators based on locale
  const config = CURRENCY_CONFIG[currency as keyof typeof CURRENCY_CONFIG] || { locale: 'en-US' }
  let normalizedPrice = cleanedPrice

  if (config.locale.includes('de') || config.locale.includes('da')) {
    // European format: 1.234,56
    normalizedPrice = cleanedPrice.replace(/\./g, '').replace(',', '.')
  } else {
    // US format: 1,234.56
    normalizedPrice = cleanedPrice.replace(/,/g, '')
  }

  const numericValue = parseFloat(normalizedPrice)
  return Math.round(numericValue * 100)
}

/**
 * Primary currency formatting function for the entire app
 * @param amountInMinor - Amount in minor units (cents, øre, etc)
 * @param currency - ISO 4217 currency code
 * @param locale - Optional locale override
 */
export function formatMoney(amountInMinor: number, currency: string, locale?: string): string {
  const amount = amountInMinor / 100

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Calculate percentage discount
 */
export function calculateDiscount(originalAmount: number, discountPercent: number): number {
  return Math.round(originalAmount * (discountPercent / 100))
}

/**
 * Apply fixed discount (capped at original amount)
 */
export function applyFixedDiscount(originalAmount: number, discountAmount: number): number {
  return Math.max(0, originalAmount - discountAmount)
}

/**
 * Validate currency consistency across items
 */
export function validateCurrencyConsistency(items: Array<{ currency: string; amount: number }>): {
  valid: boolean
  currency?: string
  error?: string
} {
  if (items.length === 0) {
    return { valid: true }
  }

  const firstCurrency = items[0]?.currency
  if (!firstCurrency) {
    return { valid: false, error: 'No currency specified' }
  }

  const inconsistent = items.find((item) => item.currency !== firstCurrency)
  if (inconsistent) {
    return {
      valid: false,
      error: `Mixed currencies not allowed: ${firstCurrency} and ${inconsistent.currency}`,
    }
  }

  return { valid: true, currency: firstCurrency }
}

/**
 * Cart state for hashing and idempotency
 */
export interface CartState {
  productId?: string
  planId?: string | null
  orderBumpIds: string[]
  couponCode?: string | null
  customerCountry: string
  customerEmail?: string
  vatNumber?: string | null
}

/**
 * Generate a deterministic hash key for cart state (for caching and idempotency)
 */
export function cartToKey(cart: CartState): string {
  // Sort bumps for consistency
  const sortedBumps = [...cart.orderBumpIds].sort()

  const normalized = {
    productId: cart.productId || '',
    planId: cart.planId || '',
    bumps: sortedBumps.join(','),
    coupon: (cart.couponCode || '').toUpperCase(),
    country: cart.customerCountry,
    email: cart.customerEmail || '',
    vat: cart.vatNumber || '',
  }

  // Create deterministic string
  const str = JSON.stringify(normalized)

  // Generate hash
  return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16) // Use first 16 chars for brevity
}

/**
 * Generate a quote ID from cart state and timestamp
 */
export function generateQuoteId(cart: CartState): string {
  const cartKey = cartToKey(cart)
  const timestamp = Date.now()
  return `quote_${cartKey}_${timestamp}`
}

/**
 * Check if a quote is expired (default 10 minutes)
 */
export function isQuoteExpired(createdAt: Date, expirationMinutes = 10): boolean {
  const now = Date.now()
  const created = new Date(createdAt).getTime()
  const expirationMs = expirationMinutes * 60 * 1000

  return now - created > expirationMs
}
