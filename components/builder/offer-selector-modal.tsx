'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import { 
  Search, 
  Package, 
  DollarSign, 
  Check, 
  Loader2,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Tag,
} from 'lucide-react'
import { api } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'
import { getCurrencySymbol } from '@/lib/currency'
import type { RouterOutputs } from '@/lib/trpc/api'

type Offer = RouterOutputs['offer']['list'][0]

interface OfferSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectOffer: (offer: Offer) => void
  selectedOfferId?: string
  contextFilter?: 'standalone' | 'order_bump' | 'upsell' | 'downsell'
}

const contextIcons = {
  standalone: Package,
  order_bump: ShoppingCart,
  upsell: TrendingUp,
  downsell: TrendingDown,
}

const contextLabels = {
  standalone: 'Standalone',
  order_bump: 'Order Bump',
  upsell: 'Upsell',
  downsell: 'Downsell',
}

const contextColors = {
  standalone: 'bg-blue-100 text-blue-800',
  order_bump: 'bg-purple-100 text-purple-800',
  upsell: 'bg-green-100 text-green-800',
  downsell: 'bg-orange-100 text-orange-800',
}

export function OfferSelectorModal({
  isOpen,
  onClose,
  onSelectOffer,
  selectedOfferId,
  contextFilter,
}: OfferSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)

  const { data: offers, isLoading } = api.offer.list.useQuery({
    context: contextFilter,
    includeInactive: false,
  })

  // Filter offers based on search
  const filteredOffers = offers?.filter(
    (offer) =>
      offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Set initial selected offer if ID provided
  useEffect(() => {
    if (selectedOfferId && offers) {
      const offer = offers.find((o) => o.id === selectedOfferId)
      if (offer) {
        setSelectedOffer(offer)
      }
    }
  }, [selectedOfferId, offers])

  const handleSelectOffer = () => {
    if (selectedOffer) {
      onSelectOffer(selectedOffer)
      onClose()
    }
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring' as const, damping: 25, stiffness: 300 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="w-full min-w-[700px] max-w-4xl">
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit">
              <DialogHeader>
                <DialogTitle>Select Offer</DialogTitle>
                <DialogDescription>
                  Choose an offer to display in your checkout page. Offers include product-specific pricing and settings.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search offers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Offer List */}
                <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : filteredOffers?.length === 0 ? (
                    <div className="py-12 text-center">
                      <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <p className="text-gray-500">No offers found</p>
                      {contextFilter && (
                        <p className="text-sm text-gray-400 mt-2">
                          Showing only {contextLabels[contextFilter]} offers
                        </p>
                      )}
                    </div>
                  ) : (
                    filteredOffers?.map((offer) => {
                      const isSelected = selectedOffer?.id === offer.id
                      const Icon = contextIcons[offer.context]
                      const savings = offer.compareAtPrice 
                        ? Math.round(((offer.compareAtPrice - offer.price) / offer.compareAtPrice) * 100)
                        : 0

                      return (
                        <motion.div
                          key={offer.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <GlassmorphicCard
                            className={cn(
                              'cursor-pointer p-4 transition-all',
                              isSelected && 'ring-primary ring-2'
                            )}
                            variant="light"
                            onClick={() => setSelectedOffer(offer)}
                          >
                            <div className="flex items-start gap-4">
                              {/* Context Icon */}
                              <div
                                className={cn(
                                  'h-12 w-12 flex-shrink-0 rounded-lg flex items-center justify-center',
                                  contextColors[offer.context].replace('text-', 'bg-').replace('800', '100')
                                )}
                              >
                                <Icon className={cn('h-6 w-6', contextColors[offer.context].replace('bg-', 'text-'))} />
                              </div>

                              {/* Offer Info */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-semibold text-gray-900">{offer.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {offer.product?.name}
                                    </p>
                                    {offer.description && (
                                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                        {offer.description}
                                      </p>
                                    )}
                                  </div>
                                  
                                  {/* Selection Indicator */}
                                  {isSelected && (
                                    <div className="ml-4 flex-shrink-0">
                                      <div className="bg-primary h-8 w-8 rounded-full flex items-center justify-center">
                                        <Check className="h-5 w-5 text-white" />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Pricing and Details */}
                                <div className="mt-3 flex items-center gap-4">
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-xl font-bold text-gray-900">
                                      {getCurrencySymbol(offer.currency)}
                                      {(offer.price / 100).toFixed(2)}
                                    </span>
                                    {offer.compareAtPrice && (
                                      <>
                                        <span className="text-sm text-gray-500 line-through">
                                          {getCurrencySymbol(offer.currency)}
                                          {(offer.compareAtPrice / 100).toFixed(2)}
                                        </span>
                                        <span className="text-sm font-medium text-green-600">
                                          Save {savings}%
                                        </span>
                                      </>
                                    )}
                                  </div>

                                  {/* Context Badge */}
                                  <span className={cn(
                                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                                    contextColors[offer.context]
                                  )}>
                                    {contextLabels[offer.context]}
                                  </span>

                                  {/* Coupon Badge */}
                                  {offer.coupon && (
                                    <div className="flex items-center gap-1 text-xs text-purple-600">
                                      <Tag className="h-3 w-3" />
                                      <span>{offer.coupon.code}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Additional Info */}
                                {(offer.headline || offer.badgeText) && (
                                  <div className="mt-2 flex items-center gap-2">
                                    {offer.badgeText && (
                                      <span 
                                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                                        style={{
                                          backgroundColor: offer.badgeColor ? `${offer.badgeColor}20` : '#fee',
                                          color: offer.badgeColor || '#dc2626',
                                        }}
                                      >
                                        {offer.badgeText}
                                      </span>
                                    )}
                                    {offer.headline && (
                                      <p className="text-xs text-gray-600 italic">{offer.headline}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </GlassmorphicCard>
                        </motion.div>
                      )
                    })
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSelectOffer}
                    disabled={!selectedOffer}
                  >
                    Select Offer
                  </Button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}