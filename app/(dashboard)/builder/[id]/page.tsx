'use client'

import { useEffect, useCallback, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Save,
  Eye,
  Rocket,
  ArrowLeft,
  Loader2,
  Undo,
  Redo,
  Smartphone,
  Tablet,
  Monitor,
  Grid3X3,
  Command,
} from 'lucide-react'
import Link from 'next/link'
import { EnhancedCanvas } from '@/components/builder/enhanced-canvas'
import { EnhancedBlockLibrary } from '@/components/builder/enhanced-block-library'
import { EnhancedPropertiesPanel } from '@/components/builder/enhanced-properties-panel'
import { SectionManager } from '@/components/builder/section-manager'
import { GridEditor } from '@/components/builder/grid-editor'
import { useBuilderStore } from '@/stores/builder-store'
import { DndContext, closestCenter, DragOverlay as DndDragOverlay } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent, DragMoveEvent } from '@dnd-kit/core'
import { DragOverlay } from '@/components/builder/drag-overlay'
import debounce from 'lodash.debounce'
import { cn } from '@/lib/utils'
import type { Section } from '@/types/builder'
import { motion, AnimatePresence } from 'framer-motion'

import { SaveIndicator, type SaveStatus } from '@/components/ui/save-indicator'
import { SuccessCelebration } from '@/components/ui/success-celebration'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useSmartGuides } from '@/hooks/use-smart-guides'
import { SmartGuides } from '@/components/builder/smart-guides'
import { KeyboardShortcutsDialog } from '@/components/builder/keyboard-shortcuts-dialog'

export default function EnhancedBuilderPage() {
  const params = useParams()
  const checkoutId = params?.id as string
  const [showGridEditor, setShowGridEditor] = useState(false)
  const [activePanel, setActivePanel] = useState<'blocks' | 'sections'>('blocks')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Zustand store - using all enhanced features
  const {
    blocks,
    sections,
    canvasSettings,
    hasUnsavedChanges,
    selectedIds,
    selectedType,
    currentBreakpoint,
    history,
    setBlocks,
    setHasUnsavedChanges,
    resetBuilder,
    migrateFromLegacyBlocks,
    addSection,
    reorderSections,
    addBlockToColumn,
    selectElement,
    undo,
    redo,
    setBreakpoint,
    updateCanvasSettings,
    toggleGrid,
    showGrid,
  } = useBuilderStore()

  // Enhanced keyboard shortcuts
  const { shortcuts, showHelp, setShowHelp, isPanning } = useKeyboardShortcuts()

  // Smart guides for alignment
  const { guides, onDragStart, onDragMove, onDragEnd } = useSmartGuides()

  // Fetch checkout data
  const { data: checkout, isLoading } = api.checkout.getById.useQuery({ id: checkoutId })

  // Save mutation
  const saveCheckout = api.checkout.savePageData.useMutation({
    onMutate: () => {
      setSaveStatus('saving')
    },
    onSuccess: (data) => {
      setHasUnsavedChanges(false)
      setSaveStatus('saved')
      setLastSaved(new Date())

      if (data?.status === 'published') {
        setShowSuccessCelebration(true)
        toast.success('Checkout published successfully!')
      } else {
        toast.success('Checkout saved!')
      }
    },
    onError: (error) => {
      setSaveStatus('error')
      toast.error(error.message)
    },
  })

  // Load checkout data into store
  useEffect(() => {
    if (checkout?.pageData) {
      // Check if we have legacy blocks or new sections structure
      if ('sections' in checkout.pageData && checkout.pageData.sections) {
        // New structure
        // TODO: Set sections from pageData
      } else if ('blocks' in checkout.pageData && checkout.pageData.blocks) {
        // Legacy structure - migrate
        setBlocks(checkout.pageData.blocks || [])
        migrateFromLegacyBlocks(checkout.pageData.blocks || [])
      }

      const settings = checkout.pageData.settings || {}
      updateCanvasSettings({
        ...settings,
        theme: (settings.theme as 'light' | 'dark' | 'auto') || 'light',
      })
      setHasUnsavedChanges(false)
    }
  }, [checkout, setBlocks, updateCanvasSettings, setHasUnsavedChanges, migrateFromLegacyBlocks])

  const handleSave = useCallback(
    (publish = false) => {
      const pageData = {
        sections,
        blocks, // Keep for backward compatibility
        settings: canvasSettings,
      }

      saveCheckout.mutate({
        id: checkoutId,
        pageData,
        publish,
      })
    },
    [sections, blocks, canvasSettings, checkoutId, saveCheckout]
  )

  // Auto-save functionality
  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        if (hasUnsavedChanges && !saveCheckout.isPending) {
          handleSave(false)
        }
      }, 5000),
    [hasUnsavedChanges, saveCheckout.isPending, handleSave]
  )

  useEffect(() => {
    if (hasUnsavedChanges) {
      debouncedSave()
    }
    return () => {
      debouncedSave.cancel()
    }
  }, [hasUnsavedChanges, debouncedSave])

  // Reset save status to idle after showing saved
  useEffect(() => {
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => setSaveStatus('idle'), 3000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [saveStatus])

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true)
    // Start smart guides tracking if dragging a section
    if (event.active.data.current?.type === 'section') {
      const element = document.getElementById(String(event.active.id))
      if (element) {
        onDragStart(String(event.active.id), element.getBoundingClientRect())
      }
    }
  }

  const handleDragMove = (event: DragMoveEvent) => {
    // Update smart guides during drag
    if (event.active.data.current?.type === 'section' && event.delta) {
      const element = document.getElementById(String(event.active.id))
      if (element) {
        const rect = element.getBoundingClientRect()
        const newBounds = new DOMRect(
          rect.x + event.delta.x,
          rect.y + event.delta.y,
          rect.width,
          rect.height
        )
        onDragMove(newBounds)
        // TODO: Apply snap points if available
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false)
    onDragEnd()

    const { active, over } = event

    if (over && active.id !== over.id) {
      if (active.data.current?.type === 'section') {
        reorderSections(active.id as string, over.id as string)
      } else if (active.data.current?.type === 'new-block') {
        // Handle new block being dropped into a column
        const columnId = over.id as string
        const blockType = active.data.current.blockType as string

        // Get default block data based on type
        const getDefaultBlockData = (type: string) => {
          switch (type) {
            case 'hero':
              return {
                headline: 'Welcome to Our Checkout',
                subheadline: 'Complete your purchase in just a few steps',
                backgroundType: 'gradient',
                gradient: { type: 'aurora', animate: true },
              }
            case 'product':
              return {
                layout: 'side-by-side',
                showImage: true,
                showFeatures: true,
                showPlans: false,
              }
            case 'payment':
              return {
                showExpressCheckout: true,
                fields: ['email', 'card'],
              }
            case 'bump':
              return {
                style: 'highlighted',
                animation: 'pulse',
              }
            case 'testimonial':
              return {
                layout: 'carousel',
                autoplay: true,
              }
            case 'trust':
              return {
                badges: ['secure', 'guarantee', 'support'],
              }
            default:
              return {}
          }
        }

        const newBlock = {
          id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: blockType,
          data: getDefaultBlockData(blockType),
          styles: {
            padding: '1rem',
            className: '',
          },
          position: 0,
        }

        addBlockToColumn(columnId, newBlock)
      }
      // Handle other drag types
    }
  }

  // Listen for custom events from keyboard shortcuts
  useEffect(() => {
    const handleSaveEvent = () => handleSave(false)
    const handlePublishEvent = () => handleSave(true)
    const handlePreview = () => window.open(`/c/${checkout?.slug}`, '_blank')
    const handleToggleSidebar = () => {
      // TODO: Implement sidebar toggle
    }
    const handleQuickSearch = () => {
      // TODO: Implement quick search
    }
    const handleZoomIn = () => {
      // TODO: Implement zoom in
    }
    const handleZoomOut = () => {
      // TODO: Implement zoom out
    }
    const handleZoomReset = () => {
      // TODO: Implement zoom reset
    }

    window.addEventListener('builder:save', handleSaveEvent)
    window.addEventListener('builder:publish', handlePublishEvent)
    window.addEventListener('builder:preview', handlePreview)
    window.addEventListener('builder:toggleSidebar', handleToggleSidebar)
    window.addEventListener('builder:quickSearch', handleQuickSearch)
    window.addEventListener('builder:zoomIn', handleZoomIn)
    window.addEventListener('builder:zoomOut', handleZoomOut)
    window.addEventListener('builder:zoomReset', handleZoomReset)

    return () => {
      window.removeEventListener('builder:save', handleSaveEvent)
      window.removeEventListener('builder:publish', handlePublishEvent)
      window.removeEventListener('builder:preview', handlePreview)
      window.removeEventListener('builder:toggleSidebar', handleToggleSidebar)
      window.removeEventListener('builder:quickSearch', handleQuickSearch)
      window.removeEventListener('builder:zoomIn', handleZoomIn)
      window.removeEventListener('builder:zoomOut', handleZoomOut)
      window.removeEventListener('builder:zoomReset', handleZoomReset)
    }
  }, [handleSave, checkout])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetBuilder()
    }
  }, [resetBuilder])

  const handleAddSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type: 'section',
      name: 'New Section',
      columns: [
        {
          id: `column-${Date.now()}`,
          type: 'column',
          span: { base: 12 },
          blocks: [],
          settings: {},
        },
      ],
      settings: {
        fullWidth: false,
        grid: {
          columns: { base: 12 },
          gap: { base: '1rem' },
        },
      },
    }
    addSection(newSection)
    selectElement(newSection.id, 'section')
  }

  const breakpoints = [
    { id: 'base', label: 'Mobile', icon: Smartphone, width: '375px' },
    { id: 'sm', label: 'Small', icon: Smartphone, width: '640px' },
    { id: 'md', label: 'Tablet', icon: Tablet, width: '768px' },
    { id: 'lg', label: 'Desktop', icon: Monitor, width: '1024px' },
    { id: 'xl', label: 'Wide', icon: Monitor, width: '1280px' },
    { id: '2xl', label: 'Ultra', icon: Monitor, width: '1536px' },
  ] as const

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-text-secondary">Loading enhanced builder...</p>
        </div>
      </div>
    )
  }

  if (!checkout) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <p className="text-danger text-xl font-semibold">Checkout not found</p>
        <Link href="/checkouts" className="mt-4">
          <Button variant="secondary">Back to Checkouts</Button>
        </Link>
      </div>
    )
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <DndDragOverlay>
        <DragOverlay />
      </DndDragOverlay>
      <div className="flex h-screen flex-col bg-gray-50">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
          <div className="flex items-center gap-4">
            <Link href="/checkouts">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-text text-xl font-semibold">{checkout.name}</h1>
              <div className="flex items-center gap-3 text-sm">
                <SaveIndicator status={saveStatus} lastSaved={lastSaved} />
                {history.past.length > 0 && (
                  <span className="text-text-tertiary">
                    • {history.past.length} action{history.past.length > 1 ? 's' : ''} to undo
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Breakpoint Selector */}
          <div className="flex items-center gap-2 border-x border-gray-200 px-4">
            {breakpoints.map((bp) => {
              const Icon = bp.icon
              return (
                <motion.button
                  key={bp.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setBreakpoint(bp.id)}
                  className={cn(
                    'rounded-lg p-2 transition-all',
                    currentBreakpoint === bp.id
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                  title={`${bp.label} (${bp.width})`}
                >
                  <Icon className="h-4 w-4" />
                </motion.button>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            {/* History Controls */}
            <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
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
            </div>

            {/* Grid Editor */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowGridEditor(true)}
              title="Grid Layout"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>

            {/* Toggle Grid */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleGrid()}
              title="Toggle Grid (⌘G)"
            >
              <Grid3X3 className={cn('h-4 w-4', showGrid && 'text-primary')} />
            </Button>

            {/* Keyboard Shortcuts */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHelp(true)}
              title="Keyboard Shortcuts (⌘/)"
            >
              <Command className="h-4 w-4" />
            </Button>

            {/* Save/Preview/Publish */}
            <Button
              variant="ghost"
              onClick={() => handleSave()}
              disabled={!hasUnsavedChanges || saveCheckout.isPending}
            >
              {saveCheckout.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
            <a href={`/c/${checkout.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </a>
            <Button
              variant="primary"
              onClick={() => handleSave(true)}
              disabled={saveCheckout.isPending}
            >
              {saveCheckout.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="mr-2 h-4 w-4" />
              )}
              Publish
            </Button>
          </div>
        </div>

        {/* Enhanced Builder Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Block Library / Section Manager */}
          <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-white/60 backdrop-blur-sm">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActivePanel('blocks')}
                className={cn(
                  'flex-1 px-4 py-2 text-sm font-medium transition-all',
                  activePanel === 'blocks'
                    ? 'text-primary border-primary border-b-2 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Blocks
              </button>
              <button
                onClick={() => setActivePanel('sections')}
                className={cn(
                  'flex-1 px-4 py-2 text-sm font-medium transition-all',
                  activePanel === 'sections'
                    ? 'text-primary border-primary border-b-2 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                Sections
              </button>
            </div>
            <div className="h-[calc(100%-48px)] overflow-y-auto">
              {activePanel === 'blocks' ? (
                <EnhancedBlockLibrary />
              ) : (
                <div className="p-4">
                  <SectionManager
                    sections={sections}
                    selectedIds={selectedIds}
                    onSelectSection={(id) => selectElement(id, 'section')}
                    onAddSection={handleAddSection}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Canvas */}
          <div className="relative flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <EnhancedCanvas />
            {/* Smart Guides Overlay */}
            {isDragging && guides.length > 0 && <SmartGuides guides={guides} />}
            {/* Panning Overlay */}
            {isPanning && (
              <div className="pointer-events-none absolute inset-0 z-50 cursor-move">
                <div className="absolute inset-0 bg-purple-500/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-900/90 px-3 py-1.5 text-sm font-medium text-white">
                  Panning Mode
                </div>
              </div>
            )}
          </div>

          {/* Properties Panel */}
          <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-white/60 backdrop-blur-sm">
            <EnhancedPropertiesPanel />
          </div>
        </div>

        {/* Grid Editor Modal */}
        <AnimatePresence>
          {showGridEditor && selectedIds.length > 0 && selectedType === 'section' && (
            <GridEditor
              gridConfig={
                sections.find((s) => s.id === selectedIds[0])?.settings.grid || {
                  columns: { base: 12 },
                  gap: { base: '1rem' },
                }
              }
              currentBreakpoint={currentBreakpoint}
              onChange={() => {
                // Update section grid config
              }}
              onClose={() => setShowGridEditor(false)}
            />
          )}
        </AnimatePresence>

        {/* Success Celebration */}
        <SuccessCelebration
          show={showSuccessCelebration}
          message="Checkout Published! 🎉"
          onComplete={() => setShowSuccessCelebration(false)}
        />

        {/* Keyboard Shortcuts Dialog */}
        <KeyboardShortcutsDialog open={showHelp} onOpenChange={setShowHelp} shortcuts={shortcuts} />
      </div>
    </DndContext>
  )
}
