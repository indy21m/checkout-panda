'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Eye, EyeOff, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useBuilderStore } from '@/stores/builder-store'
import type { Block } from '@/stores/builder-store'

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
          <div className="rounded-md bg-gradient-to-r from-purple-100 to-pink-100 p-6 dark:from-purple-900/20 dark:to-pink-900/20">
            <h3 className="text-lg font-semibold text-white">
              {String(block.data.headline || 'Hero Section')}
            </h3>
            {block.data.subheadline ? (
              <p className="mt-2 text-sm text-gray-300">{String(block.data.subheadline)}</p>
            ) : null}
          </div>
        )
      case 'product':
        return (
          <div className="rounded-md bg-blue-50 p-6 dark:bg-blue-900/20">
            <h3 className="text-lg font-semibold text-white">Product Showcase</h3>
            <p className="mt-2 text-sm text-gray-300">
              Display your product with pricing and features
            </p>
          </div>
        )
      case 'payment':
        return (
          <div className="rounded-md bg-green-50 p-6 dark:bg-green-900/20">
            <h3 className="text-lg font-semibold text-white">Payment Form</h3>
            <p className="mt-2 text-sm text-gray-300">Secure checkout with Stripe integration</p>
          </div>
        )
      case 'testimonial':
        return (
          <div className="rounded-md bg-yellow-50 p-6 dark:bg-yellow-900/20">
            <h3 className="text-lg font-semibold text-white">Testimonials</h3>
            <p className="mt-2 text-sm text-gray-300">Customer reviews and social proof</p>
          </div>
        )
      case 'trust':
        return (
          <div className="rounded-md bg-gray-100 p-6 dark:bg-gray-800/50">
            <h3 className="text-lg font-semibold text-white">Trust Badges</h3>
            <p className="mt-2 text-sm text-gray-300">Security and guarantee badges</p>
          </div>
        )
      case 'bump':
        return (
          <div className="rounded-md bg-gradient-to-r from-orange-50 to-pink-50 p-6 dark:from-orange-900/20 dark:to-pink-900/20">
            <h3 className="text-lg font-semibold text-white">Order Bump</h3>
            <p className="mt-1 text-sm font-medium text-gray-200">
              {String(block.data.headline || 'Special Offer')}
            </p>
            {block.data.discountPercent ? (
              <p className="mt-2 text-sm text-green-400">
                {String(block.data.discountPercent)}% OFF
              </p>
            ) : null}
          </div>
        )
      default:
        return (
          <div className="rounded-md bg-gray-100 p-6 dark:bg-gray-800/50">
            <h3 className="text-lg font-semibold text-white capitalize">{block.type} Block</h3>
          </div>
        )
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border-2 bg-gray-900 transition-all',
        isSelected ? 'border-purple-500 shadow-xl shadow-purple-500/20' : 'border-gray-700',
        isDragging ? 'opacity-50' : '',
        !isVisible && 'opacity-60'
      )}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <div
        className="absolute top-0 bottom-0 left-0 flex w-10 cursor-grab items-center justify-center rounded-l-lg bg-gray-800 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-gray-400" />
      </div>

      {/* Block Content */}
      <div className="ml-10 p-4">
        {isVisible ? (
          getBlockPreview()
        ) : (
          <div className="py-4 text-center text-gray-400">
            <EyeOff className="mx-auto mb-2 h-6 w-6" />
            <p className="text-sm">Hidden Block - {block.type}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            setIsVisible(!isVisible)
          }}
          className="h-8 w-8"
          title={isVisible ? 'Hide block' : 'Show block'}
        >
          {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            handleDuplicate()
          }}
          className="h-8 w-8"
          title="Duplicate block"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            deleteBlock(block.id)
          }}
          className="h-8 w-8 text-red-500 hover:text-red-600"
          title="Delete block"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
