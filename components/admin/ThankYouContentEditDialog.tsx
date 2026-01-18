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
import { Plus, Trash2 } from 'lucide-react'
import type { ThankYouContent } from '@/types'

interface ThankYouContentEditDialogProps {
  content: ThankYouContent | null
  open: boolean
  onClose: () => void
  onSave: (content: ThankYouContent) => void
}

interface StepItem {
  title: string
  description: string
}

interface FormData {
  headline: string
  subheadline: string
  steps: StepItem[]
  ctaText: string
  ctaUrl: string
}

function contentToFormData(content: ThankYouContent): FormData {
  return {
    headline: content.headline,
    subheadline: content.subheadline ?? '',
    steps: content.steps.length > 0 ? content.steps : [{ title: '', description: '' }],
    ctaText: content.ctaButton?.text ?? '',
    ctaUrl: content.ctaButton?.url ?? '',
  }
}

function formDataToContent(data: FormData): ThankYouContent {
  const steps = data.steps.filter(s => s.title.trim() || s.description.trim())

  return {
    headline: data.headline,
    subheadline: data.subheadline || undefined,
    steps: steps.length > 0 ? steps : [{ title: 'Check your email', description: 'Your access details are on the way.' }],
    ctaButton: data.ctaText && data.ctaUrl ? { text: data.ctaText, url: data.ctaUrl } : undefined,
  }
}

export function ThankYouContentEditDialog({
  content,
  open,
  onClose,
  onSave,
}: ThankYouContentEditDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    headline: '',
    subheadline: '',
    steps: [{ title: '', description: '' }],
    ctaText: '',
    ctaUrl: '',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && content) {
      setFormData(contentToFormData(content))
      setError(null)
    }
  }, [open, content])

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]): void {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  function updateStep(index: number, field: keyof StepItem, value: string): void {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => (i === index ? { ...step, [field]: value } : step)),
    }))
  }

  function addStep(): void {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { title: '', description: '' }],
    }))
  }

  function removeStep(index: number): void {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }))
  }

  function handleSave(): void {
    if (!formData.headline.trim()) {
      setError('Headline is required')
      return
    }
    if (!content) return

    const result = formDataToContent(formData)
    onSave(result)
    onClose()
  }

  if (!content) return null

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Thank You Page</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Headline */}
          <div className="space-y-1">
            <Label className="text-xs">Headline</Label>
            <Input
              value={formData.headline}
              onChange={e => updateField('headline', e.target.value)}
              placeholder="Thank you for your purchase!"
              className="h-9 text-sm"
            />
          </div>

          {/* Subheadline */}
          <div className="space-y-1">
            <Label className="text-xs">Subheadline (optional)</Label>
            <Input
              value={formData.subheadline}
              onChange={e => updateField('subheadline', e.target.value)}
              placeholder="You're on your way to mastering investing"
              className="h-9 text-sm"
            />
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Next Steps</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addStep} className="h-7 text-xs">
                <Plus className="mr-1 h-3 w-3" />
                Add Step
              </Button>
            </div>
            {formData.steps.map((step, index) => (
              <div key={index} className="rounded-md border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Step {index + 1}</span>
                  {formData.steps.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(index)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Input
                  value={step.title}
                  onChange={e => updateStep(index, 'title', e.target.value)}
                  placeholder="Check your email"
                  className="h-8 text-sm"
                />
                <Textarea
                  value={step.description}
                  onChange={e => updateStep(index, 'description', e.target.value)}
                  placeholder="Your access details are on the way."
                  className="text-sm"
                  rows={2}
                />
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="space-y-2">
            <Label className="text-xs">CTA Button (optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={formData.ctaText}
                onChange={e => updateField('ctaText', e.target.value)}
                placeholder="Button text"
                className="h-9 text-sm"
              />
              <Input
                value={formData.ctaUrl}
                onChange={e => updateField('ctaUrl', e.target.value)}
                placeholder="https://..."
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
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
