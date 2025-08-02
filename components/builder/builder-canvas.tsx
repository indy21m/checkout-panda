'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableBlock } from './sortable-block'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBuilderStore } from '@/stores/builder-store'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function BuilderCanvas() {
  const { blocks, selectedBlockId, selectBlock, addBlock } = useBuilderStore()

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-droppable',
    data: {
      accepts: ['new-block'],
    },
  })

  const handleAddFirstBlock = () => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type: 'hero',
      data: {
        headline: 'Welcome to Our Checkout',
        subheadline: 'Complete your purchase in just a few steps',
        backgroundType: 'gradient',
        gradient: { type: 'aurora', animate: true },
      },
      styles: {},
      position: 0,
    }
    addBlock(newBlock)
    selectBlock(newBlock.id)
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div
        ref={setNodeRef}
        className={cn(
          'mx-auto min-h-full max-w-4xl p-8 transition-all duration-300',
          isOver && 'bg-primary/5 scale-[1.01]'
        )}
      >
        {blocks.length === 0 ? (
          <div className="flex min-h-[600px] items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-6xl">🎨</div>
              <h3 className="text-text mb-2 text-2xl font-semibold">
                Start Building Your Checkout
              </h3>
              <p className="text-text-secondary mx-auto mb-6 max-w-md">
                Drag blocks from the left panel or click the button below to get started
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleAddFirstBlock}
                  variant="primary"
                  size="lg"
                  className="from-primary to-secondary bg-gradient-to-r transition-all duration-200 hover:shadow-lg"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add First Block
                </Button>
              </motion.div>
            </div>
          </div>
        ) : (
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  onSelect={() => selectBlock(block.id)}
                />
              ))}

              {/* Add block button at the bottom */}
              <div className="pt-8 pb-16 text-center">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-block"
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    className="glass-hover w-full max-w-xs"
                    onClick={() => {
                      const newBlock = {
                        id: `block-${Date.now()}`,
                        type: 'product',
                        data: {
                          layout: 'side-by-side',
                          showPricing: true,
                          features: [],
                        },
                        styles: {},
                        position: blocks.length,
                      }
                      addBlock(newBlock)
                      selectBlock(newBlock.id)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Block
                  </Button>
                </motion.div>
              </div>
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  )
}
