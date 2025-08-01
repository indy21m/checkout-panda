'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { SortableBlock } from './sortable-block'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CanvasBlock {
  id: string
  type: string
  position: number
  data: Record<string, unknown>
  styles: Record<string, unknown>
}

interface BuilderCanvasProps {
  blocks: CanvasBlock[]
  onBlocksChange: (blocks: CanvasBlock[]) => void
  onBlockSelect: (blockId: string) => void
  onAddBlock: () => void
  selectedBlockId?: string
}

export function BuilderCanvas({
  blocks,
  onBlocksChange,
  onBlockSelect,
  onAddBlock,
  selectedBlockId,
}: BuilderCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id)
      const newIndex = blocks.findIndex((block) => block.id === over?.id)

      const newBlocks = arrayMove(blocks, oldIndex, newIndex).map((block, index) => ({
        ...block,
        position: index,
      }))

      onBlocksChange(newBlocks)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
      <div className="mx-auto max-w-4xl p-8">
        {blocks.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-6xl">🎨</div>
              <h3 className="mb-2 text-lg font-semibold">Start Building Your Checkout</h3>
              <p className="mb-6 text-gray-500">
                Add blocks from the left panel or click the button below
              </p>
              <Button onClick={onAddBlock} variant="primary">
                <Plus className="mr-2 h-4 w-4" />
                Add First Block
              </Button>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    isSelected={selectedBlockId === block.id}
                    onSelect={() => onBlockSelect(block.id)}
                    onDelete={() => {
                      const newBlocks = blocks.filter((b) => b.id !== block.id)
                      onBlocksChange(newBlocks)
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
