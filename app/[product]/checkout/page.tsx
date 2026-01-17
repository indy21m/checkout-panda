import { notFound } from 'next/navigation'
import { getProductFromDb, getProductSlugs } from '@/config/products'
import { CheckoutPage } from '@/components/checkout'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ product: string }>
}

// Generate static params for all products (for build-time generation)
export async function generateStaticParams() {
  return getProductSlugs().map((slug) => ({ product: slug }))
}

// Force dynamic rendering to always fetch from database
export const dynamic = 'force-dynamic'

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { product: slug } = await params
  const product = await getProductFromDb(slug)

  if (!product) {
    return { title: 'Product Not Found' }
  }

  return {
    title: product.meta?.title || `Checkout - ${product.name}`,
    description: product.meta?.description || product.checkout.subtitle,
    openGraph: {
      title: product.meta?.title || product.name,
      description: product.meta?.description || product.checkout.subtitle,
      images: product.meta?.ogImage ? [product.meta.ogImage] : [],
    },
  }
}

export default async function ProductCheckoutPage({ params }: PageProps) {
  const { product: slug } = await params
  const product = await getProductFromDb(slug)

  if (!product) {
    notFound()
  }

  return <CheckoutPage product={product} />
}
