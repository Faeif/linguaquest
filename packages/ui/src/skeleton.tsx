/**
 * Skeleton — Loading Placeholder Component
 * 
 * Animated placeholder for content loading states
 */

import { cn } from './lib/utils'

/**
 * Skeleton props
 */
export interface SkeletonProps {
  /** Width of the skeleton (default: 100%) */
  width?: string | number
  /** Height of the skeleton (default: 1rem) */
  height?: string | number
  /** Border radius (default: rounded-md) */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Additional classes */
  className?: string
}

const roundedMap = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
}

/**
 * Skeleton Component
 * 
 * @example
 * ```tsx
 * <Skeleton width={200} height={24} />
 * <Skeleton width="100%" height={100} rounded="lg" />
 * <div className="space-y-2">
 *   <Skeleton height={20} />
 *   <Skeleton height={20} width="80%" />
 *   <Skeleton height={20} width="60%" />
 * </div>
 * ```
 */
function Skeleton({
  width = '100%',
  height = '1rem',
  rounded = 'md',
  className,
}: SkeletonProps) {
  const widthStyle = typeof width === 'number' ? `${width}px` : width
  const heightStyle = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={cn(
        'animate-pulse bg-accent-muted',
        roundedMap[rounded],
        className
      )}
      style={{
        width: widthStyle,
        height: heightStyle,
      }}
    />
  )
}

export { Skeleton }
