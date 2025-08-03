'use client'

import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import { Button } from '@/components/ui/button'
import { Minimize2, Grid3X3 } from 'lucide-react'
import type { GridConfig } from '@/types/builder'

interface GridEditorProps {
  gridConfig: GridConfig
  currentBreakpoint: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  onChange: (config: GridConfig) => void
  onClose?: () => void
}

interface ColumnHandle {
  index: number
  position: number
}

export function GridEditor({ gridConfig, currentBreakpoint, onChange, onClose }: GridEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedHandle, setDraggedHandle] = useState<ColumnHandle | null>(null)
  const [columnWidths, setColumnWidths] = useState<number[]>([])

  const columns = gridConfig.columns[currentBreakpoint] || gridConfig.columns.base || 12
  const gap = gridConfig.gap[currentBreakpoint] || gridConfig.gap.base || '1rem'

  // Initialize column widths
  useEffect(() => {
    const widths = Array(columns).fill(100 / columns)
    setColumnWidths(widths)
  }, [columns])

  // Convert gap to pixels for calculations
  const gapInPixels = gap.includes('rem') ? parseFloat(gap) * 16 : parseFloat(gap)

  const handleMouseDown = (index: number, event: React.MouseEvent) => {
    event.preventDefault()
    setIsDragging(true)
    setDraggedHandle({ index, position: event.clientX })
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging || !draggedHandle || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width
    const mouseX = event.clientX - containerRect.left
    const percentX = (mouseX / containerWidth) * 100

    // Update column widths
    const newWidths = [...columnWidths]
    // const totalWidth = newWidths.reduce((sum, w) => sum + w, 0)
    const currentWidth = newWidths.slice(0, draggedHandle.index + 1).reduce((sum, w) => sum + w, 0)
    const nextWidth = newWidths[draggedHandle.index + 1]

    if (nextWidth !== undefined) {
      const diff = percentX - currentWidth
      const minWidth = 100 / columns / 2 // Minimum column width

      if (newWidths[draggedHandle.index]! + diff >= minWidth && nextWidth - diff >= minWidth) {
        newWidths[draggedHandle.index] = newWidths[draggedHandle.index]! + diff
        newWidths[draggedHandle.index + 1] = nextWidth - diff
        setColumnWidths(newWidths)
      }
    }
  }

  const handleMouseUp = () => {
    if (isDragging) {
      // Convert widths to column spans (12-column system)
      const spans = columnWidths.map((width) => Math.round((width / 100) * 12))

      // Ensure spans add up to 12
      const totalSpans = spans.reduce((sum, s) => sum + s, 0)
      if (totalSpans !== 12) {
        spans[spans.length - 1] = spans[spans.length - 1]! + (12 - totalSpans)
      }

      // Update grid config
      onChange({
        ...gridConfig,
        columns: {
          ...gridConfig.columns,
          [currentBreakpoint]: columns,
        },
      })
    }

    setIsDragging(false)
    setDraggedHandle(null)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, draggedHandle, columnWidths])

  const updateColumns = (newColumns: number) => {
    onChange({
      ...gridConfig,
      columns: {
        ...gridConfig.columns,
        [currentBreakpoint]: newColumns,
      },
    })
  }

  const updateGap = (newGap: string) => {
    onChange({
      ...gridConfig,
      gap: {
        ...gridConfig.gap,
        [currentBreakpoint]: newGap,
      },
    })
  }

  const presetLayouts = [
    { name: 'Single Column', columns: 1, icon: '□' },
    { name: 'Two Columns', columns: 2, icon: '□□' },
    { name: 'Three Columns', columns: 3, icon: '□□□' },
    { name: 'Four Columns', columns: 4, icon: '□□□□' },
    { name: 'Sidebar Left', columns: 3, widths: [25, 75], icon: '▮□' },
    { name: 'Sidebar Right', columns: 3, widths: [75, 25], icon: '□▮' },
    { name: 'Three Equal', columns: 3, widths: [33.33, 33.33, 33.34], icon: '|||' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
    >
      <GlassmorphicCard className="max-h-[80vh] w-full max-w-4xl overflow-hidden" variant="light">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Grid3X3 className="h-5 w-5" />
            Grid Layout Editor
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6 p-6">
          {/* Preset Layouts */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-gray-600">Quick Layouts</h4>
            <div className="grid grid-cols-4 gap-2">
              {presetLayouts.map((layout) => (
                <motion.button
                  key={layout.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    updateColumns(layout.columns)
                    if (layout.widths) {
                      setColumnWidths(layout.widths)
                    }
                  }}
                  className={cn(
                    'rounded-lg border-2 p-3 transition-all',
                    columns === layout.columns
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <div className="mb-1 text-2xl">{layout.icon}</div>
                  <div className="text-xs">{layout.name}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Visual Grid Editor */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-gray-600">Visual Editor</h4>
            <div
              ref={containerRef}
              className="relative h-32 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 p-2 select-none"
              style={{ cursor: isDragging ? 'col-resize' : 'default' }}
            >
              <div className="flex h-full" style={{ gap: `${gapInPixels}px` }}>
                {columnWidths.map((width, index) => (
                  <div key={index} className="relative" style={{ width: `${width}%` }}>
                    <motion.div
                      className="flex h-full items-center justify-center rounded-md border-2 border-blue-300 bg-gradient-to-br from-blue-100 to-blue-200"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="text-sm font-medium text-blue-700">
                        {Math.round((width / 100) * 12)}/12
                      </span>
                    </motion.div>

                    {/* Column resize handle */}
                    {index < columnWidths.length - 1 && (
                      <div
                        className={cn(
                          'absolute top-0 -right-2 z-10 h-full w-4 cursor-col-resize',
                          'hover:bg-primary/20 rounded transition-colors'
                        )}
                        onMouseDown={(e) => handleMouseDown(index, e)}
                      >
                        <div className="bg-primary/40 absolute top-1/2 left-1/2 h-8 w-0.5 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Grid overlay */}
              <div className="pointer-events-none absolute inset-0">
                <div className="grid h-full grid-cols-12 gap-1 opacity-20">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="border-l border-gray-400 first:border-l-0" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Grid Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">Columns</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 6, 12].map((col) => (
                  <Button
                    key={col}
                    variant={columns === col ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => updateColumns(col)}
                  >
                    {col}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-600">Gap</label>
              <div className="flex gap-2">
                {['0', '0.5rem', '1rem', '1.5rem', '2rem'].map((g) => (
                  <Button
                    key={g}
                    variant={gap === g ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => updateGap(g)}
                  >
                    {g === '0' ? 'None' : g}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Responsive Preview */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-gray-600">Responsive Behavior</h4>
            <div className="grid grid-cols-6 gap-2 text-center">
              {(['base', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((bp) => (
                <div
                  key={bp}
                  className={cn(
                    'rounded-lg border-2 p-2 transition-all',
                    currentBreakpoint === bp
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  <div className="mb-1 text-xs font-medium text-gray-600">{bp}</div>
                  <div className="text-sm font-semibold">
                    {gridConfig.columns[bp] || gridConfig.columns.base || 12}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassmorphicCard>
    </motion.div>
  )
}
