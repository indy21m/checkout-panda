'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
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
import { RefreshCw, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { TestimonialFormRecord, TestimonialFormConfig } from '@/lib/db/schema'

interface Product {
  id: string
  name: string
}

interface TestimonialFormDialogProps {
  open: boolean
  onClose: () => void
  form?: TestimonialFormRecord | null
  products: Product[]
}

type SaveState = 'idle' | 'saving' | 'success' | 'error'

function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || `form-${Date.now()}`
  )
}

export function TestimonialFormDialog({
  open,
  onClose,
  form,
  products,
}: TestimonialFormDialogProps) {
  const router = useRouter()
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [productId, setProductId] = useState<string | null>(null)
  const [heading, setHeading] = useState('')
  const [description, setDescription] = useState('')
  const [thankYouMessage, setThankYouMessage] = useState('')
  const [requireEmail, setRequireEmail] = useState(true)

  const isEditing = !!form

  // Reset/populate form when dialog opens
  useEffect(() => {
    if (open) {
      if (form) {
        // Editing existing form
        setName(form.name)
        setSlug(form.slug)
        setProductId(form.productId)
        const config = form.config as TestimonialFormConfig | null
        setHeading(config?.heading ?? '')
        setDescription(config?.description ?? '')
        setThankYouMessage(config?.thankYouMessage ?? '')
        setRequireEmail(true) // Default to true since it's not in config
      } else {
        // Creating new form
        setName('')
        setSlug('')
        setProductId(null)
        setHeading('')
        setDescription('')
        setThankYouMessage('')
        setRequireEmail(true)
      }
      setSaveState('idle')
      setError(null)
    }
  }, [open, form])

  // Auto-generate slug from name (only for new forms)
  useEffect(() => {
    if (name && !isEditing) {
      setSlug(generateSlug(name))
    }
  }, [name, isEditing])

  async function handleSave(): Promise<void> {
    if (!name || !slug) {
      setError('Please fill in all required fields')
      return
    }

    setSaveState('saving')
    setError(null)

    try {
      const config: TestimonialFormConfig = {
        heading: heading || undefined,
        description: description || undefined,
        thankYouMessage: thankYouMessage || undefined,
      }

      const payload = {
        ...(isEditing ? { id: form!.id } : {}),
        name,
        slug,
        productId: productId || null,
        config,
      }

      const response = await fetch('/api/admin/testimonials/forms', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? `Failed to ${isEditing ? 'update' : 'create'} form`)
      }

      setSaveState('success')
      toast.success(`Form ${isEditing ? 'updated' : 'created'} successfully`)

      setTimeout(() => {
        onClose()
        router.refresh()
      }, 500)
    } catch (err) {
      setSaveState('error')
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} form`)
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} form`)
    }
  }

  const isValid = name && slug
  const isBusy = saveState === 'saving'

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Form' : 'Create New Form'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Investing Course Reviews"
              disabled={isBusy}
            />
            <p className="text-xs text-gray-500">Internal name to identify this form</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated"
              disabled={isBusy}
            />
            <p className="text-xs text-gray-500">
              Public URL: /testimonials/{slug || 'your-slug'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="product">Linked Product</Label>
            <Select
              value={productId ?? 'none'}
              onValueChange={(v) => setProductId(v === 'none' ? null : v)}
              disabled={isBusy}
            >
              <SelectTrigger id="product">
                <SelectValue placeholder="Select a product (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No linked product</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Optionally link testimonials to a specific product
            </p>
          </div>

          {/* Public Form Content */}
          <div className="space-y-4 rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900">Public Form Content</h3>

            <div className="space-y-2">
              <Label htmlFor="heading">Title</Label>
              <Input
                id="heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="e.g., Share Your Experience"
                disabled={isBusy}
              />
              <p className="text-xs text-gray-500">Shown at the top of the public form</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., We'd love to hear about your experience with our course..."
                rows={3}
                disabled={isBusy}
              />
              <p className="text-xs text-gray-500">Introductory text shown on the public form</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thankYouMessage">Success Message</Label>
              <Textarea
                id="thankYouMessage"
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
                placeholder="e.g., Thank you for your feedback! We really appreciate it."
                rows={2}
                disabled={isBusy}
              />
              <p className="text-xs text-gray-500">Shown after successful submission</p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requireEmail"
                checked={requireEmail}
                onCheckedChange={(checked) => setRequireEmail(checked === true)}
                disabled={isBusy}
              />
              <Label htmlFor="requireEmail" className="font-normal">
                Require email address
              </Label>
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
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : saveState === 'success' ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                {isEditing ? 'Updated!' : 'Created!'}
              </>
            ) : isEditing ? (
              'Update Form'
            ) : (
              'Create Form'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
