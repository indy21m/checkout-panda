'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import {
  Plus,
  Search,
  Filter,
  Package,
  Tag,
  TrendingUp,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  ShoppingCart,
  TrendingDown,
} from 'lucide-react'
import { api } from '@/lib/trpc/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getCurrencySymbol } from '@/lib/currency'
import type { RouterOutputs } from '@/lib/trpc/api'

type Offer = RouterOutputs['offer']['list'][0]

interface OffersListProps {
  onCreateOffer: () => void
  onEditOffer: (offer: Offer) => void
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

export function OffersList({ onCreateOffer, onEditOffer }: OffersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [contextFilter, setContextFilter] = useState<string>('all')
  const [productFilter, setProductFilter] = useState<string>('all')

  const utils = api.useUtils()

  const { data: offers = [], isLoading } = api.offer.list.useQuery({
    includeInactive: true,
  })

  const { data: products = [] } = api.product.list.useQuery({})

  const deleteOffer = api.offer.delete.useMutation({
    onSuccess: () => {
      toast.success('Offer deleted successfully')
      utils.offer.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete offer')
    },
  })

  const duplicateOffer = api.offer.duplicate.useMutation({
    onSuccess: () => {
      toast.success('Offer duplicated successfully')
      utils.offer.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to duplicate offer')
    },
  })

  const updateOffer = api.offer.update.useMutation({
    onSuccess: () => {
      toast.success('Offer updated successfully')
      utils.offer.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update offer')
    },
  })

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesContext = contextFilter === 'all' || offer.context === contextFilter
    const matchesProduct = productFilter === 'all' || offer.productId === productFilter

    return matchesSearch && matchesContext && matchesProduct
  })

  const groupedOffers = filteredOffers.reduce(
    (acc, offer) => {
      const productName = offer.product?.name || 'Unknown Product'
      if (!acc[productName]) {
        acc[productName] = []
      }
      acc[productName].push(offer)
      return acc
    },
    {} as Record<string, Offer[]>
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
    },
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-bold text-transparent">
              Offers
            </h1>
            <p className="mt-2 text-gray-600">Manage product pricing for different contexts</p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={onCreateOffer}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Offer
          </Button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <GlassmorphicCard className="p-4" variant="light">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative max-w-xl flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={contextFilter} onValueChange={setContextFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Contexts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contexts</SelectItem>
                <SelectItem value="standalone">Standalone</SelectItem>
                <SelectItem value="order_bump">Order Bump</SelectItem>
                <SelectItem value="upsell">Upsell</SelectItem>
                <SelectItem value="downsell">Downsell</SelectItem>
              </SelectContent>
            </Select>

            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="w-[200px]">
                <Package className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Products" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </GlassmorphicCard>
      </motion.div>

      {/* Offers List */}
      {isLoading ? (
        <motion.div variants={itemVariants} className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            </div>
            <p className="mt-4 text-gray-600">Loading offers...</p>
          </div>
        </motion.div>
      ) : filteredOffers.length === 0 ? (
        <motion.div variants={itemVariants}>
          <GlassmorphicCard className="p-12" variant="light">
            <div className="text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
                <Tag className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">No offers found</h3>
              <p className="mt-2 text-gray-600">
                {searchTerm || contextFilter !== 'all' || productFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first offer to get started'}
              </p>
              {!searchTerm && contextFilter === 'all' && productFilter === 'all' && (
                <Button
                  variant="primary"
                  onClick={onCreateOffer}
                  className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Offer
                </Button>
              )}
            </div>
          </GlassmorphicCard>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-6">
          {Object.entries(groupedOffers).map(([productName, productOffers]) => (
            <motion.div key={productName} variants={itemVariants} className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">{productName}</h3>
                <span className="text-sm text-gray-500">({productOffers.length} offers)</span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {productOffers.map((offer) => {
                  const Icon = contextIcons[offer.context]
                  const savings = offer.compareAtPrice
                    ? Math.round(
                        ((offer.compareAtPrice - offer.price) / offer.compareAtPrice) * 100
                      )
                    : 0

                  return (
                    <GlassmorphicCard
                      key={offer.id}
                      className="relative overflow-hidden p-8 transition-all hover:shadow-xl"
                      variant="light"
                    >
                      {/* Status Badge */}
                      <div className="absolute top-6 right-6">
                        {offer.isActive ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100/80 px-3 py-1.5 text-xs font-medium text-green-800 backdrop-blur-sm">
                            <Eye className="h-3.5 w-3.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100/80 px-3 py-1.5 text-xs font-medium text-gray-600 backdrop-blur-sm">
                            <EyeOff className="h-3.5 w-3.5" />
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* Header */}
                      <div className="mb-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              'flex h-12 w-12 items-center justify-center rounded-xl shadow-sm',
                              contextColors[offer.context]
                                .replace('text-', 'bg-')
                                .replace('800', '100')
                            )}
                          >
                            <Icon
                              className={cn(
                                'h-6 w-6',
                                contextColors[offer.context].replace('bg-', 'text-')
                              )}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate pr-2 text-lg font-semibold text-gray-900">
                              {offer.name}
                            </h4>
                            <span
                              className={cn(
                                'mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                                contextColors[offer.context]
                              )}
                            >
                              {contextLabels[offer.context]}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {offer.description && (
                        <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-gray-600">
                          {offer.description}
                        </p>
                      )}

                      {/* Pricing */}
                      <div className="mb-6 space-y-3">
                        <div className="flex flex-wrap items-baseline gap-3">
                          <span className="text-3xl font-bold text-gray-900">
                            {getCurrencySymbol(offer.currency)}
                            {(offer.price / 100).toFixed(2)}
                          </span>
                          {offer.compareAtPrice && (
                            <>
                              <span className="text-base text-gray-500 line-through">
                                {getCurrencySymbol(offer.currency)}
                                {(offer.compareAtPrice / 100).toFixed(2)}
                              </span>
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-sm font-medium text-green-700">
                                Save {savings}%
                              </span>
                            </>
                          )}
                        </div>
                        {offer.coupon && (
                          <div className="flex items-center gap-2 text-sm text-purple-600">
                            <Tag className="h-4 w-4" />
                            <span className="font-medium">Coupon: {offer.coupon.code}</span>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="mb-6 grid grid-cols-3 gap-3 rounded-lg bg-gray-50/50 p-4">
                        <div className="text-center">
                          <p className="mb-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Views
                          </p>
                          <p className="text-lg font-bold text-gray-900">{offer.views}</p>
                        </div>
                        <div className="border-x border-gray-200/50 text-center">
                          <p className="mb-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Conversions
                          </p>
                          <p className="text-lg font-bold text-gray-900">{offer.conversions}</p>
                        </div>
                        <div className="text-center">
                          <p className="mb-1 text-xs font-medium tracking-wider text-gray-500 uppercase">
                            Revenue
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {getCurrencySymbol(offer.currency)}
                            {((offer.revenue || 0) / 100).toFixed(0)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button
                          variant="secondary"
                          size="md"
                          className="flex-1 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
                          onClick={() => onEditOffer(offer)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                updateOffer.mutate({
                                  id: offer.id,
                                  isActive: !offer.isActive,
                                })
                              }
                            >
                              {offer.isActive ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => duplicateOffer.mutate({ id: offer.id })}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this offer?')) {
                                  deleteOffer.mutate({ id: offer.id })
                                }
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </GlassmorphicCard>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
