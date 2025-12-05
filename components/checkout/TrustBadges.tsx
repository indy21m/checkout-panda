'use client'

import { Lock, ShieldCheck, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrustBadgesProps {
  variant?: 'compact' | 'full'
  className?: string
}

export function TrustBadges({ variant = 'full', className }: TrustBadgesProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3 text-xs text-gray-500', className)}>
        <div className="flex items-center gap-1">
          <Lock className="h-3 w-3" />
          <span>SSL Secure</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          <span>PCI Compliant</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-6', className)}>
      <div className="flex items-center gap-2 text-gray-600">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
          <Lock className="h-4 w-4 text-green-600" />
        </div>
        <div className="text-left">
          <p className="text-xs font-medium text-gray-900">SSL Encrypted</p>
          <p className="text-xs text-gray-500">256-bit security</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-600">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
        </div>
        <div className="text-left">
          <p className="text-xs font-medium text-gray-900">PCI Compliant</p>
          <p className="text-xs text-gray-500">Bank-level security</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-gray-600">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
          <CreditCard className="h-4 w-4 text-purple-600" />
        </div>
        <div className="text-left">
          <p className="text-xs font-medium text-gray-900">Powered by Stripe</p>
          <p className="text-xs text-gray-500">Trusted worldwide</p>
        </div>
      </div>
    </div>
  )
}
