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
  Smartphone, Monitor, Loader2, Sparkles, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SaveIndicator } from '@/components/ui/save-indicator'
import { 
  CanvasBlock, 
  blockTemplates,
  type Block, 
  type BlockType,
  type HeaderBlockData,
  type ProductBlockData
} from '@/components/builder/checkout-blocks'
import { useSimplifiedBuilderStore } from '@/stores/simplified-builder-store'

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
      <CanvasBlock
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

// Properties Panel
function PropertiesPanel({ 
  block, 
  onUpdate, 
  onClose 
}: {
  block: Block | null
  onUpdate: (updates: Partial<Block>) => void
  onClose: () => void
}) {
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

      <div className="flex-1 overflow-y-auto p-4">
        <BlockEditor block={block} updateData={updateData} />
      </div>
    </div>
  )
}

// Block Editor Components
function BlockEditor({ block, updateData }: { block: Block; updateData: (updates: Partial<Block['data']>) => void }) {
  switch (block.type) {
    case 'header':
      const headerData = block.data as HeaderBlockData
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={headerData.title}
              onChange={(e) => updateData({ title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter checkout title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input
              type="text"
              value={headerData.subtitle}
              onChange={(e) => updateData({ subtitle: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional subtitle"
            />
          </div>
        </div>
      )

    case 'product':
      const productData = block.data as ProductBlockData
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              type="text"
              value={productData.name}
              onChange={(e) => updateData({ name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={productData.description}
              onChange={(e) => updateData({ description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="text"
                value={productData.price}
                onChange={(e) => updateData({ price: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Compare Price</label>
              <input
                type="text"
                value={productData.comparePrice || ''}
                onChange={(e) => updateData({ comparePrice: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={productData.type}
              onChange={(e) => updateData({ type: e.target.value as 'onetime' | 'subscription' | 'payment-plan' })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="onetime">One-time</option>
              <option value="subscription">Subscription</option>
              <option value="payment-plan">Payment Plan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Features (one per line)</label>
            <textarea
              value={productData.features.join('\n')}
              onChange={(e) => updateData({ features: e.target.value.split('\n').filter(f => f.trim()) })}
              className="w-full px-3 py-2 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

// Main Builder Component
export default function SimplifiedBuilderPage() {
  const params = useParams()
  const checkoutId = params?.id as string
  
  const [sidebarOpen] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [activeView, setActiveView] = useState<'desktop' | 'mobile'>('desktop')
  
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
  
  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id)
      const newIndex = blocks.findIndex(b => b.id === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderBlocks(oldIndex, newIndex)
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
                      <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                        <Plus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-500 font-medium">Start by adding blocks</p>
                        <p className="text-sm text-gray-400 mt-1">Choose from the library on the left</p>
                      </div>
                    ) : (
                      <>
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div className="text-xs text-gray-500 font-medium mb-2">Left Column</div>
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
                        </div>
                        
                        {/* Right Column */}
                        <div className="space-y-4">
                          <div className="text-xs text-gray-500 font-medium mb-2">Right Column</div>
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
                        </div>
                      </>
                    )}
                  </div>
                </SortableContext>
                <DndDragOverlay>
                  {/* Drag overlay content */}
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
            />
          </div>
        )}
      </div>
    </div>
  )
}