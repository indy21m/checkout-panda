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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Package,
  Image as ImageIcon,
  Sparkles,
  Upload,
  X,
  Check,
  Zap,
  Shield,
  Gift,
  Star,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  ShoppingCart,
  Monitor,
  Briefcase,
  Users,
  Layers,
  Edit2,
  ExternalLink,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { DndContext, closestCenter } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Schema for product form
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'URL slug is required'),
  description: z.string().optional(),
  featured_description: z.string().optional(),
  type: z.enum(['digital', 'service', 'membership', 'bundle']),
  status: z.enum(['active', 'inactive', 'draft']),
  price: z.number().min(0.01, 'Price must be at least $0.01').default(1),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId?: string
  onSuccess?: () => void
}

// Feature item component with drag and drop
function FeatureItem({
  feature,
  onUpdate,
  onRemove,
}: {
  feature: { id: string; text: string; icon?: string }
  onUpdate: (text: string) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: feature.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const icons = [
    { value: 'check', icon: Check, label: 'Check' },
    { value: 'star', icon: Star, label: 'Star' },
    { value: 'zap', icon: Zap, label: 'Lightning' },
    { value: 'shield', icon: Shield, label: 'Shield' },
    { value: 'gift', icon: Gift, label: 'Gift' },
    { value: 'trending', icon: TrendingUp, label: 'Trending' },
  ]

  const selectedIcon = icons.find((i) => i.value === feature.icon)
  const Icon = selectedIcon?.icon || Check

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-white p-3 transition-all',
        isDragging ? 'opacity-50 shadow-lg' : 'hover:shadow-sm'
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        type="button"
        className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex flex-1 items-center gap-2">
        <div className="group relative">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
            <Icon className="h-4 w-4" />
          </div>

          {/* Icon picker dropdown */}
          <div className="absolute top-full left-0 z-10 mt-1 hidden grid-cols-3 gap-1 rounded-lg border bg-white p-2 shadow-lg group-hover:grid">
            {icons.map(({ value, icon: IconComponent, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onUpdate(feature.text)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-gray-100',
                  feature.icon === value && 'bg-purple-100 text-purple-600'
                )}
                title={label}
              >
                <IconComponent className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        <Input
          value={feature.text}
          onChange={(e) => onUpdate(e.target.value)}
          placeholder="Feature description..."
          className="flex-1 border-0 px-2 focus:ring-0"
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-gray-400 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  )
}

export function EnhancedProductEditor({
  open,
  onOpenChange,
  productId,
  onSuccess,
}: ProductEditorProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [features, setFeatures] = useState<Array<{ id: string; text: string; icon?: string }>>([])
  const [mediaUrl, setMediaUrl] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const utils = api.useUtils()

  // Fetch product data if editing
  const { data: product } = api.product.getById.useQuery(
    { id: productId! },
    { enabled: !!productId }
  )

  // Mutations
  const createProduct = api.product.create.useMutation({
    onSuccess: () => {
      toast.success('Product created successfully')
      utils.product.list.invalidate()
      onSuccess?.()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateProduct = api.product.update.useMutation({
    onSuccess: () => {
      toast.success('Product updated successfully')
      utils.product.list.invalidate()
      utils.product.getById.invalidate({ id: productId! })
      onSuccess?.()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const form = useForm<ProductFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      featured_description: '',
      type: 'digital',
      status: 'draft',
      price: 1,
    },
  })

  // Load product data into form
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        slug: (product as any).slug || product.name.toLowerCase().replace(/\s+/g, '-'),
        description: product.description || '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        featured_description: (product as any).featured_description || '',
        type: (product.type || 'digital') as 'digital' | 'service' | 'membership' | 'bundle',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        status: ((product as any).status || 'active') as 'active' | 'inactive' | 'draft',
        price: product.price / 100, // Convert from cents to dollars
      })
      setFeatures(
        product.features
          ? product.features.map((f, i) => ({
              id: `feature-${i}`,
              text: f,
              icon: 'check',
            }))
          : []
      )
      setMediaUrl(product.thumbnail || '')
    }
  }, [product, form])

  const onSubmit = (data: ProductFormData) => {
    const productData = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      featured_description: data.featured_description,
      type: data.type as 'digital' | 'service' | 'membership' | 'bundle',
      status: data.status,
      features: features.map((f) => f.text).filter(Boolean),
      thumbnail: mediaUrl || undefined,
      price: Math.round(data.price * 100), // Convert dollars to cents
    }

    if (productId) {
      updateProduct.mutate({ id: productId, ...productData })
    } else {
      createProduct.mutate(productData)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = features.findIndex((f) => f.id === active.id)
      const newIndex = features.findIndex((f) => f.id === over.id)

      const newFeatures = [...features]
      const [movedFeature] = newFeatures.splice(oldIndex, 1)
      if (movedFeature) {
        newFeatures.splice(newIndex, 0, movedFeature)
      }

      setFeatures(newFeatures)
    }
  }

  const addFeature = () => {
    setFeatures([...features, { id: `feature-${Date.now()}`, text: '', icon: 'check' }])
  }

  const updateFeature = (id: string, text: string) => {
    setFeatures(features.map((f) => (f.id === id ? { ...f, text } : f)))
  }

  const removeFeature = (id: string) => {
    setFeatures(features.filter((f) => f.id !== id))
  }

  // Generate slug from name
  const generateSlug = () => {
    const name = form.watch('name')
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    form.setValue('slug', slug)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
        <div className="flex h-full">
          {/* Editor Section */}
          <div className="flex-1 overflow-y-auto">
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    {productId ? 'Edit Product' : 'Create New Product'}
                  </DialogTitle>
                  <DialogDescription>
                    Design a compelling product that converts visitors into customers
                  </DialogDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setPreviewMode(!previewMode)}>
                  {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-4">
                  <TabsTrigger value="details" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="features" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Features
                  </TabsTrigger>
                  <TabsTrigger value="media" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Media
                  </TabsTrigger>
                  <TabsTrigger value="offers" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Offers
                  </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabsContent value="details" className="mt-0 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Product Name</Label>
                          <Input
                            id="name"
                            {...form.register('name')}
                            placeholder="e.g., Premium Course Bundle"
                            className="mt-1"
                          />
                          {form.formState.errors.name && (
                            <p className="mt-1 text-sm text-red-500">
                              {form.formState.errors.name.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="slug">URL Slug</Label>
                          <div className="mt-1 flex gap-2">
                            <Input
                              id="slug"
                              {...form.register('slug')}
                              placeholder="premium-course-bundle"
                            />
                            <Button type="button" variant="secondary" onClick={generateSlug}>
                              Generate
                            </Button>
                          </div>
                          {form.formState.errors.slug && (
                            <p className="mt-1 text-sm text-red-500">
                              {form.formState.errors.slug.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          {...form.register('description')}
                          placeholder="Describe your product..."
                          className="mt-1 min-h-[100px]"
                        />
                      </div>

                      <div>
                        <Label htmlFor="featured_description">Featured Description</Label>
                        <Textarea
                          id="featured_description"
                          {...form.register('featured_description')}
                          placeholder="A compelling description for the checkout page..."
                          className="mt-1 min-h-[80px]"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          This appears prominently on the checkout page
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label>Product Type</Label>
                          <div className="mt-2 grid grid-cols-4 gap-2">
                            {[
                              { value: 'digital', label: 'Digital', icon: Monitor },
                              { value: 'service', label: 'Service', icon: Briefcase },
                              { value: 'membership', label: 'Membership', icon: Users },
                              { value: 'bundle', label: 'Bundle', icon: Layers },
                            ].map((type) => {
                              const Icon = type.icon
                              const isSelected = form.watch('type') === type.value
                              return (
                                <button
                                  key={type.value}
                                  type="button"
                                  onClick={() => form.setValue('type', type.value as 'digital' | 'service' | 'membership' | 'bundle')}
                                  className={`
                                    flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all
                                    ${isSelected 
                                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }
                                  `}
                                >
                                  <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                                  <span className="text-sm font-medium">{type.label}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        
                        <div>
                          <Label>Status</Label>
                          <div className="mt-2 flex gap-2">
                            {[
                              { value: 'draft', label: 'Draft', color: 'gray' },
                              { value: 'active', label: 'Active', color: 'green' },
                              { value: 'inactive', label: 'Inactive', color: 'red' },
                            ].map((status) => {
                              const isSelected = form.watch('status') === status.value
                              return (
                                <button
                                  key={status.value}
                                  type="button"
                                  onClick={() => form.setValue('status', status.value as 'draft' | 'active' | 'inactive')}
                                  className={`
                                    flex-1 rounded-lg border-2 px-4 py-2 font-medium transition-all
                                    ${isSelected 
                                      ? status.color === 'green' 
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : status.color === 'red'
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-500 bg-gray-50 text-gray-700'
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }
                                  `}
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    <div className={`
                                      h-2 w-2 rounded-full
                                      ${isSelected 
                                        ? status.color === 'green' 
                                          ? 'bg-green-500'
                                          : status.color === 'red'
                                          ? 'bg-red-500'
                                          : 'bg-gray-500'
                                        : 'bg-gray-300'
                                      }
                                    `} />
                                    {status.label}
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="price">Base Price</Label>
                        <div className="mt-1 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            min="0.01"
                            {...form.register('price', { valueAsNumber: true })}
                            placeholder="9.99"
                            className="pl-8"
                          />
                        </div>
                        {form.formState.errors.price && (
                          <p className="mt-1 text-sm text-red-500">
                            {form.formState.errors.price.message}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-gray-500">
                          This is the standalone price. Different prices can be set for offers (order bumps, upsells, etc.)
                        </p>
                      </div>
                    </TabsContent>


                    <TabsContent value="features" className="mt-0 space-y-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Product Features</h3>
                          <p className="text-sm text-gray-500">
                            Highlight what makes your product special
                          </p>
                        </div>
                        <Button type="button" variant="secondary" size="sm" onClick={addFeature}>
                          <Plus className="mr-1 h-4 w-4" />
                          Add Feature
                        </Button>
                      </div>

                      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext
                          items={features.map((f) => f.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {features.length === 0 ? (
                              <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
                                <Sparkles className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                <p className="mb-4 text-gray-500">No features added yet</p>
                                <Button type="button" variant="secondary" onClick={addFeature}>
                                  Add Your First Feature
                                </Button>
                              </div>
                            ) : (
                              features.map((feature) => (
                                <FeatureItem
                                  key={feature.id}
                                  feature={feature}
                                  onUpdate={(text) => updateFeature(feature.id, text)}
                                  onRemove={() => removeFeature(feature.id)}
                                />
                              ))
                            )}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </TabsContent>

                    <TabsContent value="media" className="mt-0 space-y-6">
                      <div>
                        <Label>Product Image</Label>
                        <div className="mt-2">
                          {mediaUrl ? (
                            <div className="group relative">
                              <img
                                src={mediaUrl}
                                alt="Product"
                                className="h-48 w-full rounded-lg object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setMediaUrl('')}
                                >
                                  <X className="mr-1 h-4 w-4" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                              <Upload className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                              <p className="mb-4 text-gray-500">Upload product image</p>
                              <Input
                                type="url"
                                placeholder="Or paste image URL..."
                                value={mediaUrl}
                                onChange={(e) => setMediaUrl(e.target.value)}
                                className="mx-auto max-w-sm"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="offers" className="mt-0">
                      <OffersTab productId={productId} />
                    </TabsContent>

                  </motion.div>
                </AnimatePresence>
              </Tabs>

              {/* Form Actions */}
              <div className="mt-8 flex justify-end gap-3 border-t pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={createProduct.isPending || updateProduct.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending}>
                  {createProduct.isPending || updateProduct.isPending ? (
                    <>
                      <motion.div
                        className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Saving...
                    </>
                  ) : productId ? (
                    'Update Product'
                  ) : (
                    'Create Product'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <AnimatePresence>
            {previewMode && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 400, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-l bg-gray-50"
              >
                <div className="p-6">
                  <h3 className="mb-4 font-semibold">Preview</h3>
                  <div className="rounded-lg bg-white p-6 shadow-sm">
                    {mediaUrl && (
                      <img
                        src={mediaUrl}
                        alt="Preview"
                        className="mb-4 h-48 w-full rounded-lg object-cover"
                      />
                    )}
                    <h4 className="mb-2 text-xl font-bold">
                      {form.watch('name') || 'Product Name'}
                    </h4>
                    <p className="mb-4 text-gray-600">
                      {form.watch('description') || 'Product description will appear here...'}
                    </p>

                    {features.length > 0 && (
                      <div className="space-y-2">
                        {features
                          .filter((f) => f.text)
                          .map((feature) => {
                            const icons = {
                              check: Check,
                              star: Star,
                              zap: Zap,
                              shield: Shield,
                              gift: Gift,
                              trending: TrendingUp,
                            }
                            const Icon = icons[feature.icon as keyof typeof icons] || Check

                            return (
                              <div key={feature.id} className="flex items-center gap-2 text-sm">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                                  <Icon className="h-3 w-3 text-green-600" />
                                </div>
                                <span>{feature.text}</span>
                              </div>
                            )
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Offers Tab Component
function OffersTab({ productId }: { productId?: string }) {
  const router = useRouter()
  const { data: offers, isLoading } = api.offer.list.useQuery(
    { productId },
    { enabled: !!productId }
  )

  const contextConfig = {
    standalone: { icon: Package, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    order_bump: { icon: ShoppingCart, color: 'bg-purple-100 text-purple-800 border-purple-200' },
    upsell: { icon: TrendingUp, color: 'bg-green-100 text-green-800 border-green-200' },
    downsell: { icon: TrendingDown, color: 'bg-orange-100 text-orange-800 border-orange-200' },
  }

  if (!productId) {
    return (
      <div className="py-12 text-center">
        <Zap className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <p className="text-gray-500 mb-4">Save the product first to manage offers</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-flex items-center gap-2 text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          Loading offers...
        </div>
      </div>
    )
  }

  const groupedOffers = offers?.reduce((acc, offer) => {
    const context = offer.context
    if (!acc[context]) acc[context] = []
    acc[context]!.push(offer)
    return acc
  }, {} as Record<string, typeof offers>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Product Offers</h3>
          <p className="text-sm text-gray-500">
            Different pricing for different contexts
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => router.push(`/offers?productId=${productId}`)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Create Offer
        </Button>
      </div>

      {!offers || offers.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-8 text-center">
          <Zap className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="mb-4 text-gray-500">No offers created yet</p>
          <p className="text-sm text-gray-400 mb-4">
            Create offers to set different prices for order bumps, upsells, and downsells
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/offers?productId=${productId}`)}
          >
            Create Your First Offer
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {(['standalone', 'order_bump', 'upsell', 'downsell'] as const).map(context => {
            const contextOffers = groupedOffers?.[context] || []
            const config = contextConfig[context]
            const Icon = config.icon

            return (
              <div key={context} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Icon className="h-4 w-4" />
                  {context.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                  {contextOffers.length > 0 && (
                    <span className="text-xs text-gray-500">({contextOffers.length})</span>
                  )}
                </div>
                
                {contextOffers.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-500">
                    No {context.replace('_', ' ')} offers
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contextOffers.map((offer) => (
                      <div
                        key={offer.id}
                        className={`rounded-lg border p-3 ${config.color}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">{offer.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-bold">
                                  ${(offer.price / 100).toFixed(2)}
                                </span>
                                {offer.compareAtPrice && (
                                  <span className="text-sm line-through opacity-60">
                                    ${(offer.compareAtPrice / 100).toFixed(2)}
                                  </span>
                                )}
                                {offer.isActive ? (
                                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                    Active
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                    Inactive
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/offers?edit=${offer.id}`)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/offers`)}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
