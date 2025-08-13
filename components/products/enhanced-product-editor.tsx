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
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Package,
  DollarSign,
  Image as ImageIcon,
  Settings,
  Sparkles,
  Upload,
  X,
  Check,
  Zap,
  Shield,
  Gift,
  Star,
  TrendingUp,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/trpc/client'
import { toast } from 'sonner'
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
    resolver: zodResolver(productSchema),
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
                <TabsList className="mb-6 grid w-full grid-cols-5">
                  <TabsTrigger value="details" className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Pricing
                  </TabsTrigger>
                  <TabsTrigger value="features" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Features
                  </TabsTrigger>
                  <TabsTrigger value="media" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Media
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
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

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="type">Product Type</Label>
                          <select
                            id="type"
                            {...form.register('type')}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                          >
                            <option value="digital">Digital Product</option>
                            <option value="service">Service</option>
                            <option value="membership">Membership</option>
                            <option value="bundle">Bundle</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <select
                            id="status"
                            {...form.register('status')}
                            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                          >
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
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

                    <TabsContent value="pricing" className="mt-0">
                      <div className="py-8 text-center text-gray-500">
                        <DollarSign className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                        <p>Pricing is managed in the Pricing Plans section</p>
                        <Button variant="link" className="mt-2">
                          Go to Pricing Plans →
                        </Button>
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

                    <TabsContent value="settings" className="mt-0 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <h4 className="font-medium">Feature on Homepage</h4>
                            <p className="text-sm text-gray-500">
                              Display this product prominently
                            </p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <h4 className="font-medium">Enable Reviews</h4>
                            <p className="text-sm text-gray-500">
                              Allow customers to leave reviews
                            </p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div>
                            <h4 className="font-medium">Stock Tracking</h4>
                            <p className="text-sm text-gray-500">
                              Track inventory for physical products
                            </p>
                          </div>
                          <Switch />
                        </div>
                      </div>
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
