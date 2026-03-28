'use server'

import {
  CardGenerator,
  CardType,
  type CharacterRecognitionCard,
  type FlashCard,
  fsrsScheduler,
  type ReviewRating,
} from '@linguaquest/core'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates an authorized SSR Supabase client
 */
async function getSupabase() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    String(process.env.NEXT_PUBLIC_SUPABASE_URL),
    String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {}
        },
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')

  return { supabase, user }
}

/**
 * Fetch due cards for a user
 */
export async function getDueCardsAction(categoryId?: string, limit = 20) {
  try {
    const { supabase, user } = await getSupabase()

    // 1. If categoryId is provided, we need to filter cards by that category
    // This requires a join with word_category_mapping
    let query = supabase
      .from('user_progress')
      .select(`
        card_id,
        card_type,
        fsrs_state,
        fsrs_data,
        global_cards!inner (*)
      `)
      .eq('user_id', user.id)
      .lte('next_review_at', new Date().toISOString())
      .limit(limit)

    if (categoryId) {
      // We join with global_cards and filter by its presence in the mapping for this category
      // However, Supabase filter syntax for this is tricky.
      // A better way is to get the card IDs for that category first.
      const { data: mappingData, error: mapError } = await supabase
        .from('word_category_mapping')
        .select('word_id')
        .eq('category_id', categoryId)

      if (mapError) {
        throw new Error(`Mapping Error: ${mapError.message}`)
      }

      const wordIds = mappingData?.map((m) => m.word_id) || []
      if (wordIds.length > 0) {
        query = query.in('card_id', wordIds)
      } else {
        return [] // No cards in this category
      }
    }

    const { data: progressData, error } = await query

    if (error) {
      console.error('getDueCards error details:', error)
      throw new Error(`DB Error: ${error.message} (${error.code})`)
    }

    // Map database rows to FlashCard objects
    const cards = (progressData || [])
      .map((row) => {
        const globalCard = Array.isArray(row.global_cards) ? row.global_cards[0] : row.global_cards
        if (!globalCard) return null

        const card = {
          id: row.card_id,
          user_id: user.id,
          card_type: row.card_type as CardType,
          difficulty_level: globalCard.hsk_level ? 'beginner' : 'intermediate',
          tags: [],
          hanzi: globalCard.word,
          simplified: globalCard.word,
          pinyin: globalCard.pinyin,
          pinyin_numbered: globalCard.pinyin_numbered,
          tones: globalCard.tones,
          thai_meaning: globalCard.definition_th,
          english_meaning: globalCard.definition_en,
          audio_url: globalCard.audio_url,
          related_words: globalCard.examples,
          total_reviews: row.fsrs_data?.total_reviews || 0,
          total_time_ms: 0,
          mastery_score: 0,
          fsrs_assessment: row.fsrs_data?.assessment || undefined,
          due: row.fsrs_data?.due ? new Date(row.fsrs_data.due) : new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        } as CharacterRecognitionCard

        // @ts-expect-error - predicted_intervals is a dynamic property for UI calculation
        card.predicted_intervals = fsrsScheduler.predictIntervals(card)
        return card
      })
      .filter(Boolean)

    return cards as FlashCard[]
  } catch (err: unknown) {
    console.error('getDueCardsAction fatal error:', err)
    const errorMessage = err instanceof Error ? err.message : String(err)
    throw new Error(`Flashcard Service Error: ${errorMessage}`)
  }
}

/**
 * Submit an FSRS review rating for a card
 */
export async function submitReviewAction(
  cardId: string,
  rating: ReviewRating,
  cardStateRaw: FlashCard
) {
  const { supabase, user } = await getSupabase()

  const now = new Date()

  // Ensure card object fulfills the FSRSScheduler interface
  const card: FlashCard = {
    ...cardStateRaw,
    // FSRS expects these properties to calculate correctly
    fsrs_assessment: cardStateRaw.fsrs_assessment,
    total_reviews: cardStateRaw.total_reviews || 0,
  }

  // 1. Calculate next assessment
  const result = fsrsScheduler.scheduleReview(card, rating, now)

  // 2. Insert Review Log
  const { error: logError } = await supabase.from('review_logs').insert({
    card_id: cardId,
    user_id: user.id,
    rating: rating,
    state: result.assessment.state,
    due: result.assessment.nextScheduledAssessment.toISOString(),
    stability: result.assessment.stability || 0,
    difficulty: result.assessment.difficulty || 0,
    reviewed_at: now.toISOString(),
    elapsed_days: 0, // Not explicitly provided by simple-ts-fsrs v2
    scheduled_days: result.interval_days,
  })

  if (logError) {
    console.error('submitReviewAction logError:', logError)
    throw new Error('Failed to save review log')
  }

  // 3. Update User Progress
  // We store the assessment in fsrs_data so we can hydrate it next time
  const fsrsDataToSave = {
    total_reviews: result.card.total_reviews,
    assessment: result.assessment,
    due: result.next_review_date.toISOString(),
  }

  const { error: progressError } = await supabase
    .from('user_progress')
    .update({
      next_review_at: result.assessment.nextScheduledAssessment.toISOString(),
      fsrs_state: result.assessment.state,
      stability: result.assessment.stability || 0,
      difficulty_rating: result.assessment.difficulty || 0,
      fsrs_data: fsrsDataToSave,
      last_elapsed_days: 0,
      scheduled_days: result.interval_days,
      total_reviews: result.card.total_reviews,
      updated_at: now.toISOString(),
    })
    .eq('user_id', user.id)
    .eq('card_id', cardId)

  // If no progress entry exists (which shouldn't happen for a due card, but fallback just in case)
  if (progressError) {
    console.error('submitReviewAction progressError:', progressError)
    throw new Error('Failed to update user progress')
  }

  return {
    success: true,
    nextReviewDate: result.next_review_date.toISOString(),
    intervalDays: result.interval_days,
  }
}

/**
 * Force-enroll a word into the user's progress
 * Generates the card via AI if it doesn't exist, and adds to user_progress
 */
export async function enrollWordAction(word: string, deckId?: string) {
  const { supabase, user } = await getSupabase()

  // 1. Check if word already exists in global_cards
  let globalCard: { id: string } | null = null
  const { data: existing } = await supabase
    .from('global_cards')
    .select('id')
    .eq('word', word)
    .single()

  if (existing) {
    globalCard = existing
  } else {
    // 2. Need to generate the card via CardGenerator
    const generator = new CardGenerator()
    // By passing options.enrich: true, it calls DeepSeek for meaning
    const generated = await generator.generateCharacterCard(word, user.id, deckId, {
      enrich: true,
      audioBaseUrl: '/audio/pinyin',
    })

    // Insert into global_cards
    const { data: inserted, error: insertError } = await supabase
      .from('global_cards')
      .insert({
        word: generated.hanzi,
        pinyin: generated.pinyin,
        pinyin_numbered: generated.pinyin_numbered,
        tones: generated.tones,
        definition_th: generated.thai_meaning,
        definition_en: generated.english_meaning,
        hsk_level: generated.tags.find((t) => t.startsWith('hsk')) || null,
        audio_url: generated.audio_url,
        examples: generated.related_words,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('enrollWordAction global_cards insert error:', insertError)
      throw new Error('Failed to cache new global card')
    }
    globalCard = inserted
  }

  // 3. Create initial FSRS assessment + user_progress
  // To initialize, create a mock card payload
  const mockCard = {
    id: globalCard.id,
    user_id: user.id,
    card_type: CardType.CHARACTER_RECOGNITION,
    total_reviews: 0,
  } as Omit<FlashCard, 'fsrs_assessment' | 'due'>

  const initializedCard = fsrsScheduler.createCard(mockCard)

  const fsrsDataToSave = {
    total_reviews: initializedCard.total_reviews,
    assessment: initializedCard.fsrs_assessment,
    due: initializedCard.due.toISOString(),
  }

  const { error: progressError } = await supabase.from('user_progress').upsert(
    {
      user_id: user.id,
      card_id: globalCard.id,
      card_type: CardType.CHARACTER_RECOGNITION,
      next_review_at: initializedCard.due.toISOString(),
      fsrs_state: initializedCard.fsrs_assessment?.state || 'Learning',
      fsrs_data: fsrsDataToSave,
      total_reviews: 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,card_id' }
  )

  if (progressError) {
    console.error('enrollWordAction progressError:', progressError)
    throw new Error('Failed to enroll word into user progress')
  }

  return { success: true, cardId: globalCard.id }
}

/**
 * Fetch NEW (unenrolled) cards for a specific category
 */
export async function getNewCardsForCategoryAction(categoryId: string, limit = 10) {
  const { supabase, user } = await getSupabase()

  // 1. Get words for this category from the mapping table
  const { data: mappingData, error: mapError } = await supabase
    .from('word_category_mapping')
    .select('word_id')
    .eq('category_id', categoryId)

  if (mapError) {
    console.error('getNewCards mapping error:', mapError)
    throw new Error(`New Cards Mapping Error: ${mapError.message}`)
  }

  const wordIds = mappingData.map((m) => m.word_id)
  if (wordIds.length === 0) return []

  // 2. Cross-reference with user_progress to find words NOT yet enrolled
  const { data: enrolledData } = await supabase
    .from('user_progress')
    .select('card_id')
    .eq('user_id', user.id)
    .in('card_id', wordIds)

  const enrolledIds = new Set((enrolledData || []).map((e) => e.card_id))
  const newWordIds = wordIds.filter((id) => !enrolledIds.has(id)).slice(0, limit)

  if (newWordIds.length === 0) return []

  // 3. Fetch the full global card data for these words
  const { data: globalCards, error: globalError } = await supabase
    .from('global_cards')
    .select('*')
    .in('id', newWordIds)

  if (globalError) {
    console.error('getNewCards global cards error:', globalError)
    return []
  }

  // 4. Enroll each card directly (no AI call — words are already in global_cards)
  const now = new Date()
  const mockCards = globalCards.map((gc) => {
    const mock = {
      id: gc.id,
      user_id: user.id,
      card_type: CardType.CHARACTER_RECOGNITION,
      total_reviews: 0,
    } as Omit<FlashCard, 'fsrs_assessment' | 'due'>
    return fsrsScheduler.createCard(mock)
  })

  await supabase.from('user_progress').upsert(
    mockCards.map((mc) => ({
      user_id: user.id,
      card_id: mc.id,
      card_type: CardType.CHARACTER_RECOGNITION,
      next_review_at: mc.due.toISOString(),
      fsrs_state: mc.fsrs_assessment?.state ?? 'Learning',
      fsrs_data: { total_reviews: 0, assessment: mc.fsrs_assessment, due: mc.due.toISOString() },
      total_reviews: 0,
      updated_at: now.toISOString(),
    })),
    { onConflict: 'user_id,card_id' }
  )

  const cards = globalCards.map((gc) => {
    // Construct the FlashCard object for the UI
    const card = {
      id: gc.id,
      user_id: user.id,
      card_type: CardType.CHARACTER_RECOGNITION,
      difficulty_level: gc.hsk_level ? 'beginner' : 'intermediate',
      tags: [],
      hanzi: gc.word,
      simplified: gc.word,
      pinyin: gc.pinyin,
      pinyin_numbered: gc.pinyin_numbered,
      tones: gc.tones,
      thai_meaning: gc.definition_th,
      english_meaning: gc.definition_en,
      audio_url: gc.audio_url,
      related_words: gc.examples,
      total_reviews: 0,
      total_time_ms: 0,
      mastery_score: 0,
      due: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    } as CharacterRecognitionCard

    // @ts-expect-error - predicted_intervals is a dynamic property for UI calculation
    card.predicted_intervals = fsrsScheduler.predictIntervals(card)
    return card
  })

  return cards as FlashCard[]
}
