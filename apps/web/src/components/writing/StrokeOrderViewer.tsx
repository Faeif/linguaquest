'use client'

/**
 * StrokeOrderViewer
 * Shows animated stroke order for Chinese characters using hanzi-writer.
 * Each character gets its own div canvas.
 */

import { useEffect, useRef, useState } from 'react'

// ─── Type for hanzi-writer instance ───────────────────────────────────────────

interface WriterInstance {
  animateCharacter: (opts?: { onComplete?: () => void }) => void
  quiz: (opts?: {
    onMistake?: (strokeData: unknown) => void
    onCorrectStroke?: (strokeData: unknown) => void
    onComplete?: (summaryData: { totalMistakes: number }) => void
    leniency?: number
    showHintAfterMisses?: number | false
  }) => Promise<unknown>
  cancelQuiz: () => void
  hideCharacter: (opts?: { duration?: number }) => void
  showCharacter: (opts?: { duration?: number }) => void
}

interface StrokeOrderViewerProps {
  characters: string[]
  /** Size in px for each character canvas (default: 80) */
  size?: number
  /** Auto-play animation on mount (default: true) */
  autoPlay?: boolean
  /** Show quiz mode: user draws the stroke, gets feedback */
  quizMode?: boolean
  onQuizComplete?: (character: string, correct: boolean) => void
}

// ─── Single character cell ─────────────────────────────────────────────────────

interface CharCellProps {
  char: string
  size: number
  autoPlay: boolean
  quizMode: boolean
  onQuizComplete?: (char: string, correct: boolean) => void
}

function CharCell({ char, size, autoPlay, quizMode, onQuizComplete }: CharCellProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const writerRef = useRef<WriterInstance | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [quizDone, setQuizDone] = useState(false)
  const [mistakeCount, setMistakeCount] = useState(0)

  // biome-ignore lint/correctness/useExhaustiveDependencies: writer is created once per char/size — quizMode/autoPlay/onQuizComplete are read at mount only; re-adding them would reset animation unexpectedly
  useEffect(() => {
    if (!containerRef.current) return
    let cancelled = false
    const el = containerRef.current

    // Lazy-load to avoid SSR issues
    import('hanzi-writer').then((mod) => {
      if (cancelled) return
      const HanziWriter = mod.default
      const writer = HanziWriter.create(el, char, {
        width: size,
        height: size,
        padding: 5,
        strokeColor: '#2C2824',
        radicalColor: '#C4704B',
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 120,
        showOutline: true,
        outlineColor: '#E8E0D5',
      }) as WriterInstance

      writerRef.current = writer
      setIsReady(true)

      if (quizMode) {
        writer.hideCharacter()
        void writer.quiz({
          leniency: 1,
          showHintAfterMisses: 3,
          onMistake: () => setMistakeCount((n) => n + 1),
          onComplete: (summary) => {
            setQuizDone(true)
            onQuizComplete?.(char, summary.totalMistakes === 0)
          },
        })
      } else if (autoPlay) {
        writer.animateCharacter()
      }
    })

    return () => {
      cancelled = true
    }
  }, [char, size])

  const handleReplay = () => {
    writerRef.current?.animateCharacter()
  }

  const handleReQuiz = () => {
    if (!writerRef.current) return
    setQuizDone(false)
    setMistakeCount(0)
    writerRef.current.cancelQuiz()
    writerRef.current.hideCharacter()
    void writerRef.current.quiz({
      leniency: 1,
      showHintAfterMisses: 3,
      onMistake: () => setMistakeCount((n) => n + 1),
      onComplete: (summary) => {
        setQuizDone(true)
        onQuizComplete?.(char, summary.totalMistakes === 0)
      },
    })
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Canvas container */}
      <div
        className="relative rounded-xl border border-[#E8E0D5] bg-[#FFFEFB] overflow-hidden"
        style={{ width: size, height: size }}
      >
        {/* Grid lines (light) */}
        <svg
          width={size}
          height={size}
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <line
            x1={size / 2}
            y1={0}
            x2={size / 2}
            y2={size}
            stroke="#E8E0D5"
            strokeWidth={0.5}
            strokeDasharray="4 4"
          />
          <line
            x1={0}
            y1={size / 2}
            x2={size}
            y2={size / 2}
            stroke="#E8E0D5"
            strokeWidth={0.5}
            strokeDasharray="4 4"
          />
        </svg>

        {/* hanzi-writer renders inside this div */}
        <div ref={containerRef} className="absolute inset-0" />

        {/* Loading spinner */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#C4704B] rounded-full animate-spin" />
          </div>
        )}

        {/* Quiz done overlay */}
        {quizMode && quizDone && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#FFFEFB]/80 pointer-events-none">
            <span className="text-2xl font-bold text-[#6B7F5E]">✓</span>
          </div>
        )}
      </div>

      {/* Character label */}
      <span
        className="text-lg font-medium text-[#2C2824] leading-none"
        style={{ fontFamily: 'serif' }}
      >
        {char}
      </span>

      {/* Controls */}
      {isReady && !quizMode && (
        <button
          type="button"
          onClick={handleReplay}
          className="text-xs text-[#9A9179] hover:text-[#C4704B] transition-colors"
        >
          เล่นซ้ำ
        </button>
      )}
      {isReady && quizMode && quizDone && (
        <button
          type="button"
          onClick={handleReQuiz}
          className="text-xs text-[#9A9179] hover:text-[#C4704B] transition-colors"
        >
          ลองอีกครั้ง
        </button>
      )}
      {quizMode && !quizDone && isReady && (
        <span className="text-xs text-[#9A9179]">ผิด {mistakeCount} ครั้ง</span>
      )}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export function StrokeOrderViewer({
  characters,
  size = 80,
  autoPlay = true,
  quizMode = false,
  onQuizComplete,
}: StrokeOrderViewerProps) {
  const validChars = characters.filter((c) => /\p{Script=Han}/u.test(c))

  if (validChars.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-[#7A7067] uppercase tracking-wider">
        {quizMode ? 'ฝึกเขียน — วาดตามลำดับขีด' : 'ลำดับการเขียน (笔顺)'}
      </p>
      <div className="flex flex-wrap gap-4">
        {validChars.map((char) => (
          <CharCell
            key={char}
            char={char}
            size={size}
            autoPlay={autoPlay}
            quizMode={quizMode}
            onQuizComplete={onQuizComplete}
          />
        ))}
      </div>
    </div>
  )
}
