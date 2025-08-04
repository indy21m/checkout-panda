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
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Schema for product form
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'URL slug is required'),
  description: z.string().optional(),
  featured_description: z.string().optional(),
  type: z.enum(['digital', 'service', 'membership', 'bundle']),
  status: z.enum(['active', 'inactive', 'draft']),
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
  onRemove 
}: { 
  feature: { id: string; text: string; icon?: string }
  onUpdate: (text: string) => void
  onRemove: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: feature.id })

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

  const selectedIcon = icons.find(i => i.value === feature.icon)
  const Icon = selectedIcon?.icon || Check

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 bg-white rounded-lg border transition-all",
        isDragging ? "opacity-50 shadow-lg" : "hover:shadow-sm"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      
      <div className="flex items-center gap-2 flex-1">
        <div className="relative group">
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <Icon className="h-4 w-4" />
          </div>
          
          {/* Icon picker dropdown */}
          <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg border hidden group-hover:grid grid-cols-3 gap-1 z-10">
            {icons.map(({ value, icon: IconComponent, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onUpdate(feature.text)}
                className={cn(
                  "h-8 w-8 rounded flex items-center justify-center hover:bg-gray-100 transition-colors",
                  feature.icon === value && "bg-purple-100 text-purple-600"
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
          className="flex-1 border-0 focus:ring-0 px-2"
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
    },
  })

  // Load product data into form
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        slug: (product as any).slug || product.name.toLowerCase().replace(/\s+/g, '-'),
        description: product.description || '',
        featured_description: (product as any).featured_description || '',
        type: (product.type || 'digital') as 'digital' | 'service' | 'membership' | 'bundle',
        status: ((product as any).status || 'active') as 'active' | 'inactive' | 'draft',
      })
      setFeatures(
        product.features
          ? product.features.map((f, i) => ({ 
              id: `feature-${i}`, 
              text: f, 
              icon: 'check' 
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
      features: features.map(f => f.text).filter(Boolean),
      thumbnail: mediaUrl || undefined,
      price: 0, // Price is managed separately in plans
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
    setFeatures([
      ...features,
      { id: `feature-${Date.now()}`, text: '', icon: 'check' }
    ])
  }

  const updateFeature = (id: string, text: string) => {
    setFeatures(features.map(f => f.id === id ? { ...f, text } : f))
  }

  const removeFeature = (id: string) => {
    setFeatures(features.filter(f => f.id !== id))
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
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
                    <TabsContent value="details" className="space-y-6 mt-0">
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
                            <p className="text-red-500 text-sm mt-1">
                              {form.formState.errors.name.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="slug">URL Slug</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              id="slug"
                              {...form.register('slug')}
                              placeholder="premium-course-bundle"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={generateSlug}
                            >
                              Generate
                            </Button>
                          </div>
                          {form.formState.errors.slug && (
                            <p className="text-red-500 text-sm mt-1">
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
                        <p className="text-sm text-gray-500 mt-1">
                          This appears prominently on the checkout page
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="type">Product Type</Label>
                          <select
                            id="type"
                            {...form.register('type')}
                            className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
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
                            className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2"
                          >
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="pricing" className="mt-0">
                      <div className="text-center py-8 text-gray-500">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Pricing is managed in the Pricing Plans section</p>
                        <Button variant="link" className="mt-2">
                          Go to Pricing Plans →
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="features" className="space-y-4 mt-0">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Product Features</h3>
                          <p className="text-sm text-gray-500">
                            Highlight what makes your product special
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={addFeature}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Feature
                        </Button>
                      </div>

                      <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={features.map(f => f.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-2">
                            {features.length === 0 ? (
                              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500 mb-4">No features added yet</p>
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={addFeature}
                                >
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

                    <TabsContent value="media" className="space-y-6 mt-0">
                      <div>
                        <Label>Product Image</Label>
                        <div className="mt-2">
                          {mediaUrl ? (
                            <div className="relative group">
                              <img
                                src={mediaUrl}
                                alt="Product"
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => setMediaUrl('')}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                              <p className="text-gray-500 mb-4">Upload product image</p>
                              <Input
                                type="url"
                                placeholder="Or paste image URL..."
                                value={mediaUrl}
                                onChange={(e) => setMediaUrl(e.target.value)}
                                className="max-w-sm mx-auto"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6 mt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Feature on Homepage</h4>
                            <p className="text-sm text-gray-500">
                              Display this product prominently
                            </p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">Enable Reviews</h4>
                            <p className="text-sm text-gray-500">
                              Allow customers to leave reviews
                            </p>
                          </div>
                          <Switch />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
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
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={createProduct.isPending || updateProduct.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createProduct.isPending || updateProduct.isPending}
                >
                  {createProduct.isPending || updateProduct.isPending ? (
                    <>
                      <motion.div
                        className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
                className="border-l bg-gray-50 overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="font-semibold mb-4">Preview</h3>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    {mediaUrl && (
                      <img
                        src={mediaUrl}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <h4 className="text-xl font-bold mb-2">
                      {form.watch('name') || 'Product Name'}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      {form.watch('description') || 'Product description will appear here...'}
                    </p>
                    
                    {features.length > 0 && (
                      <div className="space-y-2">
                        {features.filter(f => f.text).map((feature) => {
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
                              <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
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