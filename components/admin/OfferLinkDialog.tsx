'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { RefreshCw } from 'lucide-react'
import type { ProductRecord } from '@/lib/db/schema'
import type { OfferRole } from '@/types'

interface OfferLinkDialogProps {
  open: boolean
  onClose: () => void
  onLink: (offerId: string, role: OfferRole) => Promise<void>
  productId: string
  role: OfferRole
  availableOffers: ProductRecord[]
  linkedOfferIds: string[]
  isReplace?: boolean
}

export function OfferLinkDialog({
  open,
  onClose,
  onLink,
  productId: _productId,
  role,
  availableOffers,
  linkedOfferIds,
  isReplace = false,
}: OfferLinkDialogProps) {
  const [selectedOfferId, setSelectedOfferId] = useState<string>('')
  const [isLinking, setIsLinking] = useState(false)

  // Filter offers to only show those not already linked with this role
  const filteredOffers = availableOffers.filter(
    (offer) => !linkedOfferIds.includes(offer.id) && offer.type === role
  )

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedOfferId('')
    }
  }, [open])

  async function handleLink(): Promise<void> {
    if (!selectedOfferId) return

    setIsLinking(true)
    try {
      await onLink(selectedOfferId, role)
      onClose()
    } catch (error) {
      console.error('Failed to link offer:', error)
    } finally {
      setIsLinking(false)
    }
  }

  const roleLabel = role === 'bump' ? 'Order Bump' : role.charAt(0).toUpperCase() + role.slice(1)
  const actionLabel = isReplace ? 'Replace' : 'Link'

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {actionLabel} {roleLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {filteredOffers.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-sm text-gray-500">No {role} products available to link.</p>
              <p className="mt-1 text-xs text-gray-400">
                Create a new {role} product first, then link it here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="offer-select">Select {roleLabel}</Label>
              <Select value={selectedOfferId} onValueChange={setSelectedOfferId}>
                <SelectTrigger id="offer-select">
                  <SelectValue placeholder={`Choose a ${role}...`} />
                </SelectTrigger>
                <SelectContent>
                  {filteredOffers.map((offer) => (
                    <SelectItem key={offer.id} value={offer.id}>
                      <div className="flex flex-col">
                        <span>{offer.name}</span>
                        <span className="text-xs text-gray-500">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: offer.config.stripe.currency,
                            minimumFractionDigits: 0,
                          }).format(offer.config.stripe.priceAmount / 100)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleLink} disabled={!selectedOfferId || isLinking}>
            {isLinking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {isReplace ? 'Replacing...' : 'Linking...'}
              </>
            ) : (
              actionLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
