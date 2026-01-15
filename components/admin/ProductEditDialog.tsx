'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { ProductRecord, ProductConfig } from '@/lib/db/schema'
import { Trash2, Plus } from 'lucide-react'

interface ProductEditDialogProps {
  product: ProductRecord | null
  open: boolean
  onClose: () => void
}

interface PricingTierForm {
  id: string
  label: string
  priceAmount: number
  originalPrice?: number
  isDefault: boolean
  description?: string
  hasInstallments: boolean
  installmentCount?: number
  amountPerPayment?: number
}

export function ProductEditDialog({ product, open, onClose }: ProductEditDialogProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'DKK'>('DKK')
  const [pricingTiers, setPricingTiers] = useState<PricingTierForm[]>([])

  // Initialize form when product changes
  useState(() => {
    if (product) {
      setName(product.name)
      setCurrency(product.config.stripe.currency)
      setPricingTiers(
        (product.config.stripe.pricingTiers ?? []).map(tier => ({
          id: tier.id,
          label: tier.label,
          priceAmount: tier.priceAmount / 100, // Convert from cents for display
          originalPrice: tier.originalPrice ? tier.originalPrice / 100 : undefined,
          isDefault: tier.isDefault ?? false,
          description: tier.description,
          hasInstallments: !!tier.installments,
          installmentCount: tier.installments?.count,
          amountPerPayment: tier.installments ? tier.installments.amountPerPayment / 100 : undefined,
        }))
      )
    }
  })

  // Reset form when dialog opens with new product
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onClose()
      return
    }
    if (product) {
      setName(product.name)
      setCurrency(product.config.stripe.currency)
      setPricingTiers(
        (product.config.stripe.pricingTiers ?? []).map(tier => ({
          id: tier.id,
          label: tier.label,
          priceAmount: tier.priceAmount / 100,
          originalPrice: tier.originalPrice ? tier.originalPrice / 100 : undefined,
          isDefault: tier.isDefault ?? false,
          description: tier.description,
          hasInstallments: !!tier.installments,
          installmentCount: tier.installments?.count,
          amountPerPayment: tier.installments ? tier.installments.amountPerPayment / 100 : undefined,
        }))
      )
      setError(null)
    }
  }

  const addPricingTier = () => {
    setPricingTiers([
      ...pricingTiers,
      {
        id: `tier-${Date.now()}`,
        label: 'New Tier',
        priceAmount: 0,
        isDefault: pricingTiers.length === 0,
        hasInstallments: false,
      },
    ])
  }

  const removePricingTier = (index: number) => {
    const newTiers = pricingTiers.filter((_, i) => i !== index)
    // Ensure at least one tier is default
    if (newTiers.length > 0 && !newTiers.some(t => t.isDefault)) {
      newTiers[0]!.isDefault = true
    }
    setPricingTiers(newTiers)
  }

  const updatePricingTier = (index: number, updates: Partial<PricingTierForm>) => {
    setPricingTiers(tiers =>
      tiers.map((tier, i) => {
        if (i === index) {
          return { ...tier, ...updates }
        }
        // If setting this tier as default, unset others
        if (updates.isDefault && i !== index) {
          return { ...tier, isDefault: false }
        }
        return tier
      })
    )
  }

  const handleSave = async () => {
    if (!product) return

    setSaving(true)
    setError(null)

    try {
      // Convert pricing tiers back to API format
      const apiTiers = pricingTiers.map(tier => ({
        id: tier.id,
        label: tier.label,
        priceId: null, // Will be set by Stripe sync
        priceAmount: Math.round(tier.priceAmount * 100), // Convert to cents
        originalPrice: tier.originalPrice ? Math.round(tier.originalPrice * 100) : undefined,
        isDefault: tier.isDefault,
        description: tier.description,
        installments: tier.hasInstallments && tier.installmentCount && tier.amountPerPayment
          ? {
              count: tier.installmentCount,
              intervalLabel: 'month',
              amountPerPayment: Math.round(tier.amountPerPayment * 100),
            }
          : undefined,
      }))

      // Find default tier for main price
      const defaultTier = apiTiers.find(t => t.isDefault) ?? apiTiers[0]

      const updatedConfig: ProductConfig = {
        ...product.config,
        stripe: {
          ...product.config.stripe,
          currency,
          priceAmount: defaultTier?.priceAmount ?? product.config.stripe.priceAmount,
          pricingTiers: apiTiers,
        },
      }

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          config: updatedConfig,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Failed to save product')
      }

      router.refresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  if (!product) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter product name"
            />
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={(v: 'USD' | 'EUR' | 'DKK') => setCurrency(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="DKK">DKK (kr)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pricing Tiers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Pricing Tiers</Label>
              <Button variant="outline" size="sm" onClick={addPricingTier}>
                <Plus className="mr-1 h-3 w-3" />
                Add Tier
              </Button>
            </div>

            {pricingTiers.map((tier, index) => (
              <div
                key={tier.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Tier Label */}
                    <div className="space-y-1">
                      <Label className="text-xs">Label</Label>
                      <Input
                        value={tier.label}
                        onChange={e => updatePricingTier(index, { label: e.target.value })}
                        placeholder="e.g., Pay in Full"
                        className="h-8 text-sm"
                      />
                    </div>

                    {/* Price Amount */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Price ({currency})</Label>
                        <Input
                          type="number"
                          value={tier.priceAmount || ''}
                          onChange={e => updatePricingTier(index, { priceAmount: parseFloat(e.target.value) || 0 })}
                          placeholder="0"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Original Price</Label>
                        <Input
                          type="number"
                          value={tier.originalPrice || ''}
                          onChange={e => updatePricingTier(index, { originalPrice: parseFloat(e.target.value) || undefined })}
                          placeholder="Optional"
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    {/* Default + Installments Toggle */}
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-sm">
                        <Switch
                          checked={tier.isDefault}
                          onCheckedChange={checked => updatePricingTier(index, { isDefault: checked })}
                        />
                        Default
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <Switch
                          checked={tier.hasInstallments}
                          onCheckedChange={checked => updatePricingTier(index, { hasInstallments: checked })}
                        />
                        Installments
                      </label>
                    </div>

                    {/* Installment Details */}
                    {tier.hasInstallments && (
                      <div className="grid grid-cols-2 gap-3 rounded border border-gray-200 bg-white p-3">
                        <div className="space-y-1">
                          <Label className="text-xs"># of Payments</Label>
                          <Input
                            type="number"
                            value={tier.installmentCount || ''}
                            onChange={e => updatePricingTier(index, { installmentCount: parseInt(e.target.value) || undefined })}
                            placeholder="e.g., 3"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Per Payment ({currency})</Label>
                          <Input
                            type="number"
                            value={tier.amountPerPayment || ''}
                            onChange={e => updatePricingTier(index, { amountPerPayment: parseFloat(e.target.value) || undefined })}
                            placeholder="e.g., 266.33"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div className="space-y-1">
                      <Label className="text-xs">Description (optional)</Label>
                      <Input
                        value={tier.description || ''}
                        onChange={e => updatePricingTier(index, { description: e.target.value || undefined })}
                        placeholder="e.g., Save 100 kr"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  {/* Delete Button */}
                  {pricingTiers.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                      onClick={() => removePricingTier(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {pricingTiers.length === 0 && (
              <p className="text-sm text-gray-500">No pricing tiers. Add at least one.</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || pricingTiers.length === 0}>
            {saving ? 'Saving...' : 'Save & Sync'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
