// packages/core/src/flashcard/types.ts

import type { Assessment } from 'simple-ts-fsrs'

/**
 * Base flashcard shared across all card types
 */
export interface BaseFlashcard {
  id: string
  user_id: string
  deck_id?: string

  // Card type
  card_type: CardType
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]

  // FSRS data (simple-ts-fsrs)
  fsrs_assessment?: Assessment // Latest assessment

  // Due date (calculated from assessment)
  due: Date

  // Stats
  total_reviews: number
  total_time_ms: number
  mastery_score: number

  created_at: Date
  updated_at: Date
}

/**
 * Card types
 */
export enum CardType {
  CHARACTER_RECOGNITION = 'character_recognition',
  PINYIN_RECOGNITION = 'pinyin_recognition',
  AUDIO_RECOGNITION = 'audio_recognition',
  CHARACTER_WRITING = 'character_writing',
  WORD_TO_SENTENCE = 'word_to_sentence',
  CLOZE_SENTENCE = 'cloze_sentence',
  LISTENING_COMPREHENSION = 'listening_comprehension',
}

/**
 * Character Recognition Card
 */
export interface CharacterRecognitionCard extends BaseFlashcard {
  card_type: CardType.CHARACTER_RECOGNITION

  // Chinese content
  hanzi: string
  simplified?: string
  traditional?: string
  pinyin: string
  pinyin_numbered: string // from plain-pinyin
  tones: number[]

  // Meanings
  thai_meaning: string
  english_meaning?: string

  // Audio
  audio_url?: string

  // Learning aids
  mnemonic?: string
  related_words?: string[]
}

/**
 * Pinyin Recognition Card
 */
export interface PinyinRecognitionCard extends BaseFlashcard {
  card_type: CardType.PINYIN_RECOGNITION

  audio_url: string
  expected_pinyin: string
  expected_tone: number

  hanzi: string
  tone_explanation?: string
}

/**
 * Word to Sentence Card
 */
export interface WordToSentenceCard extends BaseFlashcard {
  card_type: CardType.WORD_TO_SENTENCE

  word: string
  pinyin: string
  meaning: string

  example_sentences: ExampleSentence[]
  grammar_notes?: string
  common_collocations?: string[]
}

export interface ExampleSentence {
  chinese: string
  pinyin: string
  thai: string
  audio_url?: string
}

/**
 * Cloze Card
 */
export interface ClozeCard extends BaseFlashcard {
  card_type: CardType.CLOZE_SENTENCE

  sentence_with_blank: string
  pinyin_with_blank?: string
  thai_translation?: string

  answer: string
  word_bank?: string[]

  explanation?: string
  alternatives?: Record<string, string>
}

/**
 * Listening Comprehension Card
 */
export interface ListeningComprehensionCard extends BaseFlashcard {
  card_type: CardType.LISTENING_COMPREHENSION

  audio_url: string
  question: string
  question_type: 'multiple_choice' | 'true_false' | 'open'

  options?: string[]
  correct_answer: string

  transcript: {
    chinese: string
    pinyin: string
    thai: string
  }
  key_vocabulary: Array<{
    word: string
    meaning: string
  }>
}

/**
 * Union type for all flashcard types
 */
export type FlashCard =
  | CharacterRecognitionCard
  | PinyinRecognitionCard
  | WordToSentenceCard
  | ClozeCard
  | ListeningComprehensionCard

/**
 * Review rating (simple-ts-fsrs uses: Forgot, Struggled, Remembered, Mastered)
 */
export type ReviewRating = 'Forgot' | 'Struggled' | 'Remembered' | 'Mastered'

/**
 * Review result
 */
export interface ReviewResult {
  card: FlashCard
  assessment: Assessment
  next_review_date: Date
  interval_days: number
}

/**
 * Review log
 */
export interface ReviewLog {
  id: string
  card_id: string
  user_id: string

  rating: ReviewRating
  review_duration_ms: number

  // Snapshot of assessment state
  assessment_data: Assessment

  reviewed_at: Date
}
