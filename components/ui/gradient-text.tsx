'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  gradient?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'custom'
  customGradient?: string
  animate?: boolean
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
}

export function GradientText({
  children,
  className,
  gradient = 'primary',
  customGradient,
  animate = false,
  as: Component = 'span',
}: GradientTextProps) {
  const gradients = {
    primary: 'from-primary to-secondary',
    secondary: 'from-secondary to-accent',
    success: 'from-success to-emerald-400',
    warning: 'from-warning to-danger',
    danger: 'from-danger to-pink-600',
    custom: customGradient || 'from-primary to-secondary',
  }

  const content = (
    <Component
      className={cn(
        'bg-gradient-to-r bg-clip-text text-transparent',
        gradients[gradient],
        className
      )}
    >
      {children}
    </Component>
  )

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {content}
      </motion.div>
    )
  }

  return content
}
