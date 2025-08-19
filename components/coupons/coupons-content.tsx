'use client'

import { useState } from 'react'
import { CouponsList } from './coupons-list'
import { CouponEditor } from './coupon-editor'
import type { RouterOutputs } from '@/lib/trpc/api'

type Coupon = RouterOutputs['coupon']['list'][0]

export default function CouponsContent() {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  const handleCreateCoupon = () => {
    setEditingCoupon(null)
    setIsEditorOpen(true)
  }

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setIsEditorOpen(true)
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setEditingCoupon(null)
  }

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto w-full max-w-[1400px] p-8">
        <CouponsList onCreateCoupon={handleCreateCoupon} onEditCoupon={handleEditCoupon} />

        <CouponEditor
          open={isEditorOpen}
          onOpenChange={(open) => {
            if (!open) handleCloseEditor()
          }}
          couponId={editingCoupon?.id}
        />
      </div>
    </div>
  )
}
