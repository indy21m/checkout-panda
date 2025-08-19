'use client'

import { useState } from 'react'
import { OffersList } from './offers-list'
import { OfferEditor } from './offer-editor'
import type { RouterOutputs } from '@/lib/trpc/api'

type Offer = RouterOutputs['offer']['list'][0]

export default function OffersContent() {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)

  const handleCreateOffer = () => {
    setEditingOffer(null)
    setIsEditorOpen(true)
  }

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer)
    setIsEditorOpen(true)
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setEditingOffer(null)
  }

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto w-full max-w-[1400px] p-8">
        <OffersList onCreateOffer={handleCreateOffer} onEditOffer={handleEditOffer} />

        <OfferEditor
          open={isEditorOpen}
          onOpenChange={(open) => {
            if (!open) handleCloseEditor()
          }}
          offerId={editingOffer?.id}
        />
      </div>
    </div>
  )
}
