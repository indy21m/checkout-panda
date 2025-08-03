import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

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

export interface CanvasSettings {
  theme: 'light' | 'dark' | 'auto'
  customCss?: string
  seoMeta?: {
    title?: string
    description?: string
    ogImage?: string
  }
}

interface BuilderState {
  blocks: Block[]
  selectedBlockId: string | null
  isDragging: boolean
  canvasSettings: CanvasSettings
  hasUnsavedChanges: boolean

  // Actions
  addBlock: (block: Block) => void
  updateBlock: (blockId: string, updates: Partial<Block>) => void
  deleteBlock: (blockId: string) => void
  reorderBlocks: (activeId: string, overId: string) => void
  selectBlock: (blockId: string | null) => void
  setIsDragging: (isDragging: boolean) => void
  updateCanvasSettings: (settings: Partial<CanvasSettings>) => void
  setBlocks: (blocks: Block[]) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
  resetBuilder: () => void
}

const defaultCanvasSettings: CanvasSettings = {
  theme: 'light',
  customCss: '',
  seoMeta: {},
}

export const useBuilderStore = create<BuilderState>()(
  immer((set) => ({
    blocks: [],
    selectedBlockId: null,
    isDragging: false,
    canvasSettings: defaultCanvasSettings,
    hasUnsavedChanges: false,

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

    setIsDragging: (isDragging) =>
      set((state) => {
        state.isDragging = isDragging
      }),

    updateCanvasSettings: (settings) =>
      set((state) => {
        state.canvasSettings = { ...state.canvasSettings, ...settings }
        state.hasUnsavedChanges = true
      }),

    setBlocks: (blocks) =>
      set((state) => {
        state.blocks = blocks
      }),

    setHasUnsavedChanges: (hasChanges) =>
      set((state) => {
        state.hasUnsavedChanges = hasChanges
      }),

    resetBuilder: () =>
      set((state) => {
        state.blocks = []
        state.selectedBlockId = null
        state.isDragging = false
        state.canvasSettings = defaultCanvasSettings
        state.hasUnsavedChanges = false
      }),
  }))
)
