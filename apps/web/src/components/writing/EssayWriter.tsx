'use client'

/**
 * EssayWriter — HSK 5 & HSK 6
 *
 * HSK 5 (short_essay):
 *   - Write ~80 chars using 5 required vocabulary words
 *   - Word tracker shows which words are used
 *   - AI-graded by DeepSeek
 *
 * HSK 6 (reading_to_summary):
 *   - Phase 1: Read article (timer counts down)
 *   - Phase 2: Article disappears → write ~400 char summary
 *   - AI-graded on 3 rubric criteria
 */

import type {
  GradeResult,
  ReadingToSummaryExercise,
  ShortEssayExercise,
} from '@linguaquest/core/writing/types'
import { CheckCircle, Clock, Loader2, XCircle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

// ─── Timer hook ────────────────────────────────────────────────────────────────

function useCountdown(initialSec: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(initialSec)
  const [running, setRunning] = useState(false)
  const expiredRef = useRef(false)

  useEffect(() => {
    if (!running) return
    if (remaining <= 0) {
      if (!expiredRef.current) {
        expiredRef.current = true
        onExpire()
      }
      return
    }
    const t = setTimeout(() => setRemaining((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [running, remaining, onExpire])

  const start = useCallback(() => setRunning(true), [])
  const stop = useCallback(() => setRunning(false), [])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const display = `${mm}:${ss}`
  const isLow = remaining < 120 // < 2 min

  return { display, isLow, remaining, start, stop }
}

// ─── Shared Grade Result panel ────────────────────────────────────────────────

function GradePanel({ result, onNext }: { result: GradeResult; onNext: () => void }) {
  return (
    <div
      className={[
        'p-5 rounded-2xl border space-y-3',
        result.passed ? 'bg-[#F5F9F3] border-[#6B7F5E]/30' : 'bg-[#FDF5F5] border-[#B56B6B]/30',
      ].join(' ')}
    >
      {/* Score row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {result.passed ? (
            <CheckCircle size={18} className="text-[#6B7F5E]" />
          ) : (
            <XCircle size={18} className="text-[#B56B6B]" />
          )}
          <span
            className={[
              'text-base font-semibold',
              result.passed ? 'text-[#6B7F5E]' : 'text-[#B56B6B]',
            ].join(' ')}
          >
            {result.score} / 100
          </span>
        </div>
        <span className="text-xs text-[#9A9179]">{result.passed ? 'ผ่านแล้ว' : 'ยังไม่ผ่าน'}</span>
      </div>

      {/* Rubric breakdown */}
      {result.rubric && result.rubric.length > 0 && (
        <div className="space-y-1.5">
          {result.rubric.map((r) => (
            <div key={r.criterion} className="flex items-start gap-3">
              <span className="text-xs text-[#7A7067] w-28 shrink-0 pt-0.5">{r.criterion}</span>
              <div className="flex-1">
                <div className="h-1.5 bg-[#E8E0D5] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#7D8B6A] transition-all duration-700"
                    style={{ width: `${(r.score / r.maxScore) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-[#9A9179] mt-0.5">{r.comment}</p>
              </div>
              <span className="text-xs text-[#7A7067] shrink-0 tabular-nums">
                {r.score}/{r.maxScore}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Main feedback */}
      <p className="text-sm text-[#3D3630] border-t border-[#E8E0D5] pt-3">{result.feedback}</p>

      {result.corrections && (
        <p
          className="text-sm text-[#2C2824] border-t border-[#E8E0D5] pt-3"
          style={{ fontFamily: 'serif' }}
        >
          {result.corrections}
        </p>
      )}

      <button
        type="button"
        onClick={onNext}
        className="w-full py-2.5 bg-[#C4704B] hover:bg-[#A85A3A] text-white text-sm font-semibold rounded-xl transition-colors"
      >
        ข้อถัดไป
      </button>
    </div>
  )
}

// ─── HSK 5: Short Essay ────────────────────────────────────────────────────────

interface ShortEssayProps {
  exercise: ShortEssayExercise
  onComplete: (correct: boolean, answer: string) => void
}

type ShortEssayState = 'writing' | 'grading' | 'done'

function ShortEssay({ exercise, onComplete }: ShortEssayProps) {
  const [text, setText] = useState('')
  const [state, setState] = useState<ShortEssayState>('writing')
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null)

  // Use a ref so the timer callback always calls the latest version of handleSubmit
  const submitRef = useRef<(() => void) | null>(null)

  const handleExpire = useCallback(() => {
    submitRef.current?.()
  }, [])

  const timer = useCountdown(exercise.timeLimitSec, handleExpire)

  // Start timer on mount — intentionally empty deps (run once)
  // biome-ignore lint/correctness/useExhaustiveDependencies: run-once on mount
  useEffect(() => {
    timer.start()
  }, [])

  const charCount = text.length
  const hasEnough = charCount >= exercise.targetChars
  const usedWords = exercise.requiredWords.filter((w) => text.includes(w))
  const missingWords = exercise.requiredWords.filter((w) => !text.includes(w))

  const handleSubmit = useCallback(async () => {
    if (state !== 'writing') return
    timer.stop()
    setState('grading')

    try {
      const res = await fetch('/api/writing/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseType: 'short_essay',
          hskLevel: exercise.hskLevel,
          requiredWords: exercise.requiredWords,
          targetChars: exercise.targetChars,
          userAnswer: text,
        }),
      })
      const json = (await res.json()) as { data: GradeResult | null; error: string | null }
      if (json.data) {
        setGradeResult(json.data)
      }
    } catch {
      // Show generic result on error
      setGradeResult({
        score: 0,
        passed: false,
        feedback: 'เกิดข้อผิดพลาดในการตรวจ กรุณาลองใหม่',
      })
    } finally {
      setState('done')
    }
  }, [exercise, state, text, timer])

  // Keep ref in sync with latest handleSubmit (ref-sync pattern)
  useEffect(() => {
    submitRef.current = () => void handleSubmit()
  }, [handleSubmit])

  if (state === 'done' && gradeResult) {
    return <GradePanel result={gradeResult} onNext={() => onComplete(gradeResult.passed, text)} />
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#7A7067]">
          เขียนเรียงความสั้นโดยใช้คำศัพท์ทั้ง {exercise.requiredWords.length} คำ
        </p>
        <div
          className={[
            'flex items-center gap-1.5 text-sm font-mono font-semibold',
            timer.isLow ? 'text-[#B56B6B]' : 'text-[#7A7067]',
          ].join(' ')}
        >
          <Clock size={14} />
          {timer.display}
        </div>
      </div>

      {/* Required words tracker */}
      <div className="flex flex-wrap gap-2">
        {exercise.requiredWords.map((word, idx) => {
          const isUsed = text.includes(word)
          return (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static word list
              key={idx}
              className={[
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border transition-colors',
                isUsed
                  ? 'bg-[#F5F9F3] border-[#6B7F5E]/40 text-[#6B7F5E]'
                  : 'bg-[#FFFEFB] border-[#E8E0D5] text-[#7A7067]',
              ].join(' ')}
            >
              <span style={{ fontFamily: 'serif' }}>{word}</span>
              <span>{exercise.wordPinyin[idx]}</span>
              {isUsed && <span>✓</span>}
            </div>
          )
        })}
      </div>

      {/* Text area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={state === 'grading'}
          rows={6}
          placeholder="เริ่มเขียนเรียงความที่นี่…"
          className={[
            'w-full px-4 py-3 rounded-xl border-2 text-base text-[#2C2824] outline-none resize-none transition-all duration-200',
            'placeholder:text-[#B5AFA8] placeholder:text-sm',
            'bg-[#FFFEFB] focus:border-[#C4704B]/60 focus:shadow-[0_0_0_3px_rgba(196,112,75,0.08)] border-[#E8E0D5]',
          ].join(' ')}
          style={{ fontFamily: 'serif' }}
        />
        <span
          className={[
            'absolute bottom-3 right-3 text-xs tabular-nums',
            hasEnough ? 'text-[#6B7F5E]' : 'text-[#9A9179]',
          ].join(' ')}
        >
          {charCount} / {exercise.targetChars}
        </span>
      </div>

      {/* Missing word warning */}
      {missingWords.length > 0 && text.length > 10 && (
        <p className="text-xs text-[#C4704B]">ยังขาด: {missingWords.join('、')}</p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={state === 'grading' || !hasEnough || missingWords.length > 0}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#C4704B] hover:bg-[#A85A3A] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
      >
        {state === 'grading' ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            AI กำลังตรวจ…
          </>
        ) : (
          `ส่งเรียงความ (${usedWords.length}/${exercise.requiredWords.length} คำ)`
        )}
      </button>
    </div>
  )
}

// ─── HSK 6: Reading → Summary ─────────────────────────────────────────────────

interface ReadingToSummaryProps {
  exercise: ReadingToSummaryExercise
  onComplete: (correct: boolean, answer: string) => void
}

type Hsk6Phase = 'reading' | 'writing' | 'grading' | 'done'

function ReadingToSummary({ exercise, onComplete }: ReadingToSummaryProps) {
  const [phase, setPhase] = useState<Hsk6Phase>('reading')
  const [text, setText] = useState('')
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null)

  // Use a ref to avoid stale closures in timer callbacks
  const writeSubmitRef = useRef<(() => void) | null>(null)

  const handleReadExpire = useCallback(() => setPhase('writing'), [])
  const handleWriteExpire = useCallback(() => {
    writeSubmitRef.current?.()
  }, [])

  const readTimer = useCountdown(exercise.readTimeSec, handleReadExpire)
  const writeTimer = useCountdown(exercise.writeTimeSec, handleWriteExpire)

  // Start read timer on mount — intentionally run once
  // biome-ignore lint/correctness/useExhaustiveDependencies: run-once on mount
  useEffect(() => {
    readTimer.start()
  }, [])

  // Start write timer when entering writing phase
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — only react to phase changes
  useEffect(() => {
    if (phase === 'writing') {
      writeTimer.start()
    }
  }, [phase])

  const charCount = text.length
  const hasEnough = charCount >= Math.floor(exercise.targetSummaryChars * 0.7)

  const handleStartWriting = () => {
    readTimer.stop()
    setPhase('writing')
  }

  const handleSubmit = useCallback(async () => {
    if (phase !== 'writing') return
    writeTimer.stop()
    setPhase('grading')

    try {
      const res = await fetch('/api/writing/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseType: 'reading_to_summary',
          hskLevel: exercise.hskLevel,
          articleText: exercise.articleText,
          targetSummaryChars: exercise.targetSummaryChars,
          userAnswer: text,
        }),
      })
      const json = (await res.json()) as { data: GradeResult | null; error: string | null }
      setGradeResult(
        json.data ?? {
          score: 0,
          passed: false,
          feedback: 'เกิดข้อผิดพลาด',
        }
      )
    } catch {
      setGradeResult({ score: 0, passed: false, feedback: 'เกิดข้อผิดพลาดในการตรวจ' })
    } finally {
      setPhase('done')
    }
  }, [exercise, phase, text, writeTimer])

  // Keep writeSubmitRef in sync with latest handleSubmit (ref-sync pattern)
  useEffect(() => {
    writeSubmitRef.current = () => void handleSubmit()
  }, [handleSubmit])

  // ── Phase: Reading ──
  if (phase === 'reading') {
    return (
      <div className="flex flex-col gap-4">
        {/* Timer + prompt */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#3D3630]">{exercise.articleTitle}</h3>
            <p className="text-xs text-[#9A9179] mt-0.5">อ่านบทความ — บทความจะหายไปเมื่อหมดเวลา</p>
          </div>
          <div
            className={[
              'flex items-center gap-1.5 text-sm font-mono font-semibold',
              readTimer.isLow ? 'text-[#B56B6B]' : 'text-[#7A7067]',
            ].join(' ')}
          >
            <Clock size={14} />
            {readTimer.display}
          </div>
        </div>

        {/* Article text */}
        <div className="p-5 bg-[#FFFEFB] border border-[#E8E0D5] rounded-2xl max-h-[60vh] overflow-y-auto">
          <p
            className="text-base text-[#2C2824] leading-loose whitespace-pre-wrap"
            style={{ fontFamily: 'serif' }}
          >
            {exercise.articleText}
          </p>
        </div>

        {/* Early submit */}
        <button
          type="button"
          onClick={handleStartWriting}
          className="w-full py-2.5 bg-[#3D3630] hover:bg-[#2C2824] text-white text-sm font-semibold rounded-xl transition-colors"
        >
          อ่านเสร็จแล้ว — เริ่มเขียนสรุป
        </button>
      </div>
    )
  }

  // ── Phase: Grading spinner ──
  if (phase === 'grading') {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <Loader2 size={28} className="animate-spin text-[#C4704B]" />
        <p className="text-sm text-[#7A7067]">AI กำลังตรวจสรุป…</p>
      </div>
    )
  }

  // ── Phase: Done ──
  if (phase === 'done' && gradeResult) {
    return <GradePanel result={gradeResult} onNext={() => onComplete(gradeResult.passed, text)} />
  }

  // ── Phase: Writing ──
  return (
    <div className="flex flex-col gap-4">
      {/* Timer */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#3D3630]">เขียนสรุปบทความ</h3>
          <p className="text-xs text-[#9A9179] mt-0.5">
            เขียนสรุปประมาณ {exercise.targetSummaryChars} ตัวอักษร โดยไม่คัดลอกประโยคทั้งหมด
          </p>
        </div>
        <div
          className={[
            'flex items-center gap-1.5 text-sm font-mono font-semibold',
            writeTimer.isLow ? 'text-[#B56B6B] animate-pulse' : 'text-[#7A7067]',
          ].join(' ')}
        >
          <Clock size={14} />
          {writeTimer.display}
        </div>
      </div>

      {/* Reminder: article is hidden */}
      <div className="px-4 py-2 bg-[#FFF3ED] border border-[#C4704B]/20 rounded-lg">
        <p className="text-xs text-[#C4704B]">บทความถูกซ่อนไปแล้ว — เขียนสรุปจากความจำ</p>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder="เขียนสรุปบทความที่นี่…"
          className={[
            'w-full px-4 py-3 rounded-xl border-2 text-base text-[#2C2824] outline-none resize-none transition-all duration-200',
            'placeholder:text-[#B5AFA8] placeholder:text-sm',
            'bg-[#FFFEFB] focus:border-[#C4704B]/60 focus:shadow-[0_0_0_3px_rgba(196,112,75,0.08)] border-[#E8E0D5]',
          ].join(' ')}
          style={{ fontFamily: 'serif' }}
        />
        <span
          className={[
            'absolute bottom-3 right-3 text-xs tabular-nums',
            hasEnough ? 'text-[#6B7F5E]' : 'text-[#9A9179]',
          ].join(' ')}
        >
          {charCount} / {exercise.targetSummaryChars}
        </span>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!hasEnough}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#C4704B] hover:bg-[#A85A3A] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
      >
        ส่งสรุป ({charCount} ตัวอักษร)
      </button>
    </div>
  )
}

// ─── Public wrapper ────────────────────────────────────────────────────────────

interface EssayWriterProps {
  exercise: ShortEssayExercise | ReadingToSummaryExercise
  onComplete: (correct: boolean, answer: string) => void
}

export function EssayWriter({ exercise, onComplete }: EssayWriterProps) {
  if (exercise.type === 'short_essay') {
    return <ShortEssay exercise={exercise} onComplete={onComplete} />
  }
  return <ReadingToSummary exercise={exercise} onComplete={onComplete} />
}
