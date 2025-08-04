'use client'

import { EnhancedCheckoutRenderer } from './enhanced-checkout-renderer'
import type { Section } from '@/types/builder'

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
      sections?: Section[]
      blocks?: CheckoutBlock[]
      settings: {
        theme?: string
        customCss?: string
        seoMeta?: SeoMeta
        globalAnimations?: {
          pageTransition?: unknown
          blockTransition?: unknown
          scrollSmoothing?: boolean
        }
      }
    }
  }
  productId?: string
  amount?: number
}

// This component now acts as a compatibility layer
// It detects whether the checkout uses the new section-based structure
// or the legacy block-based structure and renders appropriately
export function CheckoutRenderer(props: CheckoutRendererProps) {
  // Use the enhanced renderer which handles both structures
  return <EnhancedCheckoutRenderer {...props} />
}
