'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { UserButton } from '@clerk/nextjs'
import {
  Home,
  ShoppingCart,
  Package,
  LayoutDashboard,
  TrendingUp,
  Settings,
  ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Products',
    href: '/products',
    icon: Package,
  },
  {
    title: 'Checkouts',
    href: '/checkouts',
    icon: ShoppingCart,
  },
  {
    title: 'Builder',
    href: '/builder',
    icon: LayoutDashboard,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // Keyboard shortcut for sidebar toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault()
        setCollapsed(!collapsed)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [collapsed])

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCollapsed(true)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? '5rem' : '16rem',
          x: 0,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={cn(
          'fixed top-0 left-0 z-50 h-screen',
          'bg-background-glass backdrop-blur-xl',
          'border-border-light border-r',
          'shadow-xl shadow-black/5',
          'lg:relative lg:z-auto'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="border-border-light flex h-16 items-center justify-between border-b px-4">
            <Link
              href="/dashboard"
              className={cn(
                'flex items-center gap-3 transition-opacity',
                collapsed && 'lg:justify-center'
              )}
            >
              <Image
                src="/logo.png"
                alt="Checkout Panda"
                className="h-8 w-8 flex-shrink-0 object-contain"
                width={32}
                height={32}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden text-lg font-semibold whitespace-nowrap"
                  >
                    Checkout Panda
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Collapse Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className={cn('hidden lg:flex', collapsed && 'lg:hidden')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    onHoverStart={() => setHoveredItem(item.href)}
                    onHoverEnd={() => setHoveredItem(null)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={cn(
                        'relative flex items-center gap-3 rounded-lg px-3 py-2.5',
                        'transition-all duration-200',
                        'group cursor-pointer',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-text-secondary hover:text-text hover:bg-background-secondary',
                        collapsed && 'justify-center'
                      )}
                    >
                      {/* Icon with gradient background on hover/active */}
                      <div
                        className={cn(
                          'relative flex items-center justify-center',
                          'h-8 w-8 rounded-lg transition-all duration-200',
                          isActive
                            ? 'from-primary to-primary/80 bg-gradient-to-br text-white shadow-md'
                            : hoveredItem === item.href
                              ? 'from-primary/20 to-primary/10 bg-gradient-to-br'
                              : 'bg-background-tertiary'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Label */}
                      <AnimatePresence>
                        {!collapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="font-medium whitespace-nowrap"
                          >
                            {item.title}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Badge */}
                      {item.badge && !collapsed && (
                        <span className="bg-primary/10 text-primary ml-auto rounded-full px-2 py-0.5 text-xs">
                          {item.badge}
                        </span>
                      )}

                      {/* Tooltip for collapsed state */}
                      {collapsed && (
                        <div className="bg-background-secondary text-text pointer-events-none absolute left-full ml-2 rounded-md px-2 py-1 text-sm whitespace-nowrap opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                          {item.title}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="border-border-light border-t p-4">
            <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
              <UserButton afterSignOutUrl="/" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col"
                  >
                    <span className="text-sm font-medium">My Account</span>
                    <span className="text-text-tertiary text-xs">Cmd+\ to collapse</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Expand button for collapsed state */}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(false)}
            className="bg-background border-border-light absolute top-8 -right-3 flex h-6 w-6 items-center justify-center rounded-full border p-0 shadow-sm"
          >
            <ChevronLeft className="h-3 w-3 rotate-180" />
          </Button>
        )}
      </motion.aside>
    </>
  )
}
