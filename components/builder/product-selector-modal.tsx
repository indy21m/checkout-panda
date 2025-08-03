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
import { Search, Package, DollarSign, Check, Loader2 } from 'lucide-react'
import { api } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'
import type { RouterOutputs } from '@/lib/trpc/api'

type Product = RouterOutputs['product']['list'][0]

interface ProductSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectProduct: (product: Product) => void
  selectedProductId?: string
}

export function ProductSelectorModal({
  isOpen,
  onClose,
  onSelectProduct,
  selectedProductId,
}: ProductSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const { data: products, isLoading } = api.product.list.useQuery({
    includeArchived: false,
  })

  // Filter products based on search
  const filteredProducts = products?.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Set initial selected product if ID provided
  useEffect(() => {
    if (selectedProductId && products) {
      const product = products.find((p) => p.id === selectedProductId)
      if (product) {
        setSelectedProduct(product)
      }
    }
  }, [selectedProductId, products])

  const handleSelectProduct = () => {
    if (selectedProduct) {
      onSelectProduct(selectedProduct)
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
          <DialogContent className="max-w-3xl">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <DialogHeader>
                <DialogTitle>Select Product</DialogTitle>
                <DialogDescription>
                  Choose a product to display in your checkout page
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Product List */}
                <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : filteredProducts?.length === 0 ? (
                    <div className="py-12 text-center">
                      <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <p className="text-gray-500">No products found</p>
                    </div>
                  ) : (
                    filteredProducts?.map((product) => {
                      const isSelected = selectedProduct?.id === product.id
                      const gradient = product.color
                        ? `from-[${product.color}] to-[${product.color}]/80`
                        : 'from-blue-500 to-purple-600'

                      return (
                        <motion.div
                          key={product.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <GlassmorphicCard
                            className={cn(
                              'cursor-pointer p-4 transition-all',
                              isSelected && 'ring-2 ring-primary'
                            )}
                            variant="light"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <div className="flex items-start gap-4">
                              {/* Product Thumbnail */}
                              <div
                                className={cn(
                                  'h-16 w-16 flex-shrink-0 rounded-lg bg-gradient-to-br',
                                  gradient
                                )}
                              >
                                <div className="flex h-full items-center justify-center">
                                  <Package className="h-8 w-8 text-white/80" />
                                </div>
                              </div>

                              {/* Product Info */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-semibold">{product.name}</h3>
                                    {product.description && (
                                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                        {product.description}
                                      </p>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <div className="flex-shrink-0">
                                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                                        <Check className="h-4 w-4 text-white" />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Product Details */}
                                <div className="mt-2 flex items-center gap-4 text-sm">
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <DollarSign className="h-3 w-3" />
                                    ${(product.price / 100).toFixed(2)}
                                  </span>
                                  {product.type && (
                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium capitalize text-gray-600">
                                      {product.type}
                                    </span>
                                  )}
                                  {product.plans && product.plans.length > 0 && (
                                    <span className="text-xs text-gray-500">
                                      {product.plans.length} pricing plan{product.plans.length > 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </GlassmorphicCard>
                        </motion.div>
                      )
                    })
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 border-t pt-4">
                  <Button variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSelectProduct}
                    disabled={!selectedProduct}
                  >
                    Select Product
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