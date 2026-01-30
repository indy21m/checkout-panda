import { and, desc, eq, inArray, asc, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  testimonialForms,
  testimonials,
  testimonialWidgets,
  type NewTestimonialForm,
  type NewTestimonial,
  type NewTestimonialWidget,
  type TestimonialFormRecord,
  type TestimonialRecord,
  type TestimonialWidgetRecord,
  type TestimonialStatus,
  type TestimonialWidgetConfig,
} from '@/lib/db/schema'

// ============================================================================
// TESTIMONIAL FORMS CRUD
// ============================================================================

export async function createTestimonialForm(
  data: Omit<NewTestimonialForm, 'id' | 'createdAt'>
): Promise<TestimonialFormRecord> {
  const [form] = await db.insert(testimonialForms).values(data).returning()
  if (!form) throw new Error('Failed to create testimonial form')
  return form
}

export async function getAllTestimonialForms(): Promise<TestimonialFormRecord[]> {
  return db.query.testimonialForms.findMany({
    orderBy: [desc(testimonialForms.createdAt)],
  })
}

export async function getTestimonialFormBySlug(
  slug: string
): Promise<TestimonialFormRecord | undefined> {
  return db.query.testimonialForms.findFirst({
    where: eq(testimonialForms.slug, slug),
  })
}

export async function getTestimonialFormById(
  id: string
): Promise<TestimonialFormRecord | undefined> {
  return db.query.testimonialForms.findFirst({
    where: eq(testimonialForms.id, id),
  })
}

export async function updateTestimonialForm(
  id: string,
  data: Partial<Omit<NewTestimonialForm, 'id' | 'createdAt'>>
): Promise<TestimonialFormRecord | undefined> {
  const [updated] = await db
    .update(testimonialForms)
    .set(data)
    .where(eq(testimonialForms.id, id))
    .returning()
  return updated
}

export async function deleteTestimonialForm(id: string): Promise<boolean> {
  const result = await db.delete(testimonialForms).where(eq(testimonialForms.id, id)).returning()
  return result.length > 0
}

// ============================================================================
// TESTIMONIALS CRUD
// ============================================================================

export async function createTestimonial(
  data: Omit<NewTestimonial, 'id' | 'createdAt' | 'approvedAt'>
): Promise<TestimonialRecord> {
  const [testimonial] = await db.insert(testimonials).values(data).returning()
  if (!testimonial) throw new Error('Failed to create testimonial')
  return testimonial
}

export async function getTestimonialsByForm(
  formId: string,
  options?: { status?: TestimonialStatus; featured?: boolean }
): Promise<TestimonialRecord[]> {
  const conditions = [eq(testimonials.formId, formId)]

  if (options?.status) {
    conditions.push(eq(testimonials.status, options.status))
  }
  if (options?.featured !== undefined) {
    conditions.push(eq(testimonials.featured, options.featured))
  }

  return db.query.testimonials.findMany({
    where: and(...conditions),
    orderBy: [desc(testimonials.createdAt)],
  })
}

export async function getTestimonialsByIds(ids: string[]): Promise<TestimonialRecord[]> {
  if (ids.length === 0) return []

  return db.query.testimonials.findMany({
    where: inArray(testimonials.id, ids),
  })
}

export async function getTestimonialById(id: string): Promise<TestimonialRecord | undefined> {
  return db.query.testimonials.findFirst({
    where: eq(testimonials.id, id),
  })
}

export async function updateTestimonialStatus(
  id: string,
  status: TestimonialStatus
): Promise<TestimonialRecord | undefined> {
  const updateData: Partial<TestimonialRecord> = { status }

  // Set approvedAt when status changes to approved
  if (status === 'approved') {
    updateData.approvedAt = new Date()
  }

  const [updated] = await db
    .update(testimonials)
    .set(updateData)
    .where(eq(testimonials.id, id))
    .returning()
  return updated
}

export async function toggleTestimonialFeatured(
  id: string
): Promise<TestimonialRecord | undefined> {
  // Get current featured status and toggle it
  const current = await getTestimonialById(id)
  if (!current) return undefined

  const [updated] = await db
    .update(testimonials)
    .set({ featured: !current.featured })
    .where(eq(testimonials.id, id))
    .returning()
  return updated
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const result = await db.delete(testimonials).where(eq(testimonials.id, id)).returning()
  return result.length > 0
}

export async function getAllTestimonials(options?: {
  status?: TestimonialStatus
  featured?: boolean
  limit?: number
}): Promise<TestimonialRecord[]> {
  const conditions = []

  if (options?.status) {
    conditions.push(eq(testimonials.status, options.status))
  }
  if (options?.featured !== undefined) {
    conditions.push(eq(testimonials.featured, options.featured))
  }

  return db.query.testimonials.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(testimonials.createdAt)],
    limit: options?.limit,
  })
}

// ============================================================================
// TESTIMONIAL WIDGETS CRUD
// ============================================================================

export async function createTestimonialWidget(
  data: Omit<NewTestimonialWidget, 'id' | 'createdAt'>
): Promise<TestimonialWidgetRecord> {
  const [widget] = await db.insert(testimonialWidgets).values(data).returning()
  if (!widget) throw new Error('Failed to create testimonial widget')
  return widget
}

export async function getAllTestimonialWidgets(): Promise<TestimonialWidgetRecord[]> {
  return db.query.testimonialWidgets.findMany({
    orderBy: [desc(testimonialWidgets.createdAt)],
  })
}

export async function getTestimonialWidgetById(
  id: string
): Promise<TestimonialWidgetRecord | undefined> {
  return db.query.testimonialWidgets.findFirst({
    where: eq(testimonialWidgets.id, id),
  })
}

export async function updateTestimonialWidget(
  id: string,
  data: Partial<Omit<NewTestimonialWidget, 'id' | 'createdAt'>>
): Promise<TestimonialWidgetRecord | undefined> {
  const [updated] = await db
    .update(testimonialWidgets)
    .set(data)
    .where(eq(testimonialWidgets.id, id))
    .returning()
  return updated
}

export async function deleteTestimonialWidget(id: string): Promise<boolean> {
  const result = await db.delete(testimonialWidgets).where(eq(testimonialWidgets.id, id)).returning()
  return result.length > 0
}

// ============================================================================
// PRODUCT TESTIMONIALS (for checkout/thank-you pages)
// ============================================================================

export async function getTestimonialsForProduct(
  productId: string,
  options?: { limit?: number }
): Promise<TestimonialRecord[]> {
  // Find forms linked to this product
  const forms = await db.query.testimonialForms.findMany({
    where: eq(testimonialForms.productId, productId),
  })

  if (forms.length === 0) return []

  const formIds = forms.map((f) => f.id)

  // Get approved testimonials, featured first
  return db.query.testimonials.findMany({
    where: and(
      inArray(testimonials.formId, formIds),
      eq(testimonials.status, 'approved')
    ),
    orderBy: [desc(testimonials.featured), desc(testimonials.createdAt)],
    limit: options?.limit,
  })
}

// ============================================================================
// WIDGET DATA FETCHING (combines widget config with testimonials)
// ============================================================================

export async function getTestimonialsForWidget(
  widgetId: string
): Promise<TestimonialRecord[]> {
  const widget = await getTestimonialWidgetById(widgetId)
  if (!widget) return []

  const config = widget.config as TestimonialWidgetConfig

  // If specific IDs are selected, return those
  if (config.selectedIds && config.selectedIds.length > 0) {
    return getTestimonialsByIds(config.selectedIds)
  }

  // Build conditions
  const conditions = [eq(testimonials.status, 'approved')]

  if (config.filterByForms && config.filterByForms.length > 0) {
    conditions.push(inArray(testimonials.formId, config.filterByForms))
  }

  if (config.onlyFeatured) {
    conditions.push(eq(testimonials.featured, true))
  }

  // Determine ordering
  let orderBy
  switch (config.testimonialOrder) {
    case 'oldest':
      orderBy = [asc(testimonials.createdAt)]
      break
    case 'rating':
      orderBy = [desc(testimonials.rating), desc(testimonials.createdAt)]
      break
    case 'random':
      orderBy = [sql`RANDOM()`]
      break
    case 'newest':
    default:
      orderBy = [desc(testimonials.createdAt)]
  }

  return db.query.testimonials.findMany({
    where: and(...conditions),
    orderBy,
    limit: config.maxItems,
  })
}
