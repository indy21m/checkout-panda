'use client'

import { useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Save, Eye, Rocket, ArrowLeft, Palette, Code, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { BuilderCanvas } from '@/components/builder/builder-canvas'
import { BlockLibrary } from '@/components/builder/block-library'
import { PropertiesPanel } from '@/components/builder/properties-panel'
import { useBuilderStore } from '@/stores/builder-store'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import debounce from 'lodash.debounce'

export default function BuilderPage() {
  const params = useParams()
  const checkoutId = params?.id as string

  // Zustand store
  const {
    blocks,
    selectedBlockId,
    canvasSettings,
    hasUnsavedChanges,
    setBlocks,
    selectBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    updateCanvasSettings,
    setHasUnsavedChanges,
    resetBuilder,
  } = useBuilderStore()

  // Fetch checkout data
  const { data: checkout, isLoading } = api.checkout.getById.useQuery({ id: checkoutId })

  // Save mutation
  const saveCheckout = api.checkout.savePageData.useMutation({
    onSuccess: (data) => {
      setHasUnsavedChanges(false)
      if (data?.status === 'published') {
        toast.success('Checkout published successfully!')
      } else {
        toast.success('Checkout saved!')
      }
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Load checkout data into store
  useEffect(() => {
    if (checkout?.pageData) {
      setBlocks(checkout.pageData.blocks || [])
      updateCanvasSettings(checkout.pageData.settings || {})
      setHasUnsavedChanges(false)
    }
  }, [checkout, setBlocks, updateCanvasSettings, setHasUnsavedChanges])

  // Auto-save functionality
  const debouncedSave = useMemo(
    () =>
      debounce(() => {
        if (hasUnsavedChanges && !saveCheckout.isPending) {
          handleSave(false)
        }
      }, 5000),
    [hasUnsavedChanges, saveCheckout.isPending]
  )

  useEffect(() => {
    if (hasUnsavedChanges) {
      debouncedSave()
    }
    return () => {
      debouncedSave.cancel()
    }
  }, [hasUnsavedChanges, debouncedSave])

  const handleSave = useCallback(
    (publish = false) => {
      const pageData = {
        blocks: blocks.map((block, index) => ({
          ...block,
          position: index,
        })),
        settings: canvasSettings,
      }

      saveCheckout.mutate({
        id: checkoutId,
        pageData,
        publish,
      })
    },
    [blocks, canvasSettings, checkoutId, saveCheckout]
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      reorderBlocks(active.id as string, over.id as string)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetBuilder()
    }
  }, [resetBuilder])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          <p className="text-gray-400">Loading checkout builder...</p>
        </div>
      </div>
    )
  }

  if (!checkout) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-950">
        <p className="text-xl font-semibold text-red-500">Checkout not found</p>
        <Link href="/checkouts" className="mt-4">
          <Button variant="secondary">Back to Checkouts</Button>
        </Link>
      </div>
    )
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex h-screen flex-col bg-gray-950">
        {/* Header */}
        <div className="border-b border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4">
              <Link href="/checkouts">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-white">{checkout.name}</h1>
                {hasUnsavedChanges && (
                  <p className="text-xs text-gray-400">Unsaved changes</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
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
        </div>

        {/* Builder Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Block Library */}
          <div className="w-80 flex-shrink-0 border-r border-gray-800">
            <BlockLibrary />
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto bg-gray-900">
            <BuilderCanvas />
          </div>

          {/* Properties Panel */}
          <div className="w-80 flex-shrink-0 border-l border-gray-800">
            <PropertiesPanel />
          </div>
        </div>
      </div>
    </DndContext>
  )
}