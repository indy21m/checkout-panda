import { notFound } from 'next/navigation'
import { getProduct, getProductSlugs } from '@/config/products'
import { ThankYouPage } from '@/components/thank-you'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ product: string }>
  searchParams: Promise<{
    payment_intent?: string
    purchases?: string
  }>
}

// Generate static params for all products
export async function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ product: slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { product: slug } = await params
  const product = getProduct(slug)

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

  const product = getProduct(slug)

  if (!product) {
    notFound()
  }

  const purchasedItems = purchases?.split(',') || ['main']

  return (
    <ThankYouPage
      product={product}
      purchasedItems={purchasedItems}
      paymentIntentId={payment_intent}
    />
  )
}
