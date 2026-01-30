'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MessageSquare, FileText, Puzzle } from 'lucide-react'

interface TestimonialsLayoutProps {
  children: React.ReactNode
}

const tabs = [
  {
    name: 'Testimonials',
    href: '/admin/testimonials',
    icon: MessageSquare,
  },
  {
    name: 'Forms',
    href: '/admin/testimonials/forms',
    icon: FileText,
  },
  {
    name: 'Widgets',
    href: '/admin/testimonials/widgets',
    icon: Puzzle,
  },
]

export default function TestimonialsLayout({ children }: TestimonialsLayoutProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin/testimonials') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Testimonials</h2>
        <p className="text-sm text-gray-500">
          Collect and display customer testimonials on your checkout pages.
        </p>
      </div>

      {/* Sub-navigation tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = isActive(tab.href)
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                  active
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {children}
    </div>
  )
}
