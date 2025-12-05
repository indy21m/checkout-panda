'use client'

import { Quote } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TestimonialProps {
  quote: string
  author: string
  role?: string
  avatar?: string
  className?: string
}

export function Testimonial({ quote, author, role, avatar, className }: TestimonialProps) {
  return (
    <div className={cn('rounded-xl bg-white p-6 shadow-md', className)}>
      <div className="mb-3 flex items-center gap-2">
        <Quote className="h-5 w-5 text-blue-400" />
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
          What Others Say
        </span>
      </div>

      <blockquote className="text-gray-700">&ldquo;{quote}&rdquo;</blockquote>

      <div className="mt-4 flex items-center gap-3">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={author} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold text-white">
            {author
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-medium text-gray-900">{author}</p>
          {role && <p className="text-sm text-gray-500">{role}</p>}
        </div>
      </div>
    </div>
  )
}
