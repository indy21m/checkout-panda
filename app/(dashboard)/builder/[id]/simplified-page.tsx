'use client'

import React, { useEffect, useCallback, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { getCurrencySymbol, type Currency } from '@/lib/currency'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay as DndDragOverlay,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { 
  ArrowLeft, Save, Rocket, Undo, Redo, Plus, 
  Smartphone, Monitor, Loader2, Sparkles, X, Palette,
  Type as TypeIcon, Layers, TrendingUp, BarChart3, Users,
  DollarSign, ShoppingCart, Star,
  Shield, CheckCircle,
  Package, Copy, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SaveIndicator } from '@/components/ui/save-indicator'
import { 
  WYSIWYGBlock, 
  blockTemplates,
  type Block, 
  type BlockType,
  type HeaderBlockData,
  type ProductBlockData,
  type FAQBlockData,
  type GuaranteeBlockData,
  type OrderBumpBlockData,
  type TestimonialBlockData,
  type CountdownBlockData,
  type BenefitsBlockData,
  type PaymentBlockData
} from '@/components/builder/checkout-blocks'
import { useSimplifiedBuilderStore } from '@/stores/simplified-builder-store'
import { ProductSelectorModal } from '@/components/builder/product-selector-modal'
import type { RouterOutputs } from '@/lib/trpc/api'

// Column Drop Zone Component
function ColumnDropZone({ 
  id, 
  title, 
  children 
}: { 
  id: string
  title: string
  children: React.ReactNode 
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })
  
  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "space-y-4 min-h-[200px]",
        isOver && "bg-blue-50/50 rounded-lg transition-colors"
      )}
    >
      <div className="text-xs text-gray-500 font-medium mb-2">{title}</div>
      {children}
    </div>
  )
}

// Sortable Block Wrapper
function SortableBlock({ 
  block, 
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onToggleColumn,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  showAnalytics,
  analyticsData
}: {
  block: Block
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
  onToggleVisibility: () => void
  onToggleColumn?: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  showAnalytics?: boolean
  analyticsData?: { views: number; clicks: number; engagement: number }
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="w-full relative">
      {showAnalytics && analyticsData && (
        <AnalyticsOverlay blockType={block.type} metrics={analyticsData} />
      )}
      <WYSIWYGBlock
        block={block}
        isSelected={isSelected}
        onSelect={onSelect}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onToggleVisibility={onToggleVisibility}
        onToggleColumn={onToggleColumn}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        isDragging={isDragging}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  )
}

// Analytics Overlay Component
function AnalyticsOverlay({ 
  blockType: _blockType, 
  metrics 
}: { 
  blockType: string
  metrics?: { views: number; clicks: number; engagement: number }
}) {
  if (!metrics) return null
  
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }
  
  return (
    <div className="absolute top-2 right-2 z-20 pointer-events-none">
      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold">Analytics</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-300">Views:</span>
            <span className="text-xs font-medium">{formatNumber(metrics.views)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-300">Clicks:</span>
            <span className="text-xs font-medium">{formatNumber(metrics.clicks)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-300">Engagement:</span>
            <span className="text-xs font-medium text-green-400">{metrics.engagement.toFixed(1)}%</span>
          </div>
        </div>
        
        {/* Performance Indicator */}
        <div className="mt-2 pt-2 border-t border-white/20">
          <div className="flex items-center gap-1">
            {metrics.engagement > 50 ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400">High Performance</span>
              </>
            ) : metrics.engagement > 25 ? (
              <>
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span className="text-xs text-yellow-400">Average</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs text-red-400">Needs Optimization</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Block Library Sidebar
function BlockLibrary({ onAddBlock }: { onAddBlock: (type: BlockType) => void }) {
  const blockTypes = Object.entries(blockTemplates).filter(([_, template]) => template != null) as [BlockType, typeof blockTemplates[BlockType]][]
  
  return (
    <div className="space-y-2">
      {blockTypes.map(([type, template]) => (
        <button
          key={type}
          onClick={() => onAddBlock(type)}
          className="w-full group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-3 text-left transition-all hover:shadow-md hover:scale-[1.02] hover:border-gray-300"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-blue-100 transition-colors">
              <div className="text-gray-600 group-hover:text-blue-600 transition-colors">
                {template.icon}
              </div>
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900">{template.name}</div>
              <div className="text-xs text-gray-500">{template.description}</div>
            </div>
            <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </button>
      ))}
    </div>
  )
}

// Aurora gradient presets
const gradientPresets = [
  { name: 'Aurora Blue', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { name: 'Fire', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Royal', value: 'linear-gradient(135deg, #667eea 0%, #4ca2cd 100%)' },
  { name: 'Emerald', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
]

// Properties Panel with Styles Tab
function PropertiesPanel({ 
  block, 
  onUpdate, 
  onClose,
  onSelectProduct
}: {
  block: Block | null
  onUpdate: (updates: Partial<Block>) => void
  onClose: () => void
  onSelectProduct?: (blockId: string) => void
}) {
  const [activeTab, setActiveTab] = useState<'content' | 'styles'>('content')
  
  const openProductSelector = (blockId: string) => {
    if (onSelectProduct) {
      onSelectProduct(blockId)
    }
  }
  
  if (!block) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Select a block to edit</p>
          <p className="text-sm mt-1">Click any block on the canvas</p>
        </div>
      </div>
    )
  }

  const updateData = (updates: Partial<Block['data']>) => {
    onUpdate({ data: { ...block.data, ...updates } })
  }

  const updateStyles = (updates: Partial<Block['styles']>) => {
    onUpdate({ styles: { ...block.styles, ...updates } })
  }

  const template = blockTemplates[block.type]
  if (!template) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        <div className="text-center">
          <p className="font-medium">Unknown block type</p>
          <p className="text-sm mt-1">{block.type}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {template.icon}
            <h3 className="font-semibold">{template.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('content')}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
            activeTab === 'content' 
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          <TypeIcon className="w-4 h-4" />
          Content
        </button>
        <button
          onClick={() => setActiveTab('styles')}
          className={cn(
            "flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2",
            activeTab === 'styles' 
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          <Palette className="w-4 h-4" />
          Styles
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'content' ? (
          <BlockEditor 
            block={block} 
            updateData={updateData}
            onSelectProduct={block.type === 'product' ? () => openProductSelector(block.id) : undefined}
          />
        ) : (
          <StylesEditor block={block} updateStyles={updateStyles} />
        )}
      </div>
    </div>
  )
}

// Block Editor Components
function BlockEditor({ 
  block, 
  updateData,
  onSelectProduct 
}: { 
  block: Block; 
  updateData: (updates: Partial<Block['data']>) => void;
  onSelectProduct?: () => void;
}) {
  // State for order bump product selector
  const [showOrderBumpProductSelector, setShowOrderBumpProductSelector] = useState(false)
  const updateBlockData = updateData // Alias for clarity
  switch (block.type) {
    case 'header':
      const headerData = block.data as HeaderBlockData
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              type="text"
              value={headerData.title}
              onChange={(e) => updateData({ title: e.target.value })}
              placeholder="Enter checkout title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <Input
              type="text"
              value={headerData.subtitle}
              onChange={(e) => updateData({ subtitle: e.target.value })}
              placeholder="Optional subtitle"
            />
          </div>
        </div>
      )

    case 'product':
      const productData = block.data as ProductBlockData
      return (
        <div className="space-y-4">
          {/* Product Selection */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">Product Source</span>
              <Button
                variant="primary"
                size="sm"
                onClick={onSelectProduct}
              >
                Select from Database
              </Button>
            </div>
            <p className="text-xs text-blue-700">
              Choose a product from your database to auto-fill details, or enter manually below.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <Input
              type="text"
              value={productData.name}
              onChange={(e) => updateData({ name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={productData.description}
              onChange={(e) => updateData({ description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <Input
                type="text"
                value={productData.price}
                onChange={(e) => updateData({ price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Compare Price</label>
              <Input
                type="text"
                value={productData.comparePrice || ''}
                onChange={(e) => updateData({ comparePrice: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <Select
              value={productData.type}
              onValueChange={(value) => updateData({ type: value as 'onetime' | 'subscription' | 'payment-plan' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onetime">One-time</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="payment-plan">Payment Plan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Features (one per line)</label>
            <Textarea
              value={productData.features.join('\n')}
              onChange={(e) => updateData({ features: e.target.value.split('\n').filter(f => f.trim()) })}
              className="font-mono text-sm"
              rows={5}
            />
          </div>
        </div>
      )

    case 'faq':
      const faqData = block.data as FAQBlockData
      return (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Section Title</label>
            <Input
              value={faqData.title}
              onChange={(e) => updateBlockData({ ...faqData, title: e.target.value })}
              placeholder="Frequently Asked Questions"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Questions & Answers</label>
            <div className="space-y-3">
              {faqData.faqs.map((faq, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <Input
                        value={faq.question}
                        onChange={(e) => {
                          const newFaqs = [...faqData.faqs]
                          newFaqs[index] = { ...faq, question: e.target.value }
                          updateBlockData({ ...faqData, faqs: newFaqs })
                        }}
                        placeholder="Question"
                      />
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => {
                          const newFaqs = [...faqData.faqs]
                          newFaqs[index] = { ...faq, answer: e.target.value }
                          updateBlockData({ ...faqData, faqs: newFaqs })
                        }}
                        placeholder="Answer"
                        rows={3}
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newFaqs = faqData.faqs.filter((_, i) => i !== index)
                        updateBlockData({ ...faqData, faqs: newFaqs })
                      }}
                      className="ml-3 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <Button
                onClick={() => {
                  const newFaqs = [...faqData.faqs, { question: '', answer: '' }]
                  updateBlockData({ ...faqData, faqs: newFaqs })
                }}
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>
        </div>
      )

    case 'guarantee':
      const guaranteeData = block.data as GuaranteeBlockData
      return (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Title</label>
            <Input
              value={guaranteeData.title}
              onChange={(e) => updateBlockData({ ...guaranteeData, title: e.target.value })}
              placeholder="100% Money-Back Guarantee"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Description</label>
            <Textarea
              value={guaranteeData.description}
              onChange={(e) => updateBlockData({ ...guaranteeData, description: e.target.value })}
              placeholder="If you're not satisfied within 30 days, we'll refund your entire purchase."
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Guarantee Period (days)</label>
            <Input
              type="number"
              value={guaranteeData.days || ''}
              onChange={(e) => updateBlockData({ ...guaranteeData, days: parseInt(e.target.value) || undefined })}
              placeholder="30"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Badge Text (Optional)</label>
            <Input
              value={guaranteeData.badge || ''}
              onChange={(e) => updateBlockData({ ...guaranteeData, badge: e.target.value })}
              placeholder="Risk-Free"
            />
          </div>
        </div>
      )

    case 'orderBump':
      const orderBumpData = block.data as OrderBumpBlockData
      return (
        <>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <Input
                value={orderBumpData.title}
                onChange={(e) => updateBlockData({ ...orderBumpData, title: e.target.value })}
                placeholder="🎁 Add Premium Support (Save 50%)"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Textarea
                value={orderBumpData.description}
                onChange={(e) => updateBlockData({ ...orderBumpData, description: e.target.value })}
                placeholder="Get priority support and exclusive bonuses"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Price</label>
                <Input
                  value={orderBumpData.price}
                  onChange={(e) => updateBlockData({ ...orderBumpData, price: e.target.value })}
                  placeholder="$49"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Compare Price</label>
                <Input
                  value={orderBumpData.comparePrice || ''}
                  onChange={(e) => updateBlockData({ ...orderBumpData, comparePrice: e.target.value })}
                  placeholder="$99"
                />
              </div>
            </div>
            <Button
              onClick={() => setShowOrderBumpProductSelector(true)}
              variant="outline"
              className="w-full"
            >
              <Package className="w-4 h-4 mr-2" />
              Select from Product Database
            </Button>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="order-bump-default"
                checked={orderBumpData.isCheckedByDefault || false}
                onChange={(e) => updateBlockData({ ...orderBumpData, isCheckedByDefault: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="order-bump-default" className="text-sm text-gray-600">
                Pre-check by default
              </label>
            </div>
          </div>
          {showOrderBumpProductSelector && (
            <ProductSelectorModal
              isOpen={showOrderBumpProductSelector}
              onClose={() => setShowOrderBumpProductSelector(false)}
              onSelectProduct={(product) => {
                updateBlockData({
                  ...orderBumpData,
                  title: `🎁 Add ${product.name}`,
                  description: product.description || '',
                  price: `$${(product.price / 100).toFixed(2)}`,
                  comparePrice: undefined, // compareAtPrice not available in product type
                })
                setShowOrderBumpProductSelector(false)
              }}
            />
          )}
        </>
      )

    case 'testimonial':
      const testimonialData = block.data as TestimonialBlockData
      return (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Layout</label>
            <Select
              value={testimonialData.layout}
              onValueChange={(value: 'single' | 'grid' | 'carousel') => 
                updateBlockData({ ...testimonialData, layout: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="carousel">Carousel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Testimonials</label>
            <div className="space-y-3">
              {testimonialData.testimonials.map((testimonial, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          value={testimonial.author}
                          onChange={(e) => {
                            const newTestimonials = [...testimonialData.testimonials]
                            newTestimonials[index] = { ...testimonial, author: e.target.value }
                            updateBlockData({ ...testimonialData, testimonials: newTestimonials })
                          }}
                          placeholder="John Doe"
                        />
                        <Input
                          value={testimonial.title || ''}
                          onChange={(e) => {
                            const newTestimonials = [...testimonialData.testimonials]
                            newTestimonials[index] = { ...testimonial, title: e.target.value }
                            updateBlockData({ ...testimonialData, testimonials: newTestimonials })
                          }}
                          placeholder="CEO, Company"
                        />
                      </div>
                      <Textarea
                        value={testimonial.content}
                        onChange={(e) => {
                          const newTestimonials = [...testimonialData.testimonials]
                          newTestimonials[index] = { ...testimonial, content: e.target.value }
                          updateBlockData({ ...testimonialData, testimonials: newTestimonials })
                        }}
                        placeholder="This product changed my life..."
                        rows={3}
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Rating:</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => {
                                const newTestimonials = [...testimonialData.testimonials]
                                newTestimonials[index] = { ...testimonial, rating: star }
                                updateBlockData({ ...testimonialData, testimonials: newTestimonials })
                              }}
                              className="p-0.5"
                            >
                              <Star 
                                className={cn(
                                  "w-5 h-5 transition-colors",
                                  star <= testimonial.rating 
                                    ? "fill-yellow-400 text-yellow-400" 
                                    : "text-gray-300"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const newTestimonials = testimonialData.testimonials.filter((_, i) => i !== index)
                        updateBlockData({ ...testimonialData, testimonials: newTestimonials })
                      }}
                      className="ml-3 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <Button
                onClick={() => {
                  const newTestimonials = [...testimonialData.testimonials, 
                    { author: '', content: '', rating: 5, title: '' }]
                  updateBlockData({ ...testimonialData, testimonials: newTestimonials })
                }}
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Testimonial
              </Button>
            </div>
          </div>
        </div>
      )

    case 'countdown':
      const countdownData = block.data as CountdownBlockData
      return (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Title</label>
            <Input
              value={countdownData.title}
              onChange={(e) => updateBlockData({ ...countdownData, title: e.target.value })}
              placeholder="Limited Time Offer Ends In:"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">End Date & Time</label>
            <Input
              type="datetime-local"
              value={countdownData.endDate ? new Date(countdownData.endDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => updateBlockData({ ...countdownData, endDate: new Date(e.target.value).toISOString() })}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Display Units</label>
            <div className="space-y-2">
              {[
                { key: 'showDays', label: 'Show Days' },
                { key: 'showHours', label: 'Show Hours' },
                { key: 'showMinutes', label: 'Show Minutes' },
                { key: 'showSeconds', label: 'Show Seconds' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`countdown-${key}`}
                    checked={countdownData[key as keyof CountdownBlockData] as boolean || false}
                    onChange={(e) => updateBlockData({ ...countdownData, [key]: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`countdown-${key}`} className="text-sm text-gray-600">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )

    case 'benefits':
      const benefitsData = block.data as BenefitsBlockData
      return (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Section Title</label>
            <Input
              value={benefitsData.title}
              onChange={(e) => updateBlockData({ ...benefitsData, title: e.target.value })}
              placeholder="Why Choose Us"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Benefits</label>
            <div className="space-y-3">
              {benefitsData.benefits.map((benefit, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-[60px_1fr] gap-3">
                        <Input
                          value={benefit.icon || ''}
                          onChange={(e) => {
                            const newBenefits = [...benefitsData.benefits]
                            newBenefits[index] = { ...benefit, icon: e.target.value }
                            updateBlockData({ ...benefitsData, benefits: newBenefits })
                          }}
                          placeholder="✅"
                          className="text-center"
                        />
                        <Input
                          value={benefit.title}
                          onChange={(e) => {
                            const newBenefits = [...benefitsData.benefits]
                            newBenefits[index] = { ...benefit, title: e.target.value }
                            updateBlockData({ ...benefitsData, benefits: newBenefits })
                          }}
                          placeholder="Benefit Title"
                        />
                      </div>
                      <Textarea
                        value={benefit.description}
                        onChange={(e) => {
                          const newBenefits = [...benefitsData.benefits]
                          newBenefits[index] = { ...benefit, description: e.target.value }
                          updateBlockData({ ...benefitsData, benefits: newBenefits })
                        }}
                        placeholder="Describe this benefit..."
                        rows={2}
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newBenefits = benefitsData.benefits.filter((_, i) => i !== index)
                        updateBlockData({ ...benefitsData, benefits: newBenefits })
                      }}
                      className="ml-3 p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <Button
                onClick={() => {
                  const newBenefits = [...benefitsData.benefits, 
                    { icon: '✨', title: '', description: '' }]
                  updateBlockData({ ...benefitsData, benefits: newBenefits })
                }}
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Benefit
              </Button>
            </div>
          </div>
        </div>
      )

    case 'payment':
      const paymentData = block.data as PaymentBlockData
      return (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <Shield className="w-4 h-4 inline mr-1" />
                Professional payment form with Stripe-level security
              </p>
            </div>
            
            {paymentData.useStripeElements !== false && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> If you see Stripe errors in the console (r.stripe.com blocked), 
                  these are from ad blockers blocking telemetry. The payment form will still work correctly.
                </p>
              </div>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1.5 block">Button Text</label>
            <Input
              value={paymentData.buttonText || ''}
              onChange={(e) => updateBlockData({ ...paymentData, buttonText: e.target.value })}
              placeholder="Complete Purchase"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1.5 block">Security Text</label>
            <Input
              value={paymentData.secureText || ''}
              onChange={(e) => updateBlockData({ ...paymentData, secureText: e.target.value })}
              placeholder="Your payment is secured with 256-bit SSL encryption"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1.5 block">Required Fields</label>
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="rounded border-gray-300 opacity-50"
                />
                <label className="text-sm text-gray-600">
                  Email Address (Always Required)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="rounded border-gray-300 opacity-50"
                />
                <label className="text-sm text-gray-600">
                  Card Information (Always Required)
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1.5 block">Optional Fields</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="payment-billing"
                  checked={paymentData.showBillingAddress || false}
                  onChange={(e) => updateBlockData({ ...paymentData, showBillingAddress: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="payment-billing" className="text-sm text-gray-600">
                  Billing Address
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="payment-phone"
                  checked={paymentData.showPhoneField || false}
                  onChange={(e) => updateBlockData({ ...paymentData, showPhoneField: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="payment-phone" className="text-sm text-gray-600">
                  Phone Number
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="payment-company"
                  checked={paymentData.showCompanyField || false}
                  onChange={(e) => updateBlockData({ ...paymentData, showCompanyField: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="payment-company" className="text-sm text-gray-600">
                  Company Name
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1.5 block">Stripe Payment Features</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="payment-stripe"
                  checked={paymentData.useStripeElements !== false}
                  onChange={(e) => updateBlockData({ ...paymentData, useStripeElements: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="payment-stripe" className="text-sm text-gray-600">
                  Use Stripe Elements (Recommended)
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="payment-wallets"
                  checked={paymentData.enableWallets || false}
                  onChange={(e) => updateBlockData({ ...paymentData, enableWallets: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="payment-wallets" className="text-sm text-gray-600">
                  Enable Apple Pay & Google Pay
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="payment-link"
                  checked={paymentData.enableStripeLink || false}
                  onChange={(e) => updateBlockData({ ...paymentData, enableStripeLink: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="payment-link" className="text-sm text-gray-600">
                  Enable Stripe Link (1-Click Checkout)
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tax & Compliance</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="payment-vat"
                  checked={paymentData.collectVAT || false}
                  onChange={(e) => updateBlockData({ ...paymentData, collectVAT: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="payment-vat" className="text-sm text-gray-600">
                  Collect VAT Number
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="payment-tax"
                  checked={paymentData.enableStripeTax || false}
                  onChange={(e) => updateBlockData({ ...paymentData, enableStripeTax: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="payment-tax" className="text-sm text-gray-600">
                  Enable Stripe Tax (Automatic Tax Calculation)
                </label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1.5 block">Promotions & Trust</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="payment-coupons"
                  checked={paymentData.enableCoupons || false}
                  onChange={(e) => updateBlockData({ ...paymentData, enableCoupons: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="payment-coupons" className="text-sm text-gray-600">
                  Enable Coupon Codes
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="payment-guarantee"
                  checked={paymentData.showGuarantee || false}
                  onChange={(e) => updateBlockData({ ...paymentData, showGuarantee: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="payment-guarantee" className="text-sm text-gray-600">
                  Show Money Back Guarantee
                </label>
              </div>
            </div>
          </div>
          
          {paymentData.showGuarantee && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">Guarantee Text</label>
              <Input
                value={paymentData.guaranteeText || ''}
                onChange={(e) => updateBlockData({ ...paymentData, guaranteeText: e.target.value })}
                placeholder="30-Day Money Back Guarantee"
              />
            </div>
          )}
          
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Payment Features Included:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Real-time card validation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Auto-detect card type (Visa, Mastercard, etc.)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                3D Secure authentication
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Support for digital wallets (Apple Pay, Google Pay)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                PCI DSS compliant
              </li>
            </ul>
          </div>
        </div>
      )

    default:
      return <div className="text-gray-500">Unknown block type: {block.type}</div>
  }
}

// Styles Editor Component
function StylesEditor({ 
  block, 
  updateStyles 
}: { 
  block: Block
  updateStyles: (updates: Partial<Block['styles']>) => void 
}) {
  const styles = block.styles || {}
  
  return (
    <div className="space-y-6">
      {/* Spacing Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Spacing
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Padding</label>
            <Select
              value={styles.padding || '1.5rem'}
              onValueChange={(value) => updateStyles({ padding: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None</SelectItem>
                <SelectItem value="0.5rem">Small (8px)</SelectItem>
                <SelectItem value="1rem">Medium (16px)</SelectItem>
                <SelectItem value="1.5rem">Large (24px)</SelectItem>
                <SelectItem value="2rem">XL (32px)</SelectItem>
                <SelectItem value="3rem">2XL (48px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Margin</label>
            <Select
              value={styles.margin || '0'}
              onValueChange={(value) => updateStyles({ margin: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None</SelectItem>
                <SelectItem value="0.5rem">Small (8px)</SelectItem>
                <SelectItem value="1rem">Medium (16px)</SelectItem>
                <SelectItem value="1.5rem">Large (24px)</SelectItem>
                <SelectItem value="2rem">XL (32px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Background Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Background
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <Select
              value={styles.backgroundType || 'color'}
              onValueChange={(value) => updateStyles({ backgroundType: value as 'color' | 'gradient' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="color">Solid Color</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {styles.backgroundType === 'gradient' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aurora Gradients</label>
              <div className="grid grid-cols-2 gap-2">
                {gradientPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => updateStyles({ background: preset.value })}
                    className={cn(
                      "h-12 rounded-lg border-2 transition-all hover:scale-105",
                      styles.background === preset.value ? "border-blue-500 shadow-lg" : "border-gray-200"
                    )}
                    style={{ background: preset.value }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={styles.background || '#ffffff'}
                  onChange={(e) => updateStyles({ background: e.target.value })}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <Input
                  type="text"
                  value={styles.background || '#ffffff'}
                  onChange={(e) => updateStyles({ background: e.target.value })}
                  className="font-mono text-sm"
                  placeholder="#ffffff"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Typography Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TypeIcon className="w-4 h-4" />
          Typography
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={styles.textColor || '#000000'}
                onChange={(e) => updateStyles({ textColor: e.target.value })}
                className="h-10 w-20 rounded border cursor-pointer"
              />
              <Input
                type="text"
                value={styles.textColor || '#000000'}
                onChange={(e) => updateStyles({ textColor: e.target.value })}
                className="font-mono text-sm"
                placeholder="#000000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
            <Select
              value={styles.fontSize || '1rem'}
              onValueChange={(value) => updateStyles({ fontSize: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.75rem">XS (12px)</SelectItem>
                <SelectItem value="0.875rem">SM (14px)</SelectItem>
                <SelectItem value="1rem">Base (16px)</SelectItem>
                <SelectItem value="1.125rem">LG (18px)</SelectItem>
                <SelectItem value="1.25rem">XL (20px)</SelectItem>
                <SelectItem value="1.5rem">2XL (24px)</SelectItem>
                <SelectItem value="2rem">3XL (32px)</SelectItem>
                <SelectItem value="3rem">4XL (48px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Weight</label>
            <Select
              value={styles.fontWeight || '400'}
              onValueChange={(value) => updateStyles({ fontWeight: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">Light</SelectItem>
                <SelectItem value="400">Regular</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="600">Semibold</SelectItem>
                <SelectItem value="700">Bold</SelectItem>
                <SelectItem value="900">Black</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Borders & Effects Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Borders & Effects</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius</label>
            <Select
              value={styles.borderRadius || '0.75rem'}
              onValueChange={(value) => updateStyles({ borderRadius: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None</SelectItem>
                <SelectItem value="0.25rem">Small (4px)</SelectItem>
                <SelectItem value="0.375rem">Medium (6px)</SelectItem>
                <SelectItem value="0.5rem">Large (8px)</SelectItem>
                <SelectItem value="0.75rem">XL (12px)</SelectItem>
                <SelectItem value="1rem">2XL (16px)</SelectItem>
                <SelectItem value="1.5rem">3XL (24px)</SelectItem>
                <SelectItem value="9999px">Full (pill)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shadow</label>
            <Select
              value={styles.shadow || 'none'}
              onValueChange={(value) => updateStyles({ shadow: value === 'none' ? '' : value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="0 1px 3px 0 rgba(0, 0, 0, 0.1)">Small</SelectItem>
                <SelectItem value="0 4px 6px -1px rgba(0, 0, 0, 0.1)">Medium</SelectItem>
                <SelectItem value="0 10px 15px -3px rgba(0, 0, 0, 0.1)">Large</SelectItem>
                <SelectItem value="0 20px 25px -5px rgba(0, 0, 0, 0.1)">XL</SelectItem>
                <SelectItem value="0 0 20px rgba(66, 153, 225, 0.5)">Blue Glow</SelectItem>
                <SelectItem value="0 0 20px rgba(159, 122, 234, 0.5)">Purple Glow</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Border</label>
            <div className="flex gap-2">
              <Select
                value={styles.borderWidth || '0'}
                onValueChange={(value) => updateStyles({ borderWidth: value })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  <SelectItem value="1px">1px</SelectItem>
                  <SelectItem value="2px">2px</SelectItem>
                  <SelectItem value="4px">4px</SelectItem>
                </SelectContent>
              </Select>
              <input
                type="color"
                value={styles.borderColor || '#e5e7eb'}
                onChange={(e) => updateStyles({ borderColor: e.target.value })}
                className="h-10 w-20 rounded border cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Keyboard Shortcuts Hook
function useKeyboardShortcuts() {
  const store = useSimplifiedBuilderStore()
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Z: Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        store.undo()
      }
      
      // Cmd/Ctrl + Shift + Z: Redo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        store.redo()
      }
      
      // Cmd/Ctrl + S: Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        // Trigger save event
        window.dispatchEvent(new CustomEvent('builder:save'))
      }
      
      // Delete: Delete selected block
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.selectedBlockId && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
          e.preventDefault()
          store.deleteBlock(store.selectedBlockId)
        }
      }
      
      // Escape: Deselect block
      if (e.key === 'Escape') {
        store.selectBlock(null)
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [store])
}

// Type definitions
type Product = RouterOutputs['product']['list'][0]

// Main Builder Component
export default function SimplifiedBuilderPage() {
  const params = useParams()
  const checkoutId = params?.id as string
  
  const [sidebarOpen] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop')
  const [showThemeModal, setShowThemeModal] = useState(false)
  const [showProductSelector, setShowProductSelector] = useState(false)
  const [selectedBlockForProduct, setSelectedBlockForProduct] = useState<string | null>(null)
  const [showABTestModal, setShowABTestModal] = useState(false)
  const [activeVariant, setActiveVariant] = useState<'A' | 'B'>('A')
  const [abTestEnabled, setABTestEnabled] = useState(false)
  const [variantB, setVariantB] = useState<Block[]>([])
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState('')
  const [analyticsData] = useState({
    totalViews: 12543,
    conversions: 1879,
    conversionRate: 14.98,
    avgOrderValue: 127.50,
    cartAbandonment: 23.4,
    blockMetrics: {
      'header': { views: 12543, clicks: 3421, engagement: 27.3 },
      'product': { views: 11987, clicks: 8765, engagement: 73.1 },
      'orderBump': { views: 10234, clicks: 2156, engagement: 21.1 },
      'testimonial': { views: 9876, clicks: 1234, engagement: 12.5 },
      'guarantee': { views: 8765, clicks: 3210, engagement: 36.6 },
      'payment': { views: 7654, clicks: 1879, engagement: 24.5 },
    } as Record<string, { views: number; clicks: number; engagement: number }>
  })
  const [globalTheme, setGlobalTheme] = useState({
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    fontFamily: 'system-ui',
    pageBackground: '#ffffff',
    buttonStyle: 'rounded' as 'default' | 'rounded' | 'sharp',
    buttonColor: '#3b82f6',
  })
  const [activeId, setActiveId] = useState<string | null>(null)
  
  const {
    blocks,
    selectedBlockId,
    hasUnsavedChanges,
    history,
    isSaving,
    addBlock,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    moveBlock,
    toggleBlockVisibility,
    toggleBlockColumn,
    selectBlock,
    undo,
    redo,
    setBlocks,
    setHasUnsavedChanges,
    setSaving
  } = useSimplifiedBuilderStore()
  
  // Keyboard shortcuts
  useKeyboardShortcuts()
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // Fetch checkout data
  const { data: checkout, isLoading } = api.checkout.getById.useQuery({ id: checkoutId })
  
  // Save mutation
  const saveCheckout = api.checkout.savePageData.useMutation({
    onMutate: () => {
      setSaveStatus('saving')
      setSaving(true)
    },
    onSuccess: (data, variables) => {
      setHasUnsavedChanges(false)
      setSaveStatus('saved')
      setLastSaved(new Date())
      setSaving(false)
      
      if (variables.publish && data) {
        const checkoutUrl = `${window.location.origin}/c/${data.slug}`
        setPublishedUrl(checkoutUrl)
        setShowPublishModal(true)
        toast.success('Checkout published successfully!')
      } else {
        toast.success('Changes saved!')
      }
    },
    onError: (error) => {
      setSaveStatus('error')
      setSaving(false)
      toast.error('Failed to save: ' + error.message)
    }
  })
  
  // Load checkout data
  useEffect(() => {
    if (checkout?.pageData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pageData = checkout.pageData as any
      
      // Check if it's the new simplified format
      if (Array.isArray(pageData.blocks)) {
        // Filter out blocks with unknown types and ensure all blocks have the visible property
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const validBlocks = pageData.blocks.filter((block: any) => {
          if (!blockTemplates[block.type as BlockType]) {
            console.warn(`Filtering out unknown block type: ${block.type}`)
            return false
          }
          return true
        })
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blocks = validBlocks.map((block: any) => ({
          ...block,
          visible: block.visible !== undefined ? block.visible : true,
          column: block.column || 'left'
        }))
        setBlocks(blocks)
      } else if (pageData.sections) {
        // Convert from old format - just take the first block from each section
        const convertedBlocks: Block[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pageData.sections.forEach((section: any) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          section.columns?.forEach((column: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            column.blocks?.forEach((block: any) => {
              // Only add blocks with known types
              if (blockTemplates[block.type as BlockType]) {
                convertedBlocks.push({
                  ...block,
                  visible: block.visible !== undefined ? block.visible : true,
                  column: block.column || 'left'
                })
              } else {
                console.warn(`Filtering out unknown block type during conversion: ${block.type}`)
              }
            })
          })
        })
        setBlocks(convertedBlocks)
      }
    }
  }, [checkout, setBlocks])
  
  // Save handler
  const handleSave = useCallback((publish = false) => {
    const pageData = {
      blocks,
      settings: {
        theme: 'light'
      }
    }
    
    saveCheckout.mutate({
      id: checkoutId,
      pageData,
      publish
    })
  }, [blocks, checkoutId, saveCheckout])
  
  // Handle publish
  // Copy URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(publishedUrl)
    toast.success('URL copied to clipboard!')
  }
  
  // Auto-save
  useEffect(() => {
    if (!hasUnsavedChanges || isSaving) return
    
    const timer = setTimeout(() => {
      handleSave(false)
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [hasUnsavedChanges, isSaving, handleSave])
  
  // Handle product selection from database
  const handleProductSelection = (product: Product) => {
    if (selectedBlockForProduct) {
      // Update the selected product block with database product data
      const productData: ProductBlockData = {
        name: product.name,
        description: product.description || '',
        price: `${getCurrencySymbol(product.currency as Currency)}${(product.price / 100).toFixed(2)}`,
        comparePrice: undefined, // Product type doesn't have this field
        type: product.isRecurring ? 'subscription' : 'onetime',
        features: product.features || [],
        imageUrl: product.thumbnail || undefined,
        badge: undefined, // Product type doesn't have this field
        // NEW: Store product ID and enable product-driven pricing
        productId: product.id,
        planId: product.plans?.[0]?.id || null, // Use first plan if available
        useProductPricing: true, // Enable product-driven pricing
      }
      
      updateBlock(selectedBlockForProduct, { data: productData })
      
      // Clear selection
      setSelectedBlockForProduct(null)
      setShowProductSelector(false)
      
      // Show success message
      toast.success('Product imported successfully!')
    }
  }
  
  // Handle opening product selector for a specific block
  const openProductSelector = (blockId: string) => {
    setSelectedBlockForProduct(blockId)
    setShowProductSelector(true)
  }
  
  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
  }
  
  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null)
    
    if (!over) return
    
    const activeId = active.id as string
    const overId = over.id as string
    
    // Find the active block
    const activeBlock = blocks.find(b => b.id === activeId)
    if (!activeBlock) return
    
    // Create a working copy of blocks
    let newBlocks = [...blocks]
    
    // Handle dropping on column drop zones (empty columns)
    if (overId === 'left-column' || overId === 'right-column') {
      const targetColumn: 'left' | 'right' = overId === 'left-column' ? 'left' : 'right'
      
      // Update the block's column
      newBlocks = newBlocks.map(b => 
        b.id === activeId ? { ...b, column: targetColumn } : b
      )
      
      setBlocks(newBlocks)
      return
    }
    
    // Handle dropping on another block
    const overBlock = blocks.find(b => b.id === overId)
    if (!overBlock) return
    
    const activeIndex = newBlocks.findIndex(b => b.id === activeId)
    const overIndex = newBlocks.findIndex(b => b.id === overId)
    
    if (activeIndex === -1 || overIndex === -1) return
    
    // Determine target column
    const targetColumn: 'left' | 'right' = overBlock.column || 'left'
    
    // Remove active block from array
    const [movedBlock] = newBlocks.splice(activeIndex, 1)
    
    if (!movedBlock) return // Safety check
    
    // Update the moved block's column
    movedBlock.column = targetColumn
    
    // Find the new index after removal
    const newOverIndex = newBlocks.findIndex(b => b.id === overId)
    
    // Insert at the new position
    if (newOverIndex !== -1) {
      // Insert after the target block
      newBlocks.splice(newOverIndex + 1, 0, movedBlock)
    } else {
      // If target not found, add to end
      newBlocks.push(movedBlock)
    }
    
    setBlocks(newBlocks)
  }
  
  // Selected block
  const selectedBlock = blocks.find(b => b.id === selectedBlockId) || null
  
  // Split blocks by column
  const leftBlocks = blocks.filter(b => !b.column || b.column === 'left')
  const rightBlocks = blocks.filter(b => b.column === 'right')
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading builder...</p>
        </div>
      </div>
    )
  }
  
  if (!checkout) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="text-xl font-semibold text-red-600">Checkout not found</p>
        <Link href="/checkouts" className="mt-4">
          <Button variant="secondary">Back to Checkouts</Button>
        </Link>
      </div>
    )
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/checkouts">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">{checkout.name}</h1>
            <div className="flex items-center gap-3 text-sm">
              <SaveIndicator status={saveStatus} lastSaved={lastSaved} />
              {history.past.length > 0 && (
                <span className="text-gray-500">
                  {history.past.length} action{history.past.length > 1 ? 's' : ''} to undo
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <Button
              variant={activeView === 'desktop' ? 'primary' : 'ghost'}
              size="icon"
              onClick={() => setActiveView('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={activeView === 'mobile' ? 'primary' : 'ghost'}
              size="icon"
              onClick={() => setActiveView('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          
          {/* History Controls */}
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={history.past.length === 0}
            title="Undo (⌘Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={history.future.length === 0}
            title="Redo (⌘⇧Z)"
          >
            <Redo className="h-4 w-4" />
          </Button>
          
          {/* Theme Settings */}
          <Button
            variant="ghost"
            onClick={() => setShowThemeModal(true)}
          >
            <Palette className="mr-2 h-4 w-4" />
            Theme
          </Button>
          
          {/* A/B Testing */}
          <Button
            variant="ghost"
            onClick={() => setShowABTestModal(true)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            A/B Test
          </Button>
          
          {/* Analytics Overlay */}
          <Button
            variant={showAnalytics ? "primary" : "ghost"}
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          
          {/* Actions */}
          <Button
            variant="ghost"
            onClick={() => handleSave(false)}
            disabled={!hasUnsavedChanges || isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            <Rocket className="mr-2 h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-80 bg-white border-r flex-shrink-0"
            >
              <div className="p-4 border-b">
                <h2 className="font-semibold">Add Blocks</h2>
              </div>
              <div className="p-4 overflow-y-auto h-[calc(100vh-180px)]">
                <BlockLibrary onAddBlock={(type) => addBlock(type)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Canvas */}
        <div className="flex-1 overflow-auto">
          {/* A/B Test Variant Switcher */}
          {abTestEnabled && (
            <div className="sticky top-0 z-10 bg-white border-b px-8 py-3">
              <div className="max-w-5xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">A/B Test Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Editing:</span>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setActiveVariant('A')}
                      className={cn(
                        "px-3 py-1 rounded text-sm font-medium transition-all",
                        activeVariant === 'A' 
                          ? "bg-white text-blue-600 shadow-sm" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      Variant A
                    </button>
                    <button
                      onClick={() => setActiveVariant('B')}
                      className={cn(
                        "px-3 py-1 rounded text-sm font-medium transition-all",
                        activeVariant === 'B' 
                          ? "bg-white text-purple-600 shadow-sm" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      Variant B
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className={cn(
            "mx-auto p-8 transition-all",
            activeView === 'mobile' ? "max-w-sm" : "max-w-5xl"
          )}>
            {/* Edit Mode */}
                {/* Analytics Summary Bar */}
                {showAnalytics && (
                  <div className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                          <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Live Analytics Overview</h3>
                          <p className="text-sm text-white/80">Last 30 days performance</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-4">
                      <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-white/60" />
                          <span className="text-xs text-white/60">Total Views</span>
                        </div>
                        <p className="text-2xl font-bold">{analyticsData.totalViews.toLocaleString()}</p>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-white/60" />
                          <span className="text-xs text-white/60">Conversions</span>
                        </div>
                        <p className="text-2xl font-bold">{analyticsData.conversions.toLocaleString()}</p>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <BarChart3 className="w-4 h-4 text-white/60" />
                          <span className="text-xs text-white/60">Conv. Rate</span>
                        </div>
                        <p className="text-2xl font-bold">{analyticsData.conversionRate}%</p>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-white/60" />
                          <span className="text-xs text-white/60">Avg. Order</span>
                        </div>
                        <p className="text-2xl font-bold">${analyticsData.avgOrderValue}</p>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <ShoppingCart className="w-4 h-4 text-white/60" />
                          <span className="text-xs text-white/60">Abandonment</span>
                        </div>
                        <p className="text-2xl font-bold">{analyticsData.cartAbandonment}%</p>
                      </div>
                    </div>
                  </div>
                )}
                
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className={cn(
                  "grid gap-4",
                  activeView === 'mobile' ? "grid-cols-1" : "grid-cols-2"
                )}>
                  {blocks.length === 0 ? (
                    <div className="col-span-2 bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                      <Plus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-500 font-medium">Start by adding blocks</p>
                      <p className="text-sm text-gray-400 mt-1">Choose from the library on the left</p>
                    </div>
                  ) : (
                    <>
                      {/* Left Column */}
                      <ColumnDropZone id="left-column" title="Left Column">
                        <SortableContext
                          items={leftBlocks.map(b => b.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {leftBlocks.map((block, index) => (
                            <SortableBlock
                              key={block.id}
                              block={block}
                              isSelected={selectedBlockId === block.id}
                              onSelect={() => selectBlock(block.id)}
                              onDelete={() => deleteBlock(block.id)}
                              onDuplicate={() => duplicateBlock(block.id)}
                              onToggleVisibility={() => toggleBlockVisibility(block.id)}
                              onToggleColumn={() => toggleBlockColumn(block.id)}
                              onMoveUp={() => moveBlock(block.id, 'up')}
                              onMoveDown={() => moveBlock(block.id, 'down')}
                              canMoveUp={index > 0}
                              canMoveDown={index < leftBlocks.length - 1}
                              showAnalytics={showAnalytics}
                              analyticsData={analyticsData.blockMetrics[block.type]}
                            />
                          ))}
                          {leftBlocks.length === 0 && (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400">
                              <p className="text-sm">Drop blocks here</p>
                            </div>
                          )}
                        </SortableContext>
                        </ColumnDropZone>
                        
                        {/* Right Column */}
                        <ColumnDropZone id="right-column" title="Right Column">
                          <SortableContext
                            items={rightBlocks.map(b => b.id)}
                            strategy={verticalListSortingStrategy}
                          >
                          {rightBlocks.map((block, index) => (
                            <SortableBlock
                              key={block.id}
                              block={block}
                              isSelected={selectedBlockId === block.id}
                              onSelect={() => selectBlock(block.id)}
                              onDelete={() => deleteBlock(block.id)}
                              onDuplicate={() => duplicateBlock(block.id)}
                              onToggleVisibility={() => toggleBlockVisibility(block.id)}
                              onToggleColumn={() => toggleBlockColumn(block.id)}
                              onMoveUp={() => moveBlock(block.id, 'up')}
                              onMoveDown={() => moveBlock(block.id, 'down')}
                              canMoveUp={index > 0}
                              canMoveDown={index < rightBlocks.length - 1}
                              showAnalytics={showAnalytics}
                              analyticsData={analyticsData.blockMetrics[block.type]}
                            />
                          ))}
                          {rightBlocks.length === 0 && (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400">
                              <p className="text-sm">Drop blocks here</p>
                            </div>
                          )}
                          </SortableContext>
                        </ColumnDropZone>
                      </>
                    )}
                  </div>
                <DndDragOverlay>
                  {activeId ? (
                    <div className="opacity-80 rotate-2 scale-105">
                      <WYSIWYGBlock
                        block={blocks.find(b => b.id === activeId)!}
                        isSelected={false}
                        onSelect={() => {}}
                        onDelete={() => {}}
                        onDuplicate={() => {}}
                        onToggleVisibility={() => {}}
                        onMoveUp={() => {}}
                        onMoveDown={() => {}}
                        canMoveUp={false}
                        canMoveDown={false}
                        isDragging={true}
                        dragAttributes={{}}
                        dragListeners={{}}
                      />
                    </div>
                  ) : null}
                </DndDragOverlay>
              </DndContext>
          </div>
        </div>
        
        {/* Properties Panel */}
        {selectedBlock && (
          <div className="w-80 bg-white border-l flex-shrink-0">
            <PropertiesPanel
              block={selectedBlock}
              onUpdate={(updates) => updateBlock(selectedBlock.id, updates)}
              onClose={() => selectBlock(null)}
              onSelectProduct={openProductSelector}
            />
          </div>
        )}
      </div>
      
      {/* Theme Settings Modal */}
      {showThemeModal && (
        <ThemeSettingsModal
          theme={globalTheme}
          onUpdate={setGlobalTheme}
          onClose={() => setShowThemeModal(false)}
        />
      )}
      
      {/* Product Selector Modal */}
      <ProductSelectorModal
        isOpen={showProductSelector}
        onClose={() => {
          setShowProductSelector(false)
          setSelectedBlockForProduct(null)
        }}
        onSelectProduct={handleProductSelection}
        selectedProductId={undefined}
      />
      
      {/* Publish Success Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 min-w-[500px] max-w-md w-full mx-4"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Checkout Published!</h2>
              <p className="text-gray-600 mb-6">
                Your checkout is now live and ready to accept payments.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <label className="text-sm text-gray-500 block mb-2">Checkout URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={publishedUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyToClipboard}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPublishModal(false)}
                >
                  Continue Editing
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => window.open(publishedUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Checkout
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* A/B Testing Modal */}
      {showABTestModal && (
        <ABTestingModal
          enabled={abTestEnabled}
          activeVariant={activeVariant}
          variantA={blocks}
          variantB={variantB}
          onToggleEnabled={setABTestEnabled}
          onVariantChange={setActiveVariant}
          onVariantBUpdate={setVariantB}
          onClose={() => setShowABTestModal(false)}
        />
      )}
    </div>
  )
}

// A/B Testing Modal Component
function ABTestingModal({
  enabled,
  activeVariant: _activeVariant,
  variantA,
  variantB,
  onToggleEnabled,
  onVariantChange: _onVariantChange,
  onVariantBUpdate,
  onClose
}: {
  enabled: boolean
  activeVariant: 'A' | 'B'
  variantA: Block[]
  variantB: Block[]
  onToggleEnabled: (enabled: boolean) => void
  onVariantChange: (variant: 'A' | 'B') => void
  onVariantBUpdate: (blocks: Block[]) => void
  onClose: () => void
}) {
  const [localEnabled, setLocalEnabled] = useState(enabled)
  const [localVariantB, setLocalVariantB] = useState(variantB.length > 0 ? variantB : [...variantA])
  const [trafficSplit, setTrafficSplit] = useState(50)
  
  const handleApply = () => {
    onToggleEnabled(localEnabled)
    onVariantBUpdate(localVariantB)
    onClose()
    toast.success('A/B test settings updated!')
  }
  
  const handleDuplicateVariantA = () => {
    setLocalVariantB([...variantA])
    toast.success('Variant A duplicated to Variant B')
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-4xl min-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold">A/B Testing Configuration</h2>
              <p className="text-sm text-gray-600">Test different checkout variations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">A/B Test Status</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {localEnabled 
                      ? 'A/B testing is active. Visitors will see different variants.'
                      : 'A/B testing is disabled. All visitors see Variant A.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localEnabled}
                    onChange={(e) => setLocalEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            {/* Traffic Split */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Traffic Distribution</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Variant A</span>
                      <span className="text-sm text-gray-600">{100 - trafficSplit}%</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Variant B</span>
                      <span className="text-sm text-gray-600">{trafficSplit}%</span>
                    </div>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={trafficSplit}
                  onChange={(e) => setTrafficSplit(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${trafficSplit}%, #e5e7eb ${trafficSplit}%, #e5e7eb 100%)`
                  }}
                />
                <p className="text-xs text-gray-500">
                  Adjust how traffic is split between variants
                </p>
              </div>
            </div>
            
            {/* Variant Management */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Variant Management</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Variant A (Control)</h4>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      Original
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {variantA.length} blocks configured
                  </p>
                  <div className="text-xs text-gray-500">
                    This is your current checkout design
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Variant B (Test)</h4>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      Test
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {localVariantB.length} blocks configured
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDuplicateVariantA}
                    className="w-full"
                  >
                    Duplicate from Variant A
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> To edit Variant B, enable A/B testing and use the variant switcher in the builder.
                </p>
              </div>
            </div>
            
            {/* Test Goals */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Test Goals & Metrics</h3>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="mt-1" defaultChecked />
                  <div>
                    <p className="font-medium text-sm">Conversion Rate</p>
                    <p className="text-xs text-gray-600">Track checkout completion percentage</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="mt-1" defaultChecked />
                  <div>
                    <p className="font-medium text-sm">Average Order Value</p>
                    <p className="text-xs text-gray-600">Compare revenue per transaction</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" className="mt-1" />
                  <div>
                    <p className="font-medium text-sm">Cart Abandonment</p>
                    <p className="text-xs text-gray-600">Monitor drop-off rates</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-600">
            Changes will apply to new visitors only
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApply}>
              Apply Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Theme Settings Modal Component
function ThemeSettingsModal({
  theme,
  onUpdate,
  onClose
}: {
  theme: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    pageBackground: string
    buttonStyle: 'default' | 'rounded' | 'sharp'
    buttonColor: string
  }
  onUpdate: (theme: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
    pageBackground: string
    buttonStyle: 'default' | 'rounded' | 'sharp'
    buttonColor: string
  }) => void
  onClose: () => void
}) {
  const [localTheme, setLocalTheme] = useState(theme)
  
  const handleApply = () => {
    onUpdate(localTheme)
    onClose()
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal - Fixed width issues */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl min-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex-shrink-0">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-semibold">Global Theme Settings</h2>
                <p className="text-sm text-gray-600">Customize the overall look and feel</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6 w-full">
            {/* Colors Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Brand Colors
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localTheme.primaryColor}
                      onChange={(e) => setLocalTheme({ ...localTheme, primaryColor: e.target.value })}
                      className="h-10 w-20 rounded border cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={localTheme.primaryColor}
                      onChange={(e) => setLocalTheme({ ...localTheme, primaryColor: e.target.value })}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localTheme.secondaryColor}
                      onChange={(e) => setLocalTheme({ ...localTheme, secondaryColor: e.target.value })}
                      className="h-10 w-20 rounded border cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={localTheme.secondaryColor}
                      onChange={(e) => setLocalTheme({ ...localTheme, secondaryColor: e.target.value })}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Typography Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TypeIcon className="w-4 h-4" />
                Typography
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                <Select
                  value={localTheme.fontFamily}
                  onValueChange={(value) => setLocalTheme({ ...localTheme, fontFamily: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system-ui">System UI</SelectItem>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                    <SelectItem value="Georgia">Georgia (Serif)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Page Background */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Page Background</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={localTheme.pageBackground}
                    onChange={(e) => setLocalTheme({ ...localTheme, pageBackground: e.target.value })}
                    className="h-10 w-20 rounded border cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={localTheme.pageBackground}
                    onChange={(e) => setLocalTheme({ ...localTheme, pageBackground: e.target.value })}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>
            
            {/* Button Styles */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Button Styles</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setLocalTheme({ ...localTheme, buttonStyle: 'default' })}
                      className={cn(
                        "p-3 border-2 rounded-lg transition-all",
                        localTheme.buttonStyle === 'default' 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="h-8 bg-blue-600 rounded-md" />
                      <p className="text-xs mt-2">Default</p>
                    </button>
                    <button
                      onClick={() => setLocalTheme({ ...localTheme, buttonStyle: 'rounded' })}
                      className={cn(
                        "p-3 border-2 rounded-lg transition-all",
                        localTheme.buttonStyle === 'rounded' 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="h-8 bg-blue-600 rounded-full" />
                      <p className="text-xs mt-2">Rounded</p>
                    </button>
                    <button
                      onClick={() => setLocalTheme({ ...localTheme, buttonStyle: 'sharp' })}
                      className={cn(
                        "p-3 border-2 rounded-lg transition-all",
                        localTheme.buttonStyle === 'sharp' 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="h-8 bg-blue-600" />
                      <p className="text-xs mt-2">Sharp</p>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localTheme.buttonColor}
                      onChange={(e) => setLocalTheme({ ...localTheme, buttonColor: e.target.value })}
                      className="h-10 w-20 rounded border cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={localTheme.buttonColor}
                      onChange={(e) => setLocalTheme({ ...localTheme, buttonColor: e.target.value })}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Preview Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Preview</h3>
              <div 
                className="p-6 rounded-lg border"
                style={{ 
                  backgroundColor: localTheme.pageBackground,
                  fontFamily: localTheme.fontFamily 
                }}
              >
                <h4 
                  className="text-2xl font-bold mb-2"
                  style={{ color: localTheme.primaryColor }}
                >
                  Sample Heading
                </h4>
                <p className="mb-4">This is how your checkout page will look with these theme settings.</p>
                <button
                  className="px-6 py-3 text-white font-semibold"
                  style={{
                    backgroundColor: localTheme.buttonColor,
                    borderRadius: localTheme.buttonStyle === 'rounded' ? '9999px' : localTheme.buttonStyle === 'sharp' ? '0' : '0.5rem'
                  }}
                >
                  Sample Button
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 flex-shrink-0 w-full">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApply}>
            Apply Theme
          </Button>
        </div>
      </div>
    </div>
  )
}