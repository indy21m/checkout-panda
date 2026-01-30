import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createTestimonial, getTestimonialFormById } from '@/lib/db/testimonials'

const submitSchema = z.object({
  formId: z.string().uuid('Invalid form ID'),
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerCompany: z.string().nullable().optional(),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(20, 'Content must be at least 20 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = submitSchema.parse(body)

    // Verify form exists
    const form = await getTestimonialFormById(data.formId)
    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      )
    }

    // Create testimonial with pending status
    const testimonial = await createTestimonial({
      formId: data.formId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerCompany: data.customerCompany ?? null,
      content: data.content,
      rating: data.rating,
      status: 'pending',
      featured: false,
    })

    return NextResponse.json({
      success: true,
      id: testimonial.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    console.error('Failed to submit testimonial:', error)
    return NextResponse.json(
      { error: 'Failed to submit testimonial' },
      { status: 500 }
    )
  }
}
