'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange: (rating: number) => void
  disabled?: boolean
}

export function StarRating({ value, onChange, disabled }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)

  const displayValue = hoverValue ?? value

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(null)}
          className={cn(
            'p-1 transition-all duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded',
            disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'
          )}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            className={cn(
              'h-8 w-8 transition-colors duration-150',
              star <= displayValue
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  )
}
