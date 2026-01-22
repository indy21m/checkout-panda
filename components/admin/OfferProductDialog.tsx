'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw, Plus, Trash2, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { ProductRecord, ProductConfig, ProductType } from '@/lib/db/schema'
import type { Currency } from '@/types'

interface OfferProductDialogProps {
  product: ProductRecord | null
  open: boolean
  onClose: () => void
  onSave: (product: {
    id: string
    slug: string
    name: string
    type: ProductType
    config: ProductConfig
  }) => Promise<void>
  isNew: boolean
  productType: 'upsell' | 'downsell' | 'bump'
  defaultCurrency?: Currency
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function generateSlug(name: string, type: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${type}-${base || generateId()}`
}

type SaveState = 'idle' | 'saving' | 'syncing' | 'success' | 'error'

export function OfferProductDialog({
  product,
  open,
  onClose,
  onSave,
  isNew,
  productType,
  defaultCurrency = 'DKK',
}: OfferProductDialogProps) {
  const [saveState, setSaveState] = useState<SaveState>('idle')

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [benefits, setBenefits] = useState<string[]>([''])
  const [priceAmount, setPriceAmount] = useState(0)
  const [originalPrice, setOriginalPrice] = useState<number | undefined>()
  const [currency, setCurrency] = useState<Currency>(defaultCurrency)
  const [image, setImage] = useState('')
  const [urgencyText, setUrgencyText] = useState('')
  const [savingsPercent, setSavingsPercent] = useState<number | undefined>()
  const [enabled, setEnabled] = useState(true)

  // Initialize form from product
  useEffect(() => {
    if (open) {
      setSaveState('idle')
      if (product) {
        setName(product.name)
        setSlug(product.slug)
        setTitle(product.config.title ?? product.name)
        setSubtitle(product.config.subtitle ?? '')
        setDescription(product.config.description ?? '')
        setBenefits(product.config.benefits ?? [''])
        setPriceAmount(product.config.stripe.priceAmount / 100) // Convert from cents
        setOriginalPrice(
          product.config.originalPrice ? product.config.originalPrice / 100 : undefined
        )
        setCurrency(product.config.stripe.currency)
        setImage(product.config.image ?? '')
        setUrgencyText(product.config.urgencyText ?? '')
        setSavingsPercent(product.config.savingsPercent)
        setEnabled(product.config.enabled !== false)
      } else {
        // Reset to defaults for new product
        setName('')
        setSlug('')
        setTitle('')
        setSubtitle('')
        setDescription('')
        setBenefits([''])
        setPriceAmount(0)
        setOriginalPrice(undefined)
        setCurrency(defaultCurrency)
        setImage('')
        setUrgencyText('')
        setSavingsPercent(undefined)
        setEnabled(true)
      }
    }
  }, [open, product, defaultCurrency])

  // Auto-generate slug from name for new products
  useEffect(() => {
    if (isNew && name) {
      setSlug(generateSlug(name, productType))
    }
  }, [isNew, name, productType])

  function addBenefit(): void {
    setBenefits([...benefits, ''])
  }

  function removeBenefit(index: number): void {
    setBenefits(benefits.filter((_, i) => i !== index))
  }

  function updateBenefit(index: number, value: string): void {
    const newBenefits = [...benefits]
    newBenefits[index] = value
    setBenefits(newBenefits)
  }

  async function handleSave(): Promise<void> {
    if (!name || !title || priceAmount <= 0) return

    setSaveState('saving')
    try {
      const filteredBenefits = benefits.filter((b) => b.trim() !== '')
      const productId = product?.id ?? generateId()

      const config: ProductConfig = {
        stripe: {
          productId: product?.config.stripe.productId ?? null,
          priceId: product?.config.stripe.priceId ?? null,
          priceAmount: Math.round(priceAmount * 100), // Convert to cents
          currency,
        },
        title,
        subtitle: subtitle || undefined,
        description,
        benefits: filteredBenefits,
        originalPrice: originalPrice ? Math.round(originalPrice * 100) : undefined,
        image: image || undefined,
        urgencyText: productType === 'upsell' ? urgencyText || undefined : undefined,
        savingsPercent: productType === 'bump' ? savingsPercent : undefined,
        enabled,
      }

      await onSave({
        id: productId,
        slug: slug || generateSlug(name, productType),
        name,
        type: productType,
        config,
      })

      // If creating new product, sync to Stripe
      if (isNew) {
        setSaveState('syncing')
        try {
          await fetch(`/api/admin/products/${productId}/sync`, {
            method: 'POST',
          })
          toast.success('Product created and synced to Stripe')
        } catch {
          toast.warning('Product created but sync failed')
        }
      } else {
        toast.success('Product saved and synced to Stripe')
      }

      setSaveState('success')
      setTimeout(() => {
        onClose()
      }, 800)
    } catch (error) {
      console.error('Failed to save offer product:', error)
      setSaveState('error')
      toast.error('Failed to save product')
    }
  }

  const typeLabel =
    productType === 'bump'
      ? 'Order Bump'
      : productType.charAt(0).toUpperCase() + productType.slice(1)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isNew ? `Create New ${typeLabel}` : `Edit ${typeLabel}`}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Basic Info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`e.g., Portfolio Coaching ${typeLabel}`}
              />
              <p className="text-xs text-gray-500">Internal name for admin</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated"
              />
              <p className="text-xs text-gray-500">URL identifier</p>
            </div>
          </div>

          {/* Display Title/Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="title">Display Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                productType === 'bump'
                  ? 'Yes! Add the Deep Dive Extended for just'
                  : 'Title shown to customers'
              }
            />
            {productType === 'bump' && (
              <p className="text-xs text-gray-500">
                Full text shown before the price (e.g., &quot;Yes! Add [product] for just&quot;)
              </p>
            )}
          </div>

          {productType !== 'bump' && (
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Optional subtitle"
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the customer gets..."
              rows={3}
            />
          </div>

          {/* Benefits (for upsell/downsell only) */}
          {productType !== 'bump' && (
            <div className="space-y-2">
              <Label>Benefits</Label>
              <div className="space-y-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder={`Benefit ${index + 1}`}
                    />
                    {benefits.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBenefit(index)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={addBenefit}>
                <Plus className="mr-1 h-4 w-4" />
                Add Benefit
              </Button>
            </div>
          )}

          {/* Pricing */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={priceAmount || ''}
                onChange={(e) => setPriceAmount(parseFloat(e.target.value) || 0)}
                min={0}
                step={1}
              />
            </div>

            {productType !== 'bump' && (
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={originalPrice || ''}
                  onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || undefined)}
                  min={0}
                  step={1}
                  placeholder="For strikethrough"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DKK">DKK</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bump-specific: Savings Percent */}
          {productType === 'bump' && (
            <div className="space-y-2">
              <Label htmlFor="savingsPercent">Savings Percentage</Label>
              <Input
                id="savingsPercent"
                type="number"
                value={savingsPercent || ''}
                onChange={(e) => setSavingsPercent(parseInt(e.target.value) || undefined)}
                min={0}
                max={100}
                placeholder="e.g., 50"
              />
              <p className="text-xs text-gray-500">Shown as &quot;Save X%&quot; badge</p>
            </div>
          )}

          {/* Image */}
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* Upsell-specific: Urgency Text */}
          {productType === 'upsell' && (
            <div className="space-y-2">
              <Label htmlFor="urgencyText">Urgency Text</Label>
              <Input
                id="urgencyText"
                value={urgencyText}
                onChange={(e) => setUrgencyText(e.target.value)}
                placeholder="e.g., This offer disappears when you leave"
              />
            </div>
          )}

          {/* Enabled Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Enabled</Label>
              <p className="text-xs text-gray-500">
                When disabled, this offer won&apos;t be shown to customers
              </p>
            </div>
            <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saveState === 'saving' || saveState === 'syncing'}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !name ||
              !title ||
              priceAmount <= 0 ||
              saveState === 'saving' ||
              saveState === 'syncing'
            }
          >
            {saveState === 'saving' ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {isNew ? 'Creating...' : 'Saving...'}
              </>
            ) : saveState === 'syncing' ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing to Stripe...
              </>
            ) : saveState === 'success' ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                {isNew ? 'Created!' : 'Saved!'}
              </>
            ) : isNew ? (
              'Create & Sync'
            ) : (
              'Save & Sync'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
