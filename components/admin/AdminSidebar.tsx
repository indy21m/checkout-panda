'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  Calendar,
  MessageSquare,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const SIDEBAR_STORAGE_KEY = 'checkout-panda-sidebar-collapsed'

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  color: string
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    color: 'from-blue-400 to-blue-600',
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    color: 'from-emerald-400 to-emerald-600',
  },
  {
    name: 'Calendar',
    href: '/admin/calendar',
    icon: Calendar,
    color: 'from-purple-400 to-purple-600',
  },
  {
    name: 'Testimonials',
    href: '/admin/testimonials',
    icon: MessageSquare,
    color: 'from-amber-400 to-amber-600',
  },
  {
    name: 'Segments',
    href: '/admin/segments',
    icon: Users,
    color: 'from-pink-400 to-pink-600',
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    color: 'from-gray-400 to-gray-600',
  },
]

interface AdminSidebarProps {
  userEmail?: string | null
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved) as boolean)
    }
  }, [])

  const toggleSidebar = (): void => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(newState))
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sidebarCollapsed])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  if (!mounted) {
    return null
  }

  const sidebarWidth = sidebarCollapsed && !isHovering ? 80 : 280

  const isNavItemActive = (item: NavItem): boolean => {
    if (item.href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(item.href)
  }

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }): React.ReactElement => (
    <>
      {/* Logo Section */}
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg"
          >
            <span className="text-xl">🐼</span>
          </motion.div>
          <AnimatePresence>
            {(isMobile || !sidebarCollapsed || isHovering) && (
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-xl font-bold text-transparent"
              >
                Checkout Panda
              </motion.h2>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3">
        <ul className="space-y-1">
          {navigation.map((item, index) => {
            const isActive = isNavItemActive(item)
            const Icon = item.icon

            return (
              <motion.li
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
                    isActive
                      ? 'text-white shadow-lg'
                      : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId={isMobile ? 'activeNavMobile' : 'activeNav'}
                      className={cn('absolute inset-0 rounded-xl bg-gradient-to-r', item.color)}
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

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

                  <AnimatePresence>
                    {(isMobile || !sidebarCollapsed || isHovering) && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="relative z-10 font-medium"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {!isActive && (
                    <motion.div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-100/0 to-gray-100/0 transition-all duration-300 group-hover:from-gray-100/50 group-hover:to-gray-200/50" />
                  )}
                </Link>
              </motion.li>
            )
          })}
        </ul>
      </div>

      {/* User Section */}
      {userEmail && (
        <div className="border-t border-gray-200/50 p-4">
          <div
            className={cn(
              'flex items-center gap-3',
              !isMobile && sidebarCollapsed && !isHovering && 'justify-center'
            )}
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 text-sm font-medium text-emerald-700">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <AnimatePresence>
              {(isMobile || !sidebarCollapsed || isHovering) && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 overflow-hidden"
                >
                  <p className="truncate text-sm font-medium text-gray-900">{userEmail}</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Keyboard shortcut hint */}
      <AnimatePresence>
        {(isMobile || !sidebarCollapsed || isHovering) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-t border-gray-200/50 px-4 py-3"
          >
            <p className="text-center text-xs text-gray-400">
              <kbd className="rounded bg-gray-100 px-1.5 py-0.5">⌘</kbd>
              <span className="mx-1">+</span>
              <kbd className="rounded bg-gray-100 px-1.5 py-0.5">\</kbd>
              <span className="ml-2">toggle sidebar</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-xl bg-white/80 p-2 shadow-lg backdrop-blur-sm lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
            />
            <motion.nav
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/20 bg-white/95 backdrop-blur-xl lg:hidden"
            >
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent isMobile />
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.nav
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="relative hidden flex-col border-r border-white/20 bg-white/60 backdrop-blur-xl lg:flex"
      >
        <SidebarContent />

        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-1.5 shadow-lg transition-shadow duration-200 hover:shadow-xl"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3 text-gray-600" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-gray-600" />
          )}
        </motion.button>
      </motion.nav>
    </>
  )
}
