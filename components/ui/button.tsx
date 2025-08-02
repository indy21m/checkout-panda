import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'focus-visible:ring-primary inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: [
          'bg-primary text-white',
          'hover:bg-primary-hover active:bg-primary-pressed',
          'shadow-sm hover:shadow-md',
        ],
        secondary: [
          'bg-background-secondary text-text',
          'hover:bg-background-tertiary',
          'border-border border',
        ],
        ghost: ['text-text-secondary', 'hover:text-text hover:bg-background-secondary'],
        glass: [
          'bg-background-glass backdrop-blur-xl',
          'border-border-light border',
          'hover:-translate-y-0.5 hover:shadow-lg',
          'text-text',
        ],
        destructive: ['bg-accent text-white', 'hover:bg-accent/90', 'shadow-sm hover:shadow-md'],
        outline: [
          'border-border border',
          'bg-background hover:bg-background-secondary',
          'text-text',
        ],
        link: ['text-primary underline-offset-4', 'hover:underline'],
        gradient: [
          'from-primary to-secondary bg-gradient-to-r',
          'text-white',
          'shadow-sm hover:-translate-y-0.5 hover:shadow-md',
        ],
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
