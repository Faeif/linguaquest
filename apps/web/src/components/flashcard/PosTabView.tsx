'use client'

import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

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

function getLevelLabel(level: number): string {
  return level === 7 ? 'HSK 7-9' : `HSK ${level}`
}

interface PosTabViewProps {
  posCountsByLevel: Record<number, Partial<Record<string, number>>>
  onStartSession: (level: number | 'all', pos: string, shuffle?: boolean) => void
}

export function PosTabView({ posCountsByLevel, onStartSession }: PosTabViewProps) {
  const [selectedPos, setSelectedPos] = useState<string | null>(null)

  // Compute total count for each POS across all levels
  function getTotalForPos(pos: string): number {
    return Object.values(posCountsByLevel).reduce((sum, levelCounts) => {
      return sum + (levelCounts[pos] ?? 0)
    }, 0)
  }

  // Get level breakdown for a given POS
  function getLevelBreakdown(pos: string): { level: number; count: number }[] {
    return Object.entries(posCountsByLevel)
      .map(([levelStr, counts]) => ({
        level: parseInt(levelStr, 10),
        count: counts[pos] ?? 0,
      }))
      .filter((e) => e.count > 0)
      .sort((a, b) => a.level - b.level)
  }

  // ── Level breakdown view ───────────────────────────────────────────────────
  if (selectedPos !== null) {
    const thaiLabel = POS_THAI[selectedPos] ?? selectedPos
    const breakdown = getLevelBreakdown(selectedPos)
    const totalForPos = getTotalForPos(selectedPos)

    return (
      <div className="w-full max-w-lg mx-auto">
        {/* Back + header */}
        <button
          type="button"
          onClick={() => setSelectedPos(null)}
          className="flex items-center gap-1.5 text-sm text-[#7A7067] hover:text-[#3D3630] transition-colors mb-5"
        >
          <ArrowLeft size={15} />
          <span className="text-base text-[#2C2824]" style={{ fontFamily: 'serif' }}>
            {selectedPos}
          </span>
          <span className="text-[#9A9179]">·</span>
          <span>{thaiLabel}</span>
        </button>

        {/* Shuffle all button */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-[#7A7067]">{totalForPos.toLocaleString()} คำในทุกระดับ</p>
          <button
            type="button"
            onClick={() => onStartSession('all', selectedPos, true)}
            className="px-4 py-2 bg-[#3D3630] text-white text-sm font-medium rounded-lg hover:bg-[#2C2824] transition-colors"
          >
            สุ่มทั้งหมด {totalForPos} คำ
          </button>
        </div>

        {/* Level rows */}
        <div className="flex flex-col gap-2">
          {breakdown.map(({ level, count }) => (
            <div
              key={level}
              className="bg-[#FFFEFB] border border-[#E8E0D5] rounded-xl px-5 py-4 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-[#3D3630]">{getLevelLabel(level)}</span>
                <span className="ml-2 text-xs text-[#9A9179] tabular-nums">{count} คำ</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onStartSession(level, selectedPos, false)}
                  className="px-3 py-1.5 border border-[#E8E0D5] rounded-lg text-xs font-medium text-[#3D3630] hover:bg-[#F0EBE3] transition-colors"
                >
                  เริ่ม
                </button>
                <button
                  type="button"
                  onClick={() => onStartSession(level, selectedPos, true)}
                  className="px-3 py-1.5 bg-[#C4704B] text-white rounded-lg text-xs font-medium hover:bg-[#A85A3A] transition-colors"
                >
                  สุ่ม
                </button>
              </div>
            </div>
          ))}

          {breakdown.length === 0 && (
            <div className="py-12 text-center text-sm text-[#9A9179]">ไม่มีคำศัพท์ในหมวดนี้</div>
          )}
        </div>
      </div>
    )
  }

  // ── POS list view ──────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Title */}
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-[#3D3630] tracking-tight">หมวดคำ</h2>
        <p className="mt-0.5 text-sm text-[#7A7067]">เลือกหมวดที่ต้องการฝึก</p>
      </div>

      {/* POS list */}
      <div className="flex flex-col gap-2">
        {POS_ORDER.map((pos) => {
          const total = getTotalForPos(pos)
          if (total === 0) return null

          return (
            <button
              type="button"
              key={pos}
              onClick={() => setSelectedPos(pos)}
              className="w-full flex items-center gap-3 px-5 py-4 bg-[#FFFEFB] border border-[#E8E0D5] rounded-xl hover:bg-[#FAF7F2] transition-colors text-left group"
            >
              {/* Chinese char */}
              <span
                className="text-2xl text-[#2C2824] min-w-[3.5rem] shrink-0 leading-none"
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
                <span className="text-xs text-[#9A9179] tabular-nums">
                  {total.toLocaleString()} คำ
                </span>
                <ChevronRight
                  size={14}
                  className="text-[#C4704B]/40 group-hover:text-[#C4704B] group-hover:translate-x-0.5 transition-all"
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
