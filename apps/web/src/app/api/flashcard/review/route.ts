import { Assessment, FSRS } from 'simple-ts-fsrs'
import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'

type FsrsRating = 'Forgot' | 'Struggled' | 'Remembered' | 'Mastered'

/**
 * Auto-map answer correctness × response time → FSRS rating
 *
 * New card (first time seen) + wrong  → Struggled (not Forgot — no prior trace)
 * Review card + wrong                 → Forgot
 * Correct + <3 s                      → Mastered
 * Correct + 3–8 s                     → Remembered
 * Correct + >8 s                      → Struggled (barely remembered)
 */
function computeRating(isCorrect: boolean, elapsedMs: number, isNew: boolean): FsrsRating {
  if (!isCorrect) return isNew ? 'Struggled' : 'Forgot'
  if (elapsedMs < 3_000) return 'Mastered'
  if (elapsedMs < 8_000) return 'Remembered'
  return 'Struggled'
}

const PreviousAssessmentSchema = z.object({
  assessedAt: z.string(),
  nextScheduledAssessment: z.string(),
  stability: z.number(),
  difficulty: z.number(),
  state: z.string(),
})

const ReviewBodySchema = z.object({
  wordSimplified: z.string().min(1),
  hskLevel: z.number().int().min(1).max(7),
  isCorrect: z.boolean(),
  elapsedMs: z.number().int().min(0),
  isNew: z.boolean(),
  previousAssessment: PreviousAssessmentSchema.nullable().optional(),
})

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const input = ReviewBodySchema.parse(body)

    const rating = computeRating(input.isCorrect, input.elapsedMs, input.isNew)

    const fsrs = new FSRS()
    const previousAssessment = input.previousAssessment
      ? new Assessment({
          assessedAt: new Date(input.previousAssessment.assessedAt),
          nextScheduledAssessment: new Date(input.previousAssessment.nextScheduledAssessment),
          stability: input.previousAssessment.stability,
          difficulty: input.previousAssessment.difficulty,
          state: input.previousAssessment.state as 'Learning' | 'Review' | 'Relearning',
        })
      : undefined

    const result = fsrs.assessRecall({ rating, previousAssessment })

    // Fetch existing review_count
    const { data: existing } = await supabase
      .from('hsk_reviews')
      .select('review_count')
      .eq('user_id', user.id)
      .eq('word_simplified', input.wordSimplified)
      .maybeSingle()

    const newReviewCount = (existing?.review_count ?? 0) + 1

    const { error: upsertError } = await supabase.from('hsk_reviews').upsert(
      {
        user_id: user.id,
        word_simplified: input.wordSimplified,
        hsk_level: input.hskLevel,
        stability: result.stability,
        difficulty: result.difficulty,
        state: result.state,
        assessed_at: result.assessedAt.toISOString(),
        next_review_at: result.nextScheduledAssessment.toISOString(),
        review_count: newReviewCount,
      },
      { onConflict: 'user_id,word_simplified' }
    )

    if (upsertError) {
      console.error(
        'hsk_reviews upsert error:',
        upsertError.message,
        upsertError.code,
        upsertError.details
      )
      return Response.json(
        { data: null, error: 'Failed to save review', details: upsertError.message },
        { status: 500 }
      )
    }

    return Response.json({
      data: {
        rating,
        nextReviewAt: result.nextScheduledAssessment.toISOString(),
        state: result.state,
        stability: result.stability,
      },
      error: null,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { data: null, error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    console.error('POST /api/flashcard/review error:', error)
    return Response.json({ data: null, error: 'Internal Server Error' }, { status: 500 })
  }
}
