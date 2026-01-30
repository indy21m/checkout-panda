import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { testimonialForms, testimonials, type TestimonialFormConfig } from '@/lib/db/schema'
import { eq, sql, count } from 'drizzle-orm'
import {
  createTestimonialForm,
  updateTestimonialForm,
  deleteTestimonialForm,
  getTestimonialFormBySlug,
} from '@/lib/db/testimonials'

// Schema for form config
const formConfigSchema = z.object({
  heading: z.string().optional(),
  description: z.string().optional(),
  thankYouMessage: z.string().optional(),
  collectCompany: z.boolean().optional(),
  collectPhoto: z.boolean().optional(),
  requireRating: z.boolean().optional(),
  customFields: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(['text', 'textarea']),
        required: z.boolean().optional(),
      })
    )
    .optional(),
})

const createFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  productId: z.string().nullable().optional(),
  config: formConfigSchema.optional(),
})

const updateFormSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  productId: z.string().nullable().optional(),
  config: formConfigSchema.optional(),
})

export interface TestimonialFormWithCount {
  id: string
  name: string
  slug: string
  productId: string | null
  config: TestimonialFormConfig | null
  createdAt: Date | null
  submissionCount: number
  productName?: string
}

export async function GET(): Promise<NextResponse> {
  try {
    // Get forms with submission counts
    const formsWithCounts = await db
      .select({
        id: testimonialForms.id,
        name: testimonialForms.name,
        slug: testimonialForms.slug,
        productId: testimonialForms.productId,
        config: testimonialForms.config,
        createdAt: testimonialForms.createdAt,
        submissionCount: count(testimonials.id),
      })
      .from(testimonialForms)
      .leftJoin(testimonials, eq(testimonials.formId, testimonialForms.id))
      .groupBy(testimonialForms.id)
      .orderBy(sql`${testimonialForms.createdAt} DESC`)

    return NextResponse.json({ forms: formsWithCounts })
  } catch (error) {
    console.error('Failed to fetch testimonial forms:', error)
    return NextResponse.json({ error: 'Failed to fetch testimonial forms' }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const data = createFormSchema.parse(body)

    // Check if slug already exists
    const existingForm = await getTestimonialFormBySlug(data.slug)
    if (existingForm) {
      return NextResponse.json({ error: 'A form with this slug already exists' }, { status: 400 })
    }

    const form = await createTestimonialForm({
      name: data.name,
      slug: data.slug,
      productId: data.productId ?? null,
      config: data.config ?? {},
    })

    return NextResponse.json({ form }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Failed to create testimonial form:', error)
    return NextResponse.json({ error: 'Failed to create testimonial form' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const data = updateFormSchema.parse(body)

    // If slug is being changed, check it doesn't conflict
    if (data.slug) {
      const existingForm = await getTestimonialFormBySlug(data.slug)
      if (existingForm && existingForm.id !== data.id) {
        return NextResponse.json({ error: 'A form with this slug already exists' }, { status: 400 })
      }
    }

    const form = await updateTestimonialForm(data.id, {
      name: data.name,
      slug: data.slug,
      productId: data.productId,
      config: data.config,
    })

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    return NextResponse.json({ form })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Failed to update testimonial form:', error)
    return NextResponse.json({ error: 'Failed to update testimonial form' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 })
    }

    const deleted = await deleteTestimonialForm(id)

    if (!deleted) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete testimonial form:', error)
    return NextResponse.json({ error: 'Failed to delete testimonial form' }, { status: 500 })
  }
}
