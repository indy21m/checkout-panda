'use client'

import { motion } from 'framer-motion'
import { useDndContext } from '@dnd-kit/core'
import { Package, Layers, Grid3X3 } from 'lucide-react'

export function DragOverlay() {
  const { active } = useDndContext()

  if (!active) return null

  const renderContent = () => {
    const type = active.data.current?.type

    if (type === 'section') {
      return (
        <div className="flex items-center gap-3 p-4">
          <Layers className="h-5 w-5 text-purple-400" />
          <div>
            <p className="font-medium text-white">{active.data.current?.name || 'Section'}</p>
            <p className="text-sm text-purple-200">
              {active.data.current?.columns?.length || 0} columns
            </p>
          </div>
        </div>
      )
    }

    if (type === 'new-block') {
      const blockType = active.data.current?.blockType
      const blockIcon = getBlockIcon(blockType)
      const blockName = getBlockName(blockType)

      return (
        <div className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
            {blockIcon}
          </div>
          <div>
            <p className="font-medium text-white">{blockName}</p>
            <p className="text-sm text-purple-200">Drag to add</p>
          </div>
        </div>
      )
    }

    if (type === 'block') {
      return (
        <div className="flex items-center gap-3 p-4">
          <Package className="h-5 w-5 text-purple-400" />
          <div>
            <p className="font-medium text-white">{active.data.current?.type || 'Block'}</p>
            <p className="text-sm text-purple-200">Moving block</p>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="pointer-events-none fixed z-[9999]">
      <motion.div
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative"
      >
        {/* Glowing shadow effect */}
        <div className="absolute inset-0 animate-pulse bg-purple-500/30 blur-2xl" />

        {/* Main content */}
        <div className="relative overflow-hidden rounded-xl border-2 border-purple-500 bg-gradient-to-br from-purple-900/90 to-pink-900/90 shadow-2xl backdrop-blur-sm">
          {renderContent()}

          {/* Animated corners */}
          <div className="absolute -top-1 -left-1 h-4 w-4">
            <div className="absolute inset-0 animate-pulse rounded-tl border-t-2 border-l-2 border-purple-400" />
          </div>
          <div className="absolute -top-1 -right-1 h-4 w-4">
            <div className="absolute inset-0 animate-pulse rounded-tr border-t-2 border-r-2 border-purple-400" />
          </div>
          <div className="absolute -bottom-1 -left-1 h-4 w-4">
            <div className="absolute inset-0 animate-pulse rounded-bl border-b-2 border-l-2 border-purple-400" />
          </div>
          <div className="absolute -right-1 -bottom-1 h-4 w-4">
            <div className="absolute inset-0 animate-pulse rounded-br border-r-2 border-b-2 border-purple-400" />
          </div>

          {/* Gradient overlay for depth */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
        </div>
      </motion.div>
    </div>
  )
}

function getBlockIcon(blockType: string) {
  switch (blockType) {
    case 'hero':
      return <span className="text-2xl">🎯</span>
    case 'product':
      return <Package className="h-5 w-5 text-white" />
    case 'payment':
      return <span className="text-2xl">💳</span>
    case 'bump':
      return <span className="text-2xl">🎁</span>
    case 'testimonial':
      return <span className="text-2xl">💬</span>
    case 'trust':
      return <span className="text-2xl">🛡️</span>
    default:
      return <Grid3X3 className="h-5 w-5 text-white" />
  }
}

function getBlockName(blockType: string) {
  switch (blockType) {
    case 'hero':
      return 'Hero Section'
    case 'product':
      return 'Product Block'
    case 'payment':
      return 'Payment Form'
    case 'bump':
      return 'Order Bump'
    case 'testimonial':
      return 'Testimonials'
    case 'trust':
      return 'Trust Badges'
    default:
      return 'Custom Block'
  }
}
