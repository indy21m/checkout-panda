import { notFound } from 'next/navigation'
import { createApi } from '@/lib/trpc/server'
import { CheckoutRenderer } from '@/components/checkout/checkout-renderer'
import { SimplifiedCheckoutRenderer } from '@/components/checkout/simplified-checkout-renderer'
import type { Block } from '@/components/builder/checkout-blocks'

interface CheckoutPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  try {
    // Await params to get the slug
    const { slug } = await params
    // Create API instance
    const api = await createApi()
    // Fetch checkout by slug (this also increments views)
    const checkout = await api.checkout.getBySlug({ slug })

    // Check if it's the new simplified format (blocks array directly)
    const isSimplifiedFormat = Array.isArray(checkout.pageData?.blocks)
    
    if (isSimplifiedFormat) {
      // Transform blocks to match expected type
      const transformedCheckout = {
        id: checkout.id,
        name: checkout.name,
        slug: checkout.slug,
        pageData: {
          blocks: checkout.pageData.blocks.map((block: any) => ({
            ...block,
            visible: block.visible !== undefined ? block.visible : true,
            column: block.column || 'left'
          })) as Block[],
          settings: checkout.pageData.settings
        }
      }
      return <SimplifiedCheckoutRenderer checkout={transformedCheckout} />
    }
    
    return <CheckoutRenderer checkout={checkout} />
  } catch {
    // If checkout not found, show 404
    notFound()
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CheckoutPageProps) {
  try {
    const { slug } = await params
    const api = await createApi()
    const checkout = await api.checkout.getBySlug({ slug })

    // Extract SEO data from checkout settings
    const seoMeta = checkout.pageData.settings?.seoMeta || {}

    return {
      title: seoMeta.title || checkout.name,
      description: seoMeta.description || 'Complete your purchase',
      openGraph: {
        title: seoMeta.ogTitle || seoMeta.title || checkout.name,
        description: seoMeta.ogDescription || seoMeta.description || 'Complete your purchase',
        images: seoMeta.ogImage ? [seoMeta.ogImage] : [],
      },
    }
  } catch {
    return {
      title: 'Checkout',
      description: 'Complete your purchase',
    }
  }
}
