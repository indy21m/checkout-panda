'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { GripVertical, Star, X, ChevronUp, ChevronDown } from 'lucide-react'
import type { TestimonialRecord } from '@/lib/db/schema'

interface TestimonialWithForm extends TestimonialRecord {
  formName?: string | null
}

interface TestimonialOrderEditorProps {
  testimonials: TestimonialWithForm[]
  orderedIds: string[]
  onOrderChange: (ids: string[]) => void
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

function truncateContent(content: string, maxLength: number = 80): string {
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength).trim() + '...'
}

export function TestimonialOrderEditor({
  testimonials,
  orderedIds,
  onOrderChange,
}: TestimonialOrderEditorProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  // Get testimonials in the specified order
  const orderedTestimonials = orderedIds
    .map((id) => testimonials.find((t) => t.id === id))
    .filter((t): t is TestimonialWithForm => t !== undefined)

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    if (id !== draggedId) {
      setDragOverId(id)
    }
  }

  function handleDragLeave() {
    setDragOverId(null)
  }

  function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    setDragOverId(null)

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      return
    }

    const newOrder = [...orderedIds]
    const draggedIndex = newOrder.indexOf(draggedId)
    const targetIndex = newOrder.indexOf(targetId)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove dragged item
      newOrder.splice(draggedIndex, 1)
      // Insert at target position
      newOrder.splice(targetIndex, 0, draggedId)
      onOrderChange(newOrder)
    }

    setDraggedId(null)
  }

  function handleDragEnd() {
    setDraggedId(null)
    setDragOverId(null)
  }

  function moveUp(index: number) {
    if (index <= 0) return
    const newOrder = [...orderedIds]
    const temp = newOrder[index - 1]
    newOrder[index - 1] = newOrder[index]!
    newOrder[index] = temp!
    onOrderChange(newOrder)
  }

  function moveDown(index: number) {
    if (index >= orderedIds.length - 1) return
    const newOrder = [...orderedIds]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]!
    newOrder[index + 1] = temp!
    onOrderChange(newOrder)
  }

  function handleRemove(id: string) {
    onOrderChange(orderedIds.filter((oid) => oid !== id))
  }

  if (orderedTestimonials.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
        <p>No testimonials selected.</p>
        <p className="mt-1 text-sm">Select testimonials to reorder them here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-500 mb-4">
        Drag and drop to reorder, or use the arrows. Items at the top appear first.
      </p>
      {orderedTestimonials.map((testimonial, index) => (
        <div
          key={testimonial.id}
          draggable
          onDragStart={(e) => handleDragStart(e, testimonial.id)}
          onDragOver={(e) => handleDragOver(e, testimonial.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, testimonial.id)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-3 rounded-lg border bg-white p-3 transition-all ${
            draggedId === testimonial.id
              ? 'opacity-50 border-blue-300'
              : dragOverId === testimonial.id
                ? 'border-blue-400 bg-blue-50'
                : 'hover:border-gray-300'
          }`}
        >
          {/* Drag handle */}
          <div className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing">
            <GripVertical className="h-5 w-5" />
          </div>

          {/* Position indicator */}
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
            {index + 1}
          </div>

          {/* Testimonial info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900 truncate">
                {testimonial.customerName}
              </span>
              {testimonial.customerCompany && (
                <span className="text-sm text-gray-500 truncate">
                  at {testimonial.customerCompany}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={testimonial.rating} />
              <span className="text-sm text-gray-500 truncate">
                {truncateContent(testimonial.content, 50)}
              </span>
            </div>
          </div>

          {/* Move buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => moveUp(index)}
              disabled={index === 0}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => moveDown(index)}
              disabled={index === orderedTestimonials.length - 1}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Remove button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-red-600"
            onClick={() => handleRemove(testimonial.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
