'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient'
  interactive?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
      glass: [
        'bg-(rgba(255,255,255,0.1)) dark:bg-(rgba(0,0,0,0.1))',
        'backdrop-blur-xl backdrop-saturate-150',
        'border border-(rgba(255,255,255,0.2)) dark:border-(rgba(255,255,255,0.1))',
        'shadow-xl shadow-(rgba(0,0,0,0.1))',
      ].join(' '),
      gradient: [
        'bg-gradient-to-br from-(rgba(255,255,255,0.1)) to-(rgba(255,255,255,0.05))',
        'dark:from-(rgba(0,0,0,0.1)) dark:to-(rgba(0,0,0,0.05))',
        'backdrop-blur-xl',
        'border border-(rgba(255,255,255,0.2)) dark:border-(rgba(255,255,255,0.1))',
      ].join(' '),
    }

    if (interactive) {
      return (
        <motion.div
          ref={ref}
          className={cn(
            'rounded-xl p-6 transition-all duration-300',
            variants[variant],
            'cursor-pointer hover:scale-[1.02] hover:shadow-2xl',
            className
          )}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          {children}
        </motion.div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn('rounded-xl p-6 transition-all duration-300', variants[variant], className)}
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
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
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
