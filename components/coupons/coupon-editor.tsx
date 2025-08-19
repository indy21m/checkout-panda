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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, Info, Package, Search } from 'lucide-react'
import { api } from '@/lib/trpc/client'
import { toast } from 'sonner'

const couponSchema = z.object({
  code: z.string().min(1, 'Code is required').max(20).toUpperCase(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive('Discount value must be positive'),
  currency: z.enum(['USD', 'EUR', 'DKK']),
  duration: z.enum(['forever', 'once', 'repeating']),
  durationInMonths: z.number().optional(),
  maxRedemptions: z.number().optional(),
  maxRedemptionsPerCustomer: z.number().optional(),
  redeemableFrom: z.date().optional(),
  expiresAt: z.date().optional(),
  offerScope: z.enum(['all', 'specific']),
  offerIds: z.array(z.string()).optional(),
})

type CouponFormData = z.infer<typeof couponSchema>

interface CouponEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  couponId?: string
}

export function CouponEditor({ open, onOpenChange, couponId }: CouponEditorProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [searchOffer, setSearchOffer] = useState('')
  const [selectedOffers, setSelectedOffers] = useState<string[]>([])

  const utils = api.useUtils()

  const { data: coupon } = api.coupon.getById.useQuery({ id: couponId! }, { enabled: !!couponId })

  const { data: offers = [] } = api.offer.list.useQuery({ includeInactive: true })

  const form = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 10,
      currency: 'USD',
      duration: 'once',
      maxRedemptionsPerCustomer: 1,
      offerScope: 'all',
      offerIds: [],
    },
  })

  useEffect(() => {
    if (coupon) {
      form.reset({
        code: coupon.code,
        name: coupon.name,
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue:
          coupon.discountType === 'fixed' ? coupon.discountValue / 100 : coupon.discountValue,
        currency: coupon.currency,
        duration: coupon.duration,
        durationInMonths: coupon.durationInMonths || undefined,
        maxRedemptions: coupon.maxRedemptions || undefined,
        maxRedemptionsPerCustomer: coupon.maxRedemptionsPerCustomer || 1,
        redeemableFrom: coupon.redeemableFrom ? new Date(coupon.redeemableFrom) : undefined,
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt) : undefined,
        offerScope: coupon.productScope || 'all',
      })

      // TODO: Update when coupon-offers relation is added to database
      const offerIds: string[] = []
      setSelectedOffers(offerIds)
      form.setValue('offerIds', offerIds)
    } else {
      form.reset()
      setSelectedOffers([])
    }
  }, [coupon, form])

  const createCoupon = api.coupon.create.useMutation({
    onSuccess: () => {
      toast.success('Coupon created successfully')
      utils.coupon.list.invalidate()
      onOpenChange(false)
      form.reset()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create coupon')
    },
  })

  const updateCoupon = api.coupon.update.useMutation({
    onSuccess: () => {
      toast.success('Coupon updated successfully')
      utils.coupon.list.invalidate()
      utils.coupon.getById.invalidate({ id: couponId! })
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update coupon')
    },
  })

  const onSubmit = (data: CouponFormData) => {
    const submitData = {
      ...data,
      discountValue:
        data.discountType === 'fixed' ? Math.round(data.discountValue * 100) : data.discountValue,
      offerIds: selectedOffers,
    }

    if (couponId) {
      updateCoupon.mutate({ id: couponId, ...submitData })
    } else {
      createCoupon.mutate(submitData)
    }
  }

  const toggleOffer = (offerId: string) => {
    setSelectedOffers((prev) => {
      const updated = prev.includes(offerId)
        ? prev.filter((id) => id !== offerId)
        : [...prev, offerId]
      form.setValue('offerIds', updated)
      return updated
    })
  }

  const filteredOffers = offers.filter(
    (offer) =>
      offer.name.toLowerCase().includes(searchOffer.toLowerCase()) ||
      offer.product?.name.toLowerCase().includes(searchOffer.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-3xl min-w-[600px] flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-2xl font-bold text-transparent">
            {couponId ? 'Edit Coupon' : 'New Coupon'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="limits">Limits</TabsTrigger>
              <TabsTrigger value="offers">Offers</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-1">
              <TabsContent value="details" className="mt-6 space-y-6">
                {/* Coupon Code */}
                <div>
                  <Label htmlFor="code">
                    Coupon code
                    <span className="ml-1 text-xs text-gray-500">(will be uppercase)</span>
                  </Label>
                  <Input
                    id="code"
                    {...form.register('code')}
                    placeholder="SUMMER20"
                    className="mt-2 uppercase"
                    maxLength={20}
                  />
                  {form.formState.errors.code && (
                    <p className="mt-1 text-sm text-red-500">
                      {form.formState.errors.code.message}
                    </p>
                  )}
                </div>

                {/* Coupon Name */}
                <div>
                  <Label htmlFor="name">Coupon name</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Summer Sale 2024"
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
                    placeholder="Internal notes about this coupon..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <Label>Discount type</Label>
                  <Select
                    value={form.watch('discountType')}
                    onValueChange={(value: 'percentage' | 'fixed') =>
                      form.setValue('discountType', value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Discount Value */}
                <div>
                  <Label htmlFor="discountValue">
                    {form.watch('discountType') === 'percentage' ? 'Percentage' : 'Amount'}
                  </Label>
                  <div className="mt-2 flex gap-2">
                    {form.watch('discountType') === 'fixed' && (
                      <Select
                        value={form.watch('currency')}
                        onValueChange={(value: 'USD' | 'EUR' | 'DKK') =>
                          form.setValue('currency', value)
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="DKK">DKK</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Input
                      id="discountValue"
                      type="number"
                      {...form.register('discountValue', { valueAsNumber: true })}
                      placeholder={form.watch('discountType') === 'percentage' ? '20' : '10.00'}
                      className="flex-1"
                      step={form.watch('discountType') === 'percentage' ? '1' : '0.01'}
                      max={form.watch('discountType') === 'percentage' ? '100' : undefined}
                    />
                    {form.watch('discountType') === 'percentage' && (
                      <span className="flex items-center px-3 text-gray-500">%</span>
                    )}
                  </div>
                  {form.formState.errors.discountValue && (
                    <p className="mt-1 text-sm text-red-500">
                      {form.formState.errors.discountValue.message}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="limits" className="mt-6 space-y-6">
                {/* Duration */}
                <div>
                  <Label>Duration</Label>
                  <Select
                    value={form.watch('duration')}
                    onValueChange={(value: 'forever' | 'once' | 'repeating') =>
                      form.setValue('duration', value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                      <SelectItem value="repeating">Repeating</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-2 text-sm text-gray-500">
                    {form.watch('duration') === 'once' &&
                      'Discount applies to the first payment only'}
                    {form.watch('duration') === 'forever' &&
                      'Discount applies to all recurring payments'}
                    {form.watch('duration') === 'repeating' &&
                      'Discount applies for a specific number of months'}
                  </p>
                </div>

                {/* Duration in Months (for repeating) */}
                {form.watch('duration') === 'repeating' && (
                  <div>
                    <Label htmlFor="durationInMonths">Number of months</Label>
                    <Input
                      id="durationInMonths"
                      type="number"
                      {...form.register('durationInMonths', { valueAsNumber: true })}
                      placeholder="3"
                      className="mt-2"
                      min={1}
                    />
                  </div>
                )}

                {/* Redeemable From */}
                <div>
                  <Label>Coupon redeemable from</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'mt-2 w-full justify-start text-left font-normal',
                          !form.watch('redeemableFrom') && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch('redeemableFrom')
                          ? format(form.watch('redeemableFrom')!, 'PPP')
                          : 'Immediately'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.watch('redeemableFrom')}
                        onSelect={(date) => form.setValue('redeemableFrom', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Expires At */}
                <div>
                  <Label>Redeemable until</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'mt-2 w-full justify-start text-left font-normal',
                          !form.watch('expiresAt') && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch('expiresAt')
                          ? format(form.watch('expiresAt')!, 'PPP')
                          : 'Never expires'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.watch('expiresAt')}
                        onSelect={(date) => form.setValue('expiresAt', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Max Redemptions */}
                <div>
                  <Label htmlFor="maxRedemptions">
                    Maximum total redemptions
                    <span className="ml-1 text-xs text-gray-500">(leave empty for unlimited)</span>
                  </Label>
                  <Input
                    id="maxRedemptions"
                    type="number"
                    {...form.register('maxRedemptions', { valueAsNumber: true })}
                    placeholder="Unlimited"
                    className="mt-2"
                    min={1}
                  />
                </div>

                {/* Max Redemptions Per Customer */}
                <div>
                  <Label htmlFor="maxRedemptionsPerCustomer">
                    Maximum redemptions per customer
                  </Label>
                  <Input
                    id="maxRedemptionsPerCustomer"
                    type="number"
                    {...form.register('maxRedemptionsPerCustomer', { valueAsNumber: true })}
                    placeholder="1"
                    className="mt-2"
                    min={1}
                  />
                </div>
              </TabsContent>

              <TabsContent value="offers" className="mt-6 space-y-6">
                <div>
                  <Label>Offers</Label>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose which offers this coupon applies to.
                  </p>
                </div>

                {/* Offer Scope */}
                <RadioGroup
                  value={form.watch('offerScope')}
                  onValueChange={(value: 'all' | 'specific') => {
                    form.setValue('offerScope', value)
                    if (value === 'all') {
                      setSelectedOffers([])
                      form.setValue('offerIds', [])
                    }
                  }}
                >
                  <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-gray-50">
                    <RadioGroupItem value="all" id="all-offers" />
                    <Label htmlFor="all-offers" className="flex-1 cursor-pointer">
                      All offers
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-gray-50">
                    <RadioGroupItem value="specific" id="specific-offers" />
                    <Label htmlFor="specific-offers" className="flex-1 cursor-pointer">
                      Specific offers
                    </Label>
                  </div>
                </RadioGroup>

                {/* Offer Search and Selection */}
                {form.watch('offerScope') === 'specific' && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search for an offer"
                        value={searchOffer}
                        onChange={(e) => setSearchOffer(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="max-h-64 overflow-y-auto rounded-lg border">
                      {filteredOffers.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          {searchOffer ? 'No offers found' : 'No offers available'}
                        </div>
                      ) : (
                        <div className="divide-y">
                          {filteredOffers.map((offer) => {
                            const contextLabels = {
                              standalone: 'Standalone',
                              order_bump: 'Order Bump',
                              upsell: 'Upsell',
                              downsell: 'Downsell',
                            }
                            return (
                              <div
                                key={offer.id}
                                className="flex cursor-pointer items-center gap-3 p-4 hover:bg-gray-50"
                                onClick={() => toggleOffer(offer.id)}
                              >
                                <Checkbox
                                  checked={selectedOffers.includes(offer.id)}
                                  onCheckedChange={() => toggleOffer(offer.id)}
                                />
                                <Package className="h-4 w-4 text-gray-400" />
                                <div className="flex-1">
                                  <p className="font-medium">{offer.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {offer.product?.name} • {contextLabels[offer.context]} • $
                                    {(offer.price / 100).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {selectedOffers.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Info className="h-4 w-4" />
                        <span>{selectedOffers.length} offer(s) selected</span>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex justify-end gap-3 border-t pt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCoupon.isPending || updateCoupon.isPending}
              className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
            >
              {createCoupon.isPending || updateCoupon.isPending
                ? 'Saving...'
                : couponId
                  ? 'Update Coupon'
                  : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
