'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { motion, type HTMLMotionProps } from 'framer-motion'

interface GlassmorphicCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  variant?: 'light' | 'dark' | 'colored'
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  shadow?: boolean
  hover?: boolean
}

export function GlassmorphicCard({
  children,
  className,
  variant = 'light',
  blur = 'md',
  border = true,
  shadow = true,
  hover = false,
  ...props
}: GlassmorphicCardProps) {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  }

  const variantClasses = {
    light: 'bg-white/90 backdrop-saturate-150',
    dark: 'bg-black/60 backdrop-saturate-100',
    colored: 'bg-gradient-to-br from-white/80 via-white/70 to-white/60 backdrop-saturate-150',
  }

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl',
        blurClasses[blur],
        variantClasses[variant],
        border && 'border border-white/30 shadow-sm',
        shadow && 'shadow-xl shadow-black/10',
        hover &&
          'transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/15',
        className
      )}
      whileHover={hover ? { scale: 1.01 } : undefined}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {/* Gradient overlay for depth */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
