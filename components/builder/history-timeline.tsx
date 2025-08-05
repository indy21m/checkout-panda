'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Undo2,
  Redo2,
  Plus,
  Move,
  Trash2,
  Edit3,
  Copy,
  Layers,
  Type,
  Image,
  Grid,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBuilderStore } from '@/stores/builder-store'
import { Button } from '@/components/ui/button'
import type { HistoryState } from '@/stores/builder-store'

interface HistoryTimelineProps {
  maxItems?: number
}

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  add: Plus,
  move: Move,
  delete: Trash2,
  edit: Edit3,
  copy: Copy,
  reorder: Layers,
  text: Type,
  image: Image,
  layout: Grid,
  settings: Settings,
}

const ACTION_COLORS: Record<string, string> = {
  add: 'text-green-600 bg-green-100',
  move: 'text-blue-600 bg-blue-100',
  delete: 'text-red-600 bg-red-100',
  edit: 'text-purple-600 bg-purple-100',
  copy: 'text-orange-600 bg-orange-100',
  reorder: 'text-indigo-600 bg-indigo-100',
  default: 'text-gray-600 bg-gray-100',
}

export function HistoryTimeline({ maxItems = 10 }: HistoryTimelineProps) {
  const { history, undo, redo, jumpToHistory } = useBuilderStore()

  // Get visible history items
  const allHistory = [...history.past, history.present, ...history.future].filter(Boolean)
  const currentIndex = history.past.length
  const visibleHistory = allHistory.slice(
    Math.max(0, currentIndex - Math.floor(maxItems / 2)),
    currentIndex + Math.ceil(maxItems / 2)
  )

  const getActionDetails = (action: HistoryState) => {
    // Parse action type and get icon/color
    const actionType = action?.type?.split('_')[0] || 'default'
    const Icon = ACTION_ICONS[actionType] || Edit3
    const colorClass = ACTION_COLORS[actionType] || ACTION_COLORS.default

    return { Icon, colorClass, actionType }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">History Timeline</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            disabled={history.past.length === 0}
            className="h-7 w-7"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            disabled={history.future.length === 0}
            className="h-7 w-7"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200" />

        {/* Timeline items */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {visibleHistory.map((item, index) => {
              const globalIndex = allHistory.indexOf(item)
              const isActive = globalIndex === currentIndex
              const isFuture = globalIndex > currentIndex
              const { Icon, colorClass } = item
                ? getActionDetails(item)
                : { Icon: Edit3, colorClass: ACTION_COLORS.default }

              return (
                <motion.div
                  key={item?.timestamp || index}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: isFuture ? 0.5 : 1,
                    x: 0,
                    scale: isActive ? 1.05 : 1,
                  }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ x: 4 }}
                  className={cn(
                    'group relative flex cursor-pointer items-center gap-3',
                    isActive && 'z-10'
                  )}
                  onClick={() => jumpToHistory(globalIndex)}
                >
                  {/* Timeline dot */}
                  <motion.div
                    className={cn(
                      'relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all',
                      isActive
                        ? 'shadow-md ring-4 ring-purple-100'
                        : 'group-hover:ring-2 group-hover:ring-gray-100',
                      colorClass
                    )}
                    animate={{
                      scale: isActive ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                      duration: 0.3,
                      repeat: isActive ? Infinity : 0,
                      repeatDelay: 2,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </motion.div>

                  {/* Content */}
                  <div
                    className={cn(
                      'flex-1 rounded-lg border p-3 transition-all',
                      isActive
                        ? 'border-purple-200 bg-purple-50 shadow-sm'
                        : isFuture
                          ? 'border-gray-100 bg-gray-50/50'
                          : 'border-gray-200 bg-white group-hover:border-gray-300 group-hover:shadow-sm'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p
                          className={cn(
                            'text-sm font-medium',
                            isActive ? 'text-purple-900' : 'text-gray-700'
                          )}
                        >
                          {item?.description || 'Unknown action'}
                        </p>
                        <p
                          className={cn('text-xs', isActive ? 'text-purple-600' : 'text-gray-500')}
                        >
                          {formatTime(item?.timestamp || Date.now())}
                        </p>
                      </div>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-600"
                        >
                          Current
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Show more indicators */}
        {history.past.length > Math.floor(maxItems / 2) && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              {history.past.length - Math.floor(maxItems / 2)} more in history
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
