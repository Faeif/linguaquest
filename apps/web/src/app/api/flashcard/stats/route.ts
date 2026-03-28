import type { HskLevel } from '@linguaquest/db'
import { getWordCount } from '@linguaquest/db'
import { createServerSupabase } from '@/lib/supabase/server'

const HSK_LEVELS: HskLevel[] = [1, 2, 3, 4, 5, 6, 7]

export interface LevelStatsData {
  level: number
  totalWords: number
  seenCount: number // words reviewed at least once
  masteredCount: number // state = 'Review' AND stability >= 7
  dueCount: number // next_review_at <= now
  dueTomorrowCount: number // next_review_at <= tomorrow
  avgStability: number // average stability (days) of reviewed words
}

export interface StatsData {
  levels: LevelStatsData[]
  totalReviews: number // sum of all review_count
  totalMastered: number
  totalSeen: number
}

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const { data: rows, error } = await supabase
      .from('hsk_reviews')
      .select('hsk_level, state, stability, review_count, next_review_at')
      .eq('user_id', user.id)

    if (error) {
      return Response.json({ data: null, error: error.message }, { status: 500 })
    }

    const all = rows ?? []

    const levels: LevelStatsData[] = HSK_LEVELS.map((level) => {
      const levelRows = all.filter((r) => r.hsk_level === level)
      const seenCount = levelRows.length
      const masteredCount = levelRows.filter(
        (r) => r.state === 'Review' && (r.stability ?? 0) >= 7
      ).length
      const dueCount = levelRows.filter(
        (r) => r.next_review_at && new Date(r.next_review_at) <= now
      ).length
      const dueTomorrowCount = levelRows.filter(
        (r) => r.next_review_at && new Date(r.next_review_at) <= tomorrow
      ).length
      const totalStability = levelRows.reduce((s, r) => s + (r.stability ?? 0), 0)
      const avgStability = seenCount > 0 ? Math.round((totalStability / seenCount) * 10) / 10 : 0

      return {
        level,
        totalWords: getWordCount(level),
        seenCount,
        masteredCount,
        dueCount,
        dueTomorrowCount,
        avgStability,
      }
    })

    const totalReviews = all.reduce((s, r) => s + (r.review_count ?? 0), 0)
    const totalMastered = levels.reduce((s, l) => s + l.masteredCount, 0)
    const totalSeen = levels.reduce((s, l) => s + l.seenCount, 0)

    return Response.json({
      data: { levels, totalReviews, totalMastered, totalSeen } satisfies StatsData,
      error: null,
    })
  } catch (err) {
    console.error('GET /api/flashcard/stats error:', err)
    return Response.json({ data: null, error: 'Internal Server Error' }, { status: 500 })
  }
}
