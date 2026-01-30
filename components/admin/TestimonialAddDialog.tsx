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
import { RefreshCw, Check, Star } from 'lucide-react'
import { toast } from 'sonner'
import type { TestimonialStatus } from '@/lib/db/schema'

interface FormOption {
  id: string
  name: string
}

interface TestimonialAddDialogProps {
  open: boolean
  onClose: () => void
  forms: FormOption[]
}

type SaveState = 'idle' | 'saving' | 'success' | 'error'

function StarRatingInput({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange: (rating: number) => void
  disabled?: boolean
}) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(null)}
        >
          <Star
            className={`h-6 w-6 ${
              star <= (hoverValue ?? value)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export function TestimonialAddDialog({ open, onClose, forms }: TestimonialAddDialogProps) {
  const router = useRouter()
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formId, setFormId] = useState<string>('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerCompany, setCustomerCompany] = useState('')
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<TestimonialStatus>('approved')
  const [featured, setFeatured] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormId(forms[0]?.id ?? '')
      setCustomerName('')
      setCustomerEmail('')
      setCustomerCompany('')
      setRating(5)
      setContent('')
      setStatus('approved')
      setFeatured(false)
      setSaveState('idle')
      setError(null)
    }
  }, [open, forms])

  async function handleSave(): Promise<void> {
    if (!formId || !customerName || !content) {
      setError('Please fill in all required fields')
      return
    }

    setSaveState('saving')
    setError(null)

    try {
      const payload = {
        formId,
        customerName,
        customerEmail: customerEmail || null,
        customerCompany: customerCompany || null,
        rating,
        content,
        status,
        featured,
      }

      const response = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Failed to create testimonial')
      }

      setSaveState('success')
      toast.success('Testimonial added successfully')

      setTimeout(() => {
        onClose()
        router.refresh()
      }, 500)
    } catch (err) {
      setSaveState('error')
      setError(err instanceof Error ? err.message : 'Failed to create testimonial')
      toast.error('Failed to create testimonial')
    }
  }

  const isValid = formId && customerName && content
  const isBusy = saveState === 'saving'

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Testimonial</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Form Selection */}
          <div className="space-y-2">
            <Label htmlFor="form">Product/Form *</Label>
            <Select value={formId} onValueChange={setFormId} disabled={isBusy}>
              <SelectTrigger id="form">
                <SelectValue placeholder="Select a form" />
              </SelectTrigger>
              <SelectContent>
                {forms.map((form) => (
                  <SelectItem key={form.id} value={form.id}>
                    {form.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Which product/form is this testimonial for?</p>
          </div>

          {/* Customer Info */}
          <div className="space-y-4 rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900">Customer Information</h3>

            <div className="space-y-2">
              <Label htmlFor="customerName">Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g., John Smith"
                disabled={isBusy}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g., john@example.com"
                disabled={isBusy}
              />
              <p className="text-xs text-gray-500">Optional - for internal tracking</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerCompany">Company</Label>
              <Input
                id="customerCompany"
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                placeholder="e.g., Acme Corp"
                disabled={isBusy}
              />
            </div>
          </div>

          {/* Testimonial Content */}
          <div className="space-y-4 rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900">Testimonial</h3>

            <div className="space-y-2">
              <Label>Rating *</Label>
              <StarRatingInput value={rating} onChange={setRating} disabled={isBusy} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the testimonial content..."
                rows={4}
                disabled={isBusy}
              />
            </div>
          </div>

          {/* Status & Options */}
          <div className="space-y-4 rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900">Status & Options</h3>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as TestimonialStatus)}
                disabled={isBusy}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Manual testimonials default to approved
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={featured}
                onCheckedChange={(checked) => setFeatured(checked === true)}
                disabled={isBusy}
              />
              <Label htmlFor="featured" className="font-normal">
                Featured testimonial
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
                Adding...
              </>
            ) : saveState === 'success' ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Added!
              </>
            ) : (
              'Add Testimonial'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
