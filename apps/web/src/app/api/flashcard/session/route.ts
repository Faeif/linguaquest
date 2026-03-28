import type { HskLevel, HskSentence, PosTag } from '@linguaquest/db'
import { findWord, getWordsByLevel } from '@linguaquest/db'
import { createServerSupabase } from '@/lib/supabase/server'

export interface SessionCard {
  simplified: string
  traditional: string
  pinyin: string
  definitionEn: string
  meaningTh?: string
  pos?: PosTag
  sentence?: HskSentence
  level: number
  frequencyRank: number
  previousAssessment: {
    assessedAt: string
    nextScheduledAssessment: string
    stability: number
    difficulty: number
    state: string
  } | null
  isDue: boolean
  isNew: boolean // true = never seen before (review_count = 0)
  distractors: string[] // 3 wrong Thai meanings for MCQ
}

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i] as T
    a[i] = a[j] as T
    a[j] = tmp
  }
  return a
}

function pickDistractors(
  correctMeaning: string,
  allWords: ReturnType<typeof getWordsByLevel>,
  count = 3
): string[] {
  // Collect candidate first-meanings, deduped, excluding the correct one
  const seen = new Set<string>([correctMeaning])
  const pool: string[] = []
  for (const w of allWords) {
    if (!w.meaningTh) continue
    const short = w.meaningTh.split(',')[0]?.trim()
    if (!seen.has(short)) {
      seen.add(short)
      pool.push(short)
    }
  }

  // Fisher-Yates shuffle then pick 'count'
  const shuffled = fisherYates(pool)
  const picked = shuffled.slice(0, count)

  // Pad with generic fallbacks if pool too small
  const fallbacks = ['ไม่ทราบ', 'ไม่แน่ใจ', 'ไม่รู้']
  while (picked.length < count) {
    picked.push(fallbacks[picked.length % fallbacks.length] ?? 'ไม่ทราบ')
  }
  return picked
}

const ALL_HSK_LEVELS: HskLevel[] = [1, 2, 3, 4, 5, 6, 7]

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const levelParam = searchParams.get('level')
    const limitParam = searchParams.get('limit')
    const posParam = searchParams.get('pos') as PosTag | null
    const shuffleParam = searchParams.get('shuffle')
    const reviewParam = searchParams.get('review')

    const limit = limitParam ? parseInt(limitParam, 10) : 15
    if (Number.isNaN(limit) || limit < 1 || limit > 100) {
      return Response.json({ data: null, error: 'Invalid limit parameter' }, { status: 400 })
    }

    // ── Mode B: Review all levels ──────────────────────────────────────────────
    if (reviewParam === 'all') {
      const now = new Date().toISOString()

      const { data: dueReviews, error: dueError } = await supabase
        .from('hsk_reviews')
        .select(
          'word_simplified, hsk_level, assessed_at, next_review_at, stability, difficulty, state'
        )
        .eq('user_id', user.id)
        .lte('next_review_at', now)
        .order('next_review_at', { ascending: true })
        .limit(limit)

      if (dueError) {
        console.error('hsk_reviews review=all query error:', dueError)
        return Response.json({ data: null, error: 'Failed to fetch due cards' }, { status: 500 })
      }

      const cards: SessionCard[] = []

      for (const row of dueReviews ?? []) {
        const word = findWord(row.word_simplified)
        if (!word) continue

        const distractorPool = getWordsByLevel(word.level as HskLevel)
        const correctMeaning = word.meaningTh?.split(',')[0]?.trim() ?? word.definitionEn
        const distractors = pickDistractors(correctMeaning, distractorPool)

        cards.push({
          simplified: word.simplified,
          traditional: word.traditional,
          pinyin: word.pinyin,
          definitionEn: word.definitionEn,
          meaningTh: word.meaningTh,
          pos: word.pos,
          sentence: word.sentence,
          level: word.level,
          frequencyRank: word.frequencyRank,
          previousAssessment: {
            assessedAt: row.assessed_at ?? now,
            nextScheduledAssessment: row.next_review_at,
            stability: row.stability,
            difficulty: row.difficulty,
            state: row.state,
          },
          isDue: true,
          isNew: false,
          distractors,
        })
      }

      return Response.json({ data: { cards }, error: null })
    }

    // ── Mode A: POS across all levels ──────────────────────────────────────────
    if (levelParam === 'all' && posParam) {
      const shouldShuffle = shuffleParam === 'true'

      let pool = ALL_HSK_LEVELS.flatMap((l) => getWordsByLevel(l)).filter((w) => w.pos === posParam)

      if (shouldShuffle) {
        pool = fisherYates(pool)
      }

      pool = pool.slice(0, limit)

      const cards: SessionCard[] = pool.map((word) => {
        const distractorPool = getWordsByLevel(word.level as HskLevel)
        const correctMeaning = word.meaningTh?.split(',')[0]?.trim() ?? word.definitionEn
        const distractors = pickDistractors(correctMeaning, distractorPool)

        return {
          simplified: word.simplified,
          traditional: word.traditional,
          pinyin: word.pinyin,
          definitionEn: word.definitionEn,
          meaningTh: word.meaningTh,
          pos: word.pos,
          sentence: word.sentence,
          level: word.level,
          frequencyRank: word.frequencyRank,
          previousAssessment: null,
          isDue: false,
          isNew: true,
          distractors,
        }
      })

      return Response.json({ data: { cards }, error: null })
    }

    // ── Default Mode: Single level ─────────────────────────────────────────────
    const level = levelParam ? parseInt(levelParam, 10) : 1

    if (Number.isNaN(level) || level < 1 || level > 7) {
      return Response.json({ data: null, error: 'Invalid level parameter' }, { status: 400 })
    }

    const shouldShuffle = shuffleParam === 'true'
    const now = new Date().toISOString()

    // Fetch due cards for this level
    const { data: dueReviews, error: dueError } = await supabase
      .from('hsk_reviews')
      .select('word_simplified, assessed_at, next_review_at, stability, difficulty, state')
      .eq('user_id', user.id)
      .eq('hsk_level', level)
      .lte('next_review_at', now)
      .order('next_review_at', { ascending: true })
      .limit(limit)

    if (dueError) {
      console.error('hsk_reviews due query error:', dueError)
      return Response.json({ data: null, error: 'Failed to fetch due cards' }, { status: 500 })
    }

    const dueSet = new Set<string>((dueReviews ?? []).map((r) => r.word_simplified))

    // Fetch all reviewed words for this level (to find unseen ones)
    const { data: allReviewed, error: reviewedError } = await supabase
      .from('hsk_reviews')
      .select('word_simplified')
      .eq('user_id', user.id)
      .eq('hsk_level', level)

    if (reviewedError) {
      console.error('hsk_reviews all reviewed query error:', reviewedError)
      return Response.json({ data: null, error: 'Failed to fetch reviewed cards' }, { status: 500 })
    }

    const reviewedSet = new Set<string>((allReviewed ?? []).map((r) => r.word_simplified))

    type ReviewRow = {
      word_simplified: string
      assessed_at: string | null
      next_review_at: string
      stability: number
      difficulty: number
      state: string
    }
    const reviewMap = new Map<string, ReviewRow>()
    for (const row of dueReviews ?? []) {
      reviewMap.set(row.word_simplified, row as ReviewRow)
    }

    // Get static word data for this level
    const allWords = getWordsByLevel(level as HskLevel)

    // Apply POS filter for session words (distractors always come from full level)
    let sourceWords = posParam ? allWords.filter((w) => w.pos === posParam) : allWords

    if (shouldShuffle) {
      sourceWords = fisherYates(sourceWords)
    }

    const cards: SessionCard[] = []

    function buildCard(
      word: ReturnType<typeof getWordsByLevel>[number],
      isDue: boolean
    ): SessionCard {
      const review = reviewMap.get(word.simplified)
      const correctMeaning = word.meaningTh?.split(',')[0]?.trim() ?? word.definitionEn
      const distractors = pickDistractors(correctMeaning, allWords)

      return {
        simplified: word.simplified,
        traditional: word.traditional,
        pinyin: word.pinyin,
        definitionEn: word.definitionEn,
        meaningTh: word.meaningTh,
        pos: word.pos,
        sentence: word.sentence,
        level: word.level,
        frequencyRank: word.frequencyRank,
        previousAssessment: review
          ? {
              assessedAt: review.assessed_at ?? new Date().toISOString(),
              nextScheduledAssessment: review.next_review_at,
              stability: review.stability,
              difficulty: review.difficulty,
              state: review.state,
            }
          : null,
        isDue,
        isNew: !reviewedSet.has(word.simplified),
        distractors,
      }
    }

    // Add due cards first (from filtered source words)
    for (const word of sourceWords) {
      if (cards.length >= limit) break
      if (!dueSet.has(word.simplified)) continue
      cards.push(buildCard(word, true))
    }

    // Fill remaining slots with unseen words (from filtered source words)
    if (cards.length < limit) {
      for (const word of sourceWords) {
        if (cards.length >= limit) break
        if (reviewedSet.has(word.simplified)) continue
        cards.push(buildCard(word, false))
      }
    }

    return Response.json({ data: { cards }, error: null })
  } catch (error) {
    console.error('GET /api/flashcard/session error:', error)
    return Response.json({ data: null, error: 'Internal Server Error' }, { status: 500 })
  }
}
