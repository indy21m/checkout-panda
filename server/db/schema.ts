import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const checkoutStatusEnum = pgEnum('checkout_status', ['draft', 'published', 'archived'])
export const blockTypeEnum = pgEnum('block_type', [
  'hero',
  'product',
  'payment',
  'bump',
  'testimonial',
  'trust',
  'custom',
])
export const productTypeEnum = pgEnum('product_type', [
  'digital',
  'service',
  'membership',
  'bundle',
])
export const planTierEnum = pgEnum('plan_tier', ['basic', 'pro', 'enterprise', 'custom'])
export const assetTypeEnum = pgEnum('asset_type', ['download', 'video', 'document', 'resource'])

// Users (from Clerk)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  createdAt: timestamp('created_at').defaultNow(),
})

// Checkouts - The main entity
export const checkouts = pgTable(
  'checkouts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    status: checkoutStatusEnum('status').default('draft'),

    // Page builder data
    pageData: jsonb('page_data')
      .$type<{
        blocks: Array<{
          id: string
          type: string
          data: any
          styles: any
          position: number
        }>
        settings: {
          theme: string
          customCss?: string
          seoMeta?: any
        }
      }>()
      .notNull(),

    // A/B Testing
    isTestVariant: boolean('is_test_variant').default(false),
    parentCheckoutId: uuid('parent_checkout_id'),

    // Analytics
    views: integer('views').default(0),
    conversions: integer('conversions').default(0),
    revenue: integer('revenue').default(0), // in cents

    // Timestamps
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    slugIndex: index('checkout_slug_idx').on(table.slug),
    userIdIndex: index('checkout_user_id_idx').on(table.userId),
  })
)

// Products
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  type: productTypeEnum('type').default('digital'),

  // Visual
  thumbnail: text('thumbnail'), // URL or gradient spec
  color: text('color'), // For gradient backgrounds

  // Pricing (deprecated in favor of plans)
  price: integer('price').notNull(), // in cents - kept for backward compatibility
  stripeProductId: text('stripe_product_id'),
  stripePriceId: text('stripe_price_id'),

  // For subscriptions
  isRecurring: boolean('is_recurring').default(false),
  interval: text('interval'), // 'month', 'year', etc.
  intervalCount: integer('interval_count').default(1),

  // Features
  features: jsonb('features').$type<string[]>().default([]),

  // Analytics
  totalRevenue: integer('total_revenue').default(0), // in cents
  totalSales: integer('total_sales').default(0),
  conversionRate: integer('conversion_rate').default(0), // percentage * 100

  // Status
  isActive: boolean('is_active').default(true),
  isArchived: boolean('is_archived').default(false),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Product Plans (Pricing Tiers)
export const productPlans = pgTable('product_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),

  // Plan details
  name: text('name').notNull(),
  description: text('description'),
  tier: planTierEnum('tier').default('basic'),

  // Pricing
  price: integer('price').notNull(), // in cents
  compareAtPrice: integer('compare_at_price'), // for showing discounts

  // Billing
  isRecurring: boolean('is_recurring').default(false),
  billingInterval: text('billing_interval'), // 'month', 'year'
  billingIntervalCount: integer('billing_interval_count').default(1),
  trialDays: integer('trial_days').default(0),

  // Features
  features: jsonb('features').$type<string[]>().default([]),
  limits: jsonb('limits').$type<Record<string, number>>().default({}),

  // Stripe
  stripePriceId: text('stripe_price_id'),

  // Display
  badge: text('badge'), // e.g., "Most Popular", "Best Value"
  badgeColor: text('badge_color'),
  isHighlighted: boolean('is_highlighted').default(false),
  sortOrder: integer('sort_order').default(0),

  // Status
  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Product Assets (Digital Downloads)
export const productAssets = pgTable('product_assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  planId: uuid('plan_id').references(() => productPlans.id, { onDelete: 'cascade' }), // Optional - asset can be plan-specific

  // Asset details
  name: text('name').notNull(),
  description: text('description'),
  type: assetTypeEnum('type').default('download'),

  // File info
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size'), // in bytes
  mimeType: text('mime_type'),

  // Access control
  requiresPurchase: boolean('requires_purchase').default(true),
  maxDownloads: integer('max_downloads'), // null = unlimited
  expiresInDays: integer('expires_in_days'), // null = never expires

  // Display
  sortOrder: integer('sort_order').default(0),

  createdAt: timestamp('created_at').defaultNow(),
})

// Order Bumps
export const orderBumps = pgTable('order_bumps', {
  id: uuid('id').defaultRandom().primaryKey(),
  checkoutId: uuid('checkout_id')
    .notNull()
    .references(() => checkouts.id),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),

  // Display settings
  headline: text('headline').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  badge: text('badge'),
  discountPercent: integer('discount_percent'),

  // Analytics
  views: integer('views').default(0),
  conversions: integer('conversions').default(0),

  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
})

// Funnel Flows
export const funnels = pgTable('funnels', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  checkoutId: uuid('checkout_id').references(() => checkouts.id),
  name: text('name').notNull(),

  // React Flow data
  flowData: jsonb('flow_data')
    .$type<{
      nodes: Array<{
        id: string
        type: 'trigger' | 'upsell' | 'downsell' | 'condition' | 'thankYou'
        position: { x: number; y: number }
        data: any
      }>
      edges: Array<{
        id: string
        source: string
        target: string
        data?: {
          condition?: any
        }
      }>
    }>()
    .notNull(),

  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// Sessions (for tracking funnel progress)
export const checkoutSessions = pgTable('checkout_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  checkoutId: uuid('checkout_id')
    .notNull()
    .references(() => checkouts.id),
  customerId: text('customer_id'), // Can be null for guest checkout

  // Session state
  currentStep: text('current_step').default('checkout'),
  sessionData: jsonb('session_data')
    .$type<{
      productsPurchased: string[]
      totalSpent: number
      bumpsAccepted: string[]
      upsellsAccepted: string[]
      customerEmail?: string
      metadata?: any
    }>()
    .notNull()
    .default({
      productsPurchased: [],
      totalSpent: 0,
      bumpsAccepted: [],
      upsellsAccepted: [],
    }),

  // Payment
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  paymentMethodId: text('payment_method_id'),

  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
})

// Analytics Events
export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    checkoutId: uuid('checkout_id')
      .notNull()
      .references(() => checkouts.id),
    sessionId: uuid('session_id').references(() => checkoutSessions.id),

    eventType: text('event_type').notNull(), // 'page_view', 'bump_view', 'bump_accept', 'purchase', 'upsell_view', 'upsell_accept'
    eventData: jsonb('event_data'),

    timestamp: timestamp('timestamp').defaultNow(),
  },
  (table) => ({
    checkoutIdIndex: index('event_checkout_id_idx').on(table.checkoutId),
    timestampIndex: index('event_timestamp_idx').on(table.timestamp),
  })
)

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  checkouts: many(checkouts),
  products: many(products),
  funnels: many(funnels),
}))

export const checkoutsRelations = relations(checkouts, ({ one, many }) => ({
  user: one(users, {
    fields: [checkouts.userId],
    references: [users.id],
  }),
  parent: one(checkouts, {
    fields: [checkouts.parentCheckoutId],
    references: [checkouts.id],
  }),
  children: many(checkouts),
  orderBumps: many(orderBumps),
  sessions: many(checkoutSessions),
  events: many(analyticsEvents),
  funnel: one(funnels, {
    fields: [checkouts.id],
    references: [funnels.checkoutId],
  }),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  orderBumps: many(orderBumps),
  plans: many(productPlans),
  assets: many(productAssets),
}))

export const productPlansRelations = relations(productPlans, ({ one, many }) => ({
  product: one(products, {
    fields: [productPlans.productId],
    references: [products.id],
  }),
  assets: many(productAssets),
}))

export const productAssetsRelations = relations(productAssets, ({ one }) => ({
  product: one(products, {
    fields: [productAssets.productId],
    references: [products.id],
  }),
  plan: one(productPlans, {
    fields: [productAssets.planId],
    references: [productPlans.id],
  }),
}))

export const orderBumpsRelations = relations(orderBumps, ({ one }) => ({
  checkout: one(checkouts, {
    fields: [orderBumps.checkoutId],
    references: [checkouts.id],
  }),
  product: one(products, {
    fields: [orderBumps.productId],
    references: [products.id],
  }),
}))

export const funnelsRelations = relations(funnels, ({ one }) => ({
  user: one(users, {
    fields: [funnels.userId],
    references: [users.id],
  }),
  checkout: one(checkouts, {
    fields: [funnels.checkoutId],
    references: [checkouts.id],
  }),
}))

export const checkoutSessionsRelations = relations(checkoutSessions, ({ one, many }) => ({
  checkout: one(checkouts, {
    fields: [checkoutSessions.checkoutId],
    references: [checkouts.id],
  }),
  events: many(analyticsEvents),
}))

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  checkout: one(checkouts, {
    fields: [analyticsEvents.checkoutId],
    references: [checkouts.id],
  }),
  session: one(checkoutSessions, {
    fields: [analyticsEvents.sessionId],
    references: [checkoutSessions.id],
  }),
}))
