'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

interface TestimonialBlockProps {
  data: {
    testimonials: Array<{
      id: string
      name: string
      role?: string
      image?: string
      content: string
      rating?: number
    }>
    layout: 'grid' | 'carousel' | 'single'
    showRating?: boolean
  }
  styles?: {
    padding?: string
    backgroundColor?: string
    className?: string
  }
}

export function TestimonialBlock({ data, styles }: TestimonialBlockProps) {
  const testimonials = data.testimonials || []

  if (testimonials.length === 0) {
    return null
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    )
  }

  const renderTestimonial = (testimonial: (typeof testimonials)[0], index: number) => (
    <motion.div
      key={testimonial.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="rounded-lg border border-white/20 bg-white/90 p-6 shadow-lg backdrop-blur-sm"
    >
      {data.showRating && testimonial.rating && (
        <div className="mb-4">{renderStars(testimonial.rating)}</div>
      )}

      <p className="mb-4 text-gray-700">&ldquo;{testimonial.content}&rdquo;</p>

      <div className="flex items-center gap-3">
        {testimonial.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        )}
        <div>
          <p className="font-semibold">{testimonial.name}</p>
          {testimonial.role && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
          )}
        </div>
      </div>
    </motion.div>
  )

  return (
    <section
      className={cn('px-6 py-12', styles?.className)}
      style={{
        backgroundColor: styles?.backgroundColor,
        padding: styles?.padding,
      }}
    >
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl font-bold">What Our Customers Say</h2>
        </motion.div>

        {data.layout === 'grid' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => renderTestimonial(testimonial, index))}
          </div>
        )}

        {data.layout === 'single' && testimonials[0] && (
          <div className="mx-auto max-w-2xl">{renderTestimonial(testimonials[0], 0)}</div>
        )}

        {data.layout === 'carousel' && (
          <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id} className="w-full flex-shrink-0 snap-center md:w-1/3">
                {renderTestimonial(testimonial, index)}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
