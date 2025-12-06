'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { OrderSummary } from './OrderSummary'
import type { Product, PriceBreakdown } from '@/types'

interface OrderSummaryModalProps {
  product: Product
  breakdown: PriceBreakdown | null
  includeOrderBump: boolean
  couponCode: string | null
  selectedPriceTierId: string
  children: React.ReactNode // The trigger button
}

export function OrderSummaryModal({
  product,
  breakdown,
  includeOrderBump,
  couponCode,
  selectedPriceTierId,
  children,
}: OrderSummaryModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Order summary</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto">
          <OrderSummary
            product={product}
            breakdown={breakdown}
            includeOrderBump={includeOrderBump}
            couponCode={couponCode}
            selectedPriceTierId={selectedPriceTierId}
            isModal
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
