import { db } from '@/lib/db'
import { testimonials, testimonialForms } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { TestimonialsTable } from '@/components/admin/TestimonialsTable'

export const dynamic = 'force-dynamic'

export default async function TestimonialsPage() {
  // Fetch testimonials with form info
  const testimonialResults = await db
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
    .orderBy(desc(testimonials.createdAt))

  // Fetch all forms for the filter dropdown
  const forms = await db
    .select({
      id: testimonialForms.id,
      name: testimonialForms.name,
    })
    .from(testimonialForms)
    .orderBy(desc(testimonialForms.createdAt))

  return <TestimonialsTable testimonials={testimonialResults} forms={forms} />
}
