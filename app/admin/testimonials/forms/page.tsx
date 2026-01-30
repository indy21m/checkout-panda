import { db } from '@/lib/db'
import { testimonialForms, testimonials } from '@/lib/db/schema'
import { eq, sql, count } from 'drizzle-orm'
import { TestimonialFormsTable } from '@/components/admin/TestimonialFormsTable'
import { getProductsWithOffers } from '@/lib/db/products'

export const dynamic = 'force-dynamic'

async function getFormsWithCounts() {
  return db
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
}

export default async function TestimonialFormsPage() {
  // Fetch forms and products in parallel
  const [forms, allProducts] = await Promise.all([
    getFormsWithCounts(),
    getProductsWithOffers({ type: 'main' }),
  ])

  // Transform products for the dropdown
  const products = allProducts.map((p) => ({
    id: p.id,
    name: p.name,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Testimonial Forms</h2>
        <p className="text-sm text-gray-500">
          Create and manage forms to collect testimonials from your customers.
        </p>
      </div>

      <TestimonialFormsTable forms={forms} products={products} />
    </div>
  )
}
