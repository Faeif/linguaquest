// packages/core/src/flashcard/fsrs-scheduler.ts

import { FSRS } from 'simple-ts-fsrs'
import type { FlashCard, ReviewRating, ReviewResult } from './types'

/**
 * FSRS Scheduler configuration optimized for language learning
 */
const FSRS_CONFIG = {
  // Higher retention for language learning
  // (research shows 0.9 is optimal for vocabulary)
  requestRetention: 0.9,

  // Maximum interval: 1 year
  // (language skills decay faster than general knowledge)
  maximumInterval: 365,

  // Enable short-term memory optimization
  enableShortTerm: true,
}

/**
 * FSRS Scheduler for Chinese flashcards
 */
export class FSRSScheduler {
  private fsrs: FSRS

  constructor() {
    this.fsrs = new FSRS(FSRS_CONFIG)
  }

  /**
   * Create a new card with initial FSRS assessment
   */
  createCard<T extends FlashCard>(cardData: Omit<T, 'fsrs_assessment' | 'due'>): T {
    // Create initial assessment
    const initialAssessment = this.fsrs.assessRecall({
      rating: 'Remembered',
      date: new Date(),
    })

    return {
      ...cardData,
      fsrs_assessment: initialAssessment,
      due: initialAssessment.nextScheduledAssessment,
    } as T
  }

  /**
   * Schedule next review based on user rating
   */
  scheduleReview(
    card: FlashCard,
    rating: ReviewRating,
    reviewDate: Date = new Date()
  ): ReviewResult {
    // Get previous assessment or create new one
    const previousAssessment = card.fsrs_assessment

    // Calculate new assessment
    const newAssessment = previousAssessment
      ? this.fsrs.assessRecall({
          rating: rating,
          previousAssessment,
          date: reviewDate,
        })
      : this.fsrs.assessRecall({
          rating: rating,
          date: reviewDate,
        })

    // Calculate interval in days
    const intervalMs = newAssessment.nextScheduledAssessment.getTime() - reviewDate.getTime()
    const intervalDays = Math.round(intervalMs / (1000 * 60 * 60 * 24))

    // Update card
    const updatedCard: FlashCard = {
      ...card,
      fsrs_assessment: newAssessment,
      due: newAssessment.nextScheduledAssessment,
      total_reviews: card.total_reviews + 1,
    }

    return {
      card: updatedCard,
      assessment: newAssessment,
      next_review_date: newAssessment.nextScheduledAssessment,
      interval_days: intervalDays,
    }
  }

  /**
   * Get cards that are due for review
   */
  getDueCards(cards: FlashCard[], asOf: Date = new Date()): FlashCard[] {
    return cards
      .filter((card) => card.due <= asOf)
      .sort((a, b) => a.due.getTime() - b.due.getTime())
  }

  /**
   * Get retrievability (probability of recall) for a card
   */
  getRetrievability(card: FlashCard, asOf: Date = new Date()): number {
    if (!card.fsrs_assessment) {
      return 0
    }

    return card.fsrs_assessment.getRetrievability(asOf)
  }

  /**
   * Predict next interval for each rating
   */
  predictIntervals(card: FlashCard): Record<ReviewRating, number> {
    const ratings: ReviewRating[] = ['Forgot', 'Struggled', 'Remembered', 'Mastered']
    const predictions: Record<string, number> = {}

    const now = new Date()

    for (const rating of ratings) {
      const result = this.scheduleReview(card, rating, now)
      predictions[rating] = result.interval_days
    }

    return predictions as Record<ReviewRating, number>
  }
}

/**
 * Singleton instance
 */
export const fsrsScheduler = new FSRSScheduler()
