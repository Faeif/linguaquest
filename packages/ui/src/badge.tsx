/**
 * Badge — Primitive UI Component
 * 
 * Status indicator with multiple variants
 */

import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from './lib/utils'

/**
 * Badge variants using class-variance-authority
 */
const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-accent text-text-inverse hover:bg-accent-hover',
        secondary: 'border-transparent bg-accent-secondary text-text-inverse hover:bg-accent-secondary-hover',
        outline: 'text-text-primary border-border-strong',
        muted: 'border-transparent bg-accent-muted text-text-primary',
        success: 'border-transparent bg-success text-text-inverse hover:bg-success-hover',
        error: 'border-transparent bg-error text-text-inverse hover:bg-error-hover',
        warning: 'border-transparent bg-warning text-text-primary',
        info: 'border-transparent bg-info text-text-inverse',
      },
      size: {
        sm: 'h-5 px-2 text-[10px]',
        md: 'h-6 px-2.5 text-xs',
        lg: 'h-7 px-3 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

/**
 * Badge props interface
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Icon to display before text */
  leftIcon?: React.ReactNode
  /** Icon to display after text */
  rightIcon?: React.ReactNode
}

/**
 * Badge Component
 * 
 * @example
 * ```tsx
 * <Badge>New</Badge>
 * <Badge variant="success">Completed</Badge>
 * <Badge variant="outline" size="sm">Draft</Badge>
 * ```
 */
function Badge({
  className,
  variant,
  size,
  leftIcon,
  rightIcon,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {leftIcon && <span className="mr-1 -ml-0.5">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-1 -mr-0.5">{rightIcon}</span>}
    </div>
  )
}

export { Badge, badgeVariants }
