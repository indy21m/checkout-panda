'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Save, Loader2, Code, Star, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { TestimonialSelector } from '@/components/admin/TestimonialSelector'
import { TestimonialOrderEditor } from '@/components/admin/TestimonialOrderEditor'
import type {
  TestimonialWidgetConfig,
  TestimonialRecord,
} from '@/lib/db/schema'

interface FormOption {
  id: string
  name: string
  slug: string
}

interface TestimonialWithForm extends TestimonialRecord {
  formName?: string | null
}

type SelectionMode = 'filter' | 'handpick'

export default function EditWidgetPage() {
  const router = useRouter()
  const params = useParams()
  const widgetId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Widget data
  const [name, setName] = useState('')
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('filter')
  const [filterByForms, setFilterByForms] = useState<string[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [testimonialOrder, setTestimonialOrder] = useState<'newest' | 'oldest' | 'rating' | 'random'>('newest')
  const [maxItems, setMaxItems] = useState<number | undefined>(undefined)
  const [onlyFeatured, setOnlyFeatured] = useState(false)
  const [layout, setLayout] = useState<'grid' | 'carousel' | 'list' | 'masonry'>('grid')
  const [showRating, setShowRating] = useState(true)
  const [showCompany, setShowCompany] = useState(true)
  const [showPhoto, setShowPhoto] = useState(true)

  // Reference data
  const [forms, setForms] = useState<FormOption[]>([])
  const [testimonials, setTestimonials] = useState<TestimonialWithForm[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        // Load widget data
        const widgetRes = await fetch(`/api/admin/testimonials/widgets?id=${widgetId}`)
        if (!widgetRes.ok) {
          if (widgetRes.status === 404) {
            toast.error('Widget not found')
            router.push('/admin/testimonials/widgets')
            return
          }
          throw new Error('Failed to load widget')
        }

        const { widget, forms: formsList } = await widgetRes.json()
        setForms(formsList)

        // Set widget data
        setName(widget.name)
        const config = widget.config as TestimonialWidgetConfig

        if (config.selectedIds && config.selectedIds.length > 0) {
          setSelectionMode('handpick')
          setSelectedIds(config.selectedIds)
        } else {
          setSelectionMode('filter')
          setFilterByForms(config.filterByForms || [])
        }

        setTestimonialOrder(config.testimonialOrder || 'newest')
        setMaxItems(config.maxItems)
        setOnlyFeatured(config.onlyFeatured || false)
        setLayout(config.layout || 'grid')
        setShowRating(config.showRating !== false)
        setShowCompany(config.showCompany !== false)
        setShowPhoto(config.showPhoto !== false)

        // Load testimonials (only approved ones)
        const testimonialsRes = await fetch('/api/admin/testimonials?status=approved')
        if (testimonialsRes.ok) {
          const { testimonials: testimonialsList } = await testimonialsRes.json()
          setTestimonials(testimonialsList)
        }
      } catch (error) {
        console.error('Failed to load widget:', error)
        toast.error('Failed to load widget')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [widgetId, router])

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Please enter a widget name')
      return
    }

    setSaving(true)
    try {
      const config: TestimonialWidgetConfig = {
        testimonialOrder,
        maxItems,
        onlyFeatured,
        layout,
        showRating,
        showCompany,
        showPhoto,
      }

      if (selectionMode === 'handpick') {
        config.selectedIds = selectedIds
        config.filterByForms = undefined
      } else {
        config.filterByForms = filterByForms.length > 0 ? filterByForms : undefined
        config.selectedIds = undefined
      }

      const response = await fetch('/api/admin/testimonials/widgets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: widgetId,
          name: name.trim(),
          config,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Failed to save widget')
      }

      toast.success('Widget saved')
      router.push('/admin/testimonials/widgets')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save widget')
    } finally {
      setSaving(false)
    }
  }

  function handleFormToggle(formId: string) {
    setFilterByForms((prev) =>
      prev.includes(formId) ? prev.filter((id) => id !== formId) : [...prev, formId]
    )
  }

  function getEmbedCode(): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `<script src="${baseUrl}/embed/testimonials.js" data-widget-id="${widgetId}"></script>`
  }

  async function handleCopyEmbed() {
    try {
      await navigator.clipboard.writeText(getEmbedCode())
      toast.success('Embed code copied')
    } catch {
      toast.error('Failed to copy')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/testimonials/widgets')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Widget</h2>
            <p className="text-sm text-gray-500">Configure how testimonials are displayed</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="source">Testimonial Source</TabsTrigger>
          <TabsTrigger value="order">Ordering</TabsTrigger>
          <TabsTrigger value="embed">Preview & Embed</TabsTrigger>
        </TabsList>

        {/* Basic Info */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Widget Details</CardTitle>
              <CardDescription>Basic information about this widget</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Widget Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Homepage Testimonials"
                />
                <p className="text-sm text-gray-500">
                  An internal name to help you identify this widget
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="layout">Layout</Label>
                <Select value={layout} onValueChange={(v) => setLayout(v as typeof layout)}>
                  <SelectTrigger id="layout">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="carousel">Carousel</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="masonry">Masonry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label>Display Options</Label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <Checkbox
                      checked={showRating}
                      onCheckedChange={(checked) => setShowRating(!!checked)}
                    />
                    <span className="text-sm">Show star rating</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <Checkbox
                      checked={showCompany}
                      onCheckedChange={(checked) => setShowCompany(!!checked)}
                    />
                    <span className="text-sm">Show company name</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <Checkbox
                      checked={showPhoto}
                      onCheckedChange={(checked) => setShowPhoto(!!checked)}
                    />
                    <span className="text-sm">Show customer photo</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonial Source */}
        <TabsContent value="source">
          <Card>
            <CardHeader>
              <CardTitle>Testimonial Source</CardTitle>
              <CardDescription>Choose which testimonials to display in this widget</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Selection Mode */}
              <div className="space-y-3">
                <Label>Selection Mode</Label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                      selectionMode === 'filter'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectionMode"
                      value="filter"
                      checked={selectionMode === 'filter'}
                      onChange={() => setSelectionMode('filter')}
                      className="sr-only"
                    />
                    <div>
                      <p className="font-medium">Filter by Forms</p>
                      <p className="text-sm text-gray-500">
                        Automatically include testimonials from selected forms
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                      selectionMode === 'handpick'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selectionMode"
                      value="handpick"
                      checked={selectionMode === 'handpick'}
                      onChange={() => setSelectionMode('handpick')}
                      className="sr-only"
                    />
                    <div>
                      <p className="font-medium">Hand-pick Specific</p>
                      <p className="text-sm text-gray-500">
                        Manually select individual testimonials
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Filter by Forms */}
              {selectionMode === 'filter' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Filter by Forms</Label>
                    <p className="text-sm text-gray-500">
                      Leave empty to include testimonials from all forms
                    </p>
                  </div>
                  {forms.length === 0 ? (
                    <p className="text-sm text-gray-500">No forms created yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {forms.map((form) => (
                        <label
                          key={form.id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-gray-50"
                        >
                          <Checkbox
                            checked={filterByForms.includes(form.id)}
                            onCheckedChange={() => handleFormToggle(form.id)}
                          />
                          <span className="font-medium">{form.name}</span>
                          <code className="text-xs text-gray-500">/{form.slug}</code>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 pt-4 border-t">
                    <label className="flex items-center gap-3">
                      <Checkbox
                        checked={onlyFeatured}
                        onCheckedChange={(checked) => setOnlyFeatured(!!checked)}
                      />
                      <div>
                        <span className="font-medium flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          Only featured testimonials
                        </span>
                        <p className="text-sm text-gray-500">
                          Only show testimonials marked as featured
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="maxItems">Maximum items</Label>
                    <Input
                      id="maxItems"
                      type="number"
                      min={1}
                      max={100}
                      value={maxItems ?? ''}
                      onChange={(e) =>
                        setMaxItems(e.target.value ? parseInt(e.target.value, 10) : undefined)
                      }
                      placeholder="No limit"
                      className="w-32"
                    />
                    <p className="text-sm text-gray-500">
                      Leave empty for no limit
                    </p>
                  </div>
                </div>
              )}

              {/* Hand-pick Specific */}
              {selectionMode === 'handpick' && (
                <TestimonialSelector
                  testimonials={testimonials}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ordering */}
        <TabsContent value="order">
          <Card>
            <CardHeader>
              <CardTitle>Testimonial Order</CardTitle>
              <CardDescription>
                {selectionMode === 'handpick'
                  ? 'Drag and drop to set the display order'
                  : 'Choose how testimonials are sorted'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectionMode === 'handpick' ? (
                <TestimonialOrderEditor
                  testimonials={testimonials}
                  orderedIds={selectedIds}
                  onOrderChange={setSelectedIds}
                />
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="order">Sort Order</Label>
                  <Select
                    value={testimonialOrder}
                    onValueChange={(v) => setTestimonialOrder(v as typeof testimonialOrder)}
                  >
                    <SelectTrigger id="order" className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest first</SelectItem>
                      <SelectItem value="oldest">Oldest first</SelectItem>
                      <SelectItem value="rating">Highest rated</SelectItem>
                      <SelectItem value="random">Random</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview & Embed */}
        <TabsContent value="embed">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Embed Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Embed Code
                </CardTitle>
                <CardDescription>
                  Add this code to your website where you want testimonials to appear
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-gray-900 p-4">
                  <code className="text-sm text-green-400 break-all">{getEmbedCode()}</code>
                </div>
                <Button onClick={handleCopyEmbed} variant="outline" className="w-full">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Embed Code
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  A preview of how testimonials will appear
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <p className="text-gray-500">
                    Widget preview will appear here
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    Save changes and embed on your site to see the live widget
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Layout:</strong> {layout}
                    </p>
                    <p>
                      <strong>Source:</strong>{' '}
                      {selectionMode === 'handpick'
                        ? `${selectedIds.length} hand-picked`
                        : filterByForms.length > 0
                          ? `${filterByForms.length} form(s)`
                          : 'All forms'}
                    </p>
                    {selectionMode === 'filter' && (
                      <p>
                        <strong>Order:</strong> {testimonialOrder}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
