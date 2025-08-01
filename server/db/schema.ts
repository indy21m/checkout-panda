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
  price: integer('price').notNull(), // in cents
  stripeProductId: text('stripe_product_id'),
  stripePriceId: text('stripe_price_id'),

  // For subscriptions
  isRecurring: boolean('is_recurring').default(false),
  interval: text('interval'), // 'month', 'year', etc.
  intervalCount: integer('interval_count').default(1),

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
