'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useBuilderStore } from '@/stores/builder-store'
import { ColumnRenderer } from './column-renderer'
import type { Section } from '@/types/builder'
import { GripVertical, Settings, Trash2, Copy, Eye, EyeOff } from 'lucide-react'

interface SectionRendererProps {
  section: Section
  isSelected: boolean
  currentBreakpoint: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export function SectionRenderer({ section, isSelected, currentBreakpoint }: SectionRendererProps) {
  const { selectElement, deleteSection, copy, paste } = useBuilderStore()
  
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Get responsive values
  const getResponsiveValue = <T,>(values: Record<string, T> | { base?: T; sm?: T; md?: T; lg?: T; xl?: T; '2xl'?: T } | undefined, defaultValue: T): T => {
    if (!values) return defaultValue
    if ('base' in values || 'sm' in values || 'md' in values || 'lg' in values || 'xl' in values || '2xl' in values) {
      return (values as Record<string, T>)[currentBreakpoint] || (values as { base?: T }).base || defaultValue
    }
    return (values as Record<string, T>)[currentBreakpoint] || defaultValue
  }

  const columns = getResponsiveValue(section.settings.grid.columns, 12)
  const gap = getResponsiveValue(section.settings.grid.gap, '1rem')
  const padding = getResponsiveValue(section.settings.padding, '2rem')
  const maxWidth = getResponsiveValue(section.settings.maxWidth, '1280px')

  // Check visibility
  const isVisible = section.visibility?.[currentBreakpoint as keyof typeof section.visibility] !== false

  // Get background styles
  const getBackgroundStyles = () => {
    const bg = section.settings.background
    if (!bg) return {}

    const styles: React.CSSProperties = {}

    switch (bg.type) {
      case 'color':
        styles.backgroundColor = bg.value
        break
      case 'gradient':
        styles.backgroundImage = bg.value
        break
      case 'image':
        styles.backgroundImage = `url(${bg.value})`
        styles.backgroundSize = 'cover'
        styles.backgroundPosition = 'center'
        if (bg.parallax) {
          styles.backgroundAttachment = 'fixed'
        }
        break
      case 'video':
        // Video backgrounds would be handled differently
        break
    }

    if (bg.overlay) {
      styles.position = 'relative'
    }

    return styles
  }

  const handleDuplicate = () => {
    selectElement(section.id, 'section')
    copy()
    paste()
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative',
        isDragging && 'opacity-50',
        !isVisible && 'opacity-30'
      )}
      onClick={() => selectElement(section.id, 'section')}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Section Container */}
      <div
        className={cn(
          'relative overflow-hidden transition-all duration-200',
          isSelected && 'ring-2 ring-primary ring-offset-4',
          section.settings.className
        )}
        style={{
          ...getBackgroundStyles(),
          ...(section.settings.customCss ? { cssText: section.settings.customCss } : {}),
        }}
      >
        {/* Background Overlay */}
        {section.settings.background?.overlay && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: section.settings.background.overlay }}
          />
        )}

        {/* Section Controls (shown on hover) */}
        <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1">
            {/* Drag Handle */}
            <div
              className="flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm cursor-move"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">
                {section.name || 'Section'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Settings */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Open settings panel
              }}
              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-600" />
            </button>

            {/* Visibility Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                // Toggle visibility
              }}
              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
            >
              {isVisible ? (
                <Eye className="h-4 w-4 text-gray-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-600" />
              )}
            </button>

            {/* Duplicate */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDuplicate()
              }}
              className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-colors"
            >
              <Copy className="h-4 w-4 text-gray-600" />
            </button>

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteSection(section.id)
              }}
              className="p-1.5 bg-red-50/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          </div>
        </div>

        {/* Section Content */}
        <div
          className={cn(
            'relative z-0',
            section.settings.fullWidth ? 'w-full' : 'mx-auto'
          )}
          style={{
            maxWidth: section.settings.fullWidth ? '100%' : maxWidth,
            padding,
          }}
        >
          {/* Grid Container */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap,
            }}
          >
            {section.columns.map((column) => (
              <ColumnRenderer
                key={column.id}
                column={column}
                sectionId={section.id}
                currentBreakpoint={currentBreakpoint}
                isSelected={false} // Will be handled by column selection
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}