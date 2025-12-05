/**
 * Core types for the checkout system
 */

// Currency types
export type Currency = 'USD' | 'EUR' | 'DKK'

// Pricing tier for products with multiple payment options
export interface PricingTier {
  id: string // e.g., 'one-time', 'installment-3'
  label: string // e.g., 'Pay in Full', '3 Monthly Payments'
  priceId: string // Stripe price ID
  priceAmount: number // Total amount in cents/øre
  originalPrice?: number // For strikethrough display
  isDefault?: boolean // Which option is selected by default
  description?: string // e.g., 'Save 100 kr compared to installment plan'
  installments?: {
    count: number // Number of payments (e.g., 3)
    intervalLabel: string // e.g., 'month'
    amountPerPayment: number // Amount per payment in cents/øre
  }
}

// Stripe configuration for a product/price
export interface StripeConfig {
  productId: string // prod_xxx
  priceId: string // price_xxx (default/fallback price)
  priceAmount: number // Amount in cents (default/fallback amount)
  currency: Currency
  pricingTiers?: PricingTier[] // Optional: Multiple pricing options (one-time vs installments)
}

// Testimonial displayed on checkout
export interface Testimonial {
  quote: string
  author: string
  role?: string
  avatar?: string
}

// FAQ item
export interface FAQItem {
  question: string
  answer: string
}

// Order bump configuration
export interface OrderBump {
  enabled: boolean
  stripe: StripeConfig
  title: string
  description: string
  savingsPercent?: number
  image?: string
}

// Upsell offer configuration
export interface Upsell {
  id: string
  slug: string // e.g., 'upsell-1', 'upsell-2'
  stripe: StripeConfig
  title: string
  subtitle?: string
  description: string
  benefits: string[]
  originalPrice?: number // For showing strikethrough price
  image?: string
  urgencyText?: string // e.g., "This offer disappears when you leave"
}

// Downsell offer configuration
export interface Downsell {
  enabled: boolean
  slug: string // e.g., 'downsell'
  stripe: StripeConfig
  title: string
  subtitle?: string
  description: string
  benefits: string[]
  originalPrice?: number
  image?: string
}

// Checkout page content
export interface CheckoutContent {
  title: string
  subtitle?: string
  image: string
  benefits: string[]
  testimonial?: Testimonial // Single testimonial (backward compatibility)
  testimonials?: Testimonial[] // Multiple testimonials (new)
  guarantee: string
  guaranteeDays?: number
  faq?: FAQItem[]
}

// Thank you page content
export interface ThankYouContent {
  headline: string
  subheadline?: string
  steps: Array<{
    title: string
    description: string
  }>
  ctaButton?: {
    text: string
    url: string
  }
}

// Integration configuration
export interface IntegrationConfig {
  convertkitTags?: string[]
  circleSpaceId?: string
  zapierWebhookUrl?: string
}

// SEO metadata
export interface SEOMeta {
  title?: string
  description?: string
  ogImage?: string
}

// Complete product configuration
export interface Product {
  id: string
  slug: string // URL slug: /[slug]/checkout
  name: string
  stripe: StripeConfig
  checkout: CheckoutContent
  orderBump?: OrderBump
  upsells?: Upsell[]
  downsell?: Downsell
  thankYou: ThankYouContent
  integrations?: IntegrationConfig
  meta?: SEOMeta
}

// ============================================
// API Request/Response Types
// ============================================

// Create Payment Intent
export interface CreatePaymentIntentRequest {
  productSlug: string
  email: string
  firstName?: string
  lastName?: string
  country?: string
  vatNumber?: string | null
  couponCode?: string | null
  includeOrderBump?: boolean
  priceTierId?: string // Selected pricing tier ID (e.g., 'one-time', 'installment-3')
}

export interface PriceBreakdown {
  subtotal: number
  discount: number
  tax: number
  taxRate: number
  total: number
  currency: Currency
  reverseCharge?: boolean
  taxLabel?: string
  items: Array<{
    name: string
    amount: number
  }>
}

export interface CreatePaymentIntentResponse {
  clientSecret: string
  customerId: string
  paymentIntentId: string
  breakdown: PriceBreakdown
}

// Charge Upsell
export interface ChargeUpsellRequest {
  customerId: string
  paymentMethodId: string
  productSlug: string
  upsellId: string
}

export interface ChargeUpsellResponse {
  success: boolean
  paymentIntentId?: string
  error?: string
  requiresAction?: boolean
}

// Validate Coupon
export interface ValidateCouponRequest {
  code: string
  productSlug: string
}

export interface ValidateCouponResponse {
  valid: boolean
  couponId?: string
  discountType?: 'percent' | 'fixed'
  discountAmount?: number
  name?: string
  error?: string
}

// ============================================
// Checkout State Types
// ============================================

export interface CustomerInfo {
  email: string
  firstName?: string
  lastName?: string
  country: string
  vatNumber?: string | null
}

export interface CheckoutState {
  product: Product
  customer: CustomerInfo
  includeOrderBump: boolean
  selectedPriceTierId?: string // Selected pricing tier ID
  couponCode?: string | null
  couponDiscount?: number
  clientSecret?: string | null
  customerId?: string | null
  paymentIntentId?: string | null
  breakdown?: PriceBreakdown
  isLoading: boolean
  error?: string | null
}

// ============================================
// Upsell Flow Types
// ============================================

export interface UpsellFlowState {
  customerId: string
  paymentMethodId: string
  productSlug: string
  purchasedItems: string[] // ['main', 'bump', 'upsell-1', etc.]
  currentStep: 'upsell-1' | 'upsell-2' | 'downsell' | 'thank-you'
}
