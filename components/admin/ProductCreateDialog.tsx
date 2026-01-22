'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { ImageUpload } from './ImageUpload'
import { RefreshCw, Plus, Trash2, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { ProductConfig } from '@/lib/db/schema'
import type { Currency } from '@/types'

interface ProductCreateDialogProps {
  open: boolean
  onClose: () => void
}

type SaveState = 'idle' | 'saving' | 'syncing' | 'success' | 'error'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || generateId()
  )
}

export function ProductCreateDialog({ open, onClose }: ProductCreateDialogProps) {
  const router = useRouter()
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [currency, setCurrency] = useState<Currency>('DKK')
  const [priceAmount, setPriceAmount] = useState<number>(0)
  const [checkoutTitle, setCheckoutTitle] = useState('')
  const [checkoutSubtitle, setCheckoutSubtitle] = useState('')
  const [image, setImage] = useState('')
  const [benefits, setBenefits] = useState<string[]>([''])
  const [guarantee, setGuarantee] = useState('30-day money back guarantee')

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName('')
      setSlug('')
      setCurrency('DKK')
      setPriceAmount(0)
      setCheckoutTitle('')
      setCheckoutSubtitle('')
      setImage('')
      setBenefits([''])
      setGuarantee('30-day money back guarantee')
      setSaveState('idle')
      setError(null)
    }
  }, [open])

  // Auto-generate slug from name
  useEffect(() => {
    if (name) {
      setSlug(generateSlug(name))
    }
  }, [name])

  // Auto-fill checkout title from name
  useEffect(() => {
    if (name && !checkoutTitle) {
      setCheckoutTitle(name)
    }
  }, [name, checkoutTitle])

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
    if (!name || !slug || priceAmount <= 0 || !checkoutTitle) {
      setError('Please fill in all required fields')
      return
    }

    setSaveState('saving')
    setError(null)

    try {
      const productId = generateId()
      const tierId = `tier-${Date.now()}`
      const filteredBenefits = benefits.filter((b) => b.trim() !== '')

      const config: ProductConfig = {
        stripe: {
          productId: null,
          priceId: null,
          priceAmount: Math.round(priceAmount * 100), // Convert to cents
          currency,
          pricingTiers: [
            {
              id: tierId,
              label: 'Pay in Full',
              priceId: null,
              priceAmount: Math.round(priceAmount * 100),
              isDefault: true,
            },
          ],
        },
        checkout: {
          title: checkoutTitle,
          subtitle: checkoutSubtitle || undefined,
          image: image || '/placeholder.png',
          benefits: filteredBenefits.length > 0 ? filteredBenefits : ['Access to the full program'],
          guarantee: guarantee || '30-day money back guarantee',
        },
        thankYou: {
          headline: 'Thank you for your purchase!',
          subheadline: 'Your order has been confirmed.',
          steps: [
            {
              title: 'Check your email',
              description: "We've sent you a confirmation with access details.",
            },
            { title: 'Get started', description: 'Follow the instructions to begin.' },
          ],
        },
      }

      // Create product
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          slug,
          name,
          type: 'main',
          config,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Failed to create product')
      }

      // Sync to Stripe
      setSaveState('syncing')
      const syncResponse = await fetch(`/api/admin/products/${productId}/sync`, {
        method: 'POST',
      })

      if (syncResponse.ok) {
        setSaveState('success')
        toast.success('Product created and synced to Stripe')
      } else {
        const syncData = await syncResponse.json()
        setSaveState('success')
        toast.warning(`Product created but sync failed: ${syncData.error}`)
      }

      setTimeout(() => {
        onClose()
        router.refresh()
      }, 1000)
    } catch (err) {
      setSaveState('error')
      setError(err instanceof Error ? err.message : 'Failed to create product')
      toast.error('Failed to create product')
    }
  }

  const isValid = name && slug && priceAmount > 0 && checkoutTitle
  const isBusy = saveState === 'saving' || saveState === 'syncing'

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
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
                placeholder="e.g., Photography Masterclass"
                disabled={isBusy}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generated"
                disabled={isBusy}
              />
              <p className="text-xs text-gray-500">yoursite.com/{slug}/checkout</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number"
                value={priceAmount || ''}
                onChange={(e) => setPriceAmount(parseFloat(e.target.value) || 0)}
                min={0}
                step={1}
                placeholder="e.g., 799"
                disabled={isBusy}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={currency}
                onValueChange={(v) => setCurrency(v as Currency)}
                disabled={isBusy}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DKK">DKK (kr)</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkout Content */}
          <div className="space-y-4 rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900">Checkout Page Content</h3>

            <div className="space-y-2">
              <Label htmlFor="checkoutTitle">Title *</Label>
              <Input
                id="checkoutTitle"
                value={checkoutTitle}
                onChange={(e) => setCheckoutTitle(e.target.value)}
                placeholder="Title shown on checkout page"
                disabled={isBusy}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkoutSubtitle">Subtitle</Label>
              <Input
                id="checkoutSubtitle"
                value={checkoutSubtitle}
                onChange={(e) => setCheckoutSubtitle(e.target.value)}
                placeholder="Optional subtitle"
                disabled={isBusy}
              />
            </div>

            <div className="space-y-2">
              <Label>Product Image</Label>
              <ImageUpload value={image} onChange={setImage} size="sm" />
            </div>

            <div className="space-y-2">
              <Label>Benefits</Label>
              <div className="space-y-2">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => updateBenefit(index, e.target.value)}
                      placeholder={`Benefit ${index + 1}`}
                      disabled={isBusy}
                    />
                    {benefits.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBenefit(index)}
                        className="text-red-500"
                        disabled={isBusy}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBenefit}
                disabled={isBusy}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Benefit
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guarantee">Guarantee Text</Label>
              <Textarea
                id="guarantee"
                value={guarantee}
                onChange={(e) => setGuarantee(e.target.value)}
                placeholder="e.g., 30-day money back guarantee"
                rows={2}
                disabled={isBusy}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isBusy}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isValid || isBusy}>
            {saveState === 'saving' ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : saveState === 'syncing' ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing to Stripe...
              </>
            ) : saveState === 'success' ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Created!
              </>
            ) : (
              'Create Product'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
