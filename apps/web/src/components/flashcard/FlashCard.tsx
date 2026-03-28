'use client'

import { ArrowRight, CheckCircle2, Volume1, Volume2, XCircle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { SessionCard } from '@/app/api/flashcard/session/route'

// ─── Audio ────────────────────────────────────────────────────────────────────

function speakChinese(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      reject(new Error('SpeechSynthesis not supported'))
      return
    }
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'zh-CN'
    utter.rate = 0.85
    utter.pitch = 1
    utter.onend = () => resolve()
    utter.onerror = (e) => reject(e)
    window.speechSynthesis.speak(utter)
  })
}

const POS_LABEL: Record<string, string> = {
  动词: 'กริยา',
  名词: 'คำนาม',
  形容词: 'คุณศัพท์',
  副词: 'กริยาวิเศษณ์',
  连词: 'คำเชื่อม',
  量词: 'ลักษณนาม',
  介词: 'บุพบท',
  代词: 'สรรพนาม',
  其他: 'อื่นๆ',
}

export interface AnswerResult {
  isCorrect: boolean
  elapsedMs: number
  isNew: boolean
}

interface FlashCardProps {
  card: SessionCard
  onAnswer: (result: AnswerResult) => void
  onNext: () => void
  isLoading: boolean
}

// ─── HighlightedText ──────────────────────────────────────────────────────────
// mask=true → terracotta redaction bar with pinyin hint below

function HighlightedText({
  text,
  className,
  mask = false,
  pinyinHint,
}: {
  text: string
  className?: string
  mask?: boolean
  pinyinHint?: string
}) {
  const parts = text.split(/(\[\[.*?\]\])/)
  return (
    <span className={className}>
      {parts.map((part, i) => {
        const isHighlight = part.startsWith('[[') && part.endsWith(']]')
        const content = isHighlight ? part.slice(2, -2) : part
        if (!isHighlight) return <span key={`text::${part}`}>{content}</span>
        if (mask) {
          return (
            <span
              key={`mask::${part}`}
              className="inline-flex flex-col items-center gap-0.5 mx-0.5 align-bottom"
            >
              <span
                aria-hidden="true"
                className="inline-block rounded-md bg-[#C4704B] select-none"
                style={{ width: `${Math.max(content.length * 0.85, 1.2)}em`, height: '1.1em' }}
              />
              {pinyinHint && (
                <span className="text-[9px] text-[#C4704B] font-medium leading-none">
                  {pinyinHint}
                </span>
              )}
            </span>
          )
        }
        return (
          <mark
            key={`hl::${part}`}
            className="bg-transparent text-[#C4704B] font-semibold underline decoration-[#C4704B]/40 underline-offset-2"
          >
            {content}
          </mark>
        )
      })}
    </span>
  )
}

// ─── Option button ────────────────────────────────────────────────────────────

type OptionState = 'idle' | 'correct' | 'wrong' | 'reveal-correct'
const OPTION_LETTERS = ['ก', 'ข', 'ค', 'ง']

function OptionButton({
  label,
  index,
  state,
  disabled,
  onClick,
}: {
  label: string
  index: number
  state: OptionState
  disabled: boolean
  onClick: () => void
}) {
  const stateClass = {
    idle: 'bg-[#FFFEFB] border-[#E8E0D5] text-[#3D3630] hover:border-[#C4704B]/50 hover:bg-[#FAF5F0] active:scale-[0.98]',
    correct: 'bg-[#EBF2E8] border-[#6B7F5E] text-[#3D3630] animate-[correctPulse_0.4s_ease-out]',
    wrong: 'bg-[#F5E8E8] border-[#B56B6B] text-[#B56B6B] animate-[wrongShake_0.4s_ease-out]',
    'reveal-correct': 'bg-[#EBF2E8] border-[#6B7F5E] text-[#3D3630]',
  }[state]

  const icon = {
    idle: null,
    correct: <CheckCircle2 size={13} className="text-[#6B7F5E] shrink-0" />,
    wrong: <XCircle size={13} className="text-[#B56B6B] shrink-0" />,
    'reveal-correct': <CheckCircle2 size={13} className="text-[#6B7F5E] shrink-0" />,
  }[state]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex items-center gap-2 px-3 py-3 rounded-xl border text-left text-sm font-medium transition-all duration-200 select-none w-full',
        stateClass,
        disabled && state === 'idle' ? 'opacity-40 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <span className="w-6 h-6 rounded-full bg-[#F0EBE3] text-[#7A7067] text-xs flex items-center justify-center shrink-0 font-semibold">
        {OPTION_LETTERS[index]}
      </span>
      <span className="flex-1 leading-tight">{label}</span>
      {icon}
    </button>
  )
}

// ─── Main FlashCard ───────────────────────────────────────────────────────────

const AUTO_ADVANCE_CORRECT_MS = 2200
const AUTO_ADVANCE_WRONG_MS = 4000

export function FlashCard({ card, onAnswer, onNext, isLoading }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [autoProgress, setAutoProgress] = useState(0)
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoStartRef = useRef<number>(0)
  const startTimeRef = useRef<number>(Date.now())

  const [options] = useState<string[]>(() => {
    const correctMeaning = card.meaningTh?.split(',')[0]?.trim() ?? card.definitionEn
    const all = [correctMeaning, ...card.distractors.slice(0, 3)]
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = all[i] as string
      all[i] = all[j] as string
      all[j] = tmp
    }
    return all
  })

  const [correctIndex] = useState<number>(() => {
    const correctMeaning = card.meaningTh?.split(',')[0]?.trim() ?? card.definitionEn
    return options.indexOf(correctMeaning)
  })

  const handleSelect = useCallback(
    (index: number) => {
      if (selectedIndex !== null || isLoading) return
      const elapsedMs = Date.now() - startTimeRef.current
      const isCorrect = index === correctIndex
      setSelectedIndex(index)
      setTimeout(() => {
        setIsFlipped(true)
        const advanceMs = isCorrect ? AUTO_ADVANCE_CORRECT_MS : AUTO_ADVANCE_WRONG_MS
        autoStartRef.current = Date.now()
        const TICK = 30
        autoTimerRef.current = setInterval(() => {
          const elapsed = Date.now() - autoStartRef.current
          const progress = Math.min(elapsed / advanceMs, 1)
          setAutoProgress(progress)
          if (progress >= 1) {
            if (autoTimerRef.current) clearInterval(autoTimerRef.current)
            onNext()
          }
        }, TICK)
      }, 180)
      onAnswer({ isCorrect, elapsedMs, isNew: card.isNew })
    },
    [selectedIndex, isLoading, correctIndex, card.isNew, onAnswer, onNext]
  )

  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current)
    }
  }, [])

  const handleNext = useCallback(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current)
    onNext()
  }, [onNext])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (isFlipped) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          if (!isLoading) handleNext()
        }
      } else {
        const num = parseInt(e.key, 10)
        if (num >= 1 && num <= 4) {
          e.preventDefault()
          handleSelect(num - 1)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isFlipped, isLoading, handleNext, handleSelect])

  const handleAudio = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel()
      setIsPlayingAudio(false)
      return
    }
    setIsPlayingAudio(true)
    speakChinese(card.simplified)
      .catch(() => {})
      .finally(() => setIsPlayingAudio(false))
  }

  const levelLabel = card.level === 7 ? 'HSK 7-9' : `HSK ${card.level}`
  const isCorrectAnswer = selectedIndex !== null && selectedIndex === correctIndex
  const posLabel = card.pos ? POS_LABEL[card.pos] : null

  function getOptionState(index: number): OptionState {
    if (selectedIndex === null) return 'idle'
    if (index === correctIndex) {
      if (isFlipped || selectedIndex === correctIndex) return 'correct'
      if (selectedIndex !== null) return 'reveal-correct'
      return 'idle'
    }
    if (index === selectedIndex) return 'wrong'
    return 'idle'
  }

  return (
    <div className="w-full" style={{ perspective: '1200px' }}>
      <style>{`
        @keyframes correctPulse {
          0% { transform: scale(1); }
          40% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
        @keyframes wrongShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-slide-up { animation: fadeSlideUp 0.3s ease-out both; }
      `}</style>

      <div
        className="relative w-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s ease-in-out',
          height: '420px',
        }}
      >
        {/* ══════════════════════ FRONT ══════════════════════════════════════ */}
        <div
          className="absolute inset-0 flex flex-col bg-[#FFFEFB] border border-[#E8E0D5] rounded-2xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* ── Tags row ── */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 bg-[#F0EBE3] text-[#7A7067] text-xs font-medium rounded-full">
                {levelLabel}
              </span>
              {posLabel && (
                <span className="px-2.5 py-0.5 bg-[#EBF2E8] text-[#5A6E4E] text-xs font-medium rounded-full">
                  {card.pos} · {posLabel}
                </span>
              )}
              {card.isNew && (
                <span className="px-2.5 py-0.5 bg-[#FFF3ED] text-[#C4704B] text-xs font-medium rounded-full">
                  คำใหม่
                </span>
              )}
            </div>
            <span className="text-xs text-[#C8C2BB]">#{card.frequencyRank}</span>
          </div>

          {/* ── TOP: Hanzi + audio + sentence ── */}
          <div className="flex flex-col items-center justify-center flex-1 px-5 gap-3 min-h-0">
            {/* Hanzi */}
            <p
              className="text-[72px] sm:text-[80px] font-medium text-[#2C2824] leading-none select-none"
              style={{ fontFamily: 'serif' }}
            >
              {card.simplified}
            </p>

            {/* Audio */}
            <button
              type="button"
              onClick={handleAudio}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs transition-colors',
                isPlayingAudio
                  ? 'border-[#C4704B]/40 text-[#C4704B] bg-[#FFF3ED]'
                  : 'border-[#E8E0D5] text-[#7A7067] hover:bg-[#F5F0EA]',
              ].join(' ')}
            >
              {isPlayingAudio ? (
                <Volume1 size={13} className="animate-pulse" />
              ) : (
                <Volume2 size={13} />
              )}
              <span>{isPlayingAudio ? 'กำลังเล่น...' : 'ฟังเสียง'}</span>
            </button>

            {/* Example sentence with terracotta masked block */}
            {card.sentence && (
              <div className="w-full px-4 py-2 bg-[#FAF7F2] border border-[#E8E0D5] rounded-xl text-center">
                <HighlightedText
                  text={card.sentence.zh}
                  mask
                  pinyinHint={card.pinyin}
                  className="text-sm text-[#3D3630] leading-loose"
                />
              </div>
            )}
          </div>

          {/* ── DIVIDER ── */}
          <div className="flex items-center gap-3 px-5 py-0 shrink-0">
            <div className="flex-1 h-px bg-[#E8E0D5]" />
            <span className="text-[10px] text-[#B5AFA8] uppercase tracking-wider">
              เลือกความหมาย
            </span>
            <div className="flex-1 h-px bg-[#E8E0D5]" />
          </div>

          {/* ── BOTTOM: 2×2 MCQ grid ── */}
          <div className="px-4 pt-3 pb-4 shrink-0">
            <div className="grid grid-cols-2 gap-2">
              {options.map((opt, i) => (
                <OptionButton
                  // biome-ignore lint/suspicious/noArrayIndexKey: MCQ options are positional, no stable id
                  key={i}
                  index={i}
                  label={opt}
                  state={getOptionState(i)}
                  disabled={selectedIndex !== null}
                  onClick={() => handleSelect(i)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════ BACK ═══════════════════════════════════════ */}
        <div
          className="absolute inset-0 flex flex-col bg-[#FFFEFB] border border-[#E8E0D5] rounded-2xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* ── Result banner ── */}
          {selectedIndex !== null && (
            <div
              className={[
                'flex items-center gap-2 px-4 py-3 shrink-0 fade-slide-up border-b',
                isCorrectAnswer
                  ? 'bg-[#EBF2E8] border-[#6B7F5E]/20'
                  : 'bg-[#F5E8E8] border-[#B56B6B]/20',
              ].join(' ')}
            >
              {isCorrectAnswer ? (
                <>
                  <CheckCircle2 size={17} className="text-[#6B7F5E] shrink-0" />
                  <span className="text-sm font-semibold text-[#3D3630]">ถูกต้อง!</span>
                </>
              ) : (
                <>
                  <XCircle size={17} className="text-[#B56B6B] shrink-0" />
                  <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                    <span className="text-sm font-semibold text-[#B56B6B] shrink-0">
                      {card.isNew ? 'ยังไม่เคยเห็นคำนี้' : 'ไม่ถูกต้อง'}
                    </span>
                    {selectedIndex !== null && selectedIndex !== correctIndex && (
                      <span className="text-xs text-[#9A9179]">
                        เลือก <span className="text-[#B56B6B]">{options[selectedIndex]}</span>
                        <span className="mx-1.5 text-[#C8C2BB]">·</span>
                        ถูก{' '}
                        <span className="font-semibold text-[#6B7F5E]">
                          {options[correctIndex]}
                        </span>
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Word info row ── */}
          <div className="flex items-center gap-4 px-5 py-3 shrink-0 border-b border-[#F0EBE3]">
            {/* Hanzi */}
            <div className="flex items-baseline gap-2 shrink-0">
              <p className="text-4xl font-medium text-[#2C2824]" style={{ fontFamily: 'serif' }}>
                {card.simplified}
              </p>
              {card.traditional !== card.simplified && (
                <p className="text-base text-[#9A9179]">{card.traditional}</p>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#7A7067]">{card.pinyin}</p>
              {card.meaningTh && (
                <p className="text-xl font-semibold text-[#3D3630] leading-tight">
                  {card.meaningTh}
                </p>
              )}
              {posLabel && (
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-[#EBF2E8] text-[#5A6E4E] text-xs rounded-full">
                  {card.pos} · {posLabel}
                </span>
              )}
            </div>

            {/* Audio */}
            <button
              type="button"
              onClick={handleAudio}
              className={[
                'p-2 border rounded-lg transition-colors shrink-0',
                isPlayingAudio
                  ? 'border-[#C4704B]/40 text-[#C4704B] bg-[#FFF3ED]'
                  : 'border-[#E8E0D5] text-[#7A7067] hover:bg-[#F5F0EA]',
              ].join(' ')}
            >
              {isPlayingAudio ? (
                <Volume1 size={15} className="animate-pulse" />
              ) : (
                <Volume2 size={15} />
              )}
            </button>
          </div>

          {/* ── Example sentence ── */}
          <div className="flex-1 px-5 py-3 min-h-0 overflow-auto">
            {card.sentence ? (
              <div className="h-full p-3 bg-[#FAF7F2] border border-[#E8E0D5] rounded-xl space-y-1.5 fade-slide-up">
                <p className="text-[10px] text-[#9A9179] font-medium uppercase tracking-wide">
                  ตัวอย่างประโยค
                </p>
                <HighlightedText
                  text={card.sentence.zh}
                  className="text-base text-[#2C2824] leading-relaxed block"
                />
                <HighlightedText
                  text={card.sentence.pinyin}
                  className="text-xs text-[#7A7067] leading-relaxed block"
                />
                <HighlightedText
                  text={card.sentence.th}
                  className="text-sm text-[#9A9179] leading-relaxed block"
                />
              </div>
            ) : (
              <div className="h-full p-3 bg-[#FAF7F2] border border-[#E8E0D5] rounded-xl">
                <p className="text-xs text-[#9A9179] leading-relaxed">{card.definitionEn}</p>
              </div>
            )}
          </div>

          {/* ── Countdown + Next button ── */}
          <div className="px-5 pb-4 pt-2 space-y-2 shrink-0">
            <div className="h-0.5 bg-[#E8E0D5] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C4704B]/50 rounded-full"
                style={{
                  width: `${autoProgress * 100}%`,
                  transition: autoProgress === 0 ? 'none' : 'width 0.03s linear',
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#C4704B] hover:bg-[#A85A3A] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 active:scale-[0.98]"
            >
              <span>ถัดไป</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Legacy Flashcard ─────────────────────────────────────────────────────────

export type FsrsRating = 'Forgot' | 'Struggled' | 'Remembered' | 'Mastered'

const TONE_COLORS: Record<number, string> = {
  1: 'text-[#2C2824]',
  2: 'text-[#7D8B6A]',
  3: 'text-[#C4704B]',
  4: 'text-[#B56B6B]',
  5: 'text-[#9A9179]',
}

export function PinyinDisplay({ pinyin, tones }: { pinyin: string; tones?: number[] }) {
  const syllables = pinyin.split(' ')
  return (
    <span className="select-text tracking-wide">
      {syllables.map((syllable, i) => {
        const digit = syllable.match(/(\d)$/)?.[1]
        const tone = digit ? parseInt(digit, 10) : (tones?.[i] ?? 5)
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: pinyin syllables are positional
          <span key={i} className={TONE_COLORS[tone] ?? TONE_COLORS[5]}>
            {syllable}
            {i < syllables.length - 1 ? ' ' : ''}
          </span>
        )
      })}
    </span>
  )
}

interface LegacyFlashcardProps {
  hanzi: string
  pinyin: string
  tones?: number[]
  thaiMeaning: string
  englishMeaning?: string
  audioUrl?: string
  isFlipped: boolean
  onClick: () => void
  disabled?: boolean
}

export function Flashcard({
  hanzi,
  pinyin,
  tones,
  thaiMeaning,
  englishMeaning,
  audioUrl,
  isFlipped,
  onClick,
  disabled = false,
}: LegacyFlashcardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!audioUrl) return
    if (!audioRef.current) audioRef.current = new Audio(audioUrl)
    audioRef.current.currentTime = 0
    audioRef.current.play().catch(() => {})
  }
  return (
    <button
      type="button"
      tabIndex={0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (!disabled && e.key === 'Enter') onClick()
      }}
      className={[
        'relative w-full max-w-lg mx-auto cursor-pointer aspect-[3/4] sm:aspect-[4/3] [perspective:1000px]',
        disabled ? 'pointer-events-none opacity-70' : '',
      ].join(' ')}
    >
      <div
        className={[
          'w-full h-full [transform-style:preserve-3d] transition-transform duration-500 ease-out',
          isFlipped ? '[transform:rotateY(180deg)]' : '',
        ].join(' ')}
      >
        <div className="absolute inset-0 [backface-visibility:hidden] flex flex-col items-center justify-center p-8 bg-[#FFFEFB] border border-[#E8E0D5] rounded-2xl">
          <span className="text-[5rem] sm:text-[7rem] font-medium text-[#2C2824] select-none leading-none">
            {hanzi}
          </span>
          <p className="absolute bottom-5 text-[#9A9179] text-xs tracking-widest uppercase">
            แตะเพื่อดูความหมาย
          </p>
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-center p-8 bg-[#FAF7F2] border border-[#E8E0D5] rounded-2xl">
          <div className="w-full flex flex-col items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="text-3xl sm:text-4xl font-medium">
                <PinyinDisplay pinyin={pinyin} tones={tones} />
              </span>
              {audioUrl && (
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className="p-1.5 rounded-full text-[#9A9179] hover:text-[#3D3630] hover:bg-[#E8E0D5] transition-colors"
                >
                  <Volume2 size={18} />
                </button>
              )}
            </div>
            <div className="w-16 h-px bg-[#E8E0D5]" />
            <div className="text-center space-y-1.5">
              {thaiMeaning ? (
                <p className="text-2xl sm:text-3xl font-medium text-[#3D3630]">{thaiMeaning}</p>
              ) : (
                <p className="text-base text-[#9A9179] italic">ยังไม่มีคำแปล</p>
              )}
              {englishMeaning && <p className="text-sm text-[#7A7067]">{englishMeaning}</p>}
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}
