'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
import { ImagePicker } from '@/components/ui/image-picker'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  CalendarIcon,
  Package,
  Tag,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  CreditCard,
  RefreshCw,
  Layers,
  Clock,
  Gift,
  DollarSign,
  Zap,
} from 'lucide-react'
import { api } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { getCurrencySymbol } from '@/lib/currency'

const offerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  productId: z.string().min(1, 'Please select a product'),
  context: z.enum(['standalone', 'order_bump', 'upsell', 'downsell']),

  // Offer type
  offerType: z.enum(['one_time', 'subscription', 'payment_plan']).default('one_time'),

  // Pricing
  price: z.number().positive('Price must be positive'),
  compareAtPrice: z.number().positive().optional(),
  currency: z.enum(['USD', 'EUR', 'DKK']),
  couponId: z.string().optional(),

  // Subscription settings
  isRecurring: z.boolean().default(false),
  billingCycle: z.enum(['monthly', 'quarterly', 'yearly', 'custom']).optional(),
  billingInterval: z.number().int().positive().optional(), // for custom intervals
  billingIntervalUnit: z.enum(['day', 'week', 'month', 'year']).optional(),

  // Trial settings
  trialEnabled: z.boolean().default(false),
  trialType: z.enum(['free', 'paid']).optional(),
  trialDays: z.number().int().positive().optional(),
  trialPrice: z.number().min(0).optional(), // in dollars, will convert to cents

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

  const { data: offer } = api.offer.getById.useQuery({ id: offerId! }, { enabled: !!offerId })

  const { data: products = [] } = api.product.list.useQuery({})
  const { data: coupons = [] } = api.coupon.list.useQuery({})

  const form = useForm<OfferFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(offerSchema) as any,
    defaultValues: {
      name: '',
      description: '',
      productId: '',
      context: 'standalone',
      offerType: 'one_time',
      price: 1,
      currency: 'USD',
      isRecurring: false,
      trialEnabled: false,
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
    console.log('Form submitted with data:', data)

    // Clean up empty strings for optional URL fields
    const cleanedData = {
      ...data,
      imageUrl: data.imageUrl?.trim() || undefined,
      redirectUrl: data.redirectUrl?.trim() || undefined,
      declineRedirectUrl: data.declineRedirectUrl?.trim() || undefined,
      headline: data.headline?.trim() || undefined,
      badgeText: data.badgeText?.trim() || undefined,
      badgeColor: data.badgeColor?.trim() || undefined,
      bumpDescription: data.bumpDescription?.trim() || undefined,
      description: data.description?.trim() || undefined,
    }

    const submitData = {
      ...cleanedData,
      price: Math.round(data.price * 100), // Convert dollars to cents
      compareAtPrice: data.compareAtPrice ? Math.round(data.compareAtPrice * 100) : undefined,
      couponId: data.couponId === 'none' ? undefined : data.couponId || undefined,
      // Convert trial price to cents if present
      trialPrice: data.trialPrice ? Math.round(data.trialPrice * 100) : undefined,
      // Only include subscription fields if it's a subscription
      isRecurring: data.offerType === 'subscription',
      billingCycle: data.offerType === 'subscription' ? data.billingCycle : undefined,
      billingInterval:
        data.offerType === 'subscription' && data.billingCycle === 'custom'
          ? data.billingInterval
          : undefined,
      billingIntervalUnit:
        data.offerType === 'subscription' && data.billingCycle === 'custom'
          ? data.billingIntervalUnit
          : undefined,
      // Only include trial fields if trial is enabled
      trialEnabled: data.offerType === 'subscription' ? data.trialEnabled : false,
      trialType: data.trialEnabled ? data.trialType : undefined,
      trialDays: data.trialEnabled ? data.trialDays : undefined,
    }

    if (offerId) {
      updateOffer.mutate({ id: offerId, ...submitData })
    } else {
      createOffer.mutate(submitData)
    }
  }

  // Add form error logging
  const handleFormSubmit = form.handleSubmit(onSubmit, (errors) => {
    console.log('Form validation errors:', errors)
    // Show first error as toast
    const firstError = Object.values(errors)[0]
    if (firstError && typeof firstError === 'object' && 'message' in firstError) {
      toast.error(firstError.message as string)
    }
  })

  const selectedProduct = products.find((p) => p.id === form.watch('productId'))
  const selectedContext = form.watch('context')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-4xl overflow-hidden p-0">
        <DialogHeader className="border-b border-gray-100 px-6 pt-6 pb-4">
          <DialogTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-2xl font-bold text-transparent">
            {offerId ? 'Edit Offer' : 'Create New Offer'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="flex h-full flex-col">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <TabsList
              className="mx-6 mt-4 grid w-full grid-cols-3"
              style={{ width: 'calc(100% - 3rem)' }}
            >
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <div
              className="flex-1 overflow-y-auto px-6 pb-6"
              style={{ maxHeight: 'calc(90vh - 220px)' }}
            >
              <TabsContent value="details" className="mt-6 space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold tracking-wider text-gray-700 uppercase">
                    Basic Information
                  </h3>

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
                      <p className="mt-1 text-sm text-red-500">
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
                      onValueChange={(value) => {
                        form.setValue('productId', value, { shouldValidate: true })
                      }}
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
                      <p className="mt-1 text-sm text-red-500">
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
                            onClick={() =>
                              form.setValue(
                                'context',
                                value as 'standalone' | 'order_bump' | 'upsell' | 'downsell'
                              )
                            }
                            className={cn(
                              'flex items-center gap-3 rounded-lg border-2 p-4 transition-all',
                              isSelected
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <Icon
                              className={cn(
                                'h-5 w-5',
                                isSelected ? 'text-purple-600' : 'text-gray-400'
                              )}
                            />
                            <div className="text-left">
                              <p
                                className={cn(
                                  'font-medium',
                                  isSelected ? 'text-purple-900' : 'text-gray-900'
                                )}
                              >
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
                </div>

                {/* Display Settings Section */}
                <div className="space-y-6 border-t pt-6">
                  <h3 className="text-sm font-semibold tracking-wider text-gray-700 uppercase">
                    Display Settings
                  </h3>

                  {/* Offer Image */}
                  <div>
                    <ImagePicker
                      value={form.watch('imageUrl')}
                      onChange={(url) => form.setValue('imageUrl', url)}
                      onRemove={() => form.setValue('imageUrl', '')}
                      label="Offer Image"
                      placeholder="Choose offer image"
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

                  {/* Order Bump Description */}
                  {selectedContext === 'order_bump' && (
                    <div>
                      <Label htmlFor="bumpDescription">Order Bump Description</Label>
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
                        <Label htmlFor="redirectUrl">Success Redirect URL</Label>
                        <Input
                          id="redirectUrl"
                          type="url"
                          {...form.register('redirectUrl')}
                          placeholder="https://example.com/thank-you"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="declineRedirectUrl">Decline Redirect URL</Label>
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
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="mt-6 space-y-6">
                {/* Offer Type Selection */}
                <div>
                  <Label className="mb-3 block text-base font-semibold">Offer Type</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        form.setValue('offerType', 'one_time', { shouldValidate: true })
                        form.setValue('isRecurring', false)
                      }}
                      className={cn(
                        'relative rounded-lg border-2 p-4 text-left transition-all',
                        form.watch('offerType') === 'one_time'
                          ? 'border-purple-500 bg-purple-50/50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <CreditCard className="mb-2 h-5 w-5 text-purple-600" />
                      <div className="font-medium">One-time</div>
                      <div className="mt-1 text-xs text-gray-600">Single payment</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        form.setValue('offerType', 'subscription', { shouldValidate: true })
                        form.setValue('isRecurring', true)
                        if (!form.watch('billingCycle')) {
                          form.setValue('billingCycle', 'monthly')
                        }
                      }}
                      className={cn(
                        'relative rounded-lg border-2 p-4 text-left transition-all',
                        form.watch('offerType') === 'subscription'
                          ? 'border-purple-500 bg-purple-50/50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <RefreshCw className="mb-2 h-5 w-5 text-purple-600" />
                      <div className="font-medium">Subscription</div>
                      <div className="mt-1 text-xs text-gray-600">Recurring billing</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        form.setValue('offerType', 'payment_plan', { shouldValidate: true })
                      }
                      className={cn(
                        'relative cursor-not-allowed rounded-lg border-2 p-4 text-left opacity-50 transition-all',
                        'border-gray-200'
                      )}
                      disabled
                    >
                      <Layers className="mb-2 h-5 w-5 text-gray-400" />
                      <div className="font-medium text-gray-400">Payment Plan</div>
                      <div className="mt-1 text-xs text-gray-400">Coming soon</div>
                    </button>
                  </div>
                </div>

                {/* Subscription Settings */}
                {form.watch('offerType') === 'subscription' && (
                  <div className="space-y-4 rounded-lg border border-purple-200 bg-purple-50/30 p-4">
                    <div>
                      <Label className="text-sm font-medium">Billing Cycle</Label>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {[
                          { value: 'monthly', label: 'Monthly' },
                          { value: 'quarterly', label: 'Quarterly' },
                          { value: 'yearly', label: 'Yearly' },
                          { value: 'custom', label: 'Custom' },
                        ].map((cycle) => (
                          <button
                            key={cycle.value}
                            type="button"
                            onClick={() =>
                              form.setValue(
                                'billingCycle',
                                cycle.value as 'monthly' | 'quarterly' | 'yearly' | 'custom',
                                {
                                  shouldValidate: true,
                                }
                              )
                            }
                            className={cn(
                              'rounded-md px-3 py-2 text-sm font-medium transition-all',
                              form.watch('billingCycle') === cycle.value
                                ? 'bg-purple-600 text-white'
                                : 'border bg-white text-gray-700 hover:bg-gray-50'
                            )}
                          >
                            {cycle.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Trial Configuration */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 text-sm font-medium">
                          <Gift className="h-4 w-4 text-purple-600" />
                          Enable Trial Period
                        </Label>
                        <Switch
                          checked={form.watch('trialEnabled') || false}
                          onCheckedChange={(checked) => {
                            form.setValue('trialEnabled', checked)
                            if (checked && !form.watch('trialType')) {
                              form.setValue('trialType', 'free')
                              form.setValue('trialDays', 7)
                            }
                          }}
                        />
                      </div>

                      {form.watch('trialEnabled') && (
                        <div className="space-y-3 pl-6">
                          {/* Trial Type Cards */}
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                form.setValue('trialType', 'free')
                                form.setValue('trialPrice', undefined)
                              }}
                              className={cn(
                                'rounded-lg border p-3 text-left transition-all',
                                form.watch('trialType') === 'free'
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              )}
                            >
                              <div className="flex items-start gap-2">
                                <Gift className="mt-0.5 h-4 w-4 text-green-600" />
                                <div>
                                  <div className="text-sm font-medium">Free Trial</div>
                                  <div className="mt-0.5 text-xs text-gray-600">
                                    $0 during trial
                                  </div>
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                form.setValue('trialType', 'paid')
                                if (!form.watch('trialPrice')) {
                                  form.setValue('trialPrice', 1)
                                }
                              }}
                              className={cn(
                                'rounded-lg border p-3 text-left transition-all',
                                form.watch('trialType') === 'paid'
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              )}
                            >
                              <div className="flex items-start gap-2">
                                <DollarSign className="mt-0.5 h-4 w-4 text-green-600" />
                                <div>
                                  <div className="text-sm font-medium">Paid Trial</div>
                                  <div className="mt-0.5 text-xs text-gray-600">Reduced price</div>
                                </div>
                              </div>
                            </button>
                          </div>

                          {/* Trial Duration */}
                          <div>
                            <Label className="text-xs text-gray-600">Trial Duration (days)</Label>
                            <div className="mt-1 flex items-center gap-2">
                              <Input
                                type="number"
                                {...form.register('trialDays', { valueAsNumber: true })}
                                className="w-20"
                                min={1}
                                max={90}
                              />
                              <div className="flex gap-1">
                                {[3, 7, 14, 30].map((days) => (
                                  <button
                                    key={days}
                                    type="button"
                                    onClick={() => form.setValue('trialDays', days)}
                                    className={cn(
                                      'rounded px-2 py-1 text-xs',
                                      form.watch('trialDays') === days
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    )}
                                  >
                                    {days}d
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Trial Price (for paid trials) */}
                          {form.watch('trialType') === 'paid' && (
                            <div>
                              <Label className="text-xs text-gray-600">Trial Price</Label>
                              <div className="relative mt-1">
                                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-500">
                                  {getCurrencySymbol(form.watch('currency'))}
                                </span>
                                <Input
                                  type="number"
                                  {...form.register('trialPrice', { valueAsNumber: true })}
                                  className="w-32 pl-8"
                                  min={0.01}
                                  step={0.01}
                                />
                              </div>
                            </div>
                          )}

                          {/* Trial Preview */}
                          <div className="rounded-lg border border-purple-200 bg-white p-3">
                            <div className="flex items-center gap-2 text-xs">
                              <Clock className="h-3 w-3 text-purple-600" />
                              <span className="text-gray-600">Customer journey:</span>
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs">
                              <span className="rounded bg-green-100 px-2 py-1 text-green-700">
                                Day 0:{' '}
                                {form.watch('trialType') === 'free'
                                  ? 'Free'
                                  : `${getCurrencySymbol(form.watch('currency'))}${form.watch('trialPrice')}`}{' '}
                                trial starts
                              </span>
                              <Zap className="h-3 w-3 text-gray-400" />
                              <span className="rounded bg-purple-100 px-2 py-1 text-purple-700">
                                Day {form.watch('trialDays') || 7}:{' '}
                                {getCurrencySymbol(form.watch('currency'))}
                                {form.watch('price')}/
                                {form.watch('billingCycle')?.replace('ly', '')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
                  <div className="relative mt-2">
                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
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
                    <p className="mt-1 text-sm text-red-500">
                      {form.formState.errors.price.message}
                    </p>
                  )}
                  {selectedProduct && (
                    <p className="mt-1 text-sm text-gray-500">Product: {selectedProduct.name}</p>
                  )}
                </div>

                {/* Compare At Price */}
                <div>
                  <Label htmlFor="compareAtPrice">
                    Compare At Price <span className="text-gray-500">(optional)</span>
                  </Label>
                  <div className="relative mt-2">
                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">
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
                  <p className="mt-1 text-sm text-gray-500">
                    Show original price to highlight savings
                  </p>
                </div>

                {/* Coupon */}
                <div>
                  <Label>
                    Apply Coupon <span className="text-gray-500">(optional)</span>
                  </Label>
                  <Select
                    value={form.watch('couponId') || 'none'}
                    onValueChange={(value) =>
                      form.setValue('couponId', value === 'none' ? undefined : value, { shouldValidate: true })
                    }
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
              </TabsContent>

              <TabsContent value="settings" className="mt-6 space-y-6">
                {/* Availability Dates */}
                <div>
                  <Label>Available From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'mt-2 w-full justify-start text-left font-normal',
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
                          'mt-2 w-full justify-start text-left font-normal',
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
                  <p className="mt-1 text-sm text-gray-500">
                    Leave empty for unlimited redemptions
                  </p>
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <Label htmlFor="isActive">Active</Label>
                    <p className="text-sm text-gray-500">Make this offer available for use</p>
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

          <div className="flex justify-end gap-3 border-t bg-gray-50/50 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createOffer.isPending || updateOffer.isPending}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
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
