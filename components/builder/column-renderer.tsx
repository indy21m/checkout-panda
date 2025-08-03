'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useBuilderStore } from '@/stores/builder-store'
import { EnhancedBlockRenderer } from './enhanced-block-renderer'
import type { Column } from '@/types/builder'
import { Plus, Settings, Trash2 } from 'lucide-react'

interface ColumnRendererProps {
  column: Column
  sectionId: string
  currentBreakpoint: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  isSelected: boolean
}

export function ColumnRenderer({ 
  column, 
  currentBreakpoint, 
}: ColumnRendererProps) {
  const { 
    selectedIds, 
    selectedType,
    selectElement, 
    deleteColumn,
    addBlockToColumn,
  } = useBuilderStore()
  
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      accepts: ['block', 'new-block'],
    },
  })

  // Get responsive values
  const getResponsiveValue = <T,>(values: Record<string, T> | { base?: T; sm?: T; md?: T; lg?: T; xl?: T; '2xl'?: T } | undefined, defaultValue: T): T => {
    if (!values) return defaultValue
    if ('base' in values || 'sm' in values || 'md' in values || 'lg' in values || 'xl' in values || '2xl' in values) {
      return (values as Record<string, T>)[currentBreakpoint] || (values as { base?: T }).base || defaultValue
    }
    return (values as Record<string, T>)[currentBreakpoint] || defaultValue
  }

  const span = getResponsiveValue(column.span, 12)
  const offset = getResponsiveValue(column.offset, 0)
  const padding = getResponsiveValue(column.settings.padding, '1rem')

  const handleAddBlock = () => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type: 'hero',
      data: {
        headline: 'New Block',
        subheadline: 'Click to edit this block',
      },
      styles: {},
      position: column.blocks.length,
    }
    addBlockToColumn(column.id, newBlock)
  }

  const isColumnSelected = selectedIds.includes(column.id) && selectedType === 'column'

  return (
    <motion.div
      ref={setNodeRef}
      className={cn(
        'group relative min-h-[100px] transition-all duration-200',
        isOver && 'bg-primary/5 scale-[1.02]',
        isColumnSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      style={{
        gridColumn: `span ${span} / span ${span}`,
        gridColumnStart: offset > 0 ? offset + 1 : undefined,
        padding: padding,
        backgroundColor: column.settings.background,
        borderRadius: column.settings.borderRadius,
        border: column.settings.border,
        minHeight: getResponsiveValue(column.settings.minHeight, '100px') as string,
      }}
      onClick={(e) => {
        e.stopPropagation()
        selectElement(column.id, 'column')
      }}
    >
      {/* Column Controls (shown on hover) */}
      <div className="absolute top-1 right-1 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Settings */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            // Open column settings
          }}
          className="p-1 bg-white/90 backdrop-blur-sm rounded shadow-sm hover:bg-white transition-colors"
        >
          <Settings className="h-3 w-3 text-gray-600" />
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            deleteColumn(column.id)
          }}
          className="p-1 bg-red-50/90 backdrop-blur-sm rounded shadow-sm hover:bg-red-100 transition-colors"
        >
          <Trash2 className="h-3 w-3 text-red-600" />
        </button>
      </div>

      {/* Column Content */}
      {column.blocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[100px] p-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation()
              handleAddBlock()
            }}
            className="flex flex-col items-center gap-2 p-4 w-full max-w-xs border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
          >
            <Plus className="h-6 w-6 text-gray-400" />
            <span className="text-sm text-gray-500">Add Block</span>
          </motion.button>
        </div>
      ) : (
        <SortableContext 
          items={column.blocks.map((b) => b.id)} 
          strategy={verticalListSortingStrategy}
        >
          <div className={cn(
            'space-y-3',
            column.settings.verticalAlign === 'middle' && 'flex flex-col justify-center',
            column.settings.verticalAlign === 'bottom' && 'flex flex-col justify-end'
          )}>
            {column.blocks.map((block) => (
              <EnhancedBlockRenderer
                key={block.id}
                block={block}
                columnId={column.id}
                isSelected={selectedIds.includes(block.id) && selectedType === 'block'}
              />
            ))}

            {/* Add block button at bottom */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation()
                handleAddBlock()
              }}
              className="w-full py-2 border border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all opacity-0 group-hover:opacity-100"
            >
              <Plus className="h-4 w-4 mx-auto text-gray-400" />
            </motion.button>
          </div>
        </SortableContext>
      )}
    </motion.div>
  )
}