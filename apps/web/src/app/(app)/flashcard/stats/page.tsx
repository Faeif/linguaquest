import type { HskLevel } from '@linguaquest/db'
import { getWordCount } from '@linguaquest/db'
import { ArrowLeft, BookOpen, Calendar, Trophy, Zap } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { createServerSupabase } from '@/lib/supabase/server'

const HSK_LEVELS: HskLevel[] = [1, 2, 3, 4, 5, 6, 7]

function getLevelLabel(level: number) {
  return level === 7 ? 'HSK 7-9' : `HSK ${level}`
}

export default async function FlashcardStatsPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data: rows } = await supabase
    .from('hsk_reviews')
    .select('hsk_level, state, stability, review_count, next_review_at')
    .eq('user_id', user.id)

  const all = rows ?? []

  const levels = HSK_LEVELS.map((level) => {
    const lr = all.filter((r) => r.hsk_level === level)
    const seen = lr.length
    const mastered = lr.filter((r) => r.state === 'Review' && (r.stability ?? 0) >= 7).length
    const due = lr.filter((r) => r.next_review_at && new Date(r.next_review_at) <= now).length
    const dueTomorrow = lr.filter(
      (r) => r.next_review_at && new Date(r.next_review_at) <= tomorrow
    ).length
    const avgStab =
      seen > 0 ? Math.round((lr.reduce((s, r) => s + (r.stability ?? 0), 0) / seen) * 10) / 10 : 0
    const total = getWordCount(level)
    const retentionPct = seen > 0 ? Math.round((mastered / seen) * 100) : 0
    const progressPct = total > 0 ? Math.round((seen / total) * 100) : 0

    return { level, total, seen, mastered, due, dueTomorrow, avgStab, retentionPct, progressPct }
  })

  const totalSeen = levels.reduce((s, l) => s + l.seen, 0)
  const totalMastered = levels.reduce((s, l) => s + l.mastered, 0)
  const totalDue = levels.reduce((s, l) => s + l.due, 0)
  const totalReviews = all.reduce((s, r) => s + (r.review_count ?? 0), 0)

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/flashcard"
          className="flex items-center gap-1.5 text-sm text-[#7A7067] hover:text-[#3D3630] transition-colors"
        >
          <ArrowLeft size={16} />
          กลับ
        </Link>
        <h1 className="text-xl font-semibold text-[#3D3630] tracking-tight">สถิติการเรียน</h1>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<BookOpen size={18} className="text-[#7D8B6A]" />}
          value={totalSeen.toLocaleString()}
          label="คำที่เรียนแล้ว"
          bg="bg-[#EBF2E8]"
        />
        <StatCard
          icon={<Trophy size={18} className="text-[#C4704B]" />}
          value={totalMastered.toLocaleString()}
          label="จำได้แล้ว"
          bg="bg-[#FFF3ED]"
        />
        <StatCard
          icon={<Calendar size={18} className="text-[#B56B6B]" />}
          value={totalDue.toLocaleString()}
          label="ต้องทบทวนวันนี้"
          bg="bg-[#F5E8E8]"
        />
        <StatCard
          icon={<Zap size={18} className="text-[#7A7067]" />}
          value={totalReviews.toLocaleString()}
          label="ครั้งที่ตอบทั้งหมด"
          bg="bg-[#F0EBE3]"
        />
      </div>

      {/* Per-level breakdown */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#7A7067] uppercase tracking-wide">แยกตามระดับ</h2>

        {levels.map((l) => (
          <div
            key={l.level}
            className="p-4 bg-[#FFFEFB] border border-[#E8E0D5] rounded-xl space-y-3"
          >
            {/* Level header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#3D3630]">
                  {getLevelLabel(l.level)}
                </span>
                {l.due > 0 && (
                  <span className="px-2 py-0.5 bg-[#F5EDE5] text-[#C4704B] text-xs font-medium rounded-full">
                    {l.due} ต้องทบทวน
                  </span>
                )}
              </div>
              <span className="text-xs text-[#9A9179] tabular-nums">
                {l.seen} / {l.total} คำ
              </span>
            </div>

            {/* Progress bar: seen */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[#9A9179]">
                <span>ความคืบหน้า</span>
                <span>{l.progressPct}%</span>
              </div>
              <div className="h-2 bg-[#E8E0D5] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#7D8B6A] transition-all duration-500"
                  style={{ width: `${l.progressPct}%` }}
                />
              </div>
            </div>

            {/* Mastered sub-bar */}
            {l.seen > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-[#9A9179]">
                  <span>จำได้แล้ว (stability ≥ 7 วัน)</span>
                  <span>
                    {l.mastered} / {l.seen} ({l.retentionPct}%)
                  </span>
                </div>
                <div className="h-1.5 bg-[#E8E0D5] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#C4704B]/70 transition-all duration-500"
                    style={{ width: `${l.retentionPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Meta row */}
            {l.seen > 0 && (
              <div className="flex gap-4 text-xs text-[#9A9179]">
                <span>Stability เฉลี่ย {l.avgStab} วัน</span>
                {l.dueTomorrow > l.due && <span>ครบพรุ่งนี้ +{l.dueTomorrow - l.due} คำ</span>}
              </div>
            )}

            {l.seen === 0 && <p className="text-xs text-[#9A9179]">ยังไม่ได้เริ่มเรียนระดับนี้</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
  bg,
}: {
  icon: ReactNode
  value: string
  label: string
  bg: string
}) {
  return (
    <div className={`p-4 ${bg} rounded-xl flex flex-col gap-2`}>
      {icon}
      <p className="text-xl font-semibold text-[#3D3630] tabular-nums">{value}</p>
      <p className="text-xs text-[#7A7067] leading-snug">{label}</p>
    </div>
  )
}
