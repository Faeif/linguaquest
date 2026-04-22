'use client'

/**
 * WritingClient — Writing Coach orchestrator
 * Handles: level selection → exercise loading → session → results
 */

import type {
  ImageComposeExercise,
  PinyinToCharExercise,
  ReadingToSummaryExercise,
  SentenceOrderingExercise,
  ShortEssayExercise,
  WritingExercise,
  WritingHskLevel,
} from '@linguaquest/core/writing/types'
import { ChevronLeft, ChevronRight, Pen, Trophy } from 'lucide-react'
import { useState } from 'react'
import { EssayWriter } from '@/components/writing/EssayWriter'
import { ImagePromptCompose } from '@/components/writing/ImagePromptCompose'
import { PinyinToCharacter } from '@/components/writing/PinyinToCharacter'
import { SentenceOrdering } from '@/components/writing/SentenceOrdering'

// ─── Level config ──────────────────────────────────────────────────────────────

interface LevelMode {
  mode: string
  label: string
  description: string
}

const LEVEL_CONFIG: Record<
  WritingHskLevel,
  { title: string; thaiTitle: string; color: string; modes: LevelMode[] }
> = {
  3: {
    title: 'HSK 3',
    thaiTitle: 'ระดับกลาง',
    color: '#7D8B6A',
    modes: [
      {
        mode: 'sentence_ordering',
        label: 'เรียงประโยค',
        description: 'ลากคำมาเรียงให้ถูกไวยากรณ์',
      },
      {
        mode: 'pinyin_to_char',
        label: 'พินอิน → อักษร',
        description: 'อ่านพินอินแล้วพิมพ์ตัวอักษรจีน',
      },
    ],
  },
  4: {
    title: 'HSK 4',
    thaiTitle: 'ระดับกลาง-สูง',
    color: '#7D8B6A',
    modes: [
      {
        mode: 'sentence_ordering',
        label: 'เรียงประโยค',
        description: 'ลากคำมาเรียงให้ถูกไวยากรณ์',
      },
      {
        mode: 'image_compose',
        label: 'ดูภาพแต่งประโยค',
        description: 'ดูรูปภาพและแต่งประโยคใช้คำที่กำหนด',
      },
    ],
  },
  5: {
    title: 'HSK 5',
    thaiTitle: 'ระดับสูง',
    color: '#C4704B',
    modes: [
      {
        mode: 'short_essay',
        label: 'เขียนเรียงความสั้น',
        description: 'เขียน ~80 ตัวอักษร ใช้คำศัพท์ 5 คำ',
      },
    ],
  },
  6: {
    title: 'HSK 6',
    thaiTitle: 'ระดับสูงมาก',
    color: '#C4704B',
    modes: [
      {
        mode: 'reading_to_summary',
        label: 'อ่านแล้วสรุป',
        description: 'อ่านบทความ 10 นาที จากนั้นเขียนสรุป ~400 ตัวอักษร',
      },
    ],
  },
}

// ─── Selector ──────────────────────────────────────────────────────────────────

interface LevelModeSelectorProps {
  onStart: (level: WritingHskLevel, mode: string) => void
}

function LevelModeSelector({ onStart }: LevelModeSelectorProps) {
  const levels: WritingHskLevel[] = [3, 4, 5, 6]

  return (
    <div className="w-full max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#3D3630] tracking-tight flex items-center gap-2">
          <Pen size={20} className="text-[#C4704B]" />
          ฝึกเขียน
        </h1>
        <p className="mt-0.5 text-sm text-[#7A7067]">Writing Coach · HSK 3–6</p>
      </div>

      {levels.map((level) => {
        const cfg = LEVEL_CONFIG[level]
        return (
          <div
            key={level}
            className="bg-[#FFFEFB] border border-[#E8E0D5] rounded-2xl overflow-hidden"
          >
            {/* Level header */}
            <div className="px-5 pt-5 pb-3 border-b border-[#F0EBE3]">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-[#3D3630]">{cfg.title}</span>
                <span className="text-sm text-[#9A9179]">{cfg.thaiTitle}</span>
              </div>
            </div>

            {/* Mode buttons */}
            <div className="divide-y divide-[#F0EBE3]">
              {cfg.modes.map((m) => (
                <button
                  type="button"
                  key={m.mode}
                  onClick={() => onStart(level, m.mode)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[#FAF7F2] transition-colors group text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-[#3D3630]">{m.label}</p>
                    <p className="text-xs text-[#9A9179] mt-0.5">{m.description}</p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-[#C4704B]/40 group-hover:text-[#C4704B] group-hover:translate-x-0.5 transition-all shrink-0"
                  />
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Session header ────────────────────────────────────────────────────────────

interface SessionHeaderProps {
  level: WritingHskLevel
  mode: string
  current: number
  total: number
  onBack: () => void
}

function SessionHeader({ level, mode, current, total, onBack }: SessionHeaderProps) {
  const cfg = LEVEL_CONFIG[level]
  const modeLabel = cfg.modes.find((m) => m.mode === mode)?.label ?? mode
  const progress = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="mb-5 space-y-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-[#7A7067] hover:text-[#3D3630] transition-colors"
        >
          <ChevronLeft size={16} />
          กลับ
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#3D3630] truncate">
            {cfg.title} · {modeLabel}
          </p>
          <p className="text-xs text-[#9A9179]">
            ข้อ {current + 1} / {total}
          </p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-[#E8E0D5] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: cfg.color }}
        />
      </div>
    </div>
  )
}

// ─── Results screen ────────────────────────────────────────────────────────────

interface ResultsScreenProps {
  correct: number
  total: number
  level: WritingHskLevel
  onRestart: () => void
  onHome: () => void
}

function ResultsScreen({ correct, total, level, onRestart, onHome }: ResultsScreenProps) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const cfg = LEVEL_CONFIG[level]

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-6 py-8">
      <div className="w-16 h-16 rounded-full bg-[#FFF3ED] border border-[#C4704B]/20 flex items-center justify-center">
        <Trophy size={28} className="text-[#C4704B]" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-3xl font-semibold text-[#3D3630]">{pct}%</p>
        <p className="text-sm text-[#7A7067]">
          ถูก {correct} / {total} ข้อ — {cfg.title}
        </p>
      </div>

      <div className="w-full space-y-2">
        <button
          type="button"
          onClick={onRestart}
          className="w-full py-2.5 bg-[#C4704B] hover:bg-[#A85A3A] text-white text-sm font-semibold rounded-xl transition-colors"
        >
          เล่นอีกครั้ง
        </button>
        <button
          type="button"
          onClick={onHome}
          className="w-full py-2.5 border border-[#E8E0D5] text-[#7A7067] hover:text-[#3D3630] hover:bg-[#F0EBE3] text-sm rounded-xl transition-colors"
        >
          กลับหน้าหลัก
        </button>
      </div>
    </div>
  )
}

// ─── Main client ───────────────────────────────────────────────────────────────

type ClientView = 'selector' | 'loading' | 'session' | 'results'

interface SessionResult {
  correct: number
  total: number
}

export function WritingClient() {
  const [view, setView] = useState<ClientView>('selector')
  const [selectedLevel, setSelectedLevel] = useState<WritingHskLevel>(3)
  const [selectedMode, setSelectedMode] = useState('sentence_ordering')
  const [exercises, setExercises] = useState<WritingExercise[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<SessionResult>({ correct: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)

  const handleStart = async (level: WritingHskLevel, mode: string) => {
    setSelectedLevel(level)
    setSelectedMode(mode)
    setView('loading')
    setError(null)

    try {
      const res = await fetch(`/api/writing/exercise?level=${level}&mode=${mode}&count=5`)
      const json = (await res.json()) as {
        data: { exercises: WritingExercise[] } | null
        error: string | null
      }

      if (json.error || !json.data || json.data.exercises.length === 0) {
        setError(json.error ?? 'ไม่สามารถโหลดแบบฝึกหัดได้')
        setView('selector')
        return
      }

      setExercises(json.data.exercises)
      setCurrentIndex(0)
      setResults({ correct: 0, total: json.data.exercises.length })
      setView('session')
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
      setView('selector')
    }
  }

  const handleExerciseComplete = (correct: boolean) => {
    setResults((prev) => ({
      ...prev,
      correct: prev.correct + (correct ? 1 : 0),
    }))

    if (currentIndex + 1 >= exercises.length) {
      setView('results')
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  const handleRestart = () => {
    void handleStart(selectedLevel, selectedMode)
  }

  const handleHome = () => {
    setView('selector')
    setExercises([])
    setCurrentIndex(0)
    setResults({ correct: 0, total: 0 })
    setError(null)
  }

  // ── Loading ──
  if (view === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#C4704B] rounded-full animate-spin" />
        <p className="text-sm text-[#9A9179]">กำลังโหลดแบบฝึกหัด…</p>
      </div>
    )
  }

  // ── Results ──
  if (view === 'results') {
    return (
      <ResultsScreen
        correct={results.correct}
        total={results.total}
        level={selectedLevel}
        onRestart={handleRestart}
        onHome={handleHome}
      />
    )
  }

  // ── Session ──
  if (view === 'session' && exercises.length > 0) {
    const exercise = exercises[currentIndex]
    if (!exercise) return null

    return (
      <div className="w-full max-w-2xl mx-auto">
        <SessionHeader
          level={selectedLevel}
          mode={selectedMode}
          current={currentIndex}
          total={exercises.length}
          onBack={handleHome}
        />

        <div className="bg-[#FFFEFB] border border-[#E8E0D5] rounded-2xl p-5">
          {exercise.type === 'sentence_ordering' && (
            <SentenceOrdering
              exercise={exercise as SentenceOrderingExercise}
              onComplete={(correct, _answer) => handleExerciseComplete(correct)}
            />
          )}
          {exercise.type === 'pinyin_to_char' && (
            <PinyinToCharacter
              exercise={exercise as PinyinToCharExercise}
              onComplete={(correct, _answer) => handleExerciseComplete(correct)}
            />
          )}
          {exercise.type === 'image_compose' && (
            <ImagePromptCompose
              exercise={exercise as ImageComposeExercise}
              onComplete={(correct, _answer) => handleExerciseComplete(correct)}
            />
          )}
          {(exercise.type === 'short_essay' || exercise.type === 'reading_to_summary') && (
            <EssayWriter
              exercise={exercise as ShortEssayExercise | ReadingToSummaryExercise}
              onComplete={(correct, _answer) => handleExerciseComplete(correct)}
            />
          )}
        </div>
      </div>
    )
  }

  // ── Selector ──
  return (
    <div className="w-full">
      {error && (
        <div className="max-w-lg mx-auto mb-4 px-4 py-3 rounded-lg bg-[#FDF6F0] border border-[#E8C8B8] text-sm text-[#B56B6B]">
          {error}
        </div>
      )}
      <LevelModeSelector onStart={handleStart} />
    </div>
  )
}
