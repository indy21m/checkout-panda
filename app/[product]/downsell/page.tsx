import { notFound, redirect } from 'next/navigation'
import { getProductFromDb } from '@/config/products'
import { DownsellPage } from '@/components/upsell'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ product: string }>
  searchParams: Promise<{
    customer_id?: string
    payment_method?: string
    purchases?: string
  }>
}

// Force dynamic rendering to always fetch from database
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { product: slug } = await params
  const product = await getProductFromDb(slug)

  if (!product || !product.downsell?.enabled) {
    return { title: 'Special Offer' }
  }

  return {
    title: `Special Offer - ${product.downsell.title}`,
    description: product.downsell.description,
    robots: { index: false, follow: false }, // Don't index downsell pages
  }
}

export default async function ProductDownsellPage({ params, searchParams }: PageProps) {
  const { product: slug } = await params
  const { customer_id, payment_method, purchases } = await searchParams

  const product = await getProductFromDb(slug)

  // Verify product and downsell exist
  if (!product || !product.downsell?.enabled) {
    notFound()
  }

  // Require customer credentials for one-click purchase
  if (!customer_id || !payment_method) {
    redirect(`/${slug}/thank-you`)
  }

  const currentPurchases = purchases?.split(',') || ['main']

  return (
    <DownsellPage
      product={product}
      downsell={product.downsell}
      customerId={customer_id}
      paymentMethodId={payment_method}
      currentPurchases={currentPurchases}
    />
  )
}
