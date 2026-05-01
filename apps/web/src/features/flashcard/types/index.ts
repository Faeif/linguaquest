/**
 * Flashcard Feature Types
 */

import type { SessionCard } from '@/app/api/flashcard/session/route'

/**
 * Level statistics from database
 */
export interface LevelStat {
  level: number
  totalWords: number
  dueCount: number
  seenCount: number
}

/**
 * Answer result from flashcard interaction
 */
export interface AnswerResult {
  isCorrect: boolean
  elapsedMs: number
  isNew: boolean
}

/**
 * Card result stored during session
 */
export interface CardResult {
  simplified: string
  isCorrect: boolean
  elapsedMs: number
  isNew: boolean
}

/**
 * Session card with additional display data
 */
export interface DisplaySessionCard extends SessionCard {
  // Additional display properties if needed
}

/**
 * Session context for tracking study progress
 */
export interface SessionContext {
  level: number | 'all'
  pos?: string
  isReviewAll?: boolean
}
