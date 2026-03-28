'use client'

import { ArrowLeft, CheckCircle2, RotateCcw } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import type { SessionCard } from '@/app/api/flashcard/session/route'
import type { AnswerResult } from './FlashCard'
import { FlashCard } from './FlashCard'

interface HskFlashcardSessionProps {
  initialCards: SessionCard[]
  onComplete: () => void
  contextLabel?: string // e.g. "HSK 1 · 动词 · กริยา"
}

interface CardResult {
  simplified: string
  isCorrect: boolean
  elapsedMs: number
  isNew: boolean
}

export function HskFlashcardSession({
  initialCards,
  onComplete,
  contextLabel,
}: HskFlashcardSessionProps) {
  // Queue: starts with initial cards; wrong first-pass cards are appended once at end
  const [queue, setQueue] = useState<SessionCard[]>(initialCards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<CardResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const firstPassLength = initialCards.length
  // Accumulate cards answered wrong during the first pass
  const wrongFirstPassRef = useRef<SessionCard[]>([])
  // Ensure we only append wrong cards to the queue once
  const requeuedRef = useRef(false)

  const totalCards = queue.length
  const isDone = currentIndex >= totalCards

  // Called immediately when user selects an MCQ option
  const handleAnswer = useCallback(
    async (result: AnswerResult) => {
      const card = queue[currentIndex]
      if (!card) return

      setIsLoading(true)

      try {
        const res = await fetch('/api/flashcard/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wordSimplified: card.simplified,
            hskLevel: card.level,
            isCorrect: result.isCorrect,
            elapsedMs: result.elapsedMs,
            isNew: result.isNew,
            previousAssessment: card.previousAssessment ?? null,
          }),
        })
        if (!res.ok) {
          console.error('Failed to save review:', await res.text())
        }
      } catch (err) {
        console.error('Review submission error:', err)
      } finally {
        setIsLoading(false)
      }

      setResults((prev) => [
        ...prev,
        {
          simplified: card.simplified,
          isCorrect: result.isCorrect,
          elapsedMs: result.elapsedMs,
          isNew: result.isNew,
        },
      ])

      // Queue wrong first-pass cards for a second look at the end
      if (!result.isCorrect && currentIndex < firstPassLength) {
        wrongFirstPassRef.current.push(card)
      }
    },
    [queue, currentIndex, firstPassLength]
  )

  // Called when user taps "ถัดไป" on the card back
  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1

    // When we finish the first pass, append wrong cards once
    if (
      nextIndex >= firstPassLength &&
      !requeuedRef.current &&
      wrongFirstPassRef.current.length > 0
    ) {
      requeuedRef.current = true
      setQueue((prev) => [...prev, ...wrongFirstPassRef.current])
    }

    setCurrentIndex(nextIndex)
  }, [currentIndex, firstPassLength])

  // ─── Summary screen ──────────────────────────────────────────────────────────

  if (isDone) {
    const firstPassResults = results.slice(0, firstPassLength)
    const correctCount = firstPassResults.filter((r) => r.isCorrect).length
    const wrongCount = firstPassResults.filter((r) => !r.isCorrect).length
    const accuracy = firstPassLength > 0 ? Math.round((correctCount / firstPassLength) * 100) : 0
    const avgMs =
      firstPassResults.length > 0
        ? Math.round(
            firstPassResults.reduce((s, r) => s + r.elapsedMs, 0) / firstPassResults.length
          )
        : 0
    const avgSec = (avgMs / 1000).toFixed(1)
    const newCardsSeen = firstPassResults.filter((r) => r.isNew).length

    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center gap-6 max-w-sm mx-auto"
        style={{ animation: 'fadeSlideUp 0.4s ease-out both' }}
      >
        <style>{`
          @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className="w-16 h-16 rounded-full bg-[#7D8B6A]/15 flex items-center justify-center">
          <CheckCircle2 className="text-[#7D8B6A]" size={32} strokeWidth={1.5} />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold text-[#3D3630] tracking-tight">เสร็จแล้ว</h2>
          <p className="text-[#7A7067]">ทบทวน {firstPassLength} คำ</p>
        </div>

        {/* Stats grid */}
        <div className="w-full grid grid-cols-2 gap-3">
          <div className="p-4 bg-[#FFFEFB] border border-[#E8E0D5] rounded-xl text-center">
            <p className="text-2xl font-semibold text-[#6B7F5E]">{accuracy}%</p>
            <p className="text-xs text-[#9A9179] mt-0.5">ความแม่นยำ</p>
          </div>
          <div className="p-4 bg-[#FFFEFB] border border-[#E8E0D5] rounded-xl text-center">
            <p className="text-2xl font-semibold text-[#3D3630]">{avgSec}s</p>
            <p className="text-xs text-[#9A9179] mt-0.5">เวลาเฉลี่ย</p>
          </div>
          <div className="p-4 bg-[#FFFEFB] border border-[#E8E0D5] rounded-xl text-center">
            <p className="text-2xl font-semibold text-[#6B7F5E]">{correctCount}</p>
            <p className="text-xs text-[#9A9179] mt-0.5">ถูกต้อง</p>
          </div>
          <div className="p-4 bg-[#FFFEFB] border border-[#E8E0D5] rounded-xl text-center">
            <p className="text-2xl font-semibold text-[#B56B6B]">{wrongCount}</p>
            <p className="text-xs text-[#9A9179] mt-0.5">ผิด</p>
          </div>
        </div>

        {newCardsSeen > 0 && (
          <p className="text-xs text-[#9A9179]">เรียนคำใหม่ {newCardsSeen} คำในเซสชันนี้</p>
        )}

        <button
          type="button"
          onClick={onComplete}
          className="mt-2 px-6 py-2.5 bg-[#C4704B] hover:bg-[#A85A3A] text-white text-sm font-medium rounded-lg transition-colors"
        >
          กลับไปเลือกระดับ
        </button>
      </div>
    )
  }

  // ─── Session screen ───────────────────────────────────────────────────────────

  const card = queue[currentIndex]
  if (!card) return null
  const progress = totalCards > 0 ? (currentIndex / totalCards) * 100 : 0
  const isRequeuePhase = currentIndex >= firstPassLength

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto min-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          onClick={onComplete}
          className="flex items-center gap-1.5 text-sm text-[#7A7067] hover:text-[#3D3630] transition-colors shrink-0"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex-1 min-w-0">
          {contextLabel && (
            <p className="text-xs font-medium text-[#7A7067] mb-1 truncate">{contextLabel}</p>
          )}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-[#E8E0D5] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7D8B6A] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.max(2, progress)}%` }}
              />
            </div>
            <span className="text-xs text-[#9A9179] tabular-nums whitespace-nowrap shrink-0">
              {currentIndex} / {totalCards}
            </span>
          </div>
        </div>
      </div>

      {/* Re-queue phase indicator */}
      {isRequeuePhase && (
        <div className="flex items-center gap-2 px-3 py-2 mb-4 bg-[#FFF3ED] border border-[#C4704B]/25 rounded-lg">
          <RotateCcw size={13} className="text-[#C4704B] shrink-0" />
          <p className="text-xs text-[#C4704B] font-medium">ทบทวนคำที่ตอบผิด</p>
        </div>
      )}

      {/* Card — key forces remount on each new card so useState initializers re-run */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <FlashCard
          key={`${card.simplified}-${currentIndex}`}
          card={card}
          onAnswer={handleAnswer}
          onNext={handleNext}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
