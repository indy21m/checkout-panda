'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useBuilderStore } from '@/stores/builder-store'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Layers,
  Grid3X3,
  Palette,
} from 'lucide-react'
import type { Section } from '@/types/builder'
import { cn } from '@/lib/utils'

interface SectionManagerProps {
  sections: Section[]
  selectedIds: string[]
  onSelectSection: (id: string) => void
  onAddSection: () => void
}

export function SectionManager({
  sections,
  selectedIds,
  onSelectSection,
  onAddSection,
}: SectionManagerProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const { updateSection, deleteSection, reorderSections, addColumn, selectElement, copy, paste } =
    useBuilderStore()

  const toggleCollapse = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections)
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId)
    } else {
      newCollapsed.add(sectionId)
    }
    setCollapsedSections(newCollapsed)
  }

  const handleDuplicateSection = (section: Section) => {
    selectElement(section.id, 'section')
    copy()
    paste()
  }

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex((s) => s.id === sectionId)
    if (currentIndex === -1) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= sections.length) return

    const targetSection = sections[targetIndex]
    if (targetSection) {
      reorderSections(sectionId, targetSection.id)
    }
  }

  // const getSectionBackground = (section: Section) => {
  //   const bg = section.settings.background
  //   if (!bg) return 'transparent'

  //   switch (bg.type) {
  //     case 'color':
  //       return bg.value
  //     case 'gradient':
  //       return bg.value
  //     case 'image':
  //       return `url(${bg.value})`
  //     default:
  //       return 'transparent'
  //   }
  // }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Layers className="h-4 w-4" />
          Sections ({sections.length})
        </h3>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="primary" size="sm" onClick={onAddSection}>
            <Plus className="mr-1 h-3 w-3" />
            Add Section
          </Button>
        </motion.div>
      </div>

      {/* Sections List */}
      <AnimatePresence>
        {sections.map((section, index) => {
          const isSelected = selectedIds.includes(section.id)
          const isCollapsed = collapsedSections.has(section.id)

          return (
            <motion.div
              key={section.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <GlassmorphicCard
                className={cn(
                  'overflow-hidden transition-all duration-200',
                  isSelected && 'ring-primary ring-2 ring-offset-2'
                )}
                variant="light"
                hover
                onClick={() => onSelectSection(section.id)}
              >
                {/* Section Header */}
                <div className="flex items-center justify-between border-b border-gray-200 p-3">
                  <div className="flex flex-1 items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleCollapse(section.id)
                      }}
                      className="rounded p-1 transition-colors hover:bg-gray-100"
                    >
                      {isCollapsed ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </button>

                    <Input
                      value={section.name || `Section ${index + 1}`}
                      onChange={(e) => updateSection(section.id, { name: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="h-7 border-0 bg-transparent text-sm font-medium transition-all hover:bg-gray-50 focus:border-gray-300 focus:bg-white"
                      placeholder="Section name"
                    />
                  </div>

                  {/* Section Actions */}
                  <div className="flex items-center gap-1">
                    {/* Move Up/Down */}
                    <div className="flex flex-col">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          moveSection(section.id, 'up')
                        }}
                        disabled={index === 0}
                        className="rounded p-0.5 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          moveSection(section.id, 'down')
                        }}
                        disabled={index === sections.length - 1}
                        className="rounded p-0.5 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Visibility Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const visibility = section.visibility || {
                          desktop: true,
                          tablet: true,
                          mobile: true,
                        }
                        updateSection(section.id, {
                          visibility: {
                            ...visibility,
                            desktop: !visibility.desktop,
                          },
                        })
                      }}
                      className="rounded p-1 transition-colors hover:bg-gray-100"
                    >
                      {section.visibility?.desktop === false ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDuplicateSection(section)
                      }}
                      className="rounded p-1 transition-colors hover:bg-gray-100"
                    >
                      <Copy className="h-4 w-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSection(section.id)
                      }}
                      className="rounded p-1 text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Section Preview (when not collapsed) */}
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 p-3">
                      {/* Section Settings Summary */}
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Grid3X3 className="h-3 w-3" />
                          <span>{section.settings.grid.columns.base || 12} columns</span>
                        </div>
                        {section.settings.fullWidth && (
                          <span className="text-primary">Full Width</span>
                        )}
                        {section.settings.background && (
                          <div className="flex items-center gap-1">
                            <Palette className="h-3 w-3" />
                            <span>Custom Background</span>
                          </div>
                        )}
                      </div>

                      {/* Columns Preview */}
                      <div className="grid h-16 grid-cols-12 gap-1">
                        {section.columns.map((column) => {
                          const span = column.span.base || 12
                          return (
                            <div
                              key={column.id}
                              className={cn(
                                'flex items-center justify-center rounded bg-gradient-to-br from-gray-100 to-gray-200 text-xs text-gray-600',
                                `col-span-${Math.min(span, 12)}`
                              )}
                              style={{
                                gridColumn: `span ${Math.min(span, 12)} / span ${Math.min(span, 12)}`,
                              }}
                            >
                              {column.blocks.length} blocks
                            </div>
                          )
                        })}
                      </div>

                      {/* Add Column Button */}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          addColumn(section.id, {
                            id: `column-${Date.now()}`,
                            type: 'column',
                            span: { base: 12 },
                            blocks: [],
                            settings: {},
                          })
                        }}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add Column
                      </Button>
                    </div>
                  </motion.div>
                )}
              </GlassmorphicCard>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Empty State */}
      {sections.length === 0 && (
        <div className="px-4 py-8 text-center">
          <Layers className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="mb-4 text-sm text-gray-500">No sections yet. Start building your layout!</p>
          <Button variant="primary" onClick={onAddSection}>
            <Plus className="mr-2 h-4 w-4" />
            Add First Section
          </Button>
        </div>
      )}
    </div>
  )
}
