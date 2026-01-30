'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TestimonialCard } from './TestimonialCard'
import { cn } from '@/lib/utils'
import type { TestimonialRecord } from '@/lib/db/schema'

interface TestimonialCarouselProps {
  testimonials: TestimonialRecord[]
  autoAdvanceMs?: number
  className?: string
  title?: string
}

export function TestimonialCarousel({
  testimonials,
  autoAdvanceMs = 5000,
  className,
  title = 'What Our Customers Say',
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }, [testimonials.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [testimonials.length])

  // Auto-advance
  useEffect(() => {
    if (isPaused || testimonials.length <= 1) return

    const timer = setInterval(goToNext, autoAdvanceMs)
    return () => clearInterval(timer)
  }, [isPaused, autoAdvanceMs, goToNext, testimonials.length])

  // Don't render if no testimonials
  if (testimonials.length === 0) {
    return null
  }

  const currentTestimonial = testimonials[currentIndex]
  if (!currentTestimonial) {
    return null
  }

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Title */}
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
      )}

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Buttons - Only show if multiple testimonials */}
        {testimonials.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1/2 rounded-full border border-gray-200 bg-white p-2 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </>
        )}

        {/* Testimonial Card */}
        <div className="px-4">
          <TestimonialCard
            customerName={currentTestimonial.customerName}
            customerCompany={currentTestimonial.customerCompany}
            customerPhoto={currentTestimonial.customerPhoto}
            content={currentTestimonial.content}
            rating={currentTestimonial.rating}
          />
        </div>
      </div>

      {/* Dots Indicator - Only show if multiple testimonials */}
      {testimonials.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                index === currentIndex
                  ? 'bg-blue-600 w-4'
                  : 'bg-gray-300 hover:bg-gray-400'
              )}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
