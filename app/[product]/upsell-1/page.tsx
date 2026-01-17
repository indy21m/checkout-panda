import { notFound, redirect } from 'next/navigation'
import { getProductFromDb } from '@/config/products'
import { UpsellPage } from '@/components/upsell'
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

  if (!product || !product.upsells?.[0]) {
    return { title: 'Special Offer' }
  }

  return {
    title: `Special Offer - ${product.upsells[0].title}`,
    description: product.upsells[0].description,
    robots: { index: false, follow: false }, // Don't index upsell pages
  }
}

export default async function ProductUpsell1Page({ params, searchParams }: PageProps) {
  const { product: slug } = await params
  const { customer_id, payment_method, purchases } = await searchParams

  const product = await getProductFromDb(slug)

  // Verify product and upsell exist
  if (!product || !product.upsells?.[0]) {
    notFound()
  }

  // Require customer credentials for one-click purchase
  if (!customer_id || !payment_method) {
    redirect(`/${slug}/thank-you`)
  }

  const currentPurchases = purchases?.split(',') || ['main']
  const upsell = product.upsells[0]
  const totalSteps = (product.upsells?.length || 0) + (product.downsell?.enabled ? 1 : 0)

  return (
    <UpsellPage
      product={product}
      upsell={upsell}
      customerId={customer_id}
      paymentMethodId={payment_method}
      currentPurchases={currentPurchases}
      currentStep={1}
      totalSteps={totalSteps}
    />
  )
}
