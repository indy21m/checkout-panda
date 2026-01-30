'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TestimonialCardProps {
  customerName: string
  customerCompany?: string | null
  customerPhoto?: string | null
  content: string
  rating: number
  className?: string
}

export function TestimonialCard({
  customerName,
  customerCompany,
  customerPhoto,
  content,
  rating,
  className,
}: TestimonialCardProps) {
  // Generate initials from name
  const initials = customerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-5 shadow-sm',
        className
      )}
    >
      {/* Star Rating */}
      <div className="mb-3 flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              i < rating
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-200'
            )}
          />
        ))}
      </div>

      {/* Quote */}
      <p className="text-sm leading-relaxed text-gray-700">
        &ldquo;{content}&rdquo;
      </p>

      {/* Author */}
      <div className="mt-4 flex items-center gap-3">
        {customerPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={customerPhoto}
            alt={customerName}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
            {initials}
          </div>
        )}
        <div>
          <span className="text-sm font-medium text-gray-900">{customerName}</span>
          {customerCompany && (
            <p className="text-xs text-gray-500">{customerCompany}</p>
          )}
        </div>
      </div>
    </div>
  )
}
