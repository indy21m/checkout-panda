import { notFound } from 'next/navigation'
import { getProductFromDb } from '@/config/products'
import { ThankYouPage } from '@/components/thank-you'
import { getTestimonialsForProduct } from '@/lib/db/testimonials'
import { getTestimonialFormByProductId } from '@/lib/db/testimonials'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ product: string }>
  searchParams: Promise<{
    payment_intent?: string
    purchases?: string
  }>
}

// Force dynamic rendering to always fetch from database
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { product: slug } = await params
  const product = await getProductFromDb(slug)

  if (!product) {
    return { title: 'Thank You' }
  }

  return {
    title: `Thank You - ${product.name}`,
    description: product.thankYou.subheadline || 'Your purchase is complete!',
    robots: { index: false, follow: false }, // Don't index thank you pages
  }
}

export default async function ProductThankYouPage({ params, searchParams }: PageProps) {
  const { product: slug } = await params
  const { payment_intent, purchases } = await searchParams

  const product = await getProductFromDb(slug)

  if (!product) {
    notFound()
  }

  const purchasedItems = purchases?.split(',') || ['main']

  // Fetch testimonials and form for this product
  const [testimonials, testimonialForm] = await Promise.all([
    getTestimonialsForProduct(product.id),
    getTestimonialFormByProductId(product.id),
  ])

  return (
    <ThankYouPage
      product={product}
      purchasedItems={purchasedItems}
      paymentIntentId={payment_intent}
      testimonials={testimonials}
      testimonialFormSlug={testimonialForm?.slug}
    />
  )
}
