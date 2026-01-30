'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TestimonialRecord } from '@/lib/db/schema'

interface TestimonialCardProps {
  testimonial: TestimonialRecord
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  const { customerName, customerCompany, customerPhoto, content, rating } = testimonial

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-5 shadow-sm',
        className
      )}
    >
      {/* Star Rating */}
      <div className="mb-3 flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'h-4 w-4',
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-gray-300'
            )}
          />
        ))}
      </div>

      {/* Quote */}
      <p className="text-sm leading-relaxed text-gray-700">&ldquo;{content}&rdquo;</p>

      {/* Author */}
      <div className="mt-4 flex items-center gap-3">
        {/* Avatar - photo or initials fallback */}
        {customerPhoto ? (
          <Image
            src={customerPhoto}
            alt={customerName}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-semibold text-white">
            {getInitials(customerName)}
          </div>
        )}

        {/* Name & Company */}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">
            {customerName}
          </p>
          {customerCompany && (
            <p className="truncate text-xs text-gray-500">{customerCompany}</p>
          )}
        </div>
      </div>
    </div>
  )
}
