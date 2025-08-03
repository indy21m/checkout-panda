// Currency types and utilities

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'DKK'] as const
export type Currency = (typeof SUPPORTED_CURRENCIES)[number]

// Currency configuration
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
  const config = CURRENCY_CONFIG[currency]
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
