'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TestimonialCard } from './TestimonialCard'
import type { TestimonialRecord } from '@/lib/db/schema'

interface TestimonialCarouselProps {
  testimonials: TestimonialRecord[]
  autoAdvanceMs?: number
  className?: string
}

export function TestimonialCarousel({
  testimonials,
  autoAdvanceMs = 5000,
  className,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const count = testimonials.length

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % count)
  }, [count])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + count) % count)
  }, [count])

  // Auto-advance
  useEffect(() => {
    if (isPaused || count <= 1) return

    const timer = setInterval(goToNext, autoAdvanceMs)
    return () => clearInterval(timer)
  }, [isPaused, count, autoAdvanceMs, goToNext])

  // Don't render if no testimonials
  if (count === 0) return null

  // Single testimonial - no navigation needed
  if (count === 1) {
    const testimonial = testimonials[0]
    if (!testimonial) return null
    return (
      <div className={className}>
        <TestimonialCard testimonial={testimonial} />
      </div>
    )
  }

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="w-full flex-shrink-0 px-1"
            >
              <TestimonialCard testimonial={testimonial} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        type="button"
        onClick={goToPrev}
        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="h-5 w-5 text-gray-600" />
      </button>
      <button
        type="button"
        onClick={goToNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-white p-2 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-label="Next testimonial"
      >
        <ChevronRight className="h-5 w-5 text-gray-600" />
      </button>

      {/* Dot Indicators */}
      <div className="mt-4 flex justify-center gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'h-2 w-2 rounded-full transition-all',
              index === currentIndex
                ? 'bg-gray-800 w-4'
                : 'bg-gray-300 hover:bg-gray-400'
            )}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
