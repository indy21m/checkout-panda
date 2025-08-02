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
    light: 'bg-white/70 dark:bg-gray-900/70',
    dark: 'bg-gray-900/70 dark:bg-white/10',
    colored: 'bg-gradient-to-br from-primary/10 to-secondary/10',
  }

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl',
        blurClasses[blur],
        variantClasses[variant],
        border && 'border border-white/20 dark:border-white/10',
        shadow && 'shadow-lg shadow-black/5',
        hover &&
          'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10',
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
