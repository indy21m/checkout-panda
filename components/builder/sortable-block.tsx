'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface SortableBlockProps {
  block: {
    id: string
    type: string
    data: Record<string, unknown>
  }
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

export function SortableBlock({ block, isSelected, onSelect, onDelete }: SortableBlockProps) {
  const [isVisible, setIsVisible] = useState(true)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getBlockPreview = () => {
    switch (block.type) {
      case 'hero':
        return (
          <div className="rounded-md bg-gradient-to-r from-purple-100 to-pink-100 p-6 dark:from-purple-900/20 dark:to-pink-900/20">
            <h3 className="text-lg font-semibold">
              {String(block.data.headline || 'Hero Section')}
            </h3>
            {block.data.subheadline ? (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {String(block.data.subheadline)}
              </p>
            ) : null}
          </div>
        )
      case 'product':
        return (
          <div className="rounded-md bg-blue-50 p-6 dark:bg-blue-900/20">
            <h3 className="text-lg font-semibold">
              {String(block.data.productName || 'Product Showcase')}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              ${(((block.data.price as number) || 0) / 100).toFixed(2)}
            </p>
          </div>
        )
      case 'payment':
        return (
          <div className="rounded-md bg-green-50 p-6 dark:bg-green-900/20">
            <h3 className="text-lg font-semibold">Payment Form</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Collects customer payment information
            </p>
          </div>
        )
      case 'testimonial':
        return (
          <div className="rounded-md bg-yellow-50 p-6 dark:bg-yellow-900/20">
            <h3 className="text-lg font-semibold">Testimonials</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {(block.data.testimonials as Array<unknown>)?.length || 0} testimonials
            </p>
          </div>
        )
      case 'trust':
        return (
          <div className="rounded-md bg-gray-100 p-6 dark:bg-gray-800/50">
            <h3 className="text-lg font-semibold">Trust Badges</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {(block.data.badges as Array<unknown>)?.length || 0} badges
            </p>
          </div>
        )
      case 'bump':
        return (
          <div className="rounded-md bg-gradient-to-r from-orange-50 to-pink-50 p-6 dark:from-orange-900/20 dark:to-pink-900/20">
            <h3 className="text-lg font-semibold">Order Bump</h3>
            <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {String(block.data.headline || 'Special Offer')}
            </p>
            {block.data.discountPercent ? (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                {String(block.data.discountPercent)}% OFF
              </p>
            ) : null}
          </div>
        )
      default:
        return (
          <div className="rounded-md bg-gray-100 p-6 dark:bg-gray-800/50">
            <h3 className="text-lg font-semibold capitalize">{block.type} Block</h3>
          </div>
        )
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg border-2 bg-white transition-all dark:bg-gray-900',
        isSelected ? 'border-primary shadow-lg' : 'border-gray-200 dark:border-gray-700',
        isDragging ? 'opacity-50' : '',
        !isVisible && 'opacity-60'
      )}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <div
        className="absolute top-0 bottom-0 left-0 flex w-10 cursor-grab items-center justify-center rounded-l-lg bg-gray-50 dark:bg-gray-800"
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
        >
          {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="h-8 w-8 text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
