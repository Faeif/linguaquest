'use client'

import type { FlashCard, ReviewRating } from '@linguaquest/core'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { submitReviewAction } from '@/app/actions/flashcard'
import { Flashcard } from './FlashCard'
import { ReviewControls } from './ReviewControls'

export type ExtendedFlashcard = FlashCard & {
  predicted_intervals: Record<ReviewRating, number>
  hanzi: string
  thai_meaning: string
  pinyin: string
  tones: string[]
  audio_url?: string
  english_meaning?: string
}

interface FlashcardSessionProps {
  initialCards: ExtendedFlashcard[]
  onComplete: () => void
}

export function FlashcardSession({ initialCards, onComplete }: FlashcardSessionProps) {
  const [cards] = useState<ExtendedFlashcard[]>(initialCards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isPending, startTransition] = useTransition()

  const totalCards = cards.length
  const isDone = currentIndex >= totalCards

  // Space bar flips the card; handled here so ReviewControls keys don't conflict
  useEffect(() => {
    if (isDone) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === ' ' && !isFlipped) {
        e.preventDefault()
        setIsFlipped(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isDone, isFlipped])

  const handleFlip = useCallback(() => {
    if (!isFlipped) setIsFlipped(true)
  }, [isFlipped])

  const handleRating = useCallback(
    (rating: ReviewRating) => {
      const current = cards[currentIndex]
      setIsFlipped(false)
      setCurrentIndex((prev) => prev + 1)

      startTransition(async () => {
        try {
          await submitReviewAction(current.id, rating, current)
        } catch {
          // non-blocking — user has already moved on
        }
      })
    },
    [cards, currentIndex]
  )

  // ── Session complete ──────────────────────────────────────
  if (isDone) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-[#7D8B6A]/15 flex items-center justify-center">
          <CheckCircle2 className="text-[#7D8B6A]" size={32} strokeWidth={1.5} />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold text-[#3D3630] tracking-tight">Session complete</h2>
          <p className="text-[#7A7067]">
            {totalCards} {totalCards === 1 ? 'card' : 'cards'} reviewed
          </p>
        </div>
        <button
          type="button"
          onClick={onComplete}
          className="mt-2 px-6 py-2.5 bg-[#3D3630] hover:bg-[#2A2420] text-white text-sm font-medium rounded-lg transition-colors"
        >
          Back to Decks
        </button>
      </div>
    )
  }

  const card = cards[currentIndex]
  if (!card) return null
  const progress = (currentIndex / totalCards) * 100

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto min-h-[calc(100vh-120px)]">
      {/* ── Header ──────────────────────────────── */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={onComplete}
          className="flex items-center gap-1.5 text-sm text-[#7A7067] hover:text-[#3D3630] transition-colors"
        >
          <ArrowLeft size={16} />
          Exit
        </button>

        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-[#E8E0D5] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7D8B6A] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.max(2, progress)}%` }}
            />
          </div>
          <span className="text-xs text-[#9A9179] tabular-nums whitespace-nowrap">
            {currentIndex} / {totalCards}
          </span>
        </div>
      </div>

      {/* ── Card ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <Flashcard
          hanzi={card.hanzi}
          pinyin={card.pinyin}
          tones={card.tones}
          thaiMeaning={card.thai_meaning}
          englishMeaning={card.english_meaning}
          audioUrl={card.audio_url}
          isFlipped={isFlipped}
          onClick={handleFlip}
        />

        {/* ── Controls / hint ─────────────────────── */}
        <div className="w-full min-h-[56px] flex items-center justify-center">
          {isFlipped ? (
            <ReviewControls
              onRating={handleRating}
              intervals={card.predicted_intervals}
              disabled={isPending}
            />
          ) : (
            <p className="text-sm text-[#9A9179]">Space or tap the card to flip</p>
          )}
        </div>
      </div>
    </div>
  )
}
