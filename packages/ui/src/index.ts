/**
 * @linguaquest/ui — Shared UI Components
 * 
 * Primitive components using design system tokens
 * All components use CSS custom properties for theming
 */

// Button
export { Button, buttonVariants, type ButtonProps } from './button'

// Card
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './card'

// Input
export { Input, type InputProps } from './input'

// Badge
export { Badge, badgeVariants, type BadgeProps } from './badge'

// Skeleton
export { Skeleton, type SkeletonProps } from './skeleton'

// Spinner
export { Spinner, type SpinnerProps } from './spinner'

// Utilities
export { cn } from './lib/utils'
