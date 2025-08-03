'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Grid3X3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBuilderStore } from '@/stores/builder-store'
import { cn } from '@/lib/utils'
import { SectionRenderer } from './section-renderer'
import type { Section } from '@/types/builder'

export function EnhancedCanvas() {
  const {
    sections,
    selectedIds,
    selectedType,
    showGrid,
    currentBreakpoint,
    addSection,
    selectElement,
    toggleGrid,
  } = useBuilderStore()

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-droppable',
    data: {
      accepts: ['new-block', 'section'],
    },
  })

  const handleAddFirstSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type: 'section',
      name: 'Hero Section',
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

  // Grid overlay component
  const GridOverlay = () => {
    if (!showGrid) return null

    return (
      <div className="pointer-events-none absolute inset-0 z-10">
        <div
          className="mx-auto h-full"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 7px,
                rgba(59, 130, 246, 0.1) 7px,
                rgba(59, 130, 246, 0.1) 8px
              ),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 7px,
                rgba(59, 130, 246, 0.1) 7px,
                rgba(59, 130, 246, 0.1) 8px
              )
            `,
            backgroundSize: '8px 8px',
          }}
        />
      </div>
    )
  }

  const breakpointWidths = {
    base: '100%',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }

  return (
    <div className="relative h-full overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant={showGrid ? 'primary' : 'ghost'} size="sm" onClick={toggleGrid}>
              <Grid3X3 className="mr-1 h-4 w-4" />
              Grid
            </Button>
            <div className="text-sm text-gray-600">
              Breakpoint: <span className="font-medium">{currentBreakpoint}</span>
            </div>
          </div>
          <div className="text-sm text-gray-600">{sections.length} sections</div>
        </div>
      </div>

      {/* Canvas Content */}
      <div
        ref={setNodeRef}
        className={cn(
          'relative min-h-[calc(100vh-60px)] transition-all duration-300',
          isOver && 'bg-primary/5 scale-[1.01]'
        )}
      >
        <div
          className="mx-auto transition-all duration-300"
          style={{
            maxWidth: breakpointWidths[currentBreakpoint],
            padding: '2rem',
          }}
        >
          <GridOverlay />

          {sections.length === 0 ? (
            <div className="flex min-h-[600px] items-center justify-center">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <div className="from-primary/20 to-secondary/20 mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br">
                    <Grid3X3 className="text-primary h-12 w-12" />
                  </div>
                </motion.div>
                <h3 className="text-text mb-2 text-2xl font-semibold">Start Building Your Page</h3>
                <p className="text-text-secondary mx-auto mb-6 max-w-md">
                  Create stunning layouts with our advanced grid system and drag-and-drop blocks
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleAddFirstSection}
                    variant="primary"
                    size="lg"
                    className="shadow-lg transition-all duration-200 hover:shadow-xl"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add First Section
                  </Button>
                </motion.div>
              </div>
            </div>
          ) : (
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-6">
                <AnimatePresence>
                  {sections.map((section) => (
                    <SectionRenderer
                      key={section.id}
                      section={section}
                      isSelected={selectedIds.includes(section.id) && selectedType === 'section'}
                      currentBreakpoint={currentBreakpoint}
                    />
                  ))}
                </AnimatePresence>

                {/* Add Section Button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="pt-8 pb-16 text-center"
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => {
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
                    }}
                    className="shadow-md transition-all duration-200 hover:shadow-lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Section
                  </Button>
                </motion.div>
              </div>
            </SortableContext>
          )}
        </div>
      </div>
    </div>
  )
}
