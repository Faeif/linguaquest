import type { HskLevel } from '@linguaquest/db'
import { getWordCount, getWordsByLevel } from '@linguaquest/db'
import { redirect } from 'next/navigation'
import type { LevelStat } from '@/features/flashcard/types'
import { createServerSupabase } from '@/lib/supabase/server'
import { FlashcardClient } from './FlashcardClient'

const HSK_LEVELS: HskLevel[] = [1, 2, 3, 4, 5, 6, 7]

export default async function FlashcardPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const now = new Date().toISOString()

  // Fetch due counts per level
  const { data: dueRows } = await supabase
    .from('hsk_reviews')
    .select('hsk_level')
    .eq('user_id', user.id)
    .lte('next_review_at', now)

  // Fetch seen counts per level
  const { data: seenRows } = await supabase
    .from('hsk_reviews')
    .select('hsk_level')
    .eq('user_id', user.id)

  const dueByLevel = new Map<number, number>()
  for (const row of dueRows ?? []) {
    dueByLevel.set(row.hsk_level, (dueByLevel.get(row.hsk_level) ?? 0) + 1)
  }

  const seenByLevel = new Map<number, number>()
  for (const row of seenRows ?? []) {
    seenByLevel.set(row.hsk_level, (seenByLevel.get(row.hsk_level) ?? 0) + 1)
  }

  const levelStats: LevelStat[] = HSK_LEVELS.map((level) => ({
    level,
    totalWords: getWordCount(level),
    dueCount: dueByLevel.get(level) ?? 0,
    seenCount: seenByLevel.get(level) ?? 0,
  }))

  // Compute POS word counts per level from static bundle
  const posCountsByLevel = Object.fromEntries(
    HSK_LEVELS.map((level) => {
      const words = getWordsByLevel(level)
      const counts: Record<string, number> = {}
      for (const w of words) {
        if (w.pos) counts[w.pos] = (counts[w.pos] ?? 0) + 1
      }
      return [level, counts]
    })
  ) as Record<number, Partial<Record<string, number>>>

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 lg:p-8">
      <FlashcardClient levelStats={levelStats} posCountsByLevel={posCountsByLevel} />
    </div>
  )
}
