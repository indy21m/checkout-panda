'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { HeroBlock } from '@/components/checkout/blocks/hero-block'
import { ProductBlock } from '@/components/checkout/blocks/product-block'
import { PaymentBlock } from '@/components/checkout/blocks/payment-block'
import { TestimonialBlock } from '@/components/checkout/blocks/testimonial-block'
import { TrustBlock } from '@/components/checkout/blocks/trust-block'
import { BumpBlock } from '@/components/checkout/blocks/bump-block'

interface BlockStyles {
  padding?: string
  backgroundColor?: string
  className?: string
  minHeight?: string
}

interface CheckoutBlock {
  id: string
  type: string
  data: Record<string, unknown>
  styles: BlockStyles
  position: number
}

interface SeoMeta {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
}

interface CheckoutRendererProps {
  checkout: {
    id: string
    name: string
    slug: string
    pageData: {
      blocks: CheckoutBlock[]
      settings: {
        theme?: string
        customCss?: string
        seoMeta?: SeoMeta
      }
    }
  }
}

// Map block types to components
// Using 'any' here is acceptable since block data varies by type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const blockComponents: Record<string, React.ComponentType<any>> = {
  hero: HeroBlock,
  product: ProductBlock,
  payment: PaymentBlock,
  testimonial: TestimonialBlock,
  trust: TrustBlock,
  bump: BumpBlock,
}

export function CheckoutRenderer({ checkout }: CheckoutRendererProps) {
  const { blocks, settings } = checkout.pageData

  // Sort blocks by position
  const sortedBlocks = [...blocks].sort((a, b) => a.position - b.position)

  // Apply theme class if specified
  const themeClass = settings.theme ? `theme-${settings.theme}` : ''

  return (
    <div className={cn('min-h-screen', themeClass)}>
      {/* Apply custom CSS if provided */}
      {settings.customCss && <style dangerouslySetInnerHTML={{ __html: settings.customCss }} />}

      {/* Render blocks */}
      <div className="checkout-container">
        {sortedBlocks.map((block, index) => {
          const BlockComponent = blockComponents[block.type]

          if (!BlockComponent) {
            console.warn(`Unknown block type: ${block.type}`)
            return null
          }

          return (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <BlockComponent data={block.data} styles={block.styles} />
            </motion.div>
          )
        })}
      </div>

      {/* Default content if no blocks */}
      {sortedBlocks.length === 0 && (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Checkout Page Under Construction</h1>
            <p className="text-gray-600">
              This checkout page is being set up. Please check back soon.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
