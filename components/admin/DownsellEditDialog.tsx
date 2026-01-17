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
import type { Downsell, Currency } from '@/types'
import { Copy } from 'lucide-react'

interface DownsellWithProduct extends Downsell {
  productName: string
}

interface DownsellEditDialogProps {
  downsell: Downsell | null
  open: boolean
  onClose: () => void
  onSave: (downsell: Downsell) => void
  isNew?: boolean
  defaultCurrency?: Currency
  existingDownsells?: DownsellWithProduct[]
}

interface DownsellFormData {
  enabled: boolean
  title: string
  subtitle: string
  description: string
  benefits: string
  priceAmount: number
  originalPrice: number
  currency: Currency
}

function createEmptyFormData(currency: Currency): DownsellFormData {
  return {
    enabled: true,
    title: '',
    subtitle: '',
    description: '',
    benefits: '',
    priceAmount: 0,
    originalPrice: 0,
    currency,
  }
}

function downsellToFormData(downsell: Downsell, currency?: Currency): DownsellFormData {
  return {
    enabled: downsell.enabled,
    title: downsell.title,
    subtitle: downsell.subtitle ?? '',
    description: downsell.description,
    benefits: downsell.benefits.join('\n'),
    priceAmount: downsell.stripe.priceAmount / 100,
    originalPrice: (downsell.originalPrice ?? 0) / 100,
    currency: currency ?? downsell.stripe.currency,
  }
}

function formDataToDownsell(data: DownsellFormData): Downsell {
  const benefits = data.benefits
    .split('\n')
    .map(b => b.trim())
    .filter(b => b.length > 0)

  return {
    enabled: data.enabled,
    slug: 'downsell',
    title: data.title,
    subtitle: data.subtitle || undefined,
    description: data.description,
    benefits,
    originalPrice: data.originalPrice > 0 ? Math.round(data.originalPrice * 100) : undefined,
    stripe: {
      productId: '',
      priceId: '',
      priceAmount: Math.round(data.priceAmount * 100),
      currency: data.currency,
    },
  }
}

export function DownsellEditDialog({
  downsell,
  open,
  onClose,
  onSave,
  isNew = false,
  defaultCurrency = 'DKK',
  existingDownsells = [],
}: DownsellEditDialogProps) {
  const [formData, setFormData] = useState<DownsellFormData>(
    createEmptyFormData(defaultCurrency)
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (downsell) {
        setFormData(downsellToFormData(downsell))
      } else {
        setFormData(createEmptyFormData(defaultCurrency))
      }
      setError(null)
    }
  }, [open, downsell, defaultCurrency])

  function updateField<K extends keyof DownsellFormData>(
    field: K,
    value: DownsellFormData[K]
  ): void {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function handleCopyFrom(productName: string): void {
    const source = existingDownsells.find(ds => ds.productName === productName)
    if (source) {
      setFormData(downsellToFormData(source, defaultCurrency))
    }
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

    const result = formDataToDownsell(formData)
    onSave(result)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add Downsell' : 'Edit Downsell'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Copy from existing */}
          {isNew && existingDownsells.length > 0 && (
            <div className="space-y-1">
              <Label className="flex items-center gap-1 text-xs">
                <Copy className="h-3 w-3" />
                Copy from existing
              </Label>
              <Select onValueChange={handleCopyFrom}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select a downsell to copy..." />
                </SelectTrigger>
                <SelectContent>
                  {existingDownsells.map(ds => (
                    <SelectItem key={ds.productName} value={ds.productName}>
                      {ds.title} ({ds.productName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div>
              <Label className="text-sm font-medium">Enabled</Label>
              <p className="text-xs text-gray-500">Show downsell when upsell is declined</p>
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
              placeholder="Wait! Special Offer Just For You"
              className="h-9 text-sm"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-1">
            <Label className="text-xs">Subtitle (optional)</Label>
            <Input
              value={formData.subtitle}
              onChange={e => updateField('subtitle', e.target.value)}
              placeholder="Last chance at this price"
              className="h-9 text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Textarea
              value={formData.description}
              onChange={e => updateField('description', e.target.value)}
              placeholder="Get a simplified version at a reduced price..."
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
              placeholder="Core templates included&#10;Basic support&#10;Lifetime access"
              className="text-sm"
              rows={3}
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Price ({formData.currency})</Label>
              <Input
                type="number"
                value={formData.priceAmount || ''}
                onChange={e => updateField('priceAmount', parseFloat(e.target.value) || 0)}
                placeholder="499"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Original Price (optional)</Label>
              <Input
                type="number"
                value={formData.originalPrice || ''}
                onChange={e => updateField('originalPrice', parseFloat(e.target.value) || 0)}
                placeholder="999"
                className="h-9 text-sm"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isNew ? 'Add Downsell' : 'Save Changes'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
