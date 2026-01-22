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
import type { CheckoutContent } from '@/types'

interface CheckoutContentEditDialogProps {
  content: CheckoutContent | null
  open: boolean
  onClose: () => void
  onSave: (content: CheckoutContent) => void
}

interface FormData {
  title: string
  subtitle: string
  image: string
  benefits: string
  guarantee: string
  guaranteeDays: number
}

function contentToFormData(content: CheckoutContent): FormData {
  return {
    title: content.title,
    subtitle: content.subtitle ?? '',
    image: content.image,
    benefits: content.benefits.join('\n'),
    guarantee: content.guarantee,
    guaranteeDays: content.guaranteeDays ?? 30,
  }
}

function formDataToContent(data: FormData, original: CheckoutContent): CheckoutContent {
  const benefits = data.benefits
    .split('\n')
    .map((b) => b.trim())
    .filter((b) => b.length > 0)

  return {
    ...original, // Preserve testimonials, FAQ, etc.
    title: data.title,
    subtitle: data.subtitle || undefined,
    image: data.image,
    benefits,
    guarantee: data.guarantee,
    guaranteeDays: data.guaranteeDays > 0 ? data.guaranteeDays : undefined,
  }
}

export function CheckoutContentEditDialog({
  content,
  open,
  onClose,
  onSave,
}: CheckoutContentEditDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    subtitle: '',
    image: '',
    benefits: '',
    guarantee: '',
    guaranteeDays: 30,
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && content) {
      setFormData(contentToFormData(content))
      setError(null)
    }
  }, [open, content])

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]): void {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleSave(): void {
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    if (!formData.guarantee.trim()) {
      setError('Guarantee text is required')
      return
    }
    if (!content) return

    const result = formDataToContent(formData, content)
    onSave(result)
    onClose()
  }

  if (!content) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Checkout Page</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-1">
            <Label className="text-xs">Headline</Label>
            <Input
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Master Danish Investing"
              className="h-9 text-sm"
            />
          </div>

          {/* Subtitle */}
          <div className="space-y-1">
            <Label className="text-xs">Subtitle (optional)</Label>
            <Input
              value={formData.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="Learn to invest in Danish stocks"
              className="h-9 text-sm"
            />
          </div>

          {/* Image URL */}
          <div className="space-y-1">
            <Label className="text-xs">Product Image URL</Label>
            <Input
              value={formData.image}
              onChange={(e) => updateField('image', e.target.value)}
              placeholder="https://..."
              className="h-9 text-sm"
            />
          </div>

          {/* Benefits */}
          <div className="space-y-1">
            <Label className="text-xs">Benefits (one per line)</Label>
            <Textarea
              value={formData.benefits}
              onChange={(e) => updateField('benefits', e.target.value)}
              placeholder="Step-by-step video lessons&#10;Downloadable templates&#10;Lifetime access"
              className="text-sm"
              rows={4}
            />
          </div>

          {/* Guarantee */}
          <div className="space-y-1">
            <Label className="text-xs">Guarantee Text</Label>
            <Textarea
              value={formData.guarantee}
              onChange={(e) => updateField('guarantee', e.target.value)}
              placeholder="30-day money back guarantee. If you're not satisfied..."
              className="text-sm"
              rows={2}
            />
          </div>

          {/* Guarantee Days */}
          <div className="space-y-1">
            <Label className="text-xs">Guarantee Days</Label>
            <Input
              type="number"
              value={formData.guaranteeDays || ''}
              onChange={(e) => updateField('guaranteeDays', parseInt(e.target.value) || 0)}
              placeholder="30"
              className="h-9 w-24 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
