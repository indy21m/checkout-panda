import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  Section,
  Column,
  EnhancedBlock,
  EnhancedCanvasSettings,
  BuilderElement,
  ClipboardData,
} from '@/types/builder'

// Legacy block type for backward compatibility
export interface Block {
  id: string
  type: string
  data: any
  styles: {
    padding?: string
    className?: string
    minHeight?: string
    [key: string]: any
  }
  position: number
}

// Legacy canvas settings for backward compatibility
export interface CanvasSettings {
  theme: 'light' | 'dark' | 'auto'
  customCss?: string
  seoMeta?: {
    title?: string
    description?: string
    ogImage?: string
  }
}

// History state for undo/redo
interface HistoryState {
  sections: Section[]
  canvasSettings: EnhancedCanvasSettings
}

interface BuilderState {
  // Legacy state (for backward compatibility)
  blocks: Block[]
  selectedBlockId: string | null
  
  // Enhanced state
  sections: Section[]
  selectedIds: string[]
  selectedType: 'section' | 'column' | 'block' | null
  isDragging: boolean
  canvasSettings: EnhancedCanvasSettings
  hasUnsavedChanges: boolean
  
  // History for undo/redo
  history: {
    past: HistoryState[]
    future: HistoryState[]
  }
  
  // Clipboard
  clipboard: ClipboardData | null
  
  // UI state
  showGrid: boolean
  currentBreakpoint: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  
  // Legacy actions (for backward compatibility)
  addBlock: (block: Block) => void
  updateBlock: (blockId: string, updates: Partial<Block>) => void
  deleteBlock: (blockId: string) => void
  reorderBlocks: (activeId: string, overId: string) => void
  selectBlock: (blockId: string | null) => void
  setBlocks: (blocks: Block[]) => void
  
  // Enhanced actions
  addSection: (section: Section, index?: number) => void
  updateSection: (sectionId: string, updates: Partial<Section>) => void
  deleteSection: (sectionId: string) => void
  reorderSections: (activeId: string, overId: string) => void
  
  addColumn: (sectionId: string, column: Column, index?: number) => void
  updateColumn: (columnId: string, updates: Partial<Column>) => void
  deleteColumn: (columnId: string) => void
  reorderColumns: (sectionId: string, activeId: string, overId: string) => void
  
  addBlockToColumn: (columnId: string, block: EnhancedBlock, index?: number) => void
  updateEnhancedBlock: (blockId: string, updates: Partial<EnhancedBlock>) => void
  deleteEnhancedBlock: (blockId: string) => void
  moveBlock: (blockId: string, targetColumnId: string, index: number) => void
  
  // Selection actions
  selectElement: (id: string, type: 'section' | 'column' | 'block') => void
  selectMultiple: (ids: string[], type: 'section' | 'column' | 'block') => void
  clearSelection: () => void
  
  // History actions
  undo: () => void
  redo: () => void
  saveToHistory: () => void
  
  // Clipboard actions
  copy: () => void
  cut: () => void
  paste: (targetId?: string) => void
  
  // UI actions
  setIsDragging: (isDragging: boolean) => void
  updateCanvasSettings: (settings: Partial<EnhancedCanvasSettings>) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
  toggleGrid: () => void
  setBreakpoint: (breakpoint: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl') => void
  resetBuilder: () => void
  
  // Migration helper
  migrateFromLegacyBlocks: (blocks: Block[]) => void
}

const defaultCanvasSettings: EnhancedCanvasSettings = {
  theme: 'light',
  customCss: '',
  seoMeta: {},
  globalAnimations: {
    scrollSmoothing: true,
  },
  grid: {
    show: false,
    size: 8,
    color: 'rgba(0, 0, 0, 0.1)',
    snap: true,
  },
}

const MAX_HISTORY_SIZE = 50

export const useBuilderStore = create<BuilderState>()(
  immer((set, get) => ({
    // Initial state
    blocks: [],
    selectedBlockId: null,
    sections: [],
    selectedIds: [],
    selectedType: null,
    isDragging: false,
    canvasSettings: defaultCanvasSettings,
    hasUnsavedChanges: false,
    history: {
      past: [],
      future: [],
    },
    clipboard: null,
    showGrid: false,
    currentBreakpoint: 'lg',

    // Legacy actions for backward compatibility
    addBlock: (block) =>
      set((state) => {
        state.blocks.push(block)
        state.hasUnsavedChanges = true
      }),

    updateBlock: (blockId, updates) =>
      set((state) => {
        const blockIndex = state.blocks.findIndex((b) => b.id === blockId)
        if (blockIndex !== -1) {
          const currentBlock = state.blocks[blockIndex]
          if (!currentBlock) return

          state.blocks[blockIndex] = {
            id: currentBlock.id,
            type: currentBlock.type,
            data: updates.data !== undefined ? updates.data : currentBlock.data,
            styles: updates.styles !== undefined ? updates.styles : currentBlock.styles,
            position: updates.position !== undefined ? updates.position : currentBlock.position,
          }
          state.hasUnsavedChanges = true
        }
      }),

    deleteBlock: (blockId) =>
      set((state) => {
        state.blocks = state.blocks.filter((b) => b.id !== blockId)
        if (state.selectedBlockId === blockId) {
          state.selectedBlockId = null
        }
        state.hasUnsavedChanges = true
      }),

    reorderBlocks: (activeId, overId) =>
      set((state) => {
        const activeIndex = state.blocks.findIndex((b) => b.id === activeId)
        const overIndex = state.blocks.findIndex((b) => b.id === overId)

        if (activeIndex !== -1 && overIndex !== -1) {
          const [movedBlock] = state.blocks.splice(activeIndex, 1)
          if (movedBlock) {
            state.blocks.splice(overIndex, 0, movedBlock)

            // Update positions
            state.blocks.forEach((block, index) => {
              block.position = index
            })

            state.hasUnsavedChanges = true
          }
        }
      }),

    selectBlock: (blockId) =>
      set((state) => {
        state.selectedBlockId = blockId
      }),

    setBlocks: (blocks) =>
      set((state) => {
        state.blocks = blocks
      }),

    // Enhanced actions
    addSection: (section, index) =>
      set((state) => {
        get().saveToHistory()
        if (index !== undefined) {
          state.sections.splice(index, 0, section)
        } else {
          state.sections.push(section)
        }
        state.hasUnsavedChanges = true
      }),

    updateSection: (sectionId, updates) =>
      set((state) => {
        const section = state.sections.find((s) => s.id === sectionId)
        if (section) {
          Object.assign(section, updates)
          state.hasUnsavedChanges = true
        }
      }),

    deleteSection: (sectionId) =>
      set((state) => {
        get().saveToHistory()
        state.sections = state.sections.filter((s) => s.id !== sectionId)
        state.selectedIds = state.selectedIds.filter((id) => id !== sectionId)
        state.hasUnsavedChanges = true
      }),

    reorderSections: (activeId, overId) =>
      set((state) => {
        const activeIndex = state.sections.findIndex((s) => s.id === activeId)
        const overIndex = state.sections.findIndex((s) => s.id === overId)

        if (activeIndex !== -1 && overIndex !== -1) {
          const [movedSection] = state.sections.splice(activeIndex, 1)
          if (movedSection) {
            state.sections.splice(overIndex, 0, movedSection)
            state.hasUnsavedChanges = true
          }
        }
      }),

    addColumn: (sectionId, column, index) =>
      set((state) => {
        const section = state.sections.find((s) => s.id === sectionId)
        if (section) {
          if (index !== undefined) {
            section.columns.splice(index, 0, column)
          } else {
            section.columns.push(column)
          }
          state.hasUnsavedChanges = true
        }
      }),

    updateColumn: (columnId, updates) =>
      set((state) => {
        for (const section of state.sections) {
          const column = section.columns.find((c) => c.id === columnId)
          if (column) {
            Object.assign(column, updates)
            state.hasUnsavedChanges = true
            break
          }
        }
      }),

    deleteColumn: (columnId) =>
      set((state) => {
        get().saveToHistory()
        for (const section of state.sections) {
          const columnIndex = section.columns.findIndex((c) => c.id === columnId)
          if (columnIndex !== -1) {
            section.columns.splice(columnIndex, 1)
            state.selectedIds = state.selectedIds.filter((id) => id !== columnId)
            state.hasUnsavedChanges = true
            break
          }
        }
      }),

    reorderColumns: (sectionId, activeId, overId) =>
      set((state) => {
        const section = state.sections.find((s) => s.id === sectionId)
        if (section) {
          const activeIndex = section.columns.findIndex((c) => c.id === activeId)
          const overIndex = section.columns.findIndex((c) => c.id === overId)

          if (activeIndex !== -1 && overIndex !== -1) {
            const [movedColumn] = section.columns.splice(activeIndex, 1)
            if (movedColumn) {
              section.columns.splice(overIndex, 0, movedColumn)
              state.hasUnsavedChanges = true
            }
          }
        }
      }),

    addBlockToColumn: (columnId, block, index) =>
      set((state) => {
        for (const section of state.sections) {
          const column = section.columns.find((c) => c.id === columnId)
          if (column) {
            if (index !== undefined) {
              column.blocks.splice(index, 0, block)
            } else {
              column.blocks.push(block)
            }
            state.hasUnsavedChanges = true
            break
          }
        }
      }),

    updateEnhancedBlock: (blockId, updates) =>
      set((state) => {
        for (const section of state.sections) {
          for (const column of section.columns) {
            const block = column.blocks.find((b) => b.id === blockId)
            if (block) {
              Object.assign(block, updates)
              state.hasUnsavedChanges = true
              return
            }
          }
        }
      }),

    deleteEnhancedBlock: (blockId) =>
      set((state) => {
        get().saveToHistory()
        for (const section of state.sections) {
          for (const column of section.columns) {
            const blockIndex = column.blocks.findIndex((b) => b.id === blockId)
            if (blockIndex !== -1) {
              column.blocks.splice(blockIndex, 1)
              state.selectedIds = state.selectedIds.filter((id) => id !== blockId)
              state.hasUnsavedChanges = true
              return
            }
          }
        }
      }),

    moveBlock: (blockId, targetColumnId, index) =>
      set((state) => {
        let block: EnhancedBlock | undefined
        
        // Find and remove block from current location
        for (const section of state.sections) {
          for (const column of section.columns) {
            const blockIndex = column.blocks.findIndex((b) => b.id === blockId)
            if (blockIndex !== -1) {
              block = column.blocks[blockIndex]
              column.blocks.splice(blockIndex, 1)
              break
            }
          }
          if (block) break
        }
        
        // Add block to new location
        if (block) {
          for (const section of state.sections) {
            const column = section.columns.find((c) => c.id === targetColumnId)
            if (column) {
              column.blocks.splice(index, 0, block)
              state.hasUnsavedChanges = true
              break
            }
          }
        }
      }),

    // Selection actions
    selectElement: (id, type) =>
      set((state) => {
        state.selectedIds = [id]
        state.selectedType = type
        // For backward compatibility
        if (type === 'block') {
          state.selectedBlockId = id
        }
      }),

    selectMultiple: (ids, type) =>
      set((state) => {
        state.selectedIds = ids
        state.selectedType = type
      }),

    clearSelection: () =>
      set((state) => {
        state.selectedIds = []
        state.selectedType = null
        state.selectedBlockId = null
      }),

    // History actions
    saveToHistory: () =>
      set((state) => {
        const historyState: HistoryState = {
          sections: JSON.parse(JSON.stringify(state.sections)),
          canvasSettings: JSON.parse(JSON.stringify(state.canvasSettings)),
        }
        
        state.history.past.push(historyState)
        if (state.history.past.length > MAX_HISTORY_SIZE) {
          state.history.past.shift()
        }
        state.history.future = []
      }),

    undo: () =>
      set((state) => {
        if (state.history.past.length === 0) return
        
        const previousState = state.history.past.pop()
        if (previousState) {
          const currentState: HistoryState = {
            sections: JSON.parse(JSON.stringify(state.sections)),
            canvasSettings: JSON.parse(JSON.stringify(state.canvasSettings)),
          }
          
          state.history.future.push(currentState)
          state.sections = previousState.sections
          state.canvasSettings = previousState.canvasSettings
          state.hasUnsavedChanges = true
        }
      }),

    redo: () =>
      set((state) => {
        if (state.history.future.length === 0) return
        
        const nextState = state.history.future.pop()
        if (nextState) {
          const currentState: HistoryState = {
            sections: JSON.parse(JSON.stringify(state.sections)),
            canvasSettings: JSON.parse(JSON.stringify(state.canvasSettings)),
          }
          
          state.history.past.push(currentState)
          state.sections = nextState.sections
          state.canvasSettings = nextState.canvasSettings
          state.hasUnsavedChanges = true
        }
      }),

    // Clipboard actions
    copy: () =>
      set((state) => {
        if (state.selectedIds.length === 0) return
        
        const elements: BuilderElement[] = []
        
        if (state.selectedType === 'section') {
          state.selectedIds.forEach((id) => {
            const section = state.sections.find((s) => s.id === id)
            if (section) {
              elements.push(JSON.parse(JSON.stringify(section)))
            }
          })
        } else if (state.selectedType === 'column') {
          state.sections.forEach((section) => {
            section.columns.forEach((column) => {
              if (state.selectedIds.includes(column.id)) {
                elements.push(JSON.parse(JSON.stringify(column)))
              }
            })
          })
        } else if (state.selectedType === 'block') {
          state.sections.forEach((section) => {
            section.columns.forEach((column) => {
              column.blocks.forEach((block) => {
                if (state.selectedIds.includes(block.id)) {
                  elements.push(JSON.parse(JSON.stringify(block)))
                }
              })
            })
          })
        }
        
        if (elements.length > 0) {
          state.clipboard = {
            type: elements.length === 1 ? state.selectedType! : 'multiple',
            data: elements.length === 1 ? elements[0]! : elements,
          }
        }
      }),

    cut: () => {
      get().copy()
      const { selectedIds, selectedType } = get()
      
      set((state) => {
        get().saveToHistory()
        
        if (selectedType === 'section') {
          state.sections = state.sections.filter((s) => !selectedIds.includes(s.id))
        } else if (selectedType === 'column') {
          state.sections.forEach((section) => {
            section.columns = section.columns.filter((c) => !selectedIds.includes(c.id))
          })
        } else if (selectedType === 'block') {
          state.sections.forEach((section) => {
            section.columns.forEach((column) => {
              column.blocks = column.blocks.filter((b) => !selectedIds.includes(b.id))
            })
          })
        }
        
        state.selectedIds = []
        state.selectedType = null
        state.hasUnsavedChanges = true
      })
    },

    paste: (_targetId) => {
      const { clipboard } = get()
      if (!clipboard) return
      
      set((state) => {
        get().saveToHistory()
        
        // Generate new IDs for pasted elements
        // const generateNewId = (type: string) => `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        // TODO: Implement paste logic based on clipboard type and target
        // This is a complex operation that needs careful handling
        
        state.hasUnsavedChanges = true
      })
    },

    // UI actions
    setIsDragging: (isDragging) =>
      set((state) => {
        state.isDragging = isDragging
      }),

    updateCanvasSettings: (settings) =>
      set((state) => {
        state.canvasSettings = { ...state.canvasSettings, ...settings }
        state.hasUnsavedChanges = true
      }),

    setHasUnsavedChanges: (hasChanges) =>
      set((state) => {
        state.hasUnsavedChanges = hasChanges
      }),

    toggleGrid: () =>
      set((state) => {
        state.showGrid = !state.showGrid
      }),

    setBreakpoint: (breakpoint) =>
      set((state) => {
        state.currentBreakpoint = breakpoint
      }),

    resetBuilder: () =>
      set((state) => {
        state.blocks = []
        state.selectedBlockId = null
        state.sections = []
        state.selectedIds = []
        state.selectedType = null
        state.isDragging = false
        state.canvasSettings = defaultCanvasSettings
        state.hasUnsavedChanges = false
        state.history = { past: [], future: [] }
        state.clipboard = null
        state.showGrid = false
        state.currentBreakpoint = 'lg'
      }),

    // Migration helper
    migrateFromLegacyBlocks: (blocks) =>
      set((state) => {
        // Create a single section with one column containing all blocks
        const section: Section = {
          id: `section-${Date.now()}`,
          type: 'section',
          name: 'Main Section',
          columns: [
            {
              id: `column-${Date.now()}`,
              type: 'column',
              span: { base: 12 },
              blocks: blocks.map((block, index) => ({
                id: block.id,
                type: block.type,
                data: block.data,
                styles: block.styles,
                position: index,
              })),
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
        
        state.sections = [section]
        state.hasUnsavedChanges = true
      }),
  }))
)