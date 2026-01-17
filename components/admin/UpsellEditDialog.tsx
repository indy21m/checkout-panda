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
import type { Upsell, Currency } from '@/types'

interface UpsellEditDialogProps {
  upsell: Upsell | null
  open: boolean
  onClose: () => void
  onSave: (upsell: Upsell) => void
  isNew?: boolean
  defaultCurrency?: Currency
  upsellIndex?: number
}

interface UpsellFormData {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  benefits: string
  priceAmount: number
  originalPrice: number
  currency: Currency
  urgencyText: string
}

function createEmptyFormData(currency: Currency, index: number): UpsellFormData {
  return {
    id: `upsell-${index}`,
    slug: `upsell-${index}`,
    title: '',
    subtitle: '',
    description: '',
    benefits: '',
    priceAmount: 0,
    originalPrice: 0,
    currency,
    urgencyText: '',
  }
}

function upsellToFormData(upsell: Upsell): UpsellFormData {
  return {
    id: upsell.id,
    slug: upsell.slug,
    title: upsell.title,
    subtitle: upsell.subtitle ?? '',
    description: upsell.description,
    benefits: upsell.benefits.join('\n'),
    priceAmount: upsell.stripe.priceAmount / 100,
    originalPrice: (upsell.originalPrice ?? 0) / 100,
    currency: upsell.stripe.currency,
    urgencyText: upsell.urgencyText ?? '',
  }
}

function formDataToUpsell(data: UpsellFormData): Upsell {
  const benefits = data.benefits
    .split('\n')
    .map(b => b.trim())
    .filter(b => b.length > 0)

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle || undefined,
    description: data.description,
    benefits,
    originalPrice: data.originalPrice > 0 ? Math.round(data.originalPrice * 100) : undefined,
    urgencyText: data.urgencyText || undefined,
    stripe: {
      productId: '', // Will be populated by Stripe sync
      priceId: '', // Will be populated by Stripe sync
      priceAmount: Math.round(data.priceAmount * 100),
      currency: data.currency,
    },
  }
}

export function UpsellEditDialog({
  upsell,
  open,
  onClose,
  onSave,
  isNew = false,
  defaultCurrency = 'DKK',
  upsellIndex = 1,
}: UpsellEditDialogProps) {
  const [formData, setFormData] = useState<UpsellFormData>(
    createEmptyFormData(defaultCurrency, upsellIndex)
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (upsell) {
        setFormData(upsellToFormData(upsell))
      } else {
        setFormData(createEmptyFormData(defaultCurrency, upsellIndex))
      }
      setError(null)
    }
  }, [open, upsell, defaultCurrency, upsellIndex])

  function updateField<K extends keyof UpsellFormData>(
    field: K,
    value: UpsellFormData[K]
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

    const result = formDataToUpsell(formData)
    onSave(result)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add Upsell' : 'Edit Upsell'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input
              value={formData.title}
              onChange={e => updateField('title', e.target.value)}
              placeholder="Portfolio Coaching Session"
              className="h-9 text-sm"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-1">
            <Label className="text-xs">Subtitle (optional)</Label>
            <Input
              value={formData.subtitle}
              onChange={e => updateField('subtitle', e.target.value)}
              placeholder="One-time exclusive offer"
              className="h-9 text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Textarea
              value={formData.description}
              onChange={e => updateField('description', e.target.value)}
              placeholder="Get personalized feedback on your portfolio..."
              className="text-sm"
              rows={2}
            />
          </div>

          {/* Benefits */}
          <div className="space-y-1">
            <Label className="text-xs">Benefits (one per line)</Label>
            <Textarea
              value={formData.benefits}
              onChange={e => updateField('benefits', e.target.value)}
              placeholder="60-minute live session&#10;Personalized feedback&#10;Action plan"
              className="text-sm"
              rows={3}
            />
          </div>

          {/* Pricing - simplified to just price and original price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Price ({formData.currency})</Label>
              <Input
                type="number"
                value={formData.priceAmount || ''}
                onChange={e => updateField('priceAmount', parseFloat(e.target.value) || 0)}
                placeholder="999"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Original Price (optional)</Label>
              <Input
                type="number"
                value={formData.originalPrice || ''}
                onChange={e => updateField('originalPrice', parseFloat(e.target.value) || 0)}
                placeholder="1499"
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Urgency Text */}
          <div className="space-y-1">
            <Label className="text-xs">Urgency Text (optional)</Label>
            <Input
              value={formData.urgencyText}
              onChange={e => updateField('urgencyText', e.target.value)}
              placeholder="This offer disappears when you leave this page"
              className="h-9 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isNew ? 'Add Upsell' : 'Save Changes'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
