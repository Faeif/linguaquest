/**
 * Input — Primitive UI Component
 * 
 * Form input with consistent styling and theme tokens
 */

import * as React from 'react'
import { cn } from './lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Error message to display below input */
  error?: string
  /** Label text for the input */
  label?: string
  /** Helper text to display below input */
  helperText?: string
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode
  /** Icon to display on the right side */
  rightIcon?: React.ReactNode
}

/**
 * Input Component
 * 
 * @example
 * ```tsx
 * <Input placeholder="Enter your name" />
 * <Input label="Email" type="email" error="Invalid email" />
 * <Input leftIcon={<MailIcon />} placeholder="Search..." />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, error, label, helperText, leftIcon, rightIcon, disabled, ...props },
    ref
  ) => {
    const id = React.useId()
    const inputId = props.id ?? `input-${id}`
    const hasError = !!error

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              // Base styles
              'flex h-10 w-full rounded-lg border bg-surface px-3 py-2 text-sm',
              'text-text-primary placeholder:text-text-tertiary',
              
              // States
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled',
              
              // Border states
              hasError
                ? 'border-error focus:border-error'
                : 'border-border-strong hover:border-border focus:border-accent',
              
              // Icon padding
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            className={cn(
              'mt-1.5 text-xs',
              hasError ? 'text-error' : 'text-text-secondary'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
