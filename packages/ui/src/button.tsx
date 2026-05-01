/**
 * Button — Primitive UI Component
 * 
 * Design Tokens Usage:
 * - All colors reference theme tokens (--color-*)
 * - No hardcoded hex values
 * - Supports all variants and sizes
 */

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from './lib/utils'

/**
 * Button variants using class-variance-authority
 * All colors reference CSS custom properties (theme tokens)
 */
const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        // Primary action — accent color
        primary: 'bg-accent text-text-inverse hover:bg-accent-hover active:bg-accent-active shadow-sm',
        
        // Secondary action — secondary accent
        secondary: 'bg-accent-secondary text-text-inverse hover:bg-accent-secondary-hover shadow-sm',
        
        // Outline — bordered style
        outline: 'border border-border-strong bg-surface text-text-primary hover:bg-surface-hover hover:border-border',
        
        // Ghost — minimal style
        ghost: 'text-text-secondary hover:text-text-primary hover:bg-accent-muted',
        
        // Destructive — error state
        destructive: 'bg-error text-text-inverse hover:bg-error-hover shadow-sm',
        
        // Success — positive action
        success: 'bg-success text-text-inverse hover:bg-success-hover shadow-sm',
        
        // Muted — subtle background
        muted: 'bg-accent-muted text-text-primary hover:bg-accent-subtle',
        
        // Link — text only
        link: 'text-accent underline-offset-4 hover:underline',
      },
      size: {
        xs: 'h-7 px-2 text-xs gap-1',
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-xs': 'h-7 w-7',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
)

/**
 * Button props interface
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

/**
 * Button Component
 * 
 * @example
 * ```tsx
 * <Button>Default</Button>
 * <Button variant="secondary">Secondary</Button>
 * <Button variant="outline" size="sm">Small Outline</Button>
 * <Button isLoading>Loading...</Button>
 * <Button leftIcon={<Icon />}>With Icon</Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    const isDisabled = disabled || isLoading

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <>
            <SpinnerIcon className="animate-spin" size={size === 'lg' ? 20 : 16} />
            {children}
          </>
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

/**
 * Spinner icon for loading state
 */
function SpinnerIcon({ className, size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

export { Button, buttonVariants }
