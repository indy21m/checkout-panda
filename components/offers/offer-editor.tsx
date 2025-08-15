'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ImageUpload } from '@/components/ui/image-upload'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { 
  CalendarIcon, 
  Package, 
  Tag, 
  ShoppingCart,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { api } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { getCurrencySymbol } from '@/lib/currency'

const offerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  productId: z.string().uuid('Please select a product'),
  context: z.enum(['standalone', 'order_bump', 'upsell', 'downsell']),
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional(),
  currency: z.enum(['USD', 'EUR', 'DKK']),
  couponId: z.string().uuid().optional(),
  
  // Display settings
  headline: z.string().optional(),
  badgeText: z.string().optional(),
  badgeColor: z.string().optional(),
  imageUrl: z.string().optional(),
  
  // Order bump specific
  bumpDescription: z.string().optional(),
  
  // Upsell/Downsell specific
  redirectUrl: z.string().optional(),
  declineRedirectUrl: z.string().optional(),
  
  // Conditions
  minQuantity: z.number().int().positive().default(1),
  maxQuantity: z.number().int().positive().optional(),
  
  // Availability
  availableFrom: z.date().optional(),
  availableUntil: z.date().optional(),
  maxRedemptions: z.number().int().positive().optional(),
  
  isActive: z.boolean().default(true),
})

type OfferFormData = z.infer<typeof offerSchema>

interface OfferEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offerId?: string
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

const contextDescriptions = {
  standalone: 'Standard product pricing',
  order_bump: 'Additional offer at checkout',
  upsell: 'Higher-value offer after purchase',
  downsell: 'Alternative offer after decline',
}

export function OfferEditor({ open, onOpenChange, offerId }: OfferEditorProps) {
  const [activeTab, setActiveTab] = useState('details')
  
  const utils = api.useUtils()

  const { data: offer } = api.offer.getById.useQuery(
    { id: offerId! },
    { enabled: !!offerId }
  )

  const { data: products = [] } = api.product.list.useQuery({})
  const { data: coupons = [] } = api.coupon.list.useQuery({})

  const form = useForm<OfferFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(offerSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      context: 'standalone',
      price: 1,
      currency: 'USD',
      minQuantity: 1,
      isActive: true,
    },
  })

  useEffect(() => {
    if (offer) {
      form.reset({
        name: offer.name,
        description: offer.description || '',
        productId: offer.productId,
        context: offer.context,
        price: offer.price / 100, // Convert from cents to dollars
        compareAtPrice: offer.compareAtPrice ? offer.compareAtPrice / 100 : undefined,
        currency: offer.currency,
        couponId: offer.couponId || 'none',
        headline: offer.headline || '',
        badgeText: offer.badgeText || '',
        badgeColor: offer.badgeColor || '',
        imageUrl: offer.imageUrl || '',
        bumpDescription: offer.bumpDescription || '',
        redirectUrl: offer.redirectUrl || '',
        declineRedirectUrl: offer.declineRedirectUrl || '',
        minQuantity: offer.minQuantity || 1,
        maxQuantity: offer.maxQuantity || undefined,
        availableFrom: offer.availableFrom ? new Date(offer.availableFrom) : undefined,
        availableUntil: offer.availableUntil ? new Date(offer.availableUntil) : undefined,
        maxRedemptions: offer.maxRedemptions || undefined,
        isActive: offer.isActive ?? true,
      })
    } else {
      form.reset()
    }
  }, [offer, form])

  const createOffer = api.offer.create.useMutation({
    onSuccess: () => {
      toast.success('Offer created successfully')
      utils.offer.list.invalidate()
      onOpenChange(false)
      form.reset()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create offer')
    },
  })

  const updateOffer = api.offer.update.useMutation({
    onSuccess: () => {
      toast.success('Offer updated successfully')
      utils.offer.list.invalidate()
      utils.offer.getById.invalidate({ id: offerId! })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update offer')
    },
  })

  const onSubmit = (data: OfferFormData) => {
    const submitData = {
      ...data,
      price: Math.round(data.price * 100), // Convert dollars to cents
      compareAtPrice: data.compareAtPrice ? Math.round(data.compareAtPrice * 100) : undefined,
      couponId: data.couponId === 'none' ? undefined : data.couponId || undefined,
    }

    if (offerId) {
      updateOffer.mutate({ id: offerId, ...submitData })
    } else {
      createOffer.mutate(submitData)
    }
  }

  const selectedProduct = products.find(p => p.id === form.watch('productId'))
  const selectedContext = form.watch('context')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[80vh] max-h-[900px] w-full max-w-4xl overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {offerId ? 'Edit Offer' : 'Create New Offer'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-1">
              <TabsContent value="details" className="space-y-6 mt-6">
                {/* Offer Name */}
                <div>
                  <Label htmlFor="name">Offer Name</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="e.g., Summer Sale - 30% Off"
                    className="mt-2"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">
                    Description <span className="text-gray-500">(optional)</span>
                  </Label>
                  <Textarea
                    id="description"
                    {...form.register('description')}
                    placeholder="Internal notes about this offer..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                {/* Product Selection */}
                <div>
                  <Label>Product</Label>
                  <Select
                    value={form.watch('productId')}
                    onValueChange={(value) => form.setValue('productId', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {product.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.productId && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.productId.message}
                    </p>
                  )}
                </div>

                {/* Context Selection */}
                <div>
                  <Label>Offer Context</Label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {Object.entries(contextLabels).map(([value, label]) => {
                      const Icon = contextIcons[value as keyof typeof contextIcons]
                      const isSelected = selectedContext === value
                      
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => form.setValue('context', value as 'standalone' | 'order_bump' | 'upsell' | 'downsell')}
                          className={cn(
                            'flex items-center gap-3 p-4 rounded-lg border-2 transition-all',
                            isSelected
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <Icon className={cn(
                            'h-5 w-5',
                            isSelected ? 'text-purple-600' : 'text-gray-400'
                          )} />
                          <div className="text-left">
                            <p className={cn(
                              'font-medium',
                              isSelected ? 'text-purple-900' : 'text-gray-900'
                            )}>
                              {label}
                            </p>
                            <p className="text-xs text-gray-500">
                              {contextDescriptions[value as keyof typeof contextDescriptions]}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6 mt-6">
                {/* Currency */}
                <div>
                  <Label>Currency</Label>
                  <Select
                    value={form.watch('currency')}
                    onValueChange={(value: 'USD' | 'EUR' | 'DKK') =>
                      form.setValue('currency', value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="DKK">DKK (kr)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Offer Price */}
                <div>
                  <Label htmlFor="price">Offer Price</Label>
                  <div className="mt-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {getCurrencySymbol(form.watch('currency'))}
                    </span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...form.register('price', { valueAsNumber: true })}
                      placeholder="9.99"
                      className="pl-8"
                    />
                  </div>
                  {form.formState.errors.price && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.price.message}
                    </p>
                  )}
                  {selectedProduct && (
                    <p className="text-sm text-gray-500 mt-1">
                      Original product price: {getCurrencySymbol(selectedProduct.currency)}
                      {(selectedProduct.price / 100).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Compare At Price */}
                <div>
                  <Label htmlFor="compareAtPrice">
                    Compare At Price <span className="text-gray-500">(optional)</span>
                  </Label>
                  <div className="mt-2 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      {getCurrencySymbol(form.watch('currency'))}
                    </span>
                    <Input
                      id="compareAtPrice"
                      type="number"
                      step="0.01"
                      {...form.register('compareAtPrice', { valueAsNumber: true })}
                      placeholder="19.99"
                      className="pl-8"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Show original price to highlight savings
                  </p>
                </div>

                {/* Coupon */}
                <div>
                  <Label>Apply Coupon <span className="text-gray-500">(optional)</span></Label>
                  <Select
                    value={form.watch('couponId') || ''}
                    onValueChange={(value) => form.setValue('couponId', value || undefined)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="No coupon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No coupon</SelectItem>
                      {coupons.map((coupon) => (
                        <SelectItem key={coupon.id} value={coupon.id}>
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            {coupon.code} - {coupon.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity Limits */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minQuantity">Minimum Quantity</Label>
                    <Input
                      id="minQuantity"
                      type="number"
                      {...form.register('minQuantity', { valueAsNumber: true })}
                      placeholder="1"
                      className="mt-2"
                      min={1}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxQuantity">
                      Maximum Quantity <span className="text-gray-500">(optional)</span>
                    </Label>
                    <Input
                      id="maxQuantity"
                      type="number"
                      {...form.register('maxQuantity', { valueAsNumber: true })}
                      placeholder="Unlimited"
                      className="mt-2"
                      min={1}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="display" className="space-y-6 mt-6">
                {/* Offer Image */}
                <div>
                  <ImageUpload
                    value={form.watch('imageUrl')}
                    onChange={(url) => form.setValue('imageUrl', url)}
                    label="Offer Image (optional)"
                    placeholder="Upload offer image"
                  />
                </div>

                {/* Headline */}
                <div>
                  <Label htmlFor="headline">
                    Headline <span className="text-gray-500">(optional)</span>
                  </Label>
                  <Input
                    id="headline"
                    {...form.register('headline')}
                    placeholder="e.g., Save 30% today only!"
                    className="mt-2"
                  />
                </div>

                {/* Badge */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="badgeText">
                      Badge Text <span className="text-gray-500">(optional)</span>
                    </Label>
                    <Input
                      id="badgeText"
                      {...form.register('badgeText')}
                      placeholder="e.g., LIMITED TIME"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="badgeColor">
                      Badge Color <span className="text-gray-500">(optional)</span>
                    </Label>
                    <Input
                      id="badgeColor"
                      type="color"
                      {...form.register('badgeColor')}
                      className="mt-2 h-10"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <Label htmlFor="imageUrl">
                    Image URL <span className="text-gray-500">(optional)</span>
                  </Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    {...form.register('imageUrl')}
                    placeholder="https://example.com/image.jpg"
                    className="mt-2"
                  />
                </div>

                {/* Order Bump Description */}
                {selectedContext === 'order_bump' && (
                  <div>
                    <Label htmlFor="bumpDescription">
                      Order Bump Description
                    </Label>
                    <Textarea
                      id="bumpDescription"
                      {...form.register('bumpDescription')}
                      placeholder="Short description for the order bump checkbox..."
                      className="mt-2"
                      rows={2}
                    />
                  </div>
                )}

                {/* Upsell/Downsell URLs */}
                {(selectedContext === 'upsell' || selectedContext === 'downsell') && (
                  <>
                    <div>
                      <Label htmlFor="redirectUrl">
                        Success Redirect URL
                      </Label>
                      <Input
                        id="redirectUrl"
                        type="url"
                        {...form.register('redirectUrl')}
                        placeholder="https://example.com/thank-you"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="declineRedirectUrl">
                        Decline Redirect URL
                      </Label>
                      <Input
                        id="declineRedirectUrl"
                        type="url"
                        {...form.register('declineRedirectUrl')}
                        placeholder="https://example.com/other-offers"
                        className="mt-2"
                      />
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-6">
                {/* Availability Dates */}
                <div>
                  <Label>Available From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal mt-2',
                          !form.watch('availableFrom') && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch('availableFrom')
                          ? format(form.watch('availableFrom')!, 'PPP')
                          : 'Always available'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.watch('availableFrom')}
                        onSelect={(date) => form.setValue('availableFrom', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Available Until</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal mt-2',
                          !form.watch('availableUntil') && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch('availableUntil')
                          ? format(form.watch('availableUntil')!, 'PPP')
                          : 'Never expires'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.watch('availableUntil')}
                        onSelect={(date) => form.setValue('availableUntil', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Max Redemptions */}
                <div>
                  <Label htmlFor="maxRedemptions">
                    Maximum Redemptions <span className="text-gray-500">(optional)</span>
                  </Label>
                  <Input
                    id="maxRedemptions"
                    type="number"
                    {...form.register('maxRedemptions', { valueAsNumber: true })}
                    placeholder="Unlimited"
                    className="mt-2"
                    min={1}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Leave empty for unlimited redemptions
                  </p>
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label htmlFor="isActive">Active</Label>
                    <p className="text-sm text-gray-500">
                      Make this offer available for use
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={form.watch('isActive')}
                    onCheckedChange={(checked) => form.setValue('isActive', checked)}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="mt-auto flex justify-end gap-3 border-t bg-white pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createOffer.isPending || updateOffer.isPending}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {createOffer.isPending || updateOffer.isPending
                ? 'Saving...'
                : offerId
                ? 'Update Offer'
                : 'Create Offer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}