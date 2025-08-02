'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'solid'
  interactive?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive = false, children, ...props }, ref) => {
    const variants = {
      default: [
        'bg-background',
        'border border-border-light',
        'shadow-sm',
        interactive && 'hover:shadow-md hover:-translate-y-0.5',
      ].filter(Boolean).join(' '),
      glass: [
        'bg-background-glass backdrop-blur-xl',
        'border border-border-light',
        'shadow-lg shadow-black/5',
        interactive && 'hover:shadow-xl hover:-translate-y-0.5',
      ].filter(Boolean).join(' '),
      gradient: [
        'bg-gradient-to-br from-primary/5 to-secondary/5',
        'border border-primary/10',
        'shadow-sm',
        interactive && 'hover:shadow-md hover:-translate-y-0.5',
      ].filter(Boolean).join(' '),
      solid: [
        'bg-background-secondary',
        'border border-border',
        'shadow-sm',
        interactive && 'hover:shadow-md',
      ].filter(Boolean).join(' '),
    }

    if (interactive) {
      return (
        <motion.div
          ref={ref}
          className={cn(
            'rounded-xl p-6 transition-all duration-200',
            variants[variant],
            'cursor-pointer',
            className
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          {...props}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn('rounded-xl p-6 transition-all duration-200', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
)

CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl leading-none font-semibold tracking-tight', className)}
      {...props}
    />
  )
)

CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-text-secondary', className)} {...props} />
))

CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)

CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
)

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }