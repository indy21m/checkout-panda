'use client'

import { motion } from 'framer-motion'
import { X, Command } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import type { Shortcut } from '@/hooks/use-keyboard-shortcuts'

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shortcuts: Shortcut[]
}

const CATEGORY_LABELS = {
  editing: 'Editing',
  navigation: 'Navigation',
  view: 'View',
  file: 'File',
} as const

const MODIFIER_SYMBOLS = {
  cmd: '⌘',
  shift: '⇧',
  alt: '⌥',
} as const

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
  shortcuts,
}: KeyboardShortcutsDialogProps) {
  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = []
      }
      acc[shortcut.category]!.push(shortcut)
      return acc
    },
    {} as Record<string, Shortcut[]>
  )

  const formatKey = (key: string) => {
    // Special key formatting
    const specialKeys: Record<string, string> = {
      ArrowUp: '↑',
      ArrowDown: '↓',
      ArrowLeft: '←',
      ArrowRight: '→',
      Delete: 'Del',
      Backspace: '⌫',
      ' ': 'Space',
    }
    return specialKeys[key] || key.toUpperCase()
  }

  const formatModifier = (modifier?: string) => {
    if (!modifier) return ''

    return modifier
      .split('+')
      .map((mod) => MODIFIER_SYMBOLS[mod as keyof typeof MODIFIER_SYMBOLS] || mod)
      .join('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Command className="h-5 w-5 text-purple-600" />
            </div>
            <DialogTitle className="text-xl font-semibold">Keyboard Shortcuts</DialogTitle>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto py-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase">
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <motion.div
                    key={`${shortcut.action}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.modifier && (
                        <kbd className="inline-flex min-w-[24px] items-center justify-center rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                          {formatModifier(shortcut.modifier)}
                        </kbd>
                      )}
                      <kbd className="inline-flex min-w-[24px] items-center justify-center rounded border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                        {formatKey(shortcut.key)}
                      </kbd>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="rounded-lg bg-purple-50 p-4">
            <h4 className="mb-2 text-sm font-semibold text-purple-900">Pro Tips</h4>
            <ul className="space-y-1 text-sm text-purple-700">
              <li>• Hold Space to pan the canvas while dragging</li>
              <li>• Use ⌘K to open quick search (coming soon)</li>
              <li>• Shortcuts work globally unless you&apos;re typing in an input</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
