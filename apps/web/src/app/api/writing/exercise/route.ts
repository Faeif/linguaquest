/**
 * GET /api/writing/exercise?level=3&mode=sentence_ordering&count=5
 * Generates writing exercises from HSK static bundle.
 * No AI needed — pure data transformations.
 */

import type {
  PinyinToCharExercise,
  SentenceOrderingExercise,
  ShortEssayExercise,
} from '@linguaquest/core/writing/types'
import { getWordsByLevel } from '@linguaquest/db'
import { createServerSupabase } from '@/lib/supabase/server'

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Fisher-Yates shuffle (returns new array) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i] as T
    a[i] = a[j] as T
    a[j] = tmp
  }
  return a
}

/** Split Chinese sentence into word tokens (simple space/punctuation split) */
function tokenizeChinese(sentence: string): string[] {
  // Remove [[brackets]] markers, then split on common punctuation boundaries
  const clean = sentence.replace(/\[\[|\]\]/g, '')
  // Split by common punctuation, keeping them as separate tokens when needed
  return clean
    .split(/(?<=[\u4e00-\u9fff\w]{1,4})(?=[\u4e00-\u9fff])/)
    .filter((t) => t.trim().length > 0)
    .slice(0, 8) // cap at 8 tokens
}

/** Extract clean pinyin from [[pinyin]] markers or plain string */
function cleanPinyin(pinyin: string): string {
  return pinyin.replace(/\[\[|\]\]/g, '').trim()
}

// ─── Generator functions ───────────────────────────────────────────────────────

function generateSentenceOrdering(level: 3 | 4, count: number): SentenceOrderingExercise[] {
  const words = getWordsByLevel(level)
  const wordsWithSentences = words.filter((w) => !!w.sentence)
  const selected = shuffle(wordsWithSentences).slice(0, count * 2) // oversample

  const exercises: SentenceOrderingExercise[] = []

  for (const word of selected) {
    if (exercises.length >= count) break
    const sentence = word.sentence
    if (!sentence) continue

    const targetSentence = sentence.zh.replace(/\[\[|\]\]/g, '')
    const tokens = tokenizeChinese(sentence.zh)

    // Need at least 3 tokens to make it interesting
    if (tokens.length < 3) continue

    exercises.push({
      type: 'sentence_ordering',
      hskLevel: level,
      targetSentence,
      targetPinyin: cleanPinyin(sentence.pinyin),
      targetThai: sentence.th.replace(/\[\[|\]\]/g, ''),
      tokens: shuffle(tokens),
      hint: word.simplified,
    })
  }

  return exercises
}

function generatePinyinToChar(count: number): PinyinToCharExercise[] {
  const words = getWordsByLevel(3)
  // Filter: words with 1-2 characters and pinyin
  const candidates = words.filter((w) => w.simplified.length <= 2 && w.pinyin)
  const selected = shuffle(candidates).slice(0, count)

  return selected.map((word) => ({
    type: 'pinyin_to_char' as const,
    hskLevel: 3 as const,
    pinyin: word.pinyin ?? '',
    answer: word.simplified,
    meaning: word.meaningTh ?? '',
    characters: word.simplified.split(''),
  }))
}

function generateShortEssay(count: number): ShortEssayExercise[] {
  const words = getWordsByLevel(5)
  const exercises: ShortEssayExercise[] = []

  for (let i = 0; i < count; i++) {
    // Pick 5 random words
    const selected = shuffle(words).slice(0, 5)

    exercises.push({
      type: 'short_essay',
      hskLevel: 5,
      requiredWords: selected.map((w) => w.simplified),
      wordPinyin: selected.map((w) => w.pinyin ?? ''),
      wordThai: selected.map((w) => w.meaningTh ?? ''),
      targetChars: 80,
      timeLimitSec: 600, // 10 min
    })
  }

  return exercises
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function GET(req: Request): Promise<Response> {
  try {
    // 1. Auth
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse params
    const { searchParams } = new URL(req.url)
    const levelParam = searchParams.get('level')
    const mode = searchParams.get('mode') ?? 'sentence_ordering'
    const count = Math.min(Number(searchParams.get('count') ?? '5'), 20)
    const level = Number(levelParam)

    if (!levelParam || Number.isNaN(level) || level < 3 || level > 6) {
      return Response.json({ data: null, error: 'Invalid level. Must be 3-6.' }, { status: 400 })
    }

    // 3. Generate exercises
    let exercises: unknown[]

    if (mode === 'pinyin_to_char') {
      exercises = generatePinyinToChar(count)
    } else if (mode === 'short_essay') {
      exercises = generateShortEssay(count)
    } else {
      // Default: sentence_ordering (works for levels 3 & 4)
      const hskLevel = (level === 3 || level === 4 ? level : 3) as 3 | 4
      exercises = generateSentenceOrdering(hskLevel, count)
    }

    return Response.json({ data: { exercises, count: exercises.length }, error: null })
  } catch (error) {
    console.error('[writing/exercise] error:', error)
    return Response.json({ data: null, error: 'Internal Server Error' }, { status: 500 })
  }
}
