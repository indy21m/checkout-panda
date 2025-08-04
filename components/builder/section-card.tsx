'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Copy,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Grid3X3,
  Palette,
  Layers,
  Plus,
  Settings,
  Move,
} from 'lucide-react'
import type { Section } from '@/types/builder'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  section: Section
  index: number
  totalSections: number
  isSelected: boolean
  isCollapsed: boolean
  onSelect: () => void
  onToggleCollapse: () => void
  onUpdateName: (name: string) => void
  onMove: (direction: 'up' | 'down') => void
  onToggleVisibility: () => void
  onDuplicate: () => void
  onDelete: () => void
  onAddColumn: () => void
}

export function SectionCard({
  section,
  index,
  totalSections,
  isSelected,
  isCollapsed,
  onSelect,
  onToggleCollapse,
  onUpdateName,
  onMove,
  onToggleVisibility,
  onDuplicate,
  onDelete,
  onAddColumn,
}: SectionCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => {
        setIsHovered(true)
        setShowActions(true)
      }}
      onHoverEnd={() => {
        setIsHovered(false)
        // Delay hiding actions for smoother transition
        setTimeout(() => setShowActions(false), 200)
      }}
    >
      <GlassmorphicCard
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          isSelected
            ? 'shadow-lg ring-2 shadow-purple-500/20 ring-purple-500 ring-offset-2'
            : 'hover:shadow-lg'
        )}
        variant="light"
        blur="sm"
        onClick={onSelect}
      >
        {/* Animated gradient border on hover */}
        <AnimatePresence>
          {isHovered && !isSelected && (
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-xl opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute inset-0 rounded-xl"
                animate={{
                  background: [
                    'linear-gradient(45deg, #3b82f6, #8b5cf6)',
                    'linear-gradient(180deg, #8b5cf6, #ec4899)',
                    'linear-gradient(270deg, #ec4899, #3b82f6)',
                    'linear-gradient(360deg, #3b82f6, #8b5cf6)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ padding: '2px' }}
              >
                <div className="absolute inset-[2px] rounded-xl bg-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-gray-200 p-3">
          <div className="flex flex-1 items-center gap-2">
            {/* Collapse/Expand Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                onToggleCollapse()
              }}
              className="rounded p-1 transition-colors hover:bg-gray-100"
            >
              <motion.div
                animate={{ rotate: isCollapsed ? 0 : 180 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronUp className="h-4 w-4" />
              </motion.div>
            </motion.button>

            {/* Section Icon with animation */}
            <motion.div
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Layers className="h-4 w-4 text-purple-600" />
            </motion.div>

            {/* Section Name Input */}
            <Input
              value={section.name || `Section ${index + 1}`}
              onChange={(e) => onUpdateName(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="h-7 border-0 bg-transparent text-sm font-medium transition-all hover:bg-gray-50 focus:border-gray-300 focus:bg-white"
              placeholder="Section name"
            />
          </div>

          {/* Action Buttons with stagger animation */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                className="flex items-center gap-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Move Controls */}
                <div className="flex flex-col">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onMove('up')
                    }}
                    disabled={index === 0}
                    className="rounded p-0.5 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onMove('down')
                    }}
                    disabled={index === totalSections - 1}
                    className="rounded p-0.5 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </motion.button>
                </div>

                {/* Visibility Toggle */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleVisibility()
                  }}
                  className="rounded p-1 transition-colors hover:bg-gray-100"
                >
                  {section.visibility?.desktop === false ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </motion.button>

                {/* Duplicate */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicate()
                  }}
                  className="rounded p-1 transition-colors hover:bg-gray-100"
                >
                  <Copy className="h-4 w-4" />
                </motion.button>

                {/* Settings */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    // Open settings panel
                  }}
                  className="rounded p-1 transition-colors hover:bg-gray-100"
                >
                  <Settings className="h-4 w-4" />
                </motion.button>

                {/* Delete */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  className="rounded p-1 text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section Content Preview */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 p-3">
                {/* Section Settings Summary with fade-in */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-4 text-xs text-gray-600"
                >
                  <div className="flex items-center gap-1">
                    <Grid3X3 className="h-3 w-3" />
                    <span>{section.settings.grid.columns.base || 12} columns</span>
                  </div>
                  {section.settings.fullWidth && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                      className="font-medium text-purple-600"
                    >
                      Full Width
                    </motion.span>
                  )}
                  {section.settings.background && (
                    <div className="flex items-center gap-1">
                      <Palette className="h-3 w-3" />
                      <span>Custom Background</span>
                    </div>
                  )}
                </motion.div>

                {/* Columns Preview with stagger animation */}
                <motion.div
                  className="grid h-16 grid-cols-12 gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {section.columns.map((column, colIndex) => {
                    const span = column.span.base || 12
                    return (
                      <motion.div
                        key={column.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 * colIndex }}
                        whileHover={{ scale: 1.05 }}
                        className={cn(
                          'flex cursor-pointer items-center justify-center rounded bg-gradient-to-br from-purple-100 to-pink-100 text-xs text-gray-600 transition-all hover:from-purple-200 hover:to-pink-200'
                        )}
                        style={{
                          gridColumn: `span ${Math.min(span, 12)} / span ${Math.min(span, 12)}`,
                        }}
                      >
                        {column.blocks.length}
                      </motion.div>
                    )
                  })}
                </motion.div>

                {/* Add Column Button with hover animation */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    className="group w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddColumn()
                    }}
                  >
                    <motion.div
                      className="mr-1"
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Plus className="h-3 w-3" />
                    </motion.div>
                    Add Column
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag handle indicator */}
        <motion.div
          className="absolute top-1/2 left-0 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
          animate={{ x: isHovered ? 0 : -10 }}
        >
          <Move className="h-4 w-4 text-gray-400" />
        </motion.div>
      </GlassmorphicCard>
    </motion.div>
  )
}
