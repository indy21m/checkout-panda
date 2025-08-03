'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Package, Plus, X, Edit2, Check } from 'lucide-react'
import { ProductSelectorModal } from '../product-selector-modal'
import { api } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'
import type { RouterOutputs } from '@/lib/trpc/api'
import { getCurrencySymbol } from '@/lib/currency'

type Product = RouterOutputs['product']['list'][0]

interface EnhancedProductBlockProps {
  data: {
    productId?: string
    selectedPlanId?: string
    customName?: string
    customDescription?: string
    customFeatures?: string[]
    showImage?: boolean
    showFeatures?: boolean
    showPlans?: boolean
    layout?: 'side-by-side' | 'stacked' | 'centered'
  }
  onUpdate: (data: ProductFormData) => void
  isEditing?: boolean
}

interface ProductFormData {
  productId?: string
  selectedPlanId?: string
  customName?: string
  customDescription?: string
  customFeatures?: string[]
  showImage?: boolean
  showFeatures?: boolean
  showPlans?: boolean
  layout?: 'side-by-side' | 'stacked' | 'centered'
}

export function EnhancedProductBlock({ data, onUpdate, isEditing }: EnhancedProductBlockProps) {
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editingFeatures, setEditingFeatures] = useState(false)
  const [newFeature, setNewFeature] = useState('')
  const [customFeatures, setCustomFeatures] = useState<string[]>(data.customFeatures || [])

  // Fetch product data if productId is provided
  const { data: product } = api.product.getById.useQuery(
    { id: data.productId! },
    { enabled: !!data.productId }
  )

  useEffect(() => {
    if (product) {
      setSelectedProduct(product)
    }
  }, [product])

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    onUpdate({
      ...data,
      productId: product.id,
      selectedPlanId: product.plans?.[0]?.id, // Select first plan by default
    })
  }

  const handlePlanChange = (planId: string) => {
    onUpdate({
      ...data,
      selectedPlanId: planId,
    })
  }

  const handleLayoutChange = (layout: 'side-by-side' | 'stacked' | 'centered') => {
    onUpdate({
      ...data,
      layout,
    })
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      const updatedFeatures = [...customFeatures, newFeature.trim()]
      setCustomFeatures(updatedFeatures)
      onUpdate({
        ...data,
        customFeatures: updatedFeatures,
      })
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    const updatedFeatures = customFeatures.filter((_, i) => i !== index)
    setCustomFeatures(updatedFeatures)
    onUpdate({
      ...data,
      customFeatures: updatedFeatures,
    })
  }

  const selectedPlan = selectedProduct?.plans?.find((p) => p.id === data.selectedPlanId)
  const displayFeatures =
    data.customFeatures || selectedPlan?.features || selectedProduct?.features || []

  if (isEditing) {
    return (
      <GlassmorphicCard className="p-6" variant="light">
        <div className="space-y-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Package className="h-5 w-5" />
            Product Block Settings
          </h3>

          {/* Product Selection */}
          <div className="space-y-2">
            <Label>Product</Label>
            {selectedProduct ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border bg-gray-50 p-3">
                  <p className="font-medium">{selectedProduct.name}</p>
                  {selectedProduct.price && (
                    <p className="text-sm text-gray-600">
                      {getCurrencySymbol(selectedProduct.currency || 'USD')}
                      {(selectedProduct.price / 100).toFixed(2)}
                    </p>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsProductSelectorOpen(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => setIsProductSelectorOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Select Product
              </Button>
            )}
          </div>

          {/* Plan Selection */}
          {selectedProduct?.plans && selectedProduct.plans.length > 0 && (
            <div className="space-y-2">
              <Label>Pricing Plan</Label>
              <Select value={data.selectedPlanId} onValueChange={handlePlanChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProduct.plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} -{' '}
                      {getCurrencySymbol(plan.currency || selectedProduct.currency || 'USD')}
                      {(plan.price / 100).toFixed(2)}
                      {plan.isRecurring && `/${plan.billingInterval}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Layout */}
          <div className="space-y-2">
            <Label>Layout</Label>
            <Select value={data.layout || 'side-by-side'} onValueChange={handleLayoutChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="side-by-side">Side by Side</SelectItem>
                <SelectItem value="stacked">Stacked</SelectItem>
                <SelectItem value="centered">Centered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Content */}
          <div className="space-y-4">
            <h4 className="font-medium">Custom Content (Optional)</h4>

            <div className="space-y-2">
              <Label htmlFor="customName">Override Name</Label>
              <Input
                id="customName"
                value={data.customName || ''}
                onChange={(e) => onUpdate({ ...data, customName: e.target.value })}
                placeholder={selectedProduct?.name || 'Product name'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customDescription">Override Description</Label>
              <Textarea
                id="customDescription"
                value={data.customDescription || ''}
                onChange={(e) => onUpdate({ ...data, customDescription: e.target.value })}
                placeholder={selectedProduct?.description || 'Product description'}
                rows={3}
              />
            </div>

            {/* Custom Features */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Custom Features</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingFeatures(!editingFeatures)}
                >
                  {editingFeatures ? 'Done' : 'Edit'}
                </Button>
              </div>
              {editingFeatures && (
                <div className="space-y-2">
                  {customFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={feature} readOnly className="flex-1" />
                      <Button variant="ghost" size="icon" onClick={() => removeFeature(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a feature..."
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    />
                    <Button variant="secondary" onClick={addFeature}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Display Options */}
          <div className="space-y-3">
            <h4 className="font-medium">Display Options</h4>

            <div className="flex items-center justify-between">
              <Label htmlFor="showImage">Show Product Image</Label>
              <Switch
                id="showImage"
                checked={data.showImage !== false}
                onCheckedChange={(checked) => onUpdate({ ...data, showImage: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showFeatures">Show Features</Label>
              <Switch
                id="showFeatures"
                checked={data.showFeatures !== false}
                onCheckedChange={(checked) => onUpdate({ ...data, showFeatures: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showPlans">Show All Plans</Label>
              <Switch
                id="showPlans"
                checked={data.showPlans === true}
                onCheckedChange={(checked) => onUpdate({ ...data, showPlans: checked })}
              />
            </div>
          </div>
        </div>

        <ProductSelectorModal
          isOpen={isProductSelectorOpen}
          onClose={() => setIsProductSelectorOpen(false)}
          onSelectProduct={handleSelectProduct}
          selectedProductId={data.productId}
        />
      </GlassmorphicCard>
    )
  }

  // Preview mode
  if (!selectedProduct) {
    return (
      <GlassmorphicCard className="p-12 text-center" variant="light">
        <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="text-gray-600">No product selected</p>
        <p className="mt-2 text-sm text-gray-500">Edit this block to select a product</p>
      </GlassmorphicCard>
    )
  }

  const displayName = data.customName || selectedProduct.name
  const displayDescription = data.customDescription || selectedProduct.description
  const displayPrice = selectedPlan?.price || selectedProduct.price
  const gradient = selectedProduct.color
    ? `from-[${selectedProduct.color}] to-[${selectedProduct.color}]/80`
    : 'from-blue-500 to-purple-600'

  const layoutClasses = {
    'side-by-side': 'flex flex-col md:flex-row items-center gap-8',
    stacked: 'flex flex-col items-center text-center',
    centered: 'max-w-2xl mx-auto text-center',
  }

  return (
    <div className={cn('w-full', layoutClasses[data.layout || 'side-by-side'])}>
      {/* Product Image */}
      {data.showImage !== false && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className={cn('relative', data.layout === 'side-by-side' ? 'md:w-1/2' : 'mb-8')}
        >
          <div className={cn('aspect-video rounded-lg bg-gradient-to-br shadow-xl', gradient)}>
            <div className="flex h-full items-center justify-center">
              <Package className="h-24 w-24 text-white/80" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Product Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={data.layout === 'side-by-side' ? 'md:w-1/2' : 'w-full'}
      >
        <h2 className="mb-4 text-3xl font-bold">{displayName}</h2>

        {displayDescription && <p className="mb-6 text-lg text-gray-600">{displayDescription}</p>}

        {/* Price Display */}
        {data.showPlans && selectedProduct.plans && selectedProduct.plans.length > 0 ? (
          // Show all plans
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            {selectedProduct.plans.map((plan) => (
              <GlassmorphicCard
                key={plan.id}
                className={cn('p-4', plan.isHighlighted && 'ring-primary ring-2')}
                variant="light"
              >
                <h3 className="mb-2 font-semibold">{plan.name}</h3>
                <div className="mb-3">
                  <span className="text-2xl font-bold">
                    {getCurrencySymbol(plan.currency || selectedProduct.currency || 'USD')}
                    {(plan.price / 100).toFixed(2)}
                  </span>
                  {plan.isRecurring && (
                    <span className="text-gray-600">/{plan.billingInterval}</span>
                  )}
                </div>
                {plan.features && plan.features.length > 0 && (
                  <ul className="space-y-1">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-3 w-3 text-emerald-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </GlassmorphicCard>
            ))}
          </div>
        ) : (
          // Show single price
          <div className="mb-6">
            <span className="text-4xl font-bold">
              {getCurrencySymbol(selectedPlan?.currency || selectedProduct.currency || 'USD')}
              {(displayPrice / 100).toFixed(2)}
            </span>
            {selectedPlan?.isRecurring && (
              <span className="ml-2 text-gray-600">/{selectedPlan.billingInterval}</span>
            )}
          </div>
        )}

        {/* Features */}
        {data.showFeatures !== false && displayFeatures.length > 0 && (
          <ul className="space-y-3">
            {displayFeatures.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-gray-700">{feature}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  )
}
