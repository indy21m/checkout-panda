'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Package,
  DollarSign,
  Truck,
  FileText,
  Plus,
  X,
  Upload,
  Sparkles,
  Check,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { api } from '@/lib/trpc/client'
import type { RouterOutputs } from '@/lib/trpc/api'
import { PricingPlanBuilder } from './pricing-plan-builder'
import { cn } from '@/lib/utils'
import { SUPPORTED_CURRENCIES, getCurrencySymbol, type Currency } from '@/lib/currency'

type Product = RouterOutputs['product']['list'][0]

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  type: z.enum(['digital', 'service', 'membership', 'bundle']),
  thumbnail: z.string().optional(),
  color: z.string().optional(),
  features: z.array(z.string()).optional(),
  price: z.string().regex(/^\d+\.?\d{0,2}$/, 'Invalid price format'),
  currency: z.enum(['USD', 'EUR', 'DKK']),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductEditorModalProps {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
}

const thumbnailPresets = [
  { gradient: 'from-blue-500 to-purple-600', color: '#3B82F6' },
  { gradient: 'from-emerald-500 to-teal-600', color: '#10B981' },
  { gradient: 'from-orange-500 to-red-600', color: '#F97316' },
  { gradient: 'from-pink-500 to-rose-600', color: '#EC4899' },
  { gradient: 'from-violet-500 to-purple-600', color: '#8B5CF6' },
  { gradient: 'from-cyan-500 to-blue-600', color: '#06B6D4' },
]

export function ProductEditorModal({ isOpen, onClose, product }: ProductEditorModalProps) {
  const [activeTab, setActiveTab] = useState('essentials')
  const [selectedThumbnail, setSelectedThumbnail] = useState(0)
  const [features, setFeatures] = useState<string[]>(product?.features || [])
  const [newFeature, setNewFeature] = useState('')

  const utils = api.useUtils()

  const createProduct = api.product.create.useMutation({
    onSuccess: () => {
      toast.success('Product created successfully')
      utils.product.list.invalidate()
      onClose()
      form.reset()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const updateProduct = api.product.update.useMutation({
    onSuccess: () => {
      toast.success('Product updated successfully')
      utils.product.list.invalidate()
      onClose()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'digital',
      features: [],
      price: '',
      currency: 'USD',
    },
  })

  // Update form when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || '',
        type: product.type || 'digital',
        thumbnail: product.thumbnail || '',
        color: product.color || '',
        features: product.features || [],
        price: (product.price / 100).toFixed(2),
        currency: product.currency || 'USD',
      })
      setFeatures(product.features || [])

      // Find matching thumbnail preset
      const presetIndex = thumbnailPresets.findIndex((p) => p.color === product.color)
      if (presetIndex !== -1) {
        setSelectedThumbnail(presetIndex)
      }
    } else {
      form.reset()
      setFeatures([])
    }
  }, [product, form])

  const onSubmit = (data: ProductFormData) => {
    const payload = {
      ...data,
      price: Math.round(parseFloat(data.price) * 100),
      features,
      color: thumbnailPresets[selectedThumbnail]?.color,
      thumbnail: data.thumbnail || undefined,
    }

    if (product) {
      updateProduct.mutate({
        id: product.id,
        ...payload,
      })
    } else {
      createProduct.mutate({
        ...payload,
        isRecurring: false, // Legacy field
      })
    }
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()])
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
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
          <DialogContent className="max-w-4xl overflow-hidden p-0">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex h-[80vh] flex-col"
            >
              {/* Header */}
              <DialogHeader className="border-b bg-gradient-to-r from-gray-50 to-white px-6 py-4">
                <DialogTitle className="text-2xl font-bold">
                  {product ? 'Edit Product' : 'Create New Product'}
                </DialogTitle>
                <DialogDescription>
                  Set up your product details, pricing plans, and delivery options
                </DialogDescription>
              </DialogHeader>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
                <TabsList className="w-full justify-start rounded-none border-b px-6">
                  <TabsTrigger value="essentials" className="gap-2">
                    <Package className="h-4 w-4" />
                    Essentials
                  </TabsTrigger>
                  <TabsTrigger value="pricing" className="gap-2">
                    <DollarSign className="h-4 w-4" />
                    Pricing
                  </TabsTrigger>
                  <TabsTrigger value="delivery" className="gap-2">
                    <Truck className="h-4 w-4" />
                    Delivery
                  </TabsTrigger>
                  <TabsTrigger value="assets" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Assets
                  </TabsTrigger>
                </TabsList>

                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col">
                  <div className="flex-1 overflow-y-auto">
                    {/* Essentials Tab */}
                    <TabsContent value="essentials" className="m-0 space-y-6 p-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Product Name*</Label>
                          <Input
                            id="name"
                            {...form.register('name')}
                            placeholder="e.g., Premium Course Bundle"
                          />
                          {form.formState.errors.name && (
                            <p className="text-sm text-red-600">
                              {form.formState.errors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type">Product Type</Label>
                          <Select
                            value={form.watch('type')}
                            onValueChange={(value) =>
                              form.setValue(
                                'type',
                                value as 'digital' | 'service' | 'membership' | 'bundle'
                              )
                            }
                          >
                            <SelectTrigger id="type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="digital">Digital Product</SelectItem>
                              <SelectItem value="service">Service</SelectItem>
                              <SelectItem value="membership">Membership</SelectItem>
                              <SelectItem value="bundle">Bundle</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          {...form.register('description')}
                          placeholder="Describe what your product offers..."
                          rows={4}
                        />
                      </div>

                      {/* Thumbnail Selection */}
                      <div className="space-y-2">
                        <Label>Product Thumbnail</Label>
                        <div className="grid grid-cols-6 gap-3">
                          {thumbnailPresets.map((preset, index) => (
                            <motion.button
                              key={index}
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedThumbnail(index)}
                              className={cn(
                                'relative h-20 overflow-hidden rounded-lg bg-gradient-to-br',
                                preset.gradient,
                                selectedThumbnail === index && 'ring-primary ring-2 ring-offset-2'
                              )}
                            >
                              {selectedThumbnail === index && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <Check className="h-6 w-6 text-white" />
                                </div>
                              )}
                            </motion.button>
                          ))}
                          <button
                            type="button"
                            className="flex h-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400"
                          >
                            <Upload className="h-5 w-5 text-gray-400" />
                          </button>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2">
                        <Label>Key Features</Label>
                        <div className="space-y-2">
                          {features.map((feature, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex items-center gap-2"
                            >
                              <div className="flex flex-1 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                                <Check className="h-4 w-4 text-emerald-600" />
                                <span className="text-sm">{feature}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFeature(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          ))}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a feature..."
                              value={newFeature}
                              onChange={(e) => setNewFeature(e.target.value)}
                              onKeyPress={(e) =>
                                e.key === 'Enter' && (e.preventDefault(), addFeature())
                              }
                            />
                            <Button type="button" variant="secondary" onClick={addFeature}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Legacy Price (for backward compatibility) */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="price">Base Price*</Label>
                          <div className="relative">
                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
                              {getCurrencySymbol(form.watch('currency'))}
                            </span>
                            <Input
                              id="price"
                              {...form.register('price')}
                              placeholder="99.00"
                              className="pl-8"
                            />
                          </div>
                          {form.formState.errors.price && (
                            <p className="text-sm text-red-600">
                              {form.formState.errors.price.message}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            This is the default price. Add pricing plans for more options.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="currency">Currency</Label>
                          <Select
                            value={form.watch('currency')}
                            onValueChange={(value) => form.setValue('currency', value as Currency)}
                          >
                            <SelectTrigger id="currency">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SUPPORTED_CURRENCIES.map((currency) => (
                                <SelectItem key={currency} value={currency}>
                                  {getCurrencySymbol(currency)} {currency}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Pricing Tab */}
                    <TabsContent value="pricing" className="m-0 p-6">
                      <PricingPlanBuilder productId={product?.id} />
                    </TabsContent>

                    {/* Delivery Tab */}
                    <TabsContent value="delivery" className="m-0 p-6">
                      <div className="py-12 text-center">
                        <Truck className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-semibold">Delivery Settings</h3>
                        <p className="text-gray-600">
                          Configure how customers receive their purchase
                        </p>
                        <p className="mt-4 text-sm text-gray-500">Coming soon...</p>
                      </div>
                    </TabsContent>

                    {/* Assets Tab */}
                    <TabsContent value="assets" className="m-0 p-6">
                      <div className="py-12 text-center">
                        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <h3 className="mb-2 text-lg font-semibold">Digital Assets</h3>
                        <p className="text-gray-600">
                          Upload files and resources for your customers
                        </p>
                        <Button variant="secondary" className="mt-4">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Files
                        </Button>
                      </div>
                    </TabsContent>
                  </div>

                  {/* Footer */}
                  <div className="border-t bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Sparkles className="h-4 w-4" />
                        Changes are saved automatically
                      </div>
                      <div className="flex gap-3">
                        <Button type="button" variant="ghost" onClick={onClose}>
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={createProduct.isPending || updateProduct.isPending}
                        >
                          {createProduct.isPending || updateProduct.isPending ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Saving...
                            </>
                          ) : product ? (
                            'Update Product'
                          ) : (
                            'Create Product'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </Tabs>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}
