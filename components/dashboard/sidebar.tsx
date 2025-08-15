'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { UserButton } from '@clerk/nextjs'
import {
  Home,
  ShoppingCart,
  Package,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Tag,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GradientText } from '@/components/ui/gradient-text'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  color: string
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    color: 'from-blue-400 to-blue-600',
  },
  {
    title: 'Products',
    href: '/products',
    icon: Package,
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    title: 'Offers',
    href: '/offers',
    icon: Zap,
    color: 'from-violet-400 to-violet-600',
  },
  {
    title: 'Coupons',
    href: '/coupons',
    icon: Tag,
    color: 'from-amber-400 to-amber-600',
  },
  {
    title: 'Checkouts',
    href: '/checkouts',
    icon: ShoppingCart,
    color: 'from-purple-400 to-purple-600',
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
    color: 'from-pink-400 to-pink-600',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    color: 'from-gray-400 to-gray-600',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Load sidebar state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('checkout-panda-sidebar-collapsed')
    if (saved !== null) {
      setCollapsed(JSON.parse(saved))
    }
  }, [])

  // Save sidebar state to localStorage
  const toggleSidebar = useCallback(() => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem('checkout-panda-sidebar-collapsed', JSON.stringify(newState))
  }, [collapsed])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault()
        toggleSidebar()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [collapsed, toggleSidebar])

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
          width: collapsed && !isHovering ? '5rem' : '16rem',
          x: 0,
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={cn(
          'relative flex h-screen flex-col',
          'bg-white/60 backdrop-blur-xl',
          'border-r border-white/20',
          'shadow-xl shadow-black/5',
          'z-50'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="p-6">
            <Link href="/dashboard" className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="relative h-10 w-10 flex-shrink-0"
              >
                <Image
                  src="/logo.png"
                  alt="Checkout Panda"
                  className="h-full w-full object-contain"
                  width={40}
                  height={40}
                />
              </motion.div>
              <AnimatePresence>
                {(!collapsed || isHovering) && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <GradientText as="h2" className="text-xl font-bold" gradient="primary">
                      Checkout Panda
                    </GradientText>
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {(!collapsed || isHovering) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-4"
              >
                <button
                  onClick={() => setShowSearch(true)}
                  className="relative w-full rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <div className="py-3 pr-4 pl-12 text-sm text-gray-500 text-left">
                    Search...{' '}
                    <kbd className="ml-2 rounded bg-white border border-gray-200 px-1.5 py-0.5 text-xs">⌘K</kbd>
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto p-2">
            {navItems.map((item, index) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              const Icon = item.icon

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={item.href}>
                    <div
                      className={cn(
                        'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                        isActive
                          ? 'text-white shadow-lg'
                          : 'text-text-secondary hover:text-text hover:bg-white/50',
                        collapsed && !isHovering && 'justify-center'
                      )}
                    >
                      {/* Active background */}
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className={cn('absolute inset-0 rounded-xl bg-gradient-to-r', item.color)}
                          initial={false}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}

                      {/* Icon */}
                      <div className="relative z-10">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            'rounded-lg p-2 transition-all duration-200',
                            isActive
                              ? 'bg-white/20'
                              : 'group-hover:bg-gradient-to-br group-hover:from-gray-100 group-hover:to-gray-200'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </motion.div>
                      </div>

                      {/* Label */}
                      <AnimatePresence>
                        {(!collapsed || isHovering) && (
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="relative z-10 font-medium"
                          >
                            {item.title}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Badge */}
                      {item.badge && (!collapsed || isHovering) && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative z-10 ml-auto rounded-full bg-white/20 px-2 py-0.5 text-xs"
                        >
                          {item.badge}
                        </motion.span>
                      )}

                      {/* Hover effect */}
                      {!isActive && (
                        <motion.div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-100/0 to-gray-100/0 transition-all duration-300 group-hover:from-gray-100/50 group-hover:to-gray-200/50" />
                      )}
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          {/* Quick Actions */}
          <AnimatePresence>
            {(!collapsed || isHovering) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="border-t border-gray-200/50 p-4"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="from-primary to-secondary flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-4 py-2.5 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
                  onClick={() => (window.location.href = '/checkouts/new')}
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Create Checkout</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

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

        {/* Collapse Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="absolute top-1/2 -right-3 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-1.5 shadow-lg transition-shadow duration-200 hover:shadow-xl"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3 text-gray-600" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-gray-600" />
          )}
        </motion.button>
      </motion.aside>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSearch(false)}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2"
            >
              <div className="rounded-xl border border-gray-200 bg-white shadow-2xl">
                <div className="relative">
                  <Search className="absolute top-1/2 left-6 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products, checkouts, analytics..."
                    onKeyDown={(e) => e.key === 'Escape' && setShowSearch(false)}
                    className="w-full rounded-t-xl bg-transparent py-6 pr-6 pl-16 text-lg focus:outline-none"
                    autoFocus
                  />
                </div>
                <div className="border-t border-gray-200 bg-gray-50 rounded-b-xl p-4">
                  <p className="text-sm text-gray-500">Type to search or press ESC to close</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
