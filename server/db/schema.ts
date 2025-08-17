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
export const currencyEnum = pgEnum('currency', ['USD', 'EUR', 'DKK'])
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed'])
export const couponDurationEnum = pgEnum('coupon_duration', ['forever', 'once', 'repeating'])
export const productScopeEnum = pgEnum('product_scope', ['all', 'specific'])
export const offerContextEnum = pgEnum('offer_context', ['standalone', 'order_bump', 'upsell', 'downsell'])

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
    currency: currencyEnum('currency').default('USD').notNull(),

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

// Product status enum
export const productStatusEnum = pgEnum('product_status', ['active', 'inactive', 'draft'])

// Products
export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    subtitle: text('subtitle'), // Short tagline
    description: text('description'), // Main description shown on checkout
    type: productTypeEnum('type').default('digital'),
    status: productStatusEnum('status').default('draft'),

    // Visual
    thumbnail: text('thumbnail'), // URL or gradient spec
    color: text('color'), // For gradient backgrounds

    // Stripe IDs (for integration)
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
  },
  (table) => ({
    slugIndex: index('products_slug_idx').on(table.slug),
    userIdIndex: index('products_user_id_idx').on(table.userId),
  })
)

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
  currency: currencyEnum('currency').default('USD').notNull(),
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

// Offers - Different pricing contexts for products
export const offers = pgTable(
  'offers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    
    // Basic details
    name: text('name').notNull(),
    description: text('description'),
    
    // Product and context
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    context: offerContextEnum('context').notNull(), // standalone, order_bump, upsell, downsell
    
    // Pricing
    price: integer('price').notNull(), // in cents - the offer price
    compareAtPrice: integer('compare_at_price'), // original price for showing discount
    currency: currencyEnum('currency').default('USD').notNull(),
    
    // Optional coupon association
    couponId: uuid('coupon_id').references(() => coupons.id, { onDelete: 'set null' }),
    
    // Display settings
    headline: text('headline'), // e.g., "Save 30% today only!"
    badgeText: text('badge_text'), // e.g., "LIMITED TIME"
    badgeColor: text('badge_color'), // hex color
    imageUrl: text('image_url'),
    
    // Order bump specific settings
    bumpDescription: text('bump_description'), // Short description for order bump checkbox
    
    // Upsell/Downsell specific settings
    redirectUrl: text('redirect_url'), // Where to redirect after accepting/declining
    declineRedirectUrl: text('decline_redirect_url'), // Where to redirect on decline
    
    // Conditions
    minQuantity: integer('min_quantity').default(1),
    maxQuantity: integer('max_quantity'), // null = unlimited
    
    // Availability
    availableFrom: timestamp('available_from'),
    availableUntil: timestamp('available_until'),
    maxRedemptions: integer('max_redemptions'), // null = unlimited
    currentRedemptions: integer('current_redemptions').default(0),
    
    // Status
    isActive: boolean('is_active').default(true),
    
    // Analytics
    views: integer('views').default(0),
    conversions: integer('conversions').default(0),
    revenue: integer('revenue').default(0), // in cents
    
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    productIdIndex: index('offers_product_id_idx').on(table.productId),
    contextIndex: index('offers_context_idx').on(table.context),
    userIdIndex: index('offers_user_id_idx').on(table.userId),
  })
)

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
  currency: currencyEnum('currency').default('USD').notNull(),
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

// Coupons
export const coupons = pgTable(
  'coupons',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    
    // Coupon details
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    description: text('description'),
    
    // Discount configuration
    discountType: discountTypeEnum('discount_type').notNull(),
    discountValue: integer('discount_value').notNull(), // percentage (0-100) or cents
    currency: currencyEnum('currency').default('USD').notNull(), // Required for fixed discounts
    
    // Duration settings
    duration: couponDurationEnum('duration').default('once').notNull(),
    durationInMonths: integer('duration_in_months'), // for repeating discounts
    
    // Redemption limits
    maxRedemptions: integer('max_redemptions'), // null = unlimited
    maxRedemptionsPerCustomer: integer('max_redemptions_per_customer').default(1),
    limitPerCustomer: integer('limit_per_customer').default(1), // Times a single customer can use
    
    // Minimum requirements
    minSubtotal: integer('min_subtotal'), // Minimum cart subtotal in cents
    
    // Validity period
    startAt: timestamp('start_at'), // When coupon becomes active
    redeemableFrom: timestamp('redeemable_from').defaultNow(), // Deprecated, use startAt
    expiresAt: timestamp('expires_at'),
    
    // Product scope
    productScope: productScopeEnum('product_scope').default('all').notNull(),
    appliesTo: jsonb('applies_to').$type<string[]>().default([]), // Array of product/plan IDs
    
    // Analytics
    timesRedeemed: integer('times_redeemed').default(0),
    
    // Status
    isActive: boolean('is_active').default(true),
    
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    codeIndex: index('coupons_code_idx').on(table.code),
    userIdIndex: index('coupons_user_id_idx').on(table.userId),
    activeIndex: index('coupons_active_idx').on(table.isActive),
  })
)

// Coupon to Product linking
export const couponProducts = pgTable(
  'coupon_products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    couponId: uuid('coupon_id')
      .notNull()
      .references(() => coupons.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    couponProductIndex: index('coupon_product_idx').on(table.couponId, table.productId),
  })
)

// Coupon redemptions tracking
export const couponRedemptions = pgTable(
  'coupon_redemptions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    couponId: uuid('coupon_id')
      .notNull()
      .references(() => coupons.id),
    
    // Customer info
    customerEmail: text('customer_email').notNull(),
    customerId: text('customer_id'), // Stripe customer ID if available
    
    // Session/Payment info
    checkoutSessionId: uuid('checkout_session_id').references(() => checkoutSessions.id),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    
    // Applied discount
    discountApplied: integer('discount_applied').notNull(), // amount in cents
    originalAmount: integer('original_amount').notNull(),
    finalAmount: integer('final_amount').notNull(),
    
    // Product info
    productId: uuid('product_id').references(() => products.id),
    productName: text('product_name'),
    
    redeemedAt: timestamp('redeemed_at').defaultNow(),
  },
  (table) => ({
    couponIdIndex: index('redemptions_coupon_id_idx').on(table.couponId),
    customerEmailIndex: index('redemptions_customer_email_idx').on(table.customerEmail),
    redeemedAtIndex: index('redemptions_redeemed_at_idx').on(table.redeemedAt),
  })
)

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  checkouts: many(checkouts),
  products: many(products),
  funnels: many(funnels),
  coupons: many(coupons),
  offers: many(offers),
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
  couponProducts: many(couponProducts),
  offers: many(offers),
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

export const offersRelations = relations(offers, ({ one }) => ({
  user: one(users, {
    fields: [offers.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [offers.productId],
    references: [products.id],
  }),
  coupon: one(coupons, {
    fields: [offers.couponId],
    references: [coupons.id],
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

export const couponsRelations = relations(coupons, ({ one, many }) => ({
  user: one(users, {
    fields: [coupons.userId],
    references: [users.id],
  }),
  couponProducts: many(couponProducts),
  redemptions: many(couponRedemptions),
  offers: many(offers),
}))

export const couponProductsRelations = relations(couponProducts, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponProducts.couponId],
    references: [coupons.id],
  }),
  product: one(products, {
    fields: [couponProducts.productId],
    references: [products.id],
  }),
}))

export const couponRedemptionsRelations = relations(couponRedemptions, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponRedemptions.couponId],
    references: [coupons.id],
  }),
  product: one(products, {
    fields: [couponRedemptions.productId],
    references: [products.id],
  }),
  checkoutSession: one(checkoutSessions, {
    fields: [couponRedemptions.checkoutSessionId],
    references: [checkoutSessions.id],
  }),
}))

// Quotes Table - For tracking pricing calculations and idempotency
export const quotes = pgTable('quotes', {
  id: text('id').primaryKey(), // quote_<hash>_<timestamp>
  checkoutId: uuid('checkout_id')
    .notNull()
    .references(() => checkouts.id),
  
  // Cart state hash for caching
  cartHash: text('cart_hash').notNull(),
  
  // Customer info
  customerEmail: text('customer_email'),
  customerCountry: text('customer_country').notNull(),
  vatNumber: text('vat_number'),
  
  // Product/Plan references
  productId: uuid('product_id').references(() => products.id),
  planId: uuid('plan_id').references(() => productPlans.id),
  
  // Pricing (all in minor units)
  currency: currencyEnum('currency').notNull(),
  subtotal: integer('subtotal').notNull(),
  discount: integer('discount').default(0),
  tax: integer('tax').default(0),
  total: integer('total').notNull(),
  
  // Line items breakdown
  lineItems: jsonb('line_items').$type<Array<{
    type: 'product' | 'plan' | 'bump' | 'discount' | 'tax'
    label: string
    amount: number
  }>>().default([]),
  
  // Metadata
  meta: jsonb('meta').$type<{
    planInterval?: 'month' | 'year' | 'week' | 'day'
    trialDays?: number
    reverseCharge?: boolean
    couponCode?: string
    orderBumpIds?: string[]
  }>().default({}),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'), // Quote expiration
})

// Orders Table - For webhook-driven fulfillment
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'cancelled',
])

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // References
  checkoutId: uuid('checkout_id').references(() => checkouts.id),
  quoteId: text('quote_id').references(() => quotes.id),
  customerId: text('customer_id'), // Stripe customer ID
  productId: uuid('product_id').references(() => products.id),
  planId: uuid('plan_id').references(() => productPlans.id),
  
  // Stripe references
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
  stripeSetupIntentId: text('stripe_setup_intent_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripeInvoiceId: text('stripe_invoice_id'),
  
  // Customer info
  customerEmail: text('customer_email').notNull(),
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  
  // Billing address
  billingAddress: jsonb('billing_address').$type<{
    line1?: string
    line2?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }>().default({}),
  
  // Pricing (frozen at time of order)
  currency: currencyEnum('currency').notNull(),
  subtotal: integer('subtotal').notNull(),
  discount: integer('discount').default(0),
  tax: integer('tax').default(0),
  total: integer('total').notNull(),
  
  // Order details
  status: orderStatusEnum('status').default('pending').notNull(),
  orderItems: jsonb('order_items').$type<Array<{
    type: 'product' | 'plan' | 'bump'
    id: string
    name: string
    amount: number
    quantity: number
  }>>().default([]),
  
  // Metadata
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  failedAt: timestamp('failed_at'),
  refundedAt: timestamp('refunded_at'),
})

// Quotes Relations
export const quotesRelations = relations(quotes, ({ one, many }) => ({
  checkout: one(checkouts, {
    fields: [quotes.checkoutId],
    references: [checkouts.id],
  }),
  product: one(products, {
    fields: [quotes.productId],
    references: [products.id],
  }),
  plan: one(productPlans, {
    fields: [quotes.planId],
    references: [productPlans.id],
  }),
  orders: many(orders),
}))

// Orders Relations
export const ordersRelations = relations(orders, ({ one }) => ({
  checkout: one(checkouts, {
    fields: [orders.checkoutId],
    references: [checkouts.id],
  }),
  quote: one(quotes, {
    fields: [orders.quoteId],
    references: [quotes.id],
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
  plan: one(productPlans, {
    fields: [orders.planId],
    references: [productPlans.id],
  }),
}))
