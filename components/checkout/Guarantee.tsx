'use client'

import { ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GuaranteeProps {
  text: string
  days?: number
  className?: string
}

export function Guarantee({ text, days, className }: GuaranteeProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-4 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-5',
        className
      )}
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
        <ShieldCheck className="h-6 w-6 text-green-600" />
      </div>
      <div>
        <h4 className="font-semibold text-green-900">
          {days ? `${days}-Day Money-Back Guarantee` : 'Money-Back Guarantee'}
        </h4>
        <p className="mt-1 text-sm text-green-700">{text}</p>
      </div>
    </div>
  )
}
