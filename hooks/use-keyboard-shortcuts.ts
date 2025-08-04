import { useEffect, useState, useCallback } from 'react'
import { useBuilderStore } from '@/stores/builder-store'
import { toast } from 'sonner'

export interface Shortcut {
  key: string
  action: string
  description: string
  category: 'editing' | 'navigation' | 'view' | 'file'
  modifier?: 'cmd' | 'shift' | 'alt' | 'cmd+shift'
}

const SHORTCUTS: Shortcut[] = [
  // Editing shortcuts
  { key: 'z', modifier: 'cmd', action: 'undo', description: 'Undo', category: 'editing' },
  { key: 'z', modifier: 'cmd+shift', action: 'redo', description: 'Redo', category: 'editing' },
  { key: 'c', modifier: 'cmd', action: 'copy', description: 'Copy', category: 'editing' },
  { key: 'v', modifier: 'cmd', action: 'paste', description: 'Paste', category: 'editing' },
  { key: 'x', modifier: 'cmd', action: 'cut', description: 'Cut', category: 'editing' },
  { key: 'd', modifier: 'cmd', action: 'duplicate', description: 'Duplicate', category: 'editing' },
  { key: 'Delete', action: 'delete', description: 'Delete', category: 'editing' },
  { key: 'Backspace', action: 'delete', description: 'Delete', category: 'editing' },
  {
    key: 'a',
    modifier: 'cmd',
    action: 'selectAll',
    description: 'Select all',
    category: 'editing',
  },

  // File shortcuts
  { key: 's', modifier: 'cmd', action: 'save', description: 'Save', category: 'file' },
  { key: 's', modifier: 'cmd+shift', action: 'publish', description: 'Publish', category: 'file' },
  { key: 'o', modifier: 'cmd', action: 'open', description: 'Open', category: 'file' },
  { key: 'n', modifier: 'cmd', action: 'new', description: 'New section', category: 'file' },

  // Navigation shortcuts
  {
    key: 'k',
    modifier: 'cmd',
    action: 'quickSearch',
    description: 'Quick search',
    category: 'navigation',
  },
  { key: 'p', modifier: 'cmd', action: 'preview', description: 'Preview', category: 'navigation' },
  {
    key: 'b',
    modifier: 'cmd',
    action: 'toggleSidebar',
    description: 'Toggle sidebar',
    category: 'navigation',
  },
  { key: 'ArrowUp', action: 'moveUp', description: 'Move up', category: 'navigation' },
  { key: 'ArrowDown', action: 'moveDown', description: 'Move down', category: 'navigation' },
  { key: 'ArrowLeft', action: 'moveLeft', description: 'Move left', category: 'navigation' },
  { key: 'ArrowRight', action: 'moveRight', description: 'Move right', category: 'navigation' },

  // View shortcuts
  { key: '0', modifier: 'cmd', action: 'zoomReset', description: 'Reset zoom', category: 'view' },
  { key: '+', modifier: 'cmd', action: 'zoomIn', description: 'Zoom in', category: 'view' },
  { key: '-', modifier: 'cmd', action: 'zoomOut', description: 'Zoom out', category: 'view' },
  { key: 'g', modifier: 'cmd', action: 'toggleGrid', description: 'Toggle grid', category: 'view' },
  {
    key: 'r',
    modifier: 'cmd',
    action: 'toggleRulers',
    description: 'Toggle rulers',
    category: 'view',
  },
  {
    key: '/',
    modifier: 'cmd',
    action: 'toggleHelp',
    description: 'Show shortcuts',
    category: 'view',
  },
  { key: ' ', action: 'pan', description: 'Pan canvas (hold)', category: 'view' },
]

export function useKeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false)
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())
  const [isPanning, setIsPanning] = useState(false)

  const {
    undo,
    redo,
    copy,
    cut,
    paste,
    deleteSection,
    selectedIds,
    clearSelection,
    toggleGrid,
    addSection,
  } = useBuilderStore()

  const executeAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'undo':
          undo()
          break
        case 'redo':
          redo()
          break
        case 'copy':
          copy()
          toast.success('Copied to clipboard')
          break
        case 'cut':
          cut()
          toast.success('Cut to clipboard')
          break
        case 'paste':
          paste()
          break
        case 'duplicate':
          if (selectedIds.length > 0) {
            copy()
            paste()
            toast.success('Duplicated')
          }
          break
        case 'delete':
          if (selectedIds.length > 0) {
            selectedIds.forEach((id) => deleteSection(id))
            clearSelection()
            toast.success('Deleted')
          }
          break
        case 'selectAll':
          // TODO: Implement select all
          break
        case 'save':
          // Trigger save through DOM event
          window.dispatchEvent(new CustomEvent('builder:save'))
          break
        case 'publish':
          // Trigger publish through DOM event
          window.dispatchEvent(new CustomEvent('builder:publish'))
          break
        case 'new':
          const newSection = {
            id: `section-${Date.now()}`,
            type: 'section' as const,
            name: 'New Section',
            columns: [
              {
                id: `column-${Date.now()}`,
                type: 'column' as const,
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
          toast.success('Added new section')
          break
        case 'preview':
          // Open preview in new tab
          window.dispatchEvent(new CustomEvent('builder:preview'))
          break
        case 'toggleSidebar':
          window.dispatchEvent(new CustomEvent('builder:toggleSidebar'))
          break
        case 'toggleGrid':
          toggleGrid()
          break
        case 'toggleHelp':
          setShowHelp(!showHelp)
          break
        case 'pan':
          setIsPanning(true)
          break
        case 'quickSearch':
          window.dispatchEvent(new CustomEvent('builder:quickSearch'))
          break
        case 'zoomIn':
          window.dispatchEvent(new CustomEvent('builder:zoomIn'))
          break
        case 'zoomOut':
          window.dispatchEvent(new CustomEvent('builder:zoomOut'))
          break
        case 'zoomReset':
          window.dispatchEvent(new CustomEvent('builder:zoomReset'))
          break
        default:
          console.log('Unknown action:', action)
      }
    },
    [
      selectedIds,
      undo,
      redo,
      copy,
      cut,
      paste,
      deleteSection,
      clearSelection,
      toggleGrid,
      addSection,
      showHelp,
    ]
  )

  const getKeyCombo = useCallback((e: KeyboardEvent): string | null => {
    const key = e.key
    const modifiers = []

    if (e.metaKey || e.ctrlKey) modifiers.push('cmd')
    if (e.shiftKey) modifiers.push('shift')
    if (e.altKey) modifiers.push('alt')

    const modifier = modifiers.join('+')

    // Find matching shortcut
    const shortcut = SHORTCUTS.find((s) => {
      if (s.key !== key) return false

      if (!s.modifier && modifiers.length === 0) return true
      if (s.modifier === modifier) return true

      return false
    })

    return shortcut ? shortcut.action : null
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return
      }

      const action = getKeyCombo(e)
      if (action) {
        e.preventDefault()
        executeAction(action)
      }

      // Track active keys for combinations
      setActiveKeys((prev) => new Set([...prev, e.key]))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setActiveKeys((prev) => {
        const next = new Set(prev)
        next.delete(e.key)
        return next
      })

      // Stop panning when space is released
      if (e.key === ' ') {
        setIsPanning(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [getKeyCombo, executeAction])

  // Reset active keys on window blur
  useEffect(() => {
    const handleBlur = () => {
      setActiveKeys(new Set())
      setIsPanning(false)
    }

    window.addEventListener('blur', handleBlur)
    return () => window.removeEventListener('blur', handleBlur)
  }, [])

  return {
    shortcuts: SHORTCUTS,
    showHelp,
    setShowHelp,
    activeKeys,
    isPanning,
    executeAction,
  }
}
