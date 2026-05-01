'use client'

import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { POS_ORDER, POS_THAI, getLevelLabel } from '../constants'

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
          className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors mb-5"
        >
          <ArrowLeft size={15} />
          <span className="text-base text-text-chinese" style={{ fontFamily: 'serif' }}>
            {selectedPos}
          </span>
          <span className="text-text-hint">·</span>
          <span>{thaiLabel}</span>
        </button>

        {/* Shuffle all button */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-text-secondary">{totalForPos.toLocaleString()} คำในทุกระดับ</p>
          <button
            type="button"
            onClick={() => onStartSession('all', selectedPos, true)}
            className="px-4 py-2 bg-foreground text-text-inverse text-sm font-medium rounded-lg hover:bg-foreground-muted transition-colors"
          >
            สุ่มทั้งหมด {totalForPos} คำ
          </button>
        </div>

        {/* Level rows */}
        <div className="flex flex-col gap-2">
          {breakdown.map(({ level, count }) => (
            <div
              key={level}
              className="bg-surface border border-border rounded-xl px-5 py-4 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-text-primary">{getLevelLabel(level)}</span>
                <span className="ml-2 text-xs text-text-hint tabular-nums">{count} คำ</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onStartSession(level, selectedPos, false)}
                  className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-text-primary hover:bg-background-hover transition-colors"
                >
                  เริ่ม
                </button>
                <button
                  type="button"
                  onClick={() => onStartSession(level, selectedPos, true)}
                  className="px-3 py-1.5 bg-accent text-text-inverse rounded-lg text-xs font-medium hover:bg-accent-hover transition-colors"
                >
                  สุ่ม
                </button>
              </div>
            </div>
          ))}

          {breakdown.length === 0 && (
            <div className="py-12 text-center text-sm text-text-hint">ไม่มีคำศัพท์ในหมวดนี้</div>
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
        <h2 className="text-2xl font-semibold text-text-primary tracking-tight">หมวดคำ</h2>
        <p className="mt-0.5 text-sm text-text-secondary">เลือกหมวดที่ต้องการฝึก</p>
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
              className="w-full flex items-center gap-3 px-5 py-4 bg-surface border border-border rounded-xl hover:bg-background-hover transition-colors text-left group"
            >
              {/* Chinese char */}
              <span
                className="text-2xl text-text-chinese min-w-[3.5rem] shrink-0 leading-none"
                style={{ fontFamily: 'serif' }}
              >
                {pos}
              </span>

              {/* Thai label */}
              <div className="flex-1 min-w-0">
                <span className="text-sm text-text-primary">{POS_THAI[pos] ?? pos}</span>
              </div>

              {/* Count + arrow */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-text-hint tabular-nums">
                  {total.toLocaleString()} คำ
                </span>
                <ChevronRight
                  size={14}
                  className="text-accent/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all"
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
