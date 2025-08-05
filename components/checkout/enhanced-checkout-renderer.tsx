'use client'

import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'
import { HeroBlock } from '@/components/checkout/blocks/hero-block'
import { ProductBlock } from '@/components/checkout/blocks/product-block'
import { PaymentBlock } from '@/components/checkout/blocks/payment-block'
import { TestimonialBlock } from '@/components/checkout/blocks/testimonial-block'
import { TrustBlock } from '@/components/checkout/blocks/trust-block'
import { BumpBlock } from '@/components/checkout/blocks/bump-block'
import type { Section, Column, EnhancedBlock, AnimationConfig } from '@/types/builder'
import { useEffect, useState } from 'react'

interface SeoMeta {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
}

interface CheckoutRendererProps {
  checkout: {
    id: string
    name: string
    slug: string
    pageData: {
      sections?: Section[]
      blocks?: EnhancedBlock[] // Legacy support
      settings: {
        theme?: string
        customCss?: string
        seoMeta?: SeoMeta
        globalAnimations?: {
          pageTransition?: AnimationConfig
          blockTransition?: AnimationConfig
          scrollSmoothing?: boolean
        }
      }
    }
  }
  productId?: string
  amount?: number
}

// Map block types to components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const blockComponents: Record<string, React.ComponentType<any>> = {
  hero: HeroBlock,
  product: ProductBlock,
  payment: PaymentBlock,
  testimonial: TestimonialBlock,
  trust: TrustBlock,
  bump: BumpBlock,
}

// Animation variant generators
const getAnimationVariants = (config?: AnimationConfig): Variants => {
  const baseVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  if (!config) return baseVariants

  const duration = config.duration / 1000
  const delay = (config.delay || 0) / 1000
  const ease = config.easing || 'easeOut'

  switch (config.type) {
    case 'fade':
      return {
        hidden: { opacity: config.opacity?.from ?? 0 },
        visible: {
          opacity: config.opacity?.to ?? 1,
          transition: {
            duration,
            delay,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ease: ease as any, // Framer Motion accepts string easing
          },
        },
      } as Variants

    case 'slide':
      const slideDistance = config.distance || 50
      const direction = config.direction || 'up'

      let xOffset = 0
      let yOffset = 0

      switch (direction) {
        case 'up':
          yOffset = slideDistance
          break
        case 'down':
          yOffset = -slideDistance
          break
        case 'left':
          xOffset = slideDistance
          break
        case 'right':
          xOffset = -slideDistance
          break
      }

      return {
        hidden: {
          opacity: config.opacity?.from ?? 0,
          x: xOffset,
          y: yOffset,
        },
        visible: {
          opacity: config.opacity?.to ?? 1,
          x: 0,
          y: 0,
          transition: {
            duration,
            delay,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ease: ease as any,
          },
        },
      } as Variants

    case 'scale':
      return {
        hidden: {
          opacity: config.opacity?.from ?? 0,
          scale: config.scale || 0.8,
        },
        visible: {
          opacity: config.opacity?.to ?? 1,
          scale: 1,
          transition: {
            duration,
            delay,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ease: ease as any,
          },
        },
      } as Variants

    case 'rotate':
      return {
        hidden: {
          opacity: config.opacity?.from ?? 0,
          rotate: config.rotate || -10,
        },
        visible: {
          opacity: config.opacity?.to ?? 1,
          rotate: 0,
          transition: {
            duration,
            delay,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ease: ease as any,
          },
        },
      } as Variants

    default:
      return baseVariants
  }
}

// Responsive value getter
function getResponsiveValue<T>(
  value: T | { base?: T; sm?: T; md?: T; lg?: T; xl?: T; '2xl'?: T },
  breakpoint = 'base'
): T | undefined {
  if (typeof value === 'object' && value !== null && 'base' in value) {
    const responsiveValue = value as { base?: T; sm?: T; md?: T; lg?: T; xl?: T; '2xl'?: T }
    return responsiveValue[breakpoint as keyof typeof responsiveValue] ?? responsiveValue.base
  }
  return value as T
}

// Block renderer component
function BlockRenderer({
  block,
  additionalProps,
}: {
  block: EnhancedBlock
  additionalProps?: Record<string, unknown>
}) {
  const BlockComponent = blockComponents[block.type]
  const [isVisible, setIsVisible] = useState(true)
  const [hasTriggered, setHasTriggered] = useState(false)

  useEffect(() => {
    // Handle visibility conditions
    if (block.visibility?.condition) {
      try {
        // eslint-disable-next-line no-eval
        const result = eval(block.visibility.condition)
        setIsVisible(Boolean(result))
      } catch (error) {
        console.error('Error evaluating visibility condition:', error)
      }
    }
  }, [block.visibility?.condition])

  useEffect(() => {
    // Handle scroll-triggered animations
    const scrollAnimations = block.animations?.filter((a) => a.trigger === 'onScroll')
    if (!scrollAnimations?.length || hasTriggered) return

    const handleScroll = () => {
      const element = document.getElementById(block.id)
      if (!element) return

      const rect = element.getBoundingClientRect()
      const threshold = scrollAnimations[0]?.scrollThreshold || 0.5
      const triggerPoint = window.innerHeight * (1 - threshold)

      if (rect.top <= triggerPoint) {
        setHasTriggered(true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial position

    return () => window.removeEventListener('scroll', handleScroll)
  }, [block.id, block.animations, hasTriggered])

  if (!BlockComponent) {
    console.warn(`Unknown block type: ${block.type}`)
    return null
  }

  if (!isVisible) return null

  // Get the first animation for the block
  const primaryAnimation = block.animations?.[0]
  const shouldAnimate =
    !primaryAnimation ||
    primaryAnimation.trigger === 'onLoad' ||
    (primaryAnimation.trigger === 'onScroll' && hasTriggered)

  return (
    <motion.div
      id={block.id}
      initial="hidden"
      animate={shouldAnimate ? 'visible' : 'hidden'}
      variants={getAnimationVariants(primaryAnimation)}
      className={block.styles.className}
      style={{
        padding: block.styles.padding,
        margin: block.styles.margin,
        minHeight: block.styles.minHeight,
      }}
    >
      <BlockComponent data={block.data} styles={block.styles} {...additionalProps} />
    </motion.div>
  )
}

// Column renderer component
function ColumnRenderer({
  column,
  additionalProps,
}: {
  column: Column
  additionalProps?: Record<string, unknown>
}) {
  const sortedBlocks = [...column.blocks].sort((a, b) => a.position - b.position)

  return (
    <div
      className={cn(
        'flex flex-col',
        column.settings.className,
        column.settings.verticalAlign === 'middle' && 'justify-center',
        column.settings.verticalAlign === 'bottom' && 'justify-end'
      )}
      style={{
        gridColumn: `span ${getResponsiveValue(column.span) || 12}`,
        padding: getResponsiveValue(column.settings.padding),
        background: column.settings.background,
        border: column.settings.border,
        borderRadius: column.settings.borderRadius,
        minHeight: getResponsiveValue(column.settings.minHeight),
      }}
    >
      {sortedBlocks.map((block, index) => (
        <motion.div
          key={block.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <BlockRenderer block={block} additionalProps={additionalProps} />
        </motion.div>
      ))}
    </div>
  )
}

// Section renderer component
function SectionRenderer({
  section,
  additionalProps,
}: {
  section: Section
  additionalProps?: Record<string, unknown>
}) {
  const isVisible = section.visibility?.desktop !== false // Default to visible

  if (!isVisible) return null

  return (
    <motion.section
      id={section.id}
      initial="hidden"
      animate="visible"
      variants={getAnimationVariants(section.settings.animation)}
      className={cn(
        'relative',
        section.settings.fullWidth ? 'w-full' : 'container mx-auto',
        section.settings.className
      )}
      style={{
        maxWidth: !section.settings.fullWidth
          ? getResponsiveValue(section.settings.maxWidth)
          : undefined,
        padding: getResponsiveValue(section.settings.padding),
        margin: getResponsiveValue(section.settings.margin),
      }}
    >
      {/* Background */}
      {section.settings.background && (
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              section.settings.background.type === 'color' ||
              section.settings.background.type === 'gradient'
                ? section.settings.background.value
                : undefined,
            backgroundImage:
              section.settings.background.type === 'image'
                ? `url(${section.settings.background.value})`
                : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: section.settings.background.blur
              ? `blur(${section.settings.background.blur}px)`
              : undefined,
          }}
        >
          {section.settings.background.overlay && (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: section.settings.background.overlay }}
            />
          )}
        </div>
      )}

      {/* Grid */}
      <div
        className="grid w-full"
        style={{
          gridTemplateColumns:
            section.settings.grid.customTemplate?.columns ||
            `repeat(${getResponsiveValue(section.settings.grid.columns) || 12}, 1fr)`,
          gap: getResponsiveValue(section.settings.grid.gap),
          alignItems: getResponsiveValue(section.settings.grid.alignItems),
          justifyItems: getResponsiveValue(section.settings.grid.justifyItems),
        }}
      >
        {section.columns.map((column) => (
          <ColumnRenderer key={column.id} column={column} additionalProps={additionalProps} />
        ))}
      </div>

      {/* Custom CSS */}
      {section.settings.customCss && (
        <style dangerouslySetInnerHTML={{ __html: section.settings.customCss }} />
      )}
    </motion.section>
  )
}

export function EnhancedCheckoutRenderer({ checkout, productId, amount }: CheckoutRendererProps) {
  const { sections, blocks, settings } = checkout.pageData
  const [, setCurrentBreakpoint] = useState('base')

  // Handle responsive breakpoints
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width >= 1536) setCurrentBreakpoint('2xl')
      else if (width >= 1280) setCurrentBreakpoint('xl')
      else if (width >= 1024) setCurrentBreakpoint('lg')
      else if (width >= 768) setCurrentBreakpoint('md')
      else if (width >= 640) setCurrentBreakpoint('sm')
      else setCurrentBreakpoint('base')
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  // Apply theme class if specified
  const themeClass = settings.theme ? `theme-${settings.theme}` : ''

  // Additional props for payment blocks
  const additionalProps = productId && amount ? { checkoutId: checkout.id, productId, amount } : {}

  // Handle legacy blocks (convert to sections)
  const hasSections = sections && sections.length > 0
  const legacySections: Section[] =
    !hasSections && blocks
      ? [
          {
            id: 'legacy-section',
            type: 'section',
            name: 'Legacy Content',
            columns: [
              {
                id: 'legacy-column',
                type: 'column',
                span: { base: 12 },
                blocks: blocks.map((block) => ({
                  ...block,
                  animations: [],
                  interactions: [],
                })),
                settings: {},
              },
            ],
            settings: {
              grid: {
                columns: { base: 12 },
                gap: { base: '0' },
              },
            },
          },
        ]
      : []

  const renderSections = hasSections ? sections : legacySections

  return (
    <div className={cn('min-h-screen', themeClass)}>
      {/* Apply custom CSS if provided */}
      {settings.customCss && <style dangerouslySetInnerHTML={{ __html: settings.customCss }} />}

      {/* Apply smooth scrolling if enabled */}
      {settings.globalAnimations?.scrollSmoothing && (
        <style dangerouslySetInnerHTML={{ __html: 'html { scroll-behavior: smooth; }' }} />
      )}

      {/* Render sections */}
      <AnimatePresence mode="wait">
        {renderSections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SectionRenderer section={section} additionalProps={additionalProps} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Default content if no sections */}
      {renderSections.length === 0 && (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Checkout Page Under Construction</h1>
            <p className="text-gray-600">
              This checkout page is being set up. Please check back soon.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
