'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { OrderBump, Currency } from '@/types'

interface OrderBumpEditDialogProps {
  orderBump: OrderBump | null
  open: boolean
  onClose: () => void
  onSave: (orderBump: OrderBump) => void
  isNew?: boolean
}

interface OrderBumpFormData {
  enabled: boolean
  title: string
  description: string
  priceAmount: number
  currency: Currency
  productId: string
  priceId: string
  savingsPercent: number
}

function createEmptyFormData(): OrderBumpFormData {
  return {
    enabled: true,
    title: '',
    description: '',
    priceAmount: 0,
    currency: 'DKK',
    productId: '',
    priceId: '',
    savingsPercent: 0,
  }
}

function orderBumpToFormData(orderBump: OrderBump): OrderBumpFormData {
  return {
    enabled: orderBump.enabled,
    title: orderBump.title,
    description: orderBump.description,
    priceAmount: orderBump.stripe.priceAmount / 100,
    currency: orderBump.stripe.currency,
    productId: orderBump.stripe.productId,
    priceId: orderBump.stripe.priceId,
    savingsPercent: orderBump.savingsPercent ?? 0,
  }
}

function formDataToOrderBump(data: OrderBumpFormData): OrderBump {
  return {
    enabled: data.enabled,
    title: data.title,
    description: data.description,
    savingsPercent: data.savingsPercent > 0 ? data.savingsPercent : undefined,
    stripe: {
      productId: data.productId,
      priceId: data.priceId,
      priceAmount: Math.round(data.priceAmount * 100),
      currency: data.currency,
    },
  }
}

export function OrderBumpEditDialog({
  orderBump,
  open,
  onClose,
  onSave,
  isNew = false,
}: OrderBumpEditDialogProps) {
  const [formData, setFormData] = useState<OrderBumpFormData>(createEmptyFormData())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (orderBump) {
        setFormData(orderBumpToFormData(orderBump))
      } else {
        setFormData(createEmptyFormData())
      }
      setError(null)
    }
  }, [open, orderBump])

  function updateField<K extends keyof OrderBumpFormData>(
    field: K,
    value: OrderBumpFormData[K]
  ): void {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function handleSave(): void {
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return
    }
    if (formData.priceAmount <= 0) {
      setError('Price must be greater than 0')
      return
    }

    const result = formDataToOrderBump(formData)
    onSave(result)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add Order Bump' : 'Edit Order Bump'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Enabled Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div>
              <Label className="text-sm font-medium">Enabled</Label>
              <p className="text-xs text-gray-500">Show this order bump on checkout</p>
            </div>
            <Switch
              checked={formData.enabled}
              onCheckedChange={checked => updateField('enabled', checked)}
            />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input
              value={formData.title}
              onChange={e => updateField('title', e.target.value)}
              placeholder="Add the Template Bundle"
              className="h-8 text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Textarea
              value={formData.description}
              onChange={e => updateField('description', e.target.value)}
              placeholder="Get instant access to all premium templates..."
              className="text-sm"
              rows={3}
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Price</Label>
              <Input
                type="number"
                value={formData.priceAmount || ''}
                onChange={e => updateField('priceAmount', parseFloat(e.target.value) || 0)}
                placeholder="199"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(v: Currency) => updateField('currency', v)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DKK">DKK</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Savings %</Label>
              <Input
                type="number"
                value={formData.savingsPercent || ''}
                onChange={e => updateField('savingsPercent', parseInt(e.target.value) || 0)}
                placeholder="30"
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Stripe IDs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Stripe Product ID</Label>
              <Input
                value={formData.productId}
                onChange={e => updateField('productId', e.target.value)}
                placeholder="prod_xxx"
                className="h-8 text-sm font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Stripe Price ID</Label>
              <Input
                value={formData.priceId}
                onChange={e => updateField('priceId', e.target.value)}
                placeholder="price_xxx"
                className="h-8 text-sm font-mono"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isNew ? 'Add Order Bump' : 'Save Changes'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
