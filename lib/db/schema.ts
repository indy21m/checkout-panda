import { pgTable, text, boolean, timestamp, jsonb, integer, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
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
 * Product type - determines what kind of product this is
 */
export type ProductType = 'main' | 'upsell' | 'downsell' | 'bump'

/**
 * Offer config for upsell/downsell products (stored in JSONB config)
 */
export interface OfferConfig {
  stripe: {
    productId: string | null
    priceId: string | null
    priceAmount: number
    currency: Currency
  }
  title: string
  subtitle?: string
  description: string
  benefits: string[]
  originalPrice?: number
  image?: string
  urgencyText?: string // For upsells
  enabled?: boolean // For downsells
}

/**
 * Bump config for order bump products (stored in JSONB config)
 */
export interface BumpConfig {
  stripe: {
    productId: string | null
    priceId: string | null
    priceAmount: number
    currency: Currency
  }
  title: string
  description: string
  savingsPercent?: number
  image?: string
  enabled: boolean
}

/**
 * Main product config stored as JSONB (excludes id, slug, name which are columns)
 */
export interface MainProductConfig {
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
  thankYou: ThankYouContent
  integrations?: IntegrationConfig
  meta?: SEOMeta
}

/**
 * Product config stored as JSONB - varies by product type
 * For backward compatibility during migration, we keep the old fields as optional
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
  // Main product fields
  checkout?: CheckoutContent
  thankYou?: ThankYouContent
  integrations?: IntegrationConfig
  meta?: SEOMeta
  // Legacy nested offers (kept for backward compatibility during migration)
  orderBump?: OrderBump
  upsells?: Upsell[]
  downsell?: Downsell
  // Offer/Bump specific fields (for upsell/downsell/bump product types)
  title?: string
  subtitle?: string
  description?: string
  benefits?: string[]
  originalPrice?: number
  image?: string
  urgencyText?: string
  savingsPercent?: number
  enabled?: boolean
}

/**
 * Products table - stores full product config as JSONB
 * Products can be of type: 'main' (full products), 'upsell', 'downsell', or 'bump'
 */
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  type: text('type').$type<ProductType>().notNull().default('main'),
  config: jsonb('config').notNull().$type<ProductConfig>(),
  stripeProductId: text('stripe_product_id'),
  stripeSyncedAt: timestamp('stripe_synced_at', { withTimezone: true }),
  stripeSyncStatus: text('stripe_sync_status')
    .$type<'pending' | 'synced' | 'error'>()
    .default('pending'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

/**
 * Product offers junction table - links main products to their offers (upsells, downsells, bumps)
 */
export const productOffers = pgTable('product_offers', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: text('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  offerId: text('offer_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  role: text('role').$type<'upsell' | 'downsell' | 'bump'>().notNull(),
  position: integer('position').notNull().default(1),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/**
 * Relations for products
 */
export const productsRelations = relations(products, ({ many }) => ({
  // Offers this product has (when it's a main product)
  offers: many(productOffers, { relationName: 'productToOffers' }),
  // Products this offer is linked to (when it's an offer product)
  linkedTo: many(productOffers, { relationName: 'offerToProducts' }),
}))

/**
 * Relations for product offers
 */
export const productOffersRelations = relations(productOffers, ({ one }) => ({
  product: one(products, {
    fields: [productOffers.productId],
    references: [products.id],
    relationName: 'productToOffers',
  }),
  offer: one(products, {
    fields: [productOffers.offerId],
    references: [products.id],
    relationName: 'offerToProducts',
  }),
}))

/**
 * Stripe prices table - tracks Stripe price IDs for each tier
 */
export const stripePrices = pgTable('stripe_prices', {
  id: text('id').primaryKey(), // Format: "product-id:tier-id"
  productId: text('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  tierId: text('tier_id').notNull(),
  stripePriceId: text('stripe_price_id'),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull(),
  isRecurring: boolean('is_recurring').default(false),
  recurringInterval: text('recurring_interval'),
  recurringCount: integer('recurring_count'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/**
 * Calendar settings table - single-row config for scheduling
 */
export const calendarSettings = pgTable('calendar_settings', {
  id: text('id').primaryKey().default('default'),
  timezone: text('timezone').notNull().default('Europe/Copenhagen'),
  weeklySchedule: jsonb('weekly_schedule')
    .notNull()
    .$type<import('@/types').WeeklySchedule>()
    .default({
      monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      sunday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    }),
  slotDurationMinutes: integer('slot_duration_minutes').notNull().default(30),
  minNoticeHours: integer('min_notice_hours').notNull().default(24),
  maxDaysInAdvance: integer('max_days_in_advance').notNull().default(30),
  bufferMinutes: integer('buffer_minutes').notNull().default(15),
  meetingTypes: jsonb('meeting_types')
    .notNull()
    .$type<import('@/types').MeetingType[]>()
    .default([
      { id: 'google-meet', label: 'Google Meet', enabled: true },
      { id: 'phone', label: 'Phone Call', enabled: true },
    ]),
  googleCalendarConnected: boolean('google_calendar_connected').default(false),
  googleAccessToken: text('google_access_token'),
  googleRefreshToken: text('google_refresh_token'),
  googleTokenExpiresAt: timestamp('google_token_expires_at', { withTimezone: true }),
  googleCalendarId: text('google_calendar_id').default('primary'),
  googleEmail: text('google_email'),
  googleName: text('google_name'),
  googlePicture: text('google_picture'),
  displayName: text('display_name'),
  profilePicture: text('profile_picture'),
  meetingTitle: text('meeting_title').default('Intro Call'),
  introText: text('intro_text'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

/**
 * Bookings table - stores scheduling bookings from the public page
 */
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  guestName: text('guest_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  message: text('message'),
  meetingType: text('meeting_type').notNull(),
  googleMeetLink: text('google_meet_link'),
  googleCalendarEventId: text('google_calendar_event_id'),
  status: text('status').$type<import('@/types').BookingStatus>().notNull().default('confirmed'),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancellationReason: text('cancellation_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

/**
 * Testimonial status enum
 */
export type TestimonialStatus = 'pending' | 'approved' | 'rejected'

/**
 * Testimonial form config stored as JSONB
 */
export interface TestimonialFormConfig {
  heading?: string
  description?: string
  thankYouMessage?: string
  collectCompany?: boolean
  collectPhoto?: boolean
  requireRating?: boolean
  customFields?: Array<{
    id: string
    label: string
    type: 'text' | 'textarea'
    required?: boolean
  }>
}

/**
 * Testimonial widget config stored as JSONB
 */
export interface TestimonialWidgetConfig {
  filterByForms?: string[] // Form IDs to filter by
  selectedIds?: string[] // Specific testimonial IDs to show
  testimonialOrder?: 'newest' | 'oldest' | 'rating' | 'random'
  maxItems?: number
  onlyFeatured?: boolean
  layout?: 'grid' | 'carousel' | 'list' | 'masonry'
  showRating?: boolean
  showCompany?: boolean
  showPhoto?: boolean
}

/**
 * Testimonial forms table - collection forms for gathering testimonials
 */
export const testimonialForms = pgTable('testimonial_forms', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  config: jsonb('config').$type<TestimonialFormConfig>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/**
 * Testimonials table - individual testimonial submissions
 */
export const testimonials = pgTable('testimonials', {
  id: uuid('id').primaryKey().defaultRandom(),
  formId: uuid('form_id')
    .notNull()
    .references(() => testimonialForms.id, { onDelete: 'cascade' }),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerCompany: text('customer_company'),
  customerPhoto: text('customer_photo'),
  content: text('content').notNull(),
  rating: integer('rating').notNull(), // 1-5
  status: text('status').$type<TestimonialStatus>().notNull().default('pending'),
  featured: boolean('featured').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
})

/**
 * Testimonial widgets table - configurable display widgets
 */
export const testimonialWidgets = pgTable('testimonial_widgets', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  config: jsonb('config').$type<TestimonialWidgetConfig>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

/**
 * Relations for testimonial forms
 */
export const testimonialFormsRelations = relations(testimonialForms, ({ one, many }) => ({
  product: one(products, {
    fields: [testimonialForms.productId],
    references: [products.id],
  }),
  testimonials: many(testimonials),
}))

/**
 * Relations for testimonials
 */
export const testimonialsRelations = relations(testimonials, ({ one }) => ({
  form: one(testimonialForms, {
    fields: [testimonials.formId],
    references: [testimonialForms.id],
  }),
}))

export type CalendarSettingsRecord = typeof calendarSettings.$inferSelect
export type BookingRecord = typeof bookings.$inferSelect
export type NewBooking = typeof bookings.$inferInsert

export type ProductRecord = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type ProductOfferRecord = typeof productOffers.$inferSelect
export type NewProductOffer = typeof productOffers.$inferInsert
export type StripePriceRecord = typeof stripePrices.$inferSelect
export type NewStripePrice = typeof stripePrices.$inferInsert

export type TestimonialFormRecord = typeof testimonialForms.$inferSelect
export type NewTestimonialForm = typeof testimonialForms.$inferInsert
export type TestimonialRecord = typeof testimonials.$inferSelect
export type NewTestimonial = typeof testimonials.$inferInsert
export type TestimonialWidgetRecord = typeof testimonialWidgets.$inferSelect
export type NewTestimonialWidget = typeof testimonialWidgets.$inferInsert
