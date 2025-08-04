'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useBuilderStore } from '@/stores/builder-store'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Layers,
} from 'lucide-react'
import type { Section } from '@/types/builder'
import { SectionCard } from './section-card'

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
            <SectionCard
              key={section.id}
              section={section}
              index={index}
              totalSections={sections.length}
              isSelected={isSelected}
              isCollapsed={isCollapsed}
              onSelect={() => onSelectSection(section.id)}
              onToggleCollapse={() => toggleCollapse(section.id)}
              onUpdateName={(name) => updateSection(section.id, { name })}
              onMove={(direction) => moveSection(section.id, direction)}
              onToggleVisibility={() => {
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
              onDuplicate={() => handleDuplicateSection(section)}
              onDelete={() => deleteSection(section.id)}
              onAddColumn={() => {
                addColumn(section.id, {
                  id: `column-${Date.now()}`,
                  type: 'column',
                  span: { base: 12 },
                  blocks: [],
                  settings: {},
                })
              }}
            />
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
