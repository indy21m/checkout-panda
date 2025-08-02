import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: [
          'bg-gradient-to-r from-primary to-secondary text-white',
          'hover:shadow-lg hover:shadow-(rgba(10,132,255,0.25))',
          'focus-visible:ring-primary',
        ],
        secondary: [
          'text-primary bg-(rgba(255,255,255,0.1)) backdrop-blur-md',
          'border border-(rgba(10,132,255,0.2))',
          'hover:border-(rgba(10,132,255,0.3)) hover:bg-(rgba(255,255,255,0.2))',
          'dark:bg-(rgba(0,0,0,0.1)) dark:hover:bg-(rgba(0,0,0,0.2))',
        ],
        ghost: [
          'text-primary hover:bg-(rgba(10,132,255,0.1))',
          'dark:hover:bg-(rgba(10,132,255,0.2))',
        ],
        glass: [
          'bg-(rgba(255,255,255,0.1)) text-white backdrop-blur-xl',
          'border border-(rgba(255,255,255,0.2))',
          'hover:border-(rgba(255,255,255,0.3)) hover:bg-(rgba(255,255,255,0.2))',
          'shadow-xl shadow-(rgba(0,0,0,0.1))',
        ],
        destructive: [
          'bg-destructive text-destructive-foreground',
          'hover:bg-destructive/90',
          'focus-visible:ring-destructive',
        ],
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
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
