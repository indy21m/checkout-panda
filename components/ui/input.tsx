import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-lg px-4 py-2.5',
          'bg-background border border-border-light',
          'text-text placeholder:text-text-tertiary',
          'transition-all duration-200',
          'hover:border-border',
          'focus:outline-none focus:border-primary focus:ring-0',
          'focus:shadow-[0_0_0_3px_rgba(10,132,255,0.1)]',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
