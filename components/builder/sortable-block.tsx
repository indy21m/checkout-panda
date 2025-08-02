'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Eye, EyeOff, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useBuilderStore } from '@/stores/builder-store'
import type { Block } from '@/stores/builder-store'
import { motion } from 'framer-motion'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'

interface SortableBlockProps {
  block: Block
  isSelected: boolean
  onSelect: () => void
}

export function SortableBlock({ block, isSelected, onSelect }: SortableBlockProps) {
  const [isVisible, setIsVisible] = useState(true)
  const { deleteBlock, addBlock } = useBuilderStore()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDuplicate = () => {
    const newBlock: Block = {
      ...block,
      id: `block-${Date.now()}`,
      position: block.position + 1,
    }
    addBlock(newBlock)
  }

  const getBlockPreview = () => {
    switch (block.type) {
      case 'hero':
        return (
          <div className="rounded-md bg-gradient-to-r from-purple-50 via-purple-100 to-pink-50 p-6">
            <h3 className="text-text text-lg font-semibold">
              {String(block.data.headline || 'Hero Section')}
            </h3>
            {block.data.subheadline ? (
              <p className="text-text-secondary mt-2 text-sm">{String(block.data.subheadline)}</p>
            ) : null}
          </div>
        )
      case 'product':
        return (
          <div className="rounded-md bg-gradient-to-r from-blue-50 to-cyan-50 p-6">
            <h3 className="text-text text-lg font-semibold">Product Showcase</h3>
            <p className="text-text-secondary mt-2 text-sm">
              Display your product with pricing and features
            </p>
          </div>
        )
      case 'payment':
        return (
          <div className="rounded-md bg-gradient-to-r from-emerald-50 to-green-50 p-6">
            <h3 className="text-text text-lg font-semibold">Payment Form</h3>
            <p className="text-text-secondary mt-2 text-sm">
              Secure checkout with Stripe integration
            </p>
          </div>
        )
      case 'testimonial':
        return (
          <div className="rounded-md bg-gradient-to-r from-amber-50 to-yellow-50 p-6">
            <h3 className="text-text text-lg font-semibold">Testimonials</h3>
            <p className="text-text-secondary mt-2 text-sm">Customer reviews and social proof</p>
          </div>
        )
      case 'trust':
        return (
          <div className="rounded-md bg-gradient-to-r from-gray-50 to-gray-100 p-6">
            <h3 className="text-text text-lg font-semibold">Trust Badges</h3>
            <p className="text-text-secondary mt-2 text-sm">Security and guarantee badges</p>
          </div>
        )
      case 'bump':
        return (
          <div className="rounded-md bg-gradient-to-r from-orange-50 via-pink-50 to-red-50 p-6">
            <h3 className="text-text text-lg font-semibold">Order Bump</h3>
            <p className="text-text-secondary mt-1 text-sm font-medium">
              {String(block.data.headline || 'Special Offer')}
            </p>
            {block.data.discountPercent ? (
              <p className="text-success mt-2 text-sm font-semibold">
                {String(block.data.discountPercent)}% OFF
              </p>
            ) : null}
          </div>
        )
      default:
        return (
          <div className="rounded-md bg-gradient-to-r from-gray-50 to-gray-100 p-6">
            <h3 className="text-text text-lg font-semibold capitalize">{block.type} Block</h3>
          </div>
        )
    }
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-xl transition-all',
        isDragging ? 'opacity-50' : '',
        !isVisible && 'opacity-60'
      )}
      onClick={onSelect}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <GlassmorphicCard
        className={cn(
          'relative overflow-hidden',
          isSelected && 'ring-primary shadow-primary/20 shadow-lg ring-2 ring-offset-2'
        )}
        variant="light"
        hover={false}
      >
        {/* Drag Handle */}
        <div
          className="absolute top-0 bottom-0 left-0 flex w-10 cursor-grab items-center justify-center rounded-l-lg bg-gradient-to-b from-gray-100 to-gray-200 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-gray-600" />
        </div>

        {/* Block Content */}
        <div className="ml-10 p-4">
          {isVisible ? (
            getBlockPreview()
          ) : (
            <div className="text-text-tertiary py-4 text-center">
              <EyeOff className="mx-auto mb-2 h-6 w-6" />
              <p className="text-sm">Hidden Block - {block.type}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              setIsVisible(!isVisible)
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm transition-colors hover:bg-white/70"
            title={isVisible ? 'Hide block' : 'Show block'}
          >
            {isVisible ? (
              <Eye className="h-4 w-4 text-gray-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-600" />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              handleDuplicate()
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm transition-colors hover:bg-white/70"
            title="Duplicate block"
          >
            <Copy className="h-4 w-4 text-gray-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              deleteBlock(block.id)
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50/50 backdrop-blur-sm transition-colors hover:bg-red-100/70"
            title="Delete block"
          >
            <Trash2 className="text-danger h-4 w-4" />
          </motion.button>
        </div>
      </GlassmorphicCard>
    </motion.div>
  )
}
