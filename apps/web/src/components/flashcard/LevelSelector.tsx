'use client'

import { BarChart2, ChevronRight, Play, Search } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

interface LevelStat {
  level: number
  totalWords: number
  dueCount: number
  seenCount: number
}

interface LevelSelectorProps {
  levelStats: LevelStat[]
  onSelectLevel: (level: number, pos?: string) => void
  posCountsByLevel?: Record<number, Partial<Record<string, number>>>
}

function getLevelLabel(level: number): string {
  return level === 7 ? 'HSK 7-9' : `HSK ${level}`
}

function getLevelDescription(level: number): string {
  switch (level) {
    case 1:
      return 'คำพื้นฐาน'
    case 2:
      return 'ระดับพื้นฐาน'
    case 3:
      return 'ระดับกลาง'
    case 4:
      return 'ระดับกลาง-สูง'
    case 5:
      return 'ระดับสูง'
    case 6:
      return 'ระดับสูงมาก'
    case 7:
      return 'ระดับเชี่ยวชาญ'
    default:
      return ''
  }
}

// POS display order (most common first)
const POS_ORDER = ['动词', '名词', '形容词', '副词', '代词', '量词', '介词', '连词', '其他']

const POS_THAI: Record<string, string> = {
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

// Typewriter placeholder
const PLACEHOLDER_CYCLE = [
  '你好  ·  สวัสดี',
  '动词  ·  กริยา',
  '学习  ·  เรียนรู้',
  'HSK 3  ·  ระดับกลาง',
  '名词  ·  คำนาม',
  '朋友  ·  เพื่อน',
  '形容词  ·  คุณศัพท์',
]

function useAnimatedPlaceholder(phrases: string[], intervalMs = 2600) {
  const [displayText, setDisplayText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const current = phrases[phraseIndex % phrases.length] ?? ''
    if (!isDeleting) {
      if (charIndex < current.length) {
        timerRef.current = setTimeout(() => {
          setDisplayText(current.slice(0, charIndex + 1))
          setCharIndex((c) => c + 1)
        }, 55)
      } else {
        timerRef.current = setTimeout(() => setIsDeleting(true), intervalMs)
      }
    } else {
      if (charIndex > 0) {
        timerRef.current = setTimeout(() => {
          setDisplayText(current.slice(0, charIndex - 1))
          setCharIndex((c) => c - 1)
        }, 30)
      } else {
        setIsDeleting(false)
        setPhraseIndex((i) => i + 1)
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [charIndex, isDeleting, phraseIndex, phrases, intervalMs])

  return displayText
}

// ─── Level Card ───────────────────────────────────────────────────────────────

interface LevelCardProps {
  stat: LevelStat
  posEntries: { pos: string; count: number }[]
  onStart: (pos?: string) => void
}

function LevelCard({ stat, posEntries, onStart }: LevelCardProps) {
  const [posOpen, setPosOpen] = useState(false)
  const hasDue = stat.dueCount > 0
  const progressPct = stat.totalWords > 0 ? Math.round((stat.seenCount / stat.totalWords) * 100) : 0
  const hasPosData = posEntries.length > 0

  return (
    <div className="bg-[#FFFEFB] border border-[#E8E0D5] rounded-2xl overflow-hidden">
      {/* ── Card header ── */}
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold text-[#3D3630] tracking-tight">
                {getLevelLabel(stat.level)}
              </span>
              <span className="text-sm text-[#9A9179]">{getLevelDescription(stat.level)}</span>
            </div>
            <p className="text-xs text-[#9A9179] mt-0.5 tabular-nums">
              {stat.seenCount.toLocaleString()} / {stat.totalWords.toLocaleString()} คำ
            </p>
          </div>
          {hasDue && (
            <span className="mt-0.5 px-2.5 py-1 bg-[#FFF3ED] text-[#C4704B] text-xs font-semibold rounded-full whitespace-nowrap border border-[#C4704B]/20">
              {stat.dueCount} ต้องทบทวน
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-[#E8E0D5] rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.max(progressPct, progressPct > 0 ? 1 : 0)}%`,
              background: hasDue ? '#C4704B' : '#7D8B6A',
            }}
          />
        </div>

        {/* Action row */}
        <div className="flex gap-2">
          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => onStart()}
            className={[
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors',
              hasDue
                ? 'bg-[#C4704B] hover:bg-[#A85A3A] text-white'
                : 'bg-[#F0EBE3] hover:bg-[#E8E0D5] text-[#3D3630]',
            ].join(' ')}
          >
            <Play size={13} className={hasDue ? 'text-white/80' : 'text-[#7A7067]'} />
            {hasDue ? `ทบทวน ${stat.dueCount} คำ` : 'เริ่มเรียน'}
          </button>

          {/* POS toggle — only when POS data available */}
          {hasPosData && (
            <button
              type="button"
              onClick={() => setPosOpen((v) => !v)}
              className={[
                'flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap',
                posOpen
                  ? 'bg-[#F0EBE3] border-[#C4704B]/30 text-[#3D3630]'
                  : 'border-[#E8E0D5] text-[#7A7067] hover:text-[#3D3630] hover:bg-[#FAF7F2]',
              ].join(' ')}
            >
              หมวดคำ
              <ChevronRight
                size={13}
                className={['transition-transform duration-200', posOpen ? 'rotate-90' : ''].join(
                  ' '
                )}
              />
            </button>
          )}
        </div>
      </div>

      {/* ── POS section (collapsible) ── */}
      {hasPosData && (
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: posOpen ? `${posEntries.length * 52 + 24}px` : '0px' }}
        >
          <div className="border-t border-[#E8E0D5] divide-y divide-[#F0EBE3]">
            {posEntries.map(({ pos, count }) => (
              <button
                type="button"
                key={pos}
                onClick={() => onStart(pos)}
                className="w-full flex items-center px-5 py-3 hover:bg-[#FAF7F2] transition-colors group text-left"
              >
                {/* Chinese char */}
                <span
                  className="text-xl text-[#2C2824] min-w-[3.5rem] shrink-0 leading-none"
                  style={{ fontFamily: 'serif' }}
                >
                  {pos}
                </span>

                {/* Thai label */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-[#3D3630]">{POS_THAI[pos] ?? pos}</span>
                </div>

                {/* Count + arrow */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-[#9A9179] tabular-nums">{count} คำ</span>
                  <ChevronRight
                    size={14}
                    className="text-[#C4704B]/40 group-hover:text-[#C4704B] group-hover:translate-x-0.5 transition-all"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main LevelSelector ───────────────────────────────────────────────────────

export function LevelSelector({ levelStats, onSelectLevel, posCountsByLevel }: LevelSelectorProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const animatedPlaceholder = useAnimatedPlaceholder(PLACEHOLDER_CYCLE)

  const filtered = levelStats.filter((stat) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    const label = getLevelLabel(stat.level).toLowerCase()
    const desc = getLevelDescription(stat.level).toLowerCase()
    return label.includes(q) || desc.includes(q) || String(stat.level).includes(q)
  })

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Title */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-[#3D3630] tracking-tight">ฝึกคำศัพท์</h1>
          <p className="mt-0.5 text-sm text-[#7A7067]">
            HSK 1–9 · {levelStats.reduce((s, l) => s + l.totalWords, 0).toLocaleString()} คำ
          </p>
        </div>
        <Link
          href="/flashcard/stats"
          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E8E0D5] rounded-lg text-[#7A7067] hover:text-[#3D3630] hover:bg-[#F5F0EA] transition-colors text-sm"
        >
          <BarChart2 size={15} />
          <span>สถิติ</span>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search
          size={15}
          className={[
            'absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 pointer-events-none',
            isFocused ? 'text-[#C4704B]' : 'text-[#9A9179]',
          ].join(' ')}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused || query ? 'ค้นหาระดับ...' : animatedPlaceholder}
          className={[
            'w-full pl-9 pr-4 py-2.5 bg-[#FFFEFB] border rounded-xl text-sm text-[#3D3630] outline-none transition-all duration-200',
            'placeholder:text-[#B5AFA8]',
            isFocused
              ? 'border-[#C4704B]/50 shadow-[0_0_0_3px_rgba(196,112,75,0.08)]'
              : 'border-[#E8E0D5] hover:border-[#C4704B]/30',
          ].join(' ')}
        />
        {!isFocused && !query && (
          <span
            className="absolute top-1/2 -translate-y-1/2 w-px h-4 bg-[#9A9179]/60 pointer-events-none"
            style={{
              left: `calc(2.25rem + ${animatedPlaceholder.length * 0.56}em)`,
              animation: 'blink 1s step-end infinite',
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      {/* Level cards — single column for clean POS expansion */}
      <div className="flex flex-col gap-3">
        {filtered.map((stat) => {
          const posCounts = posCountsByLevel?.[stat.level] ?? {}
          const posEntries = POS_ORDER.map((pos) => ({ pos, count: posCounts[pos] ?? 0 })).filter(
            (e) => e.count > 0
          )

          return (
            <LevelCard
              key={stat.level}
              stat={stat}
              posEntries={posEntries}
              onStart={(pos) => onSelectLevel(stat.level, pos)}
            />
          )
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-[#9A9179]">ไม่พบระดับที่ค้นหา</div>
        )}
      </div>
    </div>
  )
}

export type { LevelStat }
