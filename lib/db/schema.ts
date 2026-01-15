import { pgTable, text, boolean, timestamp, jsonb, integer } from 'drizzle-orm/pg-core'
import type {
  CheckoutContent,
  OrderBump,
  Upsell,
  Downsell,
  ThankYouContent,
  IntegrationConfig,
  SEOMeta,
  Currency,
} from '@/types'

/**
 * Product config stored as JSONB (excludes id, slug, name which are columns)
 */
export interface ProductConfig {
  stripe: {
    productId: string | null // null = not yet synced to Stripe
    priceId: string | null
    priceAmount: number
    currency: Currency
    pricingTiers?: Array<{
      id: string
      label: string
      priceId: string | null // null = not yet synced
      priceAmount: number
      originalPrice?: number
      isDefault?: boolean
      description?: string
      installments?: {
        count: number
        intervalLabel: string
        amountPerPayment: number
      }
    }>
  }
  checkout: CheckoutContent
  orderBump?: OrderBump
  upsells?: Upsell[]
  downsell?: Downsell
  thankYou: ThankYouContent
  integrations?: IntegrationConfig
  meta?: SEOMeta
}

/**
 * Products table - stores full product config as JSONB
 */
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  config: jsonb('config').notNull().$type<ProductConfig>(),
  stripeProductId: text('stripe_product_id'),
  stripeSyncedAt: timestamp('stripe_synced_at', { withTimezone: true }),
  stripeSyncStatus: text('stripe_sync_status').$type<'pending' | 'synced' | 'error'>().default('pending'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

/**
 * Stripe prices table - tracks Stripe price IDs for each tier
 */
export const stripePrices = pgTable('stripe_prices', {
  id: text('id').primaryKey(), // Format: "product-id:tier-id"
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  tierId: text('tier_id').notNull(),
  stripePriceId: text('stripe_price_id'),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull(),
  isRecurring: boolean('is_recurring').default(false),
  recurringInterval: text('recurring_interval'),
  recurringCount: integer('recurring_count'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type ProductRecord = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type StripePriceRecord = typeof stripePrices.$inferSelect
export type NewStripePrice = typeof stripePrices.$inferInsert
