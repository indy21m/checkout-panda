'use client'

import React, { useEffect, useCallback, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/trpc/client'
import { toast } from 'sonner'
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
  ArrowLeft, Save, Eye, Rocket, Undo, Redo, Plus, 
  Smartphone, Monitor, Loader2, Sparkles, X, Palette,
  Type as TypeIcon, Layers
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
  type ProductBlockData
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
  canMoveDown
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
    <div ref={setNodeRef} style={style} className="w-full">
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

    // Add more block type editors...
    default:
      return <div className="text-gray-500">Editor for {block.type} coming soon...</div>
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
              value={styles.shadow || ''}
              onValueChange={(value) => updateStyles({ shadow: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
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
    isPreviewMode,
    isSaving,
    addBlock,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    moveBlock,
    toggleBlockVisibility,
    toggleBlockColumn,
    reorderBlocks,
    selectBlock,
    undo,
    redo,
    setBlocks,
    setHasUnsavedChanges,
    setPreviewMode,
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
    onSuccess: () => {
      setHasUnsavedChanges(false)
      setSaveStatus('saved')
      setLastSaved(new Date())
      setSaving(false)
      toast.success('Changes saved!')
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
        price: `$${(product.price / 100).toFixed(2)}`,
        comparePrice: undefined, // Product type doesn't have this field
        type: product.isRecurring ? 'subscription' : 'onetime',
        features: product.features || [],
        imageUrl: product.thumbnail || undefined,
        badge: undefined, // Product type doesn't have this field
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
    
    // Handle dropping on column drop zones
    if (overId === 'left-column' || overId === 'right-column') {
      const column = overId === 'left-column' ? 'left' : 'right'
      const block = blocks.find(b => b.id === activeId)
      if (block && block.column !== column) {
        updateBlock(activeId, { column })
      }
      return
    }
    
    // Handle reordering within or between columns
    if (activeId !== overId) {
      const oldIndex = blocks.findIndex(b => b.id === activeId)
      const newIndex = blocks.findIndex(b => b.id === overId)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // Check if we're moving between columns
        const activeBlock = blocks[oldIndex]
        const overBlock = blocks[newIndex]
        
        if (activeBlock && overBlock) {
          // Update column if dropping on a block in a different column
          if (activeBlock.column !== overBlock.column) {
            updateBlock(activeId, { column: overBlock.column })
          }
          
          reorderBlocks(oldIndex, newIndex)
        }
      }
    }
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
            variant="secondary"
            onClick={() => setPreviewMode(!isPreviewMode)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {isPreviewMode ? 'Edit' : 'Preview'}
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
          {sidebarOpen && !isPreviewMode && (
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
          <div className={cn(
            "mx-auto p-8 transition-all",
            activeView === 'mobile' ? "max-w-sm" : "max-w-5xl"
          )}>
            {isPreviewMode ? (
              // Preview Mode
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                {blocks.filter(b => b.visible).map((block) => {
                  const template = blockTemplates[block.type]
                  return (
                    <div key={block.id}>
                      {/* Render preview of each block */}
                      <div className="p-6 border-b">
                        {template ? template.name : `Unknown block: ${block.type}`}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // Edit Mode
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map(b => b.id)}
                  strategy={verticalListSortingStrategy}
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
                            />
                          ))}
                          {leftBlocks.length === 0 && (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400">
                              <p className="text-sm">Drop blocks here</p>
                            </div>
                          )}
                        </ColumnDropZone>
                        
                        {/* Right Column */}
                        <ColumnDropZone id="right-column" title="Right Column">
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
                            />
                          ))}
                          {rightBlocks.length === 0 && (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400">
                              <p className="text-sm">Drop blocks here</p>
                            </div>
                          )}
                        </ColumnDropZone>
                      </>
                    )}
                  </div>
                </SortableContext>
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
            )}
          </div>
        </div>
        
        {/* Properties Panel */}
        {!isPreviewMode && selectedBlock && (
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