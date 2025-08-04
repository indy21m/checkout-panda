'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Grid3X3,
  Columns,
  Square,
  LayoutGrid,
  Maximize,
  AlignCenter,
  AlignLeft,
  AlignRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Section } from '@/types/builder'

interface LayoutControlsProps {
  section: Section
  onChange: (updates: Partial<Section>) => void
  currentBreakpoint: string
}

const LAYOUT_PRESETS = [
  {
    id: '1col',
    name: 'Single',
    columns: [12],
    icon: Square,
    description: 'Full width single column',
  },
  {
    id: '2col',
    name: '2 Equal',
    columns: [6, 6],
    icon: Columns,
    description: 'Two equal columns',
  },
  {
    id: '3col',
    name: '3 Equal',
    columns: [4, 4, 4],
    icon: Grid3X3,
    description: 'Three equal columns',
  },
  {
    id: '2col-left',
    name: '2/3 + 1/3',
    columns: [8, 4],
    icon: AlignLeft,
    description: 'Wider left column',
  },
  {
    id: '2col-right',
    name: '1/3 + 2/3',
    columns: [4, 8],
    icon: AlignRight,
    description: 'Wider right column',
  },
  {
    id: '3col-center',
    name: 'Center Focus',
    columns: [3, 6, 3],
    icon: AlignCenter,
    description: 'Wide center with sidebars',
  },
  {
    id: '4col',
    name: '4 Equal',
    columns: [3, 3, 3, 3],
    icon: LayoutGrid,
    description: 'Four equal columns',
  },
  {
    id: 'custom',
    name: 'Custom',
    columns: 'custom',
    icon: Maximize,
    description: 'Create custom grid',
  },
]

export function LayoutControls({ section, onChange, currentBreakpoint }: LayoutControlsProps) {
  const [showCustomGrid, setShowCustomGrid] = useState(false)
  const [customColumns, setCustomColumns] = useState('1fr 1fr')
  const [customRows, setCustomRows] = useState('auto')

  const currentGap = section.settings.grid?.gap?.[currentBreakpoint as keyof typeof section.settings.grid.gap] || '1rem'

  const handlePresetSelect = (preset: (typeof LAYOUT_PRESETS)[0]) => {
    if (preset.id === 'custom') {
      setShowCustomGrid(true)
      return
    }

    // Update section with new column layout
    const newColumns = section.columns.slice()

    // Adjust number of columns to match preset
    if (Array.isArray(preset.columns)) {
      // Remove extra columns or add new ones
      while (newColumns.length > preset.columns.length) {
        newColumns.pop()
      }

      while (newColumns.length < preset.columns.length) {
        const spanValue = preset.columns[newColumns.length]
        if (spanValue !== undefined) {
          newColumns.push({
            id: `column-${Date.now()}-${newColumns.length}`,
            type: 'column',
            span: { [currentBreakpoint]: spanValue },
            blocks: [],
            settings: {},
          })
        }
      }

      // Update column spans
      preset.columns.forEach((span, index) => {
        const column = newColumns[index]
        if (column) {
          column.span = {
            ...column.span,
            [currentBreakpoint]: span,
          }
        }
      })

      onChange({
        columns: newColumns,
        settings: {
          ...section.settings,
          grid: {
            ...section.settings.grid,
            columns: {
              ...section.settings.grid?.columns,
              [currentBreakpoint]: 12,
            },
          },
        },
      })
    }
  }

  const handleGapChange = (value: number[]) => {
    const firstValue = value[0]
    if (firstValue === undefined) return
    const gap = `${firstValue / 4}rem`
    onChange({
      settings: {
        ...section.settings,
        grid: {
          ...section.settings.grid,
          gap: {
            ...section.settings.grid?.gap,
            [currentBreakpoint]: gap,
          },
        },
      },
    })
  }

  const applyCustomGrid = () => {
    onChange({
      settings: {
        ...section.settings,
        grid: {
          ...section.settings.grid,
          customTemplate: {
            columns: customColumns,
            rows: customRows,
          },
        },
      },
    })
    setShowCustomGrid(false)
  }

  return (
    <div className="space-y-6">
      {/* Layout Presets */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Layout Template</Label>
        <div className="grid grid-cols-4 gap-2">
          {LAYOUT_PRESETS.map((preset) => {
            const Icon = preset.icon
            const isActive = false // TODO: Check if current layout matches preset

            return (
              <motion.button
                key={preset.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePresetSelect(preset)}
                className={cn(
                  'group relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all',
                  isActive
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                {/* Visual Preview */}
                <div className="relative h-12 w-full">
                  <div className="absolute inset-0 grid gap-0.5">
                    {Array.isArray(preset.columns) ? (
                      preset.columns.map((span, i) => (
                        <div
                          key={i}
                          className={cn(
                            'rounded bg-gradient-to-br',
                            isActive
                              ? 'from-purple-400 to-purple-500'
                              : 'from-gray-300 to-gray-400 group-hover:from-gray-400 group-hover:to-gray-500'
                          )}
                          style={{
                            gridColumn: `span ${span}`,
                          }}
                        />
                      ))
                    ) : (
                      <div className="flex h-full items-center justify-center rounded border-2 border-dashed border-gray-300">
                        <Icon className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Label */}
                <span className="text-xs font-medium">{preset.name}</span>

                {/* Tooltip */}
                <motion.div
                  className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 group-hover:opacity-100"
                  initial={{ y: 5 }}
                  whileHover={{ y: 0 }}
                >
                  {preset.description}
                  <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900" />
                </motion.div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Gap Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Column Gap</Label>
          <span className="text-sm text-gray-500">{currentGap}</span>
        </div>
        <Slider
          value={[parseFloat(currentGap) * 4]}
          onValueChange={handleGapChange}
          min={0}
          max={16}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0</span>
          <span>1rem</span>
          <span>2rem</span>
          <span>3rem</span>
          <span>4rem</span>
        </div>
      </div>

      {/* Full Width Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
        <div>
          <Label className="text-sm font-medium">Full Width Section</Label>
          <p className="text-xs text-gray-500">Extend to viewport edges</p>
        </div>
        <Button
          variant={section.settings.fullWidth ? 'primary' : 'secondary'}
          size="sm"
          onClick={() =>
            onChange({
              settings: {
                ...section.settings,
                fullWidth: !section.settings.fullWidth,
              },
            })
          }
        >
          {section.settings.fullWidth ? 'Enabled' : 'Disabled'}
        </Button>
      </div>

      {/* Custom Grid Builder */}
      <AnimatePresence>
        {showCustomGrid && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 rounded-lg bg-gray-50 p-4">
              <h4 className="font-medium">Custom Grid Template</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="columns" className="text-sm">
                    Columns
                  </Label>
                  <Input
                    id="columns"
                    value={customColumns}
                    onChange={(e) => setCustomColumns(e.target.value)}
                    placeholder="1fr 300px 1fr"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">Use fr, px, %, or auto</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rows" className="text-sm">
                    Rows
                  </Label>
                  <Input
                    id="rows"
                    value={customRows}
                    onChange={(e) => setCustomRows(e.target.value)}
                    placeholder="auto"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500">Usually &quot;auto&quot; works best</p>
                </div>
              </div>

              {/* Visual Preview */}
              <div className="space-y-2">
                <Label className="text-sm">Preview</Label>
                <div
                  className="h-32 rounded border border-gray-300 bg-white p-2"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: customColumns,
                    gridTemplateRows: customRows,
                    gap: currentGap,
                  }}
                >
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center rounded bg-gradient-to-br from-purple-100 to-purple-200 text-xs text-purple-700"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCustomGrid(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={applyCustomGrid} className="flex-1">
                  Apply Grid
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
