'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Filter,
  MoreVertical,
  Package,
  Copy,
  Archive,
  Edit,
  ChevronDown,
} from 'lucide-react'
import { api } from '@/lib/trpc/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { RouterOutputs } from '@/lib/trpc/api'
import { getCurrencySymbol } from '@/lib/currency'

type Product = RouterOutputs['product']['list'][0]

interface ProductDashboardProps {
  onCreateProduct: () => void
  onEditProduct: (product: Product) => void
}

const gradientPresets = [
  'from-blue-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-pink-500 to-rose-600',
  'from-violet-500 to-purple-600',
  'from-cyan-500 to-blue-600',
]

export function ModernProductDashboard({ onCreateProduct, onEditProduct }: ProductDashboardProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())

  const utils = api.useUtils()
  const { data: products, isLoading } = api.product.list.useQuery({
    includeArchived: false,
    includeAnalytics: true,
  })

  const archiveProduct = api.product.archive.useMutation({
    onSuccess: () => {
      toast.success('Product archived')
      utils.product.list.invalidate()
    },
  })

  const duplicateProduct = api.product.duplicate.useMutation({
    onSuccess: () => {
      toast.success('Product duplicated')
      utils.product.list.invalidate()
    },
  })

  const filteredProducts = products?.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // const handleSelectAll = () => {
  //   if (selectedProducts.size === filteredProducts?.length) {
  //     setSelectedProducts(new Set())
  //   } else {
  //     setSelectedProducts(new Set(filteredProducts?.map(p => p.id) || []))
  //   }
  // }

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
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-4xl font-bold text-transparent">
              Products
            </h1>
            <p className="mt-2 text-gray-600">Manage your digital products and services</p>
          </div>
          <Button variant="primary" size="lg" onClick={onCreateProduct} className="shadow-lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Product
          </Button>
        </div>
      </motion.div>


      {/* Controls Bar */}
      <motion.div variants={itemVariants}>
        <GlassmorphicCard className="p-4" variant="light">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[200px] flex-1 sm:max-w-sm">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="md" className="flex-shrink-0">
                    <Filter className="mr-2 h-4 w-4" />
                    <span>Filter</span>
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>All Products</DropdownMenuItem>
                  <DropdownMenuItem>Active Only</DropdownMenuItem>
                  <DropdownMenuItem>Digital Products</DropdownMenuItem>
                  <DropdownMenuItem>Services</DropdownMenuItem>
                  <DropdownMenuItem>Memberships</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Recently Added</DropdownMenuItem>
                  <DropdownMenuItem>Best Selling</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {selectedProducts.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mr-2"
                >
                  <Button variant="secondary" size="sm">
                    Bulk Actions ({selectedProducts.size})
                  </Button>
                </motion.div>
              )}

              <div className="flex rounded-lg border border-gray-200 bg-white p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'rounded-md p-2 transition-colors',
                    viewMode === 'grid'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'rounded-md p-2 transition-colors',
                    viewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </GlassmorphicCard>
      </motion.div>

      {/* Products Display */}
      {isLoading ? (
        <motion.div variants={itemVariants} className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </motion.div>
      ) : filteredProducts?.length === 0 ? (
        <motion.div variants={itemVariants}>
          <GlassmorphicCard className="p-12" variant="light">
            <div className="text-center">
              <div className="from-primary/10 to-primary/5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br">
                <Package className="text-primary h-8 w-8" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">No products found</h3>
              <p className="mt-2 text-gray-600">
                {searchTerm
                  ? 'Try adjusting your search'
                  : 'Create your first product to get started'}
              </p>
              {!searchTerm && (
                <Button variant="primary" onClick={onCreateProduct} className="mt-6">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Product
                </Button>
              )}
            </div>
          </GlassmorphicCard>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <motion.div
          variants={containerVariants}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredProducts?.map((product, index) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard
                product={product}
                gradientClass={
                  gradientPresets[index % gradientPresets.length] || 'from-blue-500 to-purple-600'
                }
                isSelected={selectedProducts.has(product.id)}
                onSelect={() => {
                  const newSelected = new Set(selectedProducts)
                  if (newSelected.has(product.id)) {
                    newSelected.delete(product.id)
                  } else {
                    newSelected.add(product.id)
                  }
                  setSelectedProducts(newSelected)
                }}
                onEdit={() => onEditProduct(product)}
                onDuplicate={() => duplicateProduct.mutate({ id: product.id })}
                onArchive={() => archiveProduct.mutate({ id: product.id })}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-4">
          {filteredProducts?.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductListItem
                product={product}
                isSelected={selectedProducts.has(product.id)}
                onSelect={() => {
                  const newSelected = new Set(selectedProducts)
                  if (newSelected.has(product.id)) {
                    newSelected.delete(product.id)
                  } else {
                    newSelected.add(product.id)
                  }
                  setSelectedProducts(newSelected)
                }}
                onEdit={() => onEditProduct(product)}
                onDuplicate={() => duplicateProduct.mutate({ id: product.id })}
                onArchive={() => archiveProduct.mutate({ id: product.id })}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

// Product Card Component
function ProductCard({
  product,
  gradientClass,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onArchive,
}: {
  product: Product
  gradientClass: string
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDuplicate: () => void
  onArchive: () => void
}) {
  const lowestPrice =
    product.plans.length > 0 ? Math.min(...product.plans.map((p) => p.price)) : 0

  return (
    <GlassmorphicCard
      className={cn(
        'group relative h-full overflow-hidden transition-all duration-300',
        isSelected && 'ring-primary ring-2 ring-offset-2'
      )}
      variant="light"
      hover
    >
      {/* Selection Checkbox */}
      <div className="absolute top-4 left-4 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
        />
      </div>

      {/* Product Thumbnail */}
      <div className={cn('h-48 bg-gradient-to-br', product.thumbnail ? '' : gradientClass)}>
        {product.thumbnail ? (
          <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-16 w-16 text-white/50" />
          </div>
        )}

        {/* Floating Actions */}
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onArchive} className="text-red-600">
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {product.description || 'No description'}
          </p>
        </div>

        {/* Pricing */}
        <div className="mb-4">
          {product.plans && product.plans.length > 0 ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-primary text-2xl font-bold">
                  From {getCurrencySymbol('USD')}
                  {(lowestPrice / 100).toFixed(2)}
                </span>
                {product.isRecurring && product.interval && (
                  <span className="text-sm text-gray-500">/{product.interval}</span>
                )}
              </div>
              {product.plans.length > 1 && (
                <p className="text-sm text-gray-600">{product.plans.length} pricing plans</p>
              )}
            </>
          ) : (
            <div className="text-gray-500">
              <span className="text-sm">Set pricing via</span>
              <br />
              <span className="text-primary font-semibold">Offers</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 border-t pt-4">
          <div>
            <p className="text-sm text-gray-600">Revenue</p>
            <p className="font-semibold">
              {getCurrencySymbol('USD')}
              {((product.totalRevenue || 0) / 100).toFixed(0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Sales</p>
            <p className="font-semibold">{product.totalSales}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Conv.</p>
            <p className="font-semibold">{product.conversionRate}%</p>
          </div>
        </div>

        {/* Product Type Badge */}
        <div className="absolute top-[13rem] right-6">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
              product.type === 'digital' && 'bg-blue-100 text-blue-800',
              product.type === 'service' && 'bg-purple-100 text-purple-800',
              product.type === 'membership' && 'bg-emerald-100 text-emerald-800',
              product.type === 'bundle' && 'bg-orange-100 text-orange-800'
            )}
          >
            {product.type}
          </span>
        </div>
      </div>
    </GlassmorphicCard>
  )
}

// Product List Item Component
function ProductListItem({
  product,
  isSelected,
  onSelect,
  onEdit,
  onDuplicate,
  onArchive,
}: {
  product: Product
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  onDuplicate: () => void
  onArchive: () => void
}) {
  const lowestPrice =
    product.plans.length > 0 ? Math.min(...product.plans.map((p) => p.price)) : 0

  return (
    <GlassmorphicCard
      className={cn(
        'p-6 transition-all duration-300',
        isSelected && 'ring-primary ring-2 ring-offset-2'
      )}
      variant="light"
      hover
    >
      <div className="flex items-center gap-6">
        {/* Selection */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
        />

        {/* Thumbnail */}
        <div
          className={cn(
            'h-16 w-16 flex-shrink-0 rounded-lg bg-gradient-to-br',
            product.thumbnail ? '' : 'from-blue-500 to-purple-600'
          )}
        >
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-8 w-8 text-white/50" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.description || 'No description'}</p>
            </div>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                product.type === 'digital' && 'bg-blue-100 text-blue-800',
                product.type === 'service' && 'bg-purple-100 text-purple-800',
                product.type === 'membership' && 'bg-emerald-100 text-emerald-800',
                product.type === 'bundle' && 'bg-orange-100 text-orange-800'
              )}
            >
              {product.type}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">Price</p>
            {product.plans && product.plans.length > 0 ? (
              <p className="text-primary font-semibold">
                {getCurrencySymbol('USD')}
                {(lowestPrice / 100).toFixed(2)}
              </p>
            ) : (
              <p className="text-gray-500 text-sm">Via Offers</p>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Revenue</p>
            <p className="font-semibold">
              {getCurrencySymbol('USD')}
              {((product.totalRevenue || 0) / 100).toFixed(0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Sales</p>
            <p className="font-semibold">{product.totalSales}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Conv.</p>
            <p className="font-semibold">{product.conversionRate}%</p>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onArchive} className="text-red-600">
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </GlassmorphicCard>
  )
}
