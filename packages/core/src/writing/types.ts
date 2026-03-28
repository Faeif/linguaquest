/**
 * Writing Coach — Types
 * Supports HSK 3-6 writing exercises
 */

// ─── Exercise Modes ────────────────────────────────────────────────────────────

/** HSK 3-4: Arrange shuffled words into a grammatically correct sentence */
export interface SentenceOrderingExercise {
  type: 'sentence_ordering'
  hskLevel: 3 | 4
  /** The target sentence in Chinese */
  targetSentence: string
  /** Pinyin for the full sentence */
  targetPinyin: string
  /** Thai translation */
  targetThai: string
  /** Shuffled word tokens for drag-drop */
  tokens: string[]
  /** Hint: related vocabulary word */
  hint?: string
}

/** HSK 3: Given pinyin, write the correct Chinese character(s) */
export interface PinyinToCharExercise {
  type: 'pinyin_to_char'
  hskLevel: 3
  /** Pinyin to display (e.g. "péngyou") */
  pinyin: string
  /** Correct answer in Chinese (e.g. "朋友") */
  answer: string
  /** Thai meaning */
  meaning: string
  /** Individual characters for stroke order display */
  characters: string[]
}

/** HSK 4: Given an image prompt + vocabulary words, compose a sentence */
export interface ImageComposeExercise {
  type: 'image_compose'
  hskLevel: 4
  /** URL or base64 of the image */
  imageUrl: string
  /** Required vocabulary words to use */
  requiredWords: string[]
  /** Pinyin for each word */
  wordPinyin: string[]
  /** Thai meaning for each word */
  wordThai: string[]
  /** Minimum characters */
  minChars: number
  /** AI-graded — no fixed answer */
}

/** HSK 5: Write a short essay (~80 chars) using 5 required vocabulary words */
export interface ShortEssayExercise {
  type: 'short_essay'
  hskLevel: 5
  /** Required vocabulary words (5 words) */
  requiredWords: string[]
  /** Pinyin for each word */
  wordPinyin: string[]
  /** Thai meaning for each word */
  wordThai: string[]
  /** Target character count */
  targetChars: number
  /** Time limit in seconds (default: 10 min = 600s) */
  timeLimitSec: number
}

/** HSK 6: Read article → it disappears → write summary */
export interface ReadingToSummaryExercise {
  type: 'reading_to_summary'
  hskLevel: 6
  /** The article text (Chinese, ~1000 chars) */
  articleText: string
  /** Article title */
  articleTitle: string
  /** Time to read in seconds (default: 10 min = 600s) */
  readTimeSec: number
  /** Time to write summary in seconds (default: 35 min = 2100s) */
  writeTimeSec: number
  /** Target summary length in characters */
  targetSummaryChars: number
}

export type WritingExercise =
  | SentenceOrderingExercise
  | PinyinToCharExercise
  | ImageComposeExercise
  | ShortEssayExercise
  | ReadingToSummaryExercise

// ─── Grading ───────────────────────────────────────────────────────────────────

export interface GradeResult {
  score: number // 0-100
  passed: boolean
  feedback: string // Thai language feedback
  corrections?: string // Chinese corrections if applicable
  rubric?: RubricScore[]
}

export interface RubricScore {
  criterion: string // e.g. "ครอบคลุมเนื้อหา"
  score: number // 0-10
  maxScore: number
  comment: string
}

// ─── Session State ──────────────────────────────────────────────────────────────

export type WritingHskLevel = 3 | 4 | 5 | 6

export interface WritingSessionConfig {
  hskLevel: WritingHskLevel
  exerciseCount: number
}

export type ExerciseStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

export interface ExerciseResult {
  exercise: WritingExercise
  userAnswer: string
  grade: GradeResult | null
  status: ExerciseStatus
  timeSpentSec: number
}
