'use client'

import type { ReviewRating } from '@linguaquest/core'
import { useEffect } from 'react'

interface ReviewControlsProps {
  onRating: (rating: ReviewRating) => void
  intervals: Record<ReviewRating, number>
  disabled?: boolean
}

const RATINGS = [
  { value: 'Forgot', label: 'Again', key: '1', bg: 'bg-[#B56B6B]', hover: 'hover:bg-[#A05858]' },
  { value: 'Struggled', label: 'Hard', key: '2', bg: 'bg-[#D29862]', hover: 'hover:bg-[#BE8450]' },
  { value: 'Remembered', label: 'Good', key: '3', bg: 'bg-[#7D8B6A]', hover: 'hover:bg-[#6C7A59]' },
  { value: 'Mastered', label: 'Easy', key: '4', bg: 'bg-[#557B83]', hover: 'hover:bg-[#456970]' },
] as const

function formatInterval(days: number): string {
  if (days < 1) return '< 1d'
  if (days < 30) return `${Math.round(days)}d`
  if (days < 365) return `${Math.round(days / 30)}mo`
  return `${(days / 365).toFixed(1)}y`
}

export function ReviewControls({ onRating, intervals, disabled = false }: ReviewControlsProps) {
  useEffect(() => {
    if (disabled) return
    const handler = (e: KeyboardEvent) => {
      const match = RATINGS.find((r) => r.key === e.key)
      if (match) onRating(match.value as ReviewRating)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [disabled, onRating])

  return (
    <div
      className={[
        'grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-xl mx-auto',
        'transition-opacity duration-200',
        disabled ? 'opacity-40 pointer-events-none' : 'opacity-100',
      ].join(' ')}
    >
      {RATINGS.map(({ value, label, key, bg, hover }) => {
        const rating = value as ReviewRating
        return (
          <button
            type="button"
            key={value}
            onClick={() => onRating(rating)}
            className={[
              'relative flex flex-col items-center justify-center gap-0.5',
              'py-3 px-2 rounded-xl text-white',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#7D8B6A]',
              bg,
              hover,
            ].join(' ')}
          >
            <span className="text-[10px] font-medium opacity-75 tabular-nums">
              {formatInterval(intervals[rating])}
            </span>
            <span className="text-sm font-semibold">{label}</span>
            <span className="absolute top-1.5 right-2 text-[9px] font-mono opacity-40 hidden sm:block">
              [{key}]
            </span>
          </button>
        )
      })}
    </div>
  )
}
