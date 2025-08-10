import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Block, BlockType } from '@/components/builder/checkout-blocks'
import { blockTemplates, generateBlockId } from '@/components/builder/checkout-blocks'

interface HistoryState {
  blocks: Block[]
  timestamp: number
}

interface SimplifiedBuilderStore {
  // Core state
  blocks: Block[]
  selectedBlockId: string | null
  hasUnsavedChanges: boolean
  
  // History
  history: {
    past: HistoryState[]
    future: HistoryState[]
  }
  
  // View state
  isPreviewMode: boolean
  isSaving: boolean
  
  // Actions - Block Management
  addBlock: (type: BlockType, index?: number, column?: 'left' | 'right') => void
  updateBlock: (id: string, updates: Partial<Block>) => void
  deleteBlock: (id: string) => void
  duplicateBlock: (id: string) => void
  moveBlock: (id: string, direction: 'up' | 'down') => void
  toggleBlockVisibility: (id: string) => void
  toggleBlockColumn: (id: string) => void
  reorderBlocks: (startIndex: number, endIndex: number) => void
  
  // Actions - Selection
  selectBlock: (id: string | null) => void
  
  // Actions - History
  undo: () => void
  redo: () => void
  saveToHistory: () => void
  
  // Actions - State Management
  setBlocks: (blocks: Block[]) => void
  setHasUnsavedChanges: (value: boolean) => void
  setPreviewMode: (value: boolean) => void
  setSaving: (value: boolean) => void
  resetBuilder: () => void
}

const MAX_HISTORY_SIZE = 50

export const useSimplifiedBuilderStore = create<SimplifiedBuilderStore>()(
  immer((set, get) => ({
    // Initial state
    blocks: [],
    selectedBlockId: null,
    hasUnsavedChanges: false,
    history: {
      past: [],
      future: []
    },
    isPreviewMode: false,
    isSaving: false,
    
    // Add a new block
    addBlock: (type: BlockType, index?: number, column: 'left' | 'right' = 'left') => {
      set((state) => {
        const template = blockTemplates[type]
        const newBlock: Block = {
          id: generateBlockId(),
          type,
          data: { ...template.data },
          visible: true,
          column
        }
        
        // Save current state to history before making changes
        get().saveToHistory()
        
        if (index !== undefined && index >= 0 && index <= state.blocks.length) {
          state.blocks.splice(index, 0, newBlock)
        } else {
          state.blocks.push(newBlock)
        }
        
        state.selectedBlockId = newBlock.id
        state.hasUnsavedChanges = true
      })
    },
    
    // Update a block
    updateBlock: (id: string, updates: Partial<Block>) => {
      set((state) => {
        const blockIndex = state.blocks.findIndex(b => b.id === id)
        if (blockIndex !== -1) {
          // Save to history before updating
          get().saveToHistory()
          
          // Deep merge the updates
          const block = state.blocks[blockIndex]
          if (block) {
            if (updates.data) {
              block.data = { ...block.data, ...updates.data }
            }
            if (updates.type !== undefined) {
              block.type = updates.type
            }
            if (updates.visible !== undefined) {
              block.visible = updates.visible
            }
          }
          
          state.hasUnsavedChanges = true
        }
      })
    },
    
    // Delete a block
    deleteBlock: (id: string) => {
      set((state) => {
        const blockIndex = state.blocks.findIndex(b => b.id === id)
        if (blockIndex !== -1) {
          get().saveToHistory()
          state.blocks.splice(blockIndex, 1)
          
          if (state.selectedBlockId === id) {
            state.selectedBlockId = null
          }
          state.hasUnsavedChanges = true
        }
      })
    },
    
    // Duplicate a block
    duplicateBlock: (id: string) => {
      set((state) => {
        const blockIndex = state.blocks.findIndex(b => b.id === id)
        if (blockIndex !== -1) {
          get().saveToHistory()
          
          const originalBlock = state.blocks[blockIndex]
          if (originalBlock) {
            const newBlock: Block = {
              ...originalBlock,
              id: generateBlockId(),
              data: { ...originalBlock.data }
            }
            
            state.blocks.splice(blockIndex + 1, 0, newBlock)
            state.selectedBlockId = newBlock.id
            state.hasUnsavedChanges = true
          }
        }
      })
    },
    
    // Move a block up or down
    moveBlock: (id: string, direction: 'up' | 'down') => {
      set((state) => {
        const index = state.blocks.findIndex(b => b.id === id)
        if (index === -1) return
        
        const newIndex = direction === 'up' ? index - 1 : index + 1
        if (newIndex < 0 || newIndex >= state.blocks.length) return
        
        get().saveToHistory()
        
        // Swap blocks
        const temp = state.blocks[index]
        const other = state.blocks[newIndex]
        if (temp && other) {
          state.blocks[index] = other
          state.blocks[newIndex] = temp
        }
        
        state.hasUnsavedChanges = true
      })
    },
    
    // Toggle block visibility
    toggleBlockVisibility: (id: string) => {
      set((state) => {
        const block = state.blocks.find(b => b.id === id)
        if (block) {
          get().saveToHistory()
          block.visible = !block.visible
          state.hasUnsavedChanges = true
        }
      })
    },
    
    // Toggle block column
    toggleBlockColumn: (id: string) => {
      set((state) => {
        const block = state.blocks.find(b => b.id === id)
        if (block) {
          get().saveToHistory()
          block.column = block.column === 'right' ? 'left' : 'right'
          state.hasUnsavedChanges = true
        }
      })
    },
    
    // Reorder blocks (for drag and drop)
    reorderBlocks: (startIndex: number, endIndex: number) => {
      set((state) => {
        if (startIndex === endIndex) return
        
        get().saveToHistory()
        
        const [removed] = state.blocks.splice(startIndex, 1)
        if (removed) {
          state.blocks.splice(endIndex, 0, removed)
        }
        
        state.hasUnsavedChanges = true
      })
    },
    
    // Select a block
    selectBlock: (id: string | null) => {
      set((state) => {
        state.selectedBlockId = id
      })
    },
    
    // Undo
    undo: () => {
      set((state) => {
        if (state.history.past.length === 0) return
        
        // Save current state to future
        const currentState: HistoryState = {
          blocks: JSON.parse(JSON.stringify(state.blocks)),
          timestamp: Date.now()
        }
        state.history.future.unshift(currentState)
        
        // Restore previous state
        const previousState = state.history.past.pop()
        if (previousState) {
          state.blocks = previousState.blocks
          state.hasUnsavedChanges = true
        }
      })
    },
    
    // Redo
    redo: () => {
      set((state) => {
        if (state.history.future.length === 0) return
        
        // Save current state to past
        const currentState: HistoryState = {
          blocks: JSON.parse(JSON.stringify(state.blocks)),
          timestamp: Date.now()
        }
        state.history.past.push(currentState)
        
        // Restore future state
        const futureState = state.history.future.shift()
        if (futureState) {
          state.blocks = futureState.blocks
          state.hasUnsavedChanges = true
        }
      })
    },
    
    // Save current state to history
    saveToHistory: () => {
      set((state) => {
        const historyState: HistoryState = {
          blocks: JSON.parse(JSON.stringify(state.blocks)),
          timestamp: Date.now()
        }
        
        state.history.past.push(historyState)
        
        // Limit history size
        if (state.history.past.length > MAX_HISTORY_SIZE) {
          state.history.past.shift()
        }
        
        // Clear future history when new action is taken
        state.history.future = []
      })
    },
    
    // Set blocks (for loading from database)
    setBlocks: (blocks: Block[]) => {
      set((state) => {
        state.blocks = blocks
        state.hasUnsavedChanges = false
        state.history = { past: [], future: [] }
      })
    },
    
    // Set unsaved changes flag
    setHasUnsavedChanges: (value: boolean) => {
      set((state) => {
        state.hasUnsavedChanges = value
      })
    },
    
    // Toggle preview mode
    setPreviewMode: (value: boolean) => {
      set((state) => {
        state.isPreviewMode = value
        if (value) {
          state.selectedBlockId = null
        }
      })
    },
    
    // Set saving state
    setSaving: (value: boolean) => {
      set((state) => {
        state.isSaving = value
      })
    },
    
    // Reset builder to initial state
    resetBuilder: () => {
      set((state) => {
        state.blocks = []
        state.selectedBlockId = null
        state.hasUnsavedChanges = false
        state.history = { past: [], future: [] }
        state.isPreviewMode = false
        state.isSaving = false
      })
    }
  }))
)