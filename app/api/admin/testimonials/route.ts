import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { testimonials, testimonialForms, type TestimonialStatus } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'

// GET: List testimonials with filters
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const formId = searchParams.get('formId')
    const featured = searchParams.get('featured')

    // Build filter conditions
    const conditions = []
    if (status && status !== 'all' && ['pending', 'approved', 'rejected'].includes(status)) {
      conditions.push(eq(testimonials.status, status as TestimonialStatus))
    }
    if (formId && formId !== 'all') {
      conditions.push(eq(testimonials.formId, formId))
    }
    if (featured === 'true') {
      conditions.push(eq(testimonials.featured, true))
    }

    // Fetch testimonials with form info
    const results = await db
      .select({
        id: testimonials.id,
        formId: testimonials.formId,
        customerName: testimonials.customerName,
        customerEmail: testimonials.customerEmail,
        customerCompany: testimonials.customerCompany,
        customerPhoto: testimonials.customerPhoto,
        content: testimonials.content,
        rating: testimonials.rating,
        status: testimonials.status,
        featured: testimonials.featured,
        createdAt: testimonials.createdAt,
        approvedAt: testimonials.approvedAt,
        formName: testimonialForms.name,
        formSlug: testimonialForms.slug,
      })
      .from(testimonials)
      .leftJoin(testimonialForms, eq(testimonials.formId, testimonialForms.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(testimonials.createdAt))

    // Fetch all forms for the filter dropdown
    const forms = await db
      .select({
        id: testimonialForms.id,
        name: testimonialForms.name,
      })
      .from(testimonialForms)
      .orderBy(desc(testimonialForms.createdAt))

    return NextResponse.json({ testimonials: results, forms })
  } catch (error) {
    console.error('Failed to fetch testimonials:', error)
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 })
  }
}

// PATCH: Update testimonial status or featured flag
const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  featured: z.boolean().optional(),
})

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const data = updateSchema.parse(body)

    const updateData: Partial<{
      status: TestimonialStatus
      featured: boolean
      approvedAt: Date | null
    }> = {}

    if (data.status !== undefined) {
      updateData.status = data.status
      // Set approvedAt when status changes to approved
      if (data.status === 'approved') {
        updateData.approvedAt = new Date()
      } else {
        updateData.approvedAt = null
      }
    }

    if (data.featured !== undefined) {
      updateData.featured = data.featured
    }

    const [updated] = await db
      .update(testimonials)
      .set(updateData)
      .where(eq(testimonials.id, data.id))
      .returning()

    if (!updated) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    return NextResponse.json({ testimonial: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Failed to update testimonial:', error)
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 })
  }
}

// DELETE: Delete a testimonial
const deleteSchema = z.object({
  id: z.string().uuid(),
})

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const data = deleteSchema.parse(body)

    const [deleted] = await db
      .delete(testimonials)
      .where(eq(testimonials.id, data.id))
      .returning()

    if (!deleted) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Failed to delete testimonial:', error)
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 })
  }
}
