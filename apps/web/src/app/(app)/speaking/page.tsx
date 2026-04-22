'use client'

import { ArrowRight, ChevronLeft, Volume2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { SessionCard } from '@/app/api/flashcard/session/route'
import { SpeechPractice } from '@/components/flashcard/SpeechPractice'

// ─── Level selector ───────────────────────────────────────────────────────────

const LEVELS = [1, 2, 3, 4, 5, 6] as const
type Level = (typeof LEVELS)[number]

function LevelSelector({ onStart }: { onStart: (level: Level) => void }) {
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#3D3630] tracking-tight">Speaking Coach</h1>
        <p className="mt-0.5 text-sm text-[#7A7067]">
          ฝึกออกเสียงคำศัพท์ · Azure Pronunciation Assessment
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {LEVELS.map((lv) => (
          <button
            type="button"
            key={lv}
            onClick={() => onStart(lv)}
            className="flex flex-col items-center gap-1 p-4 bg-[#FFFEFB] border border-[#E8E0D5] rounded-2xl hover:border-[#C4704B]/50 hover:bg-[#FAF5F0] active:scale-[0.97] transition-all"
          >
            <span className="text-2xl font-bold text-[#2C2824]">{lv}</span>
            <span className="text-[10px] text-[#9A9179] font-medium uppercase tracking-wider">
              HSK {lv}
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-[#B5AFA8] text-center">
        กดการ์ดแล้วพูดออกเสียง — Azure AI จะให้คะแนน 声母 / 韵母 / 声调
      </p>
    </div>
  )
}

// ─── Word card ────────────────────────────────────────────────────────────────

function WordCard({
  card,
  index,
  total,
  onNext,
}: {
  card: SessionCard
  index: number
  total: number
  onNext: () => void
}) {
  const [revealed, setRevealed] = useState(false)
  const progress = (index / total) * 100

  function speakWord() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(card.simplified)
    u.lang = 'zh-CN'
    u.rate = 0.8
    window.speechSynthesis.speak(u)
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Progress header */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#9A9179]">
          {index + 1} / {total}
        </span>
        <div className="flex-1 h-1 bg-[#E8E0D5] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C4704B]/60 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-[#9A9179]">
          {card.level === 7 ? 'HSK 7-9' : `HSK ${card.level}`}
        </span>
      </div>

      {/* Main card */}
      <div className="bg-[#FFFEFB] border border-[#E8E0D5] rounded-2xl overflow-hidden">
        {/* Hanzi display */}
        <div className="flex flex-col items-center gap-3 px-6 pt-8 pb-6">
          <p
            className="text-[80px] font-medium text-[#2C2824] leading-none select-none"
            style={{ fontFamily: 'serif' }}
          >
            {card.simplified}
          </p>

          {/* Reveal / pinyin row */}
          {revealed ? (
            <div className="flex items-center gap-2">
              <p className="text-lg text-[#7A7067]">{card.pinyin}</p>
              <button
                type="button"
                onClick={speakWord}
                className="p-1.5 border border-[#E8E0D5] rounded-lg text-[#9A9179] hover:bg-[#F0EBE3] transition-colors"
              >
                <Volume2 size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setRevealed(true)
                speakWord()
              }}
              className="px-4 py-1.5 border border-[#E8E0D5] text-[#9A9179] text-xs rounded-lg hover:bg-[#F0EBE3] transition-colors"
            >
              แสดงพินอิน
            </button>
          )}

          {/* Meaning */}
          {revealed && card.meaningTh && (
            <p className="text-base text-[#3D3630] font-medium">{card.meaningTh}</p>
          )}
        </div>

        {/* Speaking practice section */}
        <div className="px-4 pb-4">
          <SpeechPractice word={card.simplified} pinyin={card.pinyin} />
        </div>
      </div>

      {/* Next button */}
      <button
        type="button"
        onClick={() => {
          setRevealed(false)
          onNext()
        }}
        className="flex items-center justify-center gap-2 w-full py-3 bg-[#C4704B] hover:bg-[#A85A3A] text-white text-sm font-semibold rounded-xl transition-colors active:scale-[0.98]"
      >
        คำถัดไป
        <ArrowRight size={15} />
      </button>
    </div>
  )
}

// ─── Results ──────────────────────────────────────────────────────────────────

function ResultsScreen({ total, onRestart }: { total: number; onRestart: () => void }) {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6 py-10">
      <div className="w-16 h-16 rounded-full bg-[#FFF3ED] border border-[#C4704B]/20 flex items-center justify-center">
        <span className="text-2xl">🎙️</span>
      </div>
      <div className="text-center space-y-1">
        <p className="text-2xl font-semibold text-[#3D3630]">ฝึกครบแล้ว!</p>
        <p className="text-sm text-[#7A7067]">ออกเสียง {total} คำ</p>
      </div>
      <button
        type="button"
        onClick={onRestart}
        className="w-full max-w-xs py-3 bg-[#C4704B] hover:bg-[#A85A3A] text-white text-sm font-semibold rounded-xl transition-colors"
      >
        ฝึกอีกครั้ง
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type View = 'selector' | 'loading' | 'session' | 'done'

export default function SpeakingPage() {
  const [view, setView] = useState<View>('selector')
  const [cards, setCards] = useState<SessionCard[]>([])
  const [index, setIndex] = useState(0)
  const [level, setLevel] = useState<Level>(1)
  const abortRef = useRef<AbortController | null>(null)

  const loadSession = useCallback(async (lv: Level) => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl

    setLevel(lv)
    setView('loading')

    try {
      const res = await fetch(`/api/flashcard/session?level=${lv}&limit=10&shuffle=true`, {
        signal: ctrl.signal,
      })
      const json = (await res.json()) as {
        data: { cards: SessionCard[] } | null
        error: string | null
      }

      if (!json.data?.cards?.length) {
        setView('selector')
        return
      }
      setCards(json.data.cards)
      setIndex(0)
      setView('session')
    } catch {
      setView('selector')
    }
  }, [])

  useEffect(() => () => abortRef.current?.abort(), [])

  const handleNext = useCallback(() => {
    if (index + 1 >= cards.length) {
      setView('done')
    } else {
      setIndex((i) => i + 1)
    }
  }, [index, cards.length])

  // ── Loading ──
  if (view === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#C4704B] rounded-full animate-spin" />
        <p className="text-sm text-[#9A9179]">กำลังโหลดคำศัพท์…</p>
      </div>
    )
  }

  // ── Done ──
  if (view === 'done') {
    return <ResultsScreen total={cards.length} onRestart={() => loadSession(level)} />
  }

  // ── Session ──
  if (view === 'session') {
    const card = cards[index]
    if (!card) return null

    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => setView('selector')}
          className="flex items-center gap-1 text-sm text-[#7A7067] hover:text-[#3D3630] transition-colors mb-4"
        >
          <ChevronLeft size={16} />
          กลับ
        </button>
        <WordCard card={card} index={index} total={cards.length} onNext={handleNext} />
      </div>
    )
  }

  // ── Selector ──
  return <LevelSelector onStart={loadSession} />
}
