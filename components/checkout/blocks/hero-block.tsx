'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface HeroBlockProps {
  data: {
    headline: string
    subheadline?: string
    backgroundType: 'gradient' | 'image' | 'solid'
    gradient?: {
      type: 'aurora' | 'sunset' | 'ocean' | 'custom'
      colors?: string[]
      animate?: boolean
    }
    image?: {
      url: string
      overlay?: boolean
      overlayOpacity?: number
    }
    solidColor?: string
  }
  styles?: {
    padding?: string
    minHeight?: string
    className?: string
  }
}

export function HeroBlock({ data, styles }: HeroBlockProps) {
  const getBackgroundStyle = () => {
    switch (data.backgroundType) {
      case 'gradient':
        if (data.gradient?.type === 'aurora') {
          return 'bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500'
        } else if (data.gradient?.type === 'sunset') {
          return 'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600'
        } else if (data.gradient?.type === 'ocean') {
          return 'bg-gradient-to-br from-blue-400 via-teal-500 to-green-500'
        }
        return 'bg-gradient-to-br from-purple-100 to-pink-100'
      case 'solid':
        return ''
      default:
        return 'bg-gradient-to-br from-purple-50 to-pink-50'
    }
  }

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        getBackgroundStyle(),
        styles?.padding || 'px-6 py-16',
        styles?.className
      )}
      style={{
        minHeight: styles?.minHeight || '400px',
        backgroundColor: data.backgroundType === 'solid' ? data.solidColor : undefined,
      }}
    >
      {/* Background image */}
      {data.backgroundType === 'image' && data.image?.url && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${data.image.url})` }}
          />
          {data.image.overlay && (
            <div
              className="absolute inset-0 bg-gray-900"
              style={{ opacity: data.image.overlayOpacity || 0.5 }}
            />
          )}
        </>
      )}

      {/* Animated gradient overlay */}
      {data.gradient?.animate && (
        <div className="absolute inset-0 opacity-50">
          <div className="gradient-animated h-full w-full bg-gradient-to-r from-transparent via-white to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 text-4xl font-bold text-white md:text-6xl"
        >
          {data.headline || 'Welcome to Our Checkout'}
        </motion.h1>
        {data.subheadline && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-100 md:text-2xl"
          >
            {data.subheadline}
          </motion.p>
        )}
      </div>
    </section>
  )
}
