'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, Star, X, CheckCircle2 } from 'lucide-react'
import type { TestimonialRecord } from '@/lib/db/schema'

interface TestimonialWithForm extends TestimonialRecord {
  formName?: string | null
}

interface TestimonialSelectorProps {
  testimonials: TestimonialWithForm[]
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
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

function truncateContent(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength).trim() + '...'
}

export function TestimonialSelector({
  testimonials,
  selectedIds,
  onSelectionChange,
}: TestimonialSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter testimonials by search query
  const filteredTestimonials = useMemo(() => {
    if (!searchQuery.trim()) return testimonials

    const query = searchQuery.toLowerCase()
    return testimonials.filter(
      (t) =>
        t.customerName.toLowerCase().includes(query) ||
        t.content.toLowerCase().includes(query) ||
        t.customerCompany?.toLowerCase().includes(query) ||
        t.formName?.toLowerCase().includes(query)
    )
  }, [testimonials, searchQuery])

  // Get selected testimonials in order
  const selectedTestimonials = useMemo(() => {
    return selectedIds
      .map((id) => testimonials.find((t) => t.id === id))
      .filter((t): t is TestimonialWithForm => t !== undefined)
  }, [selectedIds, testimonials])

  function handleToggle(id: string) {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  function handleRemove(id: string) {
    onSelectionChange(selectedIds.filter((sid) => sid !== id))
  }

  function handleClearAll() {
    onSelectionChange([])
  }

  return (
    <div className="space-y-4">
      {/* Selected testimonials */}
      {selectedIds.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-800">
              {selectedIds.length} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-7 text-blue-600 hover:text-blue-800"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTestimonials.map((t) => (
              <Badge
                key={t.id}
                variant="secondary"
                className="flex items-center gap-1 bg-white border"
              >
                <span className="max-w-[150px] truncate">{t.customerName}</span>
                <button
                  onClick={() => handleRemove(t.id)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search testimonials..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Testimonials list */}
      <ScrollArea className="h-[400px] rounded-lg border">
        <div className="divide-y">
          {filteredTestimonials.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {testimonials.length === 0
                ? 'No approved testimonials available.'
                : 'No testimonials match your search.'}
            </div>
          ) : (
            filteredTestimonials.map((testimonial) => {
              const isSelected = selectedIds.includes(testimonial.id)

              return (
                <label
                  key={testimonial.id}
                  className={`flex cursor-pointer items-start gap-3 p-4 transition-colors hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 hover:bg-blue-50' : ''
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggle(testimonial.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {testimonial.customerName}
                      </span>
                      {testimonial.customerCompany && (
                        <span className="text-sm text-gray-500">
                          at {testimonial.customerCompany}
                        </span>
                      )}
                      {testimonial.featured && (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      )}
                    </div>
                    <StarRating rating={testimonial.rating} />
                    <p className="mt-1 text-sm text-gray-600">
                      {truncateContent(testimonial.content)}
                    </p>
                    {testimonial.formName && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        {testimonial.formName}
                      </Badge>
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />
                  )}
                </label>
              )
            })
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
