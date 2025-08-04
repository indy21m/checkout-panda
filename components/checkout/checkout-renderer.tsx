'use client'

import { EnhancedCheckoutRenderer } from './enhanced-checkout-renderer'

// This component now acts as a compatibility layer
// It detects whether the checkout uses the new section-based structure
// or the legacy block-based structure and renders appropriately
export function CheckoutRenderer(props: Parameters<typeof EnhancedCheckoutRenderer>[0]) {
  // Use the enhanced renderer which handles both structures
  return <EnhancedCheckoutRenderer {...props} />
}
