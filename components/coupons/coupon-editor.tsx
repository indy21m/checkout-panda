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
  productScope: z.enum(['all', 'specific']),
  productIds: z.array(z.string()).optional(),
})

type CouponFormData = z.infer<typeof couponSchema>

interface CouponEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  couponId?: string
}

export function CouponEditor({ open, onOpenChange, couponId }: CouponEditorProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [searchProduct, setSearchProduct] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  
  const utils = api.useUtils()

  const { data: coupon } = api.coupon.getById.useQuery(
    { id: couponId! },
    { enabled: !!couponId }
  )

  const { data: products = [] } = api.product.list.useQuery({})

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
      productScope: 'all',
      productIds: [],
    },
  })

  useEffect(() => {
    if (coupon) {
      form.reset({
        code: coupon.code,
        name: coupon.name,
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue: coupon.discountType === 'fixed' 
          ? coupon.discountValue / 100 
          : coupon.discountValue,
        currency: coupon.currency,
        duration: coupon.duration,
        durationInMonths: coupon.durationInMonths || undefined,
        maxRedemptions: coupon.maxRedemptions || undefined,
        maxRedemptionsPerCustomer: coupon.maxRedemptionsPerCustomer || 1,
        redeemableFrom: coupon.redeemableFrom ? new Date(coupon.redeemableFrom) : undefined,
        expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt) : undefined,
        productScope: coupon.productScope,
      })
      
      const productIds = coupon.couponProducts?.map(cp => cp.productId) || []
      setSelectedProducts(productIds)
      form.setValue('productIds', productIds)
    } else {
      form.reset()
      setSelectedProducts([])
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
      discountValue: data.discountType === 'fixed' 
        ? Math.round(data.discountValue * 100) 
        : data.discountValue,
      productIds: selectedProducts,
    }

    if (couponId) {
      updateCoupon.mutate({ id: couponId, ...submitData })
    } else {
      createCoupon.mutate(submitData)
    }
  }

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => {
      const updated = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
      form.setValue('productIds', updated)
      return updated
    })
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchProduct.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">
            {couponId ? 'Edit Coupon' : 'New Coupon'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="limits">Limits</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-1">
              <TabsContent value="details" className="space-y-6 mt-6">
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
                    <p className="text-sm text-red-500 mt-1">
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
                  <div className="flex gap-2 mt-2">
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
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.discountValue.message}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="limits" className="space-y-6 mt-6">
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
                  <p className="text-sm text-gray-500 mt-2">
                    {form.watch('duration') === 'once' && 'Discount applies to the first payment only'}
                    {form.watch('duration') === 'forever' && 'Discount applies to all recurring payments'}
                    {form.watch('duration') === 'repeating' && 'Discount applies for a specific number of months'}
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
                          'w-full justify-start text-left font-normal mt-2',
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
                          'w-full justify-start text-left font-normal mt-2',
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

              <TabsContent value="products" className="space-y-6 mt-6">
                <div>
                  <Label>Products</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose which products this coupon applies to.
                  </p>
                </div>

                {/* Product Scope */}
                <RadioGroup
                  value={form.watch('productScope')}
                  onValueChange={(value: 'all' | 'specific') => {
                    form.setValue('productScope', value)
                    if (value === 'all') {
                      setSelectedProducts([])
                      form.setValue('productIds', [])
                    }
                  }}
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="all" id="all-products" />
                    <Label htmlFor="all-products" className="flex-1 cursor-pointer">
                      All products
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="specific" id="specific-products" />
                    <Label htmlFor="specific-products" className="flex-1 cursor-pointer">
                      Specific products
                    </Label>
                  </div>
                </RadioGroup>

                {/* Product Search and Selection */}
                {form.watch('productScope') === 'specific' && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search for a product"
                        value={searchProduct}
                        onChange={(e) => setSearchProduct(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          {searchProduct ? 'No products found' : 'No products available'}
                        </div>
                      ) : (
                        <div className="divide-y">
                          {filteredProducts.map((product) => (
                            <div
                              key={product.id}
                              className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                              onClick={() => toggleProduct(product.id)}
                            >
                              <Checkbox
                                checked={selectedProducts.includes(product.id)}
                                onCheckedChange={() => toggleProduct(product.id)}
                              />
                              <Package className="w-4 h-4 text-gray-400" />
                              <div className="flex-1">
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-gray-500">
                                  ${(product.price / 100).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {selectedProducts.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Info className="w-4 h-4" />
                        <span>{selectedProducts.length} product(s) selected</span>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createCoupon.isPending || updateCoupon.isPending}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
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