'use client'

import { CheckCircle2 } from 'lucide-react'
import type { LevelStat } from '@/components/flashcard/LevelSelector'

function getLevelLabel(level: number): string {
  return level === 7 ? 'HSK 7-9' : `HSK ${level}`
}

interface ReviewTabViewProps {
  levelStats: LevelStat[]
  onStartReview: (level: number | 'all') => void
}

export function ReviewTabView({ levelStats, onStartReview }: ReviewTabViewProps) {
  const dueLevels = levelStats.filter((s) => s.dueCount > 0)
  const totalDue = dueLevels.reduce((sum, s) => sum + s.dueCount, 0)

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Title */}
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-[#3D3630] tracking-tight">ทบทวน</h2>
        <p className="mt-0.5 text-sm text-[#7A7067]">ครบกำหนดวันนี้</p>
      </div>

      {totalDue === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <CheckCircle2 size={40} className="text-[#6B7F5E]" />
          <p className="text-sm text-[#7A7067]">ไม่มีคำที่ต้องทบทวนวันนี้</p>
          <p className="text-xs text-[#9A9179]">เรียนดีมาก ลองเริ่มคำใหม่ได้เลย</p>
        </div>
      ) : (
        <>
          {/* Review all button */}
          <button
            type="button"
            onClick={() => onStartReview('all')}
            className="w-full py-3 bg-[#C4704B] text-white text-sm font-semibold rounded-xl hover:bg-[#A85A3A] transition-colors mb-4"
          >
            ทบทวนทั้งหมด {totalDue} คำ
          </button>

          {/* Per-level rows */}
          <div className="flex flex-col gap-2">
            {dueLevels.map((stat) => (
              <div
                key={stat.level}
                className="bg-[#FFFEFB] border border-[#E8E0D5] rounded-xl px-5 py-4 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-[#3D3630]">
                    {getLevelLabel(stat.level)}
                  </span>
                  <span className="ml-2 text-xs text-[#9A9179] tabular-nums">
                    {stat.dueCount} คำ
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onStartReview(stat.level)}
                  className="shrink-0 px-4 py-1.5 bg-[#C4704B] text-white rounded-lg text-xs font-medium hover:bg-[#A85A3A] transition-colors"
                >
                  ทบทวน
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
