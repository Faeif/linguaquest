/**
 * Review Service — Business Logic for Flashcard Reviews
 * 
 * Encapsulates all FSRS scheduling logic for flashcard reviews.
 * API routes should delegate to this service, not implement logic inline.
 */

import { Assessment, FSRS } from 'simple-ts-fsrs'
import type { ReviewRating } from './types'

/**
 * Rating computation from user interaction data
 * 
 * Auto-maps answer correctness × response time → FSRS rating
 * - New card (first time seen) + wrong  → Struggled
 * - Review card + wrong                 → Forgot
 * - Correct + <3 s                      → Mastered
 * - Correct + 3–8 s                     → Remembered
 * - Correct + >8 s                      → Struggled
 */
export function computeFsrsRating(
  isCorrect: boolean,
  elapsedMs: number,
  isNew: boolean
): ReviewRating {
  if (!isCorrect) return isNew ? 'Struggled' : 'Forgot'
  if (elapsedMs < 3_000) return 'Mastered'
  if (elapsedMs < 8_000) return 'Remembered'
  return 'Struggled'
}

/**
 * FSRS Assessment input from stored data
 */
export interface StoredAssessment {
  assessedAt: string
  nextScheduledAssessment: string
  stability: number
  difficulty: number
  state: string
}

/**
 * Result of processing a flashcard review
 */
export interface ReviewResult {
  rating: ReviewRating
  nextReviewAt: Date
  state: 'Learning' | 'Review' | 'Relearning'
  stability: number
  difficulty: number
  reviewCount: number
}

/**
 * Input for processing a review
 */
export interface ProcessReviewInput {
  isCorrect: boolean
  elapsedMs: number
  isNew: boolean
  previousAssessment: StoredAssessment | null
  currentReviewCount: number
}

/**
 * Service for processing flashcard reviews with FSRS
 * 
 * @example
 * ```ts
 * const result = ReviewService.processReview({
 *   isCorrect: true,
 *   elapsedMs: 2500,
 *   isNew: false,
 *   previousAssessment: storedAssessment,
 *   currentReviewCount: 5
 * })
 * 
 * // Save to database
 * await db.upsert({
 *   next_review_at: result.nextReviewAt,
 *   stability: result.stability,
 *   // ...
 * })
 * ```
 */
export class ReviewService {
  private fsrs: FSRS

  constructor() {
    this.fsrs = new FSRS({
      requestRetention: 0.9,
      maximumInterval: 365,
    })
  }

  /**
   * Process a flashcard review and calculate next scheduling
   * 
   * This is the main entry point for review processing.
   * All API routes should use this method instead of implementing FSRS logic inline.
   */
  processReview(input: ProcessReviewInput): ReviewResult {
    const rating = computeFsrsRating(input.isCorrect, input.elapsedMs, input.isNew)

    // Convert stored assessment to FSRS Assessment object
    const previousAssessment = input.previousAssessment
      ? new Assessment({
          assessedAt: new Date(input.previousAssessment.assessedAt),
          nextScheduledAssessment: new Date(input.previousAssessment.nextScheduledAssessment),
          stability: input.previousAssessment.stability,
          difficulty: input.previousAssessment.difficulty,
          state: input.previousAssessment.state as 'Learning' | 'Review' | 'Relearning',
        })
      : undefined

    // Calculate new assessment
    const result = previousAssessment
      ? this.fsrs.assessRecall({ rating, previousAssessment })
      : this.fsrs.assessRecall({ rating })

    return {
      rating,
      nextReviewAt: result.nextScheduledAssessment,
      state: result.state,
      stability: result.stability,
      difficulty: result.difficulty,
      reviewCount: input.currentReviewCount + 1,
    }
  }

  /**
   * Get initial assessment for a new card
   * 
   * Use this when a user first sees a card (not yet reviewed)
   */
  getInitialAssessment(): Pick<ReviewResult, 'nextReviewAt' | 'state' | 'stability' | 'difficulty'> {
    const result = this.fsrs.assessRecall({
      rating: 'Remembered',
      date: new Date(),
    })

    return {
      nextReviewAt: result.nextScheduledAssessment,
      state: result.state,
      stability: result.stability,
      difficulty: result.difficulty,
    }
  }
}

/**
 * Singleton instance for convenience
 * 
 * Use this in most cases, or create a new ReviewService() if you need custom config
 */
export const reviewService = new ReviewService()
