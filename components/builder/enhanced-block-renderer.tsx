'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion, useAnimation, useInView, type Easing } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useBuilderStore } from '@/stores/builder-store'
import { GripVertical, Trash2, Eye, EyeOff, Copy, Zap, MousePointer } from 'lucide-react'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import type { EnhancedBlock, AnimationConfig } from '@/types/builder'

interface EnhancedBlockRendererProps {
  block: EnhancedBlock
  columnId: string
  isSelected: boolean
}

export function EnhancedBlockRenderer({ block, isSelected }: EnhancedBlockRendererProps) {
  const { 
    selectElement, 
    deleteEnhancedBlock, 
    copy,
    paste 
  } = useBuilderStore()
  
  const [isVisible, setIsVisible] = useState(true)
  const controls = useAnimation()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: false, margin: '-10%' })
  
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // Apply animations based on configuration
  useEffect(() => {
    if (block.animations && block.animations.length > 0) {
      block.animations.forEach((animation) => {
        if (animation.trigger === 'onScroll' && inView) {
          applyAnimation(animation)
        } else if (animation.trigger === 'onLoad') {
          applyAnimation(animation)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, block.animations])

  const applyAnimation = async (config: AnimationConfig) => {
    const animationVariants: Record<string, Record<string, number | string>> = {}

    switch (config.type) {
      case 'fade':
        animationVariants.hidden = { opacity: config.opacity?.from || 0 }
        animationVariants.visible = { opacity: config.opacity?.to || 1 }
        break
      case 'slide':
        const distance = config.distance || 50
        animationVariants.hidden = {
          opacity: 0,
          x: config.direction === 'left' ? -distance : config.direction === 'right' ? distance : 0,
          y: config.direction === 'up' ? -distance : config.direction === 'down' ? distance : 0,
        }
        animationVariants.visible = { opacity: 1, x: 0, y: 0 }
        break
      case 'scale':
        animationVariants.hidden = { opacity: 0, scale: config.scale || 0.8 }
        animationVariants.visible = { opacity: 1, scale: 1 }
        break
      case 'rotate':
        animationVariants.hidden = { opacity: 0, rotate: -(config.rotate || 45) }
        animationVariants.visible = { opacity: 1, rotate: 0 }
        break
    }

    await controls.start({
      ...animationVariants.visible,
      transition: {
        duration: (config.duration || 500) / 1000,
        delay: (config.delay || 0) / 1000,
        ease: (config.easing || 'easeOut') as Easing,
      },
    })
  }

  const handleDuplicate = () => {
    selectElement(block.id, 'block')
    copy()
    paste()
  }

  const handleInteraction = (type: 'hover' | 'click') => {
    const interactions = block.interactions?.filter((i) => i.type === type)
    interactions?.forEach((interaction) => {
      interaction.actions.forEach((action) => {
        switch (action.type) {
          case 'animate':
            if (action.animation) {
              applyAnimation(action.animation)
            }
            break
          // Handle other action types
        }
      })
    })
  }

  const getBlockPreview = () => {
    // Reuse existing block preview logic
    switch (block.type) {
      case 'hero':
        return (
          <div className="rounded-md bg-gradient-to-r from-purple-50 via-purple-100 to-pink-50 p-6">
            <h3 className="text-text text-lg font-semibold">
              {String(block.data.headline || 'Hero Section')}
            </h3>
            {block.data.subheadline ? (
              <p className="text-text-secondary mt-2 text-sm">{String(block.data.subheadline)}</p>
            ) : null}
          </div>
        )
      case 'product':
        return (
          <div className="rounded-md bg-gradient-to-r from-blue-50 to-cyan-50 p-6">
            <h3 className="text-text text-lg font-semibold">Product Showcase</h3>
            <p className="text-text-secondary mt-2 text-sm">
              Display your product with pricing and features
            </p>
          </div>
        )
      case 'payment':
        return (
          <div className="rounded-md bg-gradient-to-r from-emerald-50 to-green-50 p-6">
            <h3 className="text-text text-lg font-semibold">Payment Form</h3>
            <p className="text-text-secondary mt-2 text-sm">
              Secure checkout with Stripe integration
            </p>
          </div>
        )
      default:
        return (
          <div className="rounded-md bg-gradient-to-r from-gray-50 to-gray-100 p-6">
            <h3 className="text-text text-lg font-semibold capitalize">{block.type} Block</h3>
          </div>
        )
    }
  }

  // Check visibility based on conditions
  const checkVisibility = () => {
    if (block.visibility?.condition) {
      try {
        // Safe evaluation of visibility condition
        return eval(block.visibility.condition)
      } catch {
        return true
      }
    }
    return true
  }

  const shouldRender = isVisible && checkVisibility()

  return (
    <motion.div
      ref={(node) => {
        setNodeRef(node)
        if (ref.current !== node && node) {
          ref.current = node
        }
      }}
      style={style}
      className={cn(
        'group relative rounded-xl transition-all',
        isDragging ? 'opacity-50' : '',
        !shouldRender && 'opacity-30'
      )}
      onClick={() => selectElement(block.id, 'block')}
      onMouseEnter={() => handleInteraction('hover')}
      onMouseDown={() => handleInteraction('click')}
      animate={controls}
      initial="hidden"
    >
      <GlassmorphicCard
        className={cn(
          'relative overflow-hidden',
          isSelected && 'ring-primary shadow-primary/20 shadow-lg ring-2 ring-offset-2',
          block.styles.className
        )}
        style={{
          padding: block.styles.padding,
          margin: block.styles.margin,
          minHeight: block.styles.minHeight,
        }}
        variant="light"
        hover={false}
      >
        {/* Animation Indicators */}
        {block.animations && block.animations.length > 0 && (
          <div className="absolute top-2 left-12 flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
            <Zap className="h-3 w-3" />
            {block.animations.length} animations
          </div>
        )}

        {/* Interaction Indicators */}
        {block.interactions && block.interactions.length > 0 && (
          <div className="absolute top-2 left-32 flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
            <MousePointer className="h-3 w-3" />
            {block.interactions.length} interactions
          </div>
        )}

        {/* Drag Handle */}
        <div
          className="absolute top-0 bottom-0 left-0 flex w-10 cursor-grab items-center justify-center rounded-l-lg bg-gradient-to-b from-gray-100 to-gray-200 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-gray-600" />
        </div>

        {/* Block Content */}
        <div className="ml-10 p-4">
          {shouldRender ? (
            getBlockPreview()
          ) : (
            <div className="text-text-tertiary py-4 text-center">
              <EyeOff className="mx-auto mb-2 h-6 w-6" />
              <p className="text-sm">Hidden Block - {block.type}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              setIsVisible(!isVisible)
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm transition-colors hover:bg-white/70"
            title={isVisible ? 'Hide block' : 'Show block'}
          >
            {isVisible ? (
              <Eye className="h-4 w-4 text-gray-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-600" />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              handleDuplicate()
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/50 backdrop-blur-sm transition-colors hover:bg-white/70"
            title="Duplicate block"
          >
            <Copy className="h-4 w-4 text-gray-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              deleteEnhancedBlock(block.id)
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50/50 backdrop-blur-sm transition-colors hover:bg-red-100/70"
            title="Delete block"
          >
            <Trash2 className="text-danger h-4 w-4" />
          </motion.button>
        </div>
      </GlassmorphicCard>
    </motion.div>
  )
}