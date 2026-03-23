/**
 * SM-2 Algorithm implementation
 * https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 *
 * Rating: 1 = Again (hard), 2 = Good, 3 = Easy
 */

export interface SRSCard {
  easeFactor: number // default: 2.5, min: 1.3
  intervalDays: number // default: 0
  repetitions: number // default: 0
}

export interface SRSResult {
  easeFactor: number
  intervalDays: number
  repetitions: number
  nextReviewAt: Date
}

const MIN_EASE_FACTOR = 1.3
const DEFAULT_EASE_FACTOR = 2.5

/**
 * Calculate next review date using SM-2 algorithm
 * @param card - Current card state
 * @param rating - 1 (Again), 2 (Good), 3 (Easy)
 */
export function calculateNextReview(card: SRSCard, rating: 1 | 2 | 3): SRSResult {
  let { easeFactor, intervalDays, repetitions } = card

  if (rating === 1) {
    // Again — reset
    repetitions = 0
    intervalDays = 1
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2)
  } else {
    // Good or Easy
    if (repetitions === 0) {
      intervalDays = 1
    } else if (repetitions === 1) {
      intervalDays = 6
    } else {
      intervalDays = Math.round(intervalDays * easeFactor)
    }

    repetitions += 1

    // Adjust ease factor based on rating
    const delta = rating === 2 ? 0 : 0.15 // Good: no change, Easy: +0.15
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor + delta - 0.08)
  }

  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalDays)
  nextReviewAt.setHours(0, 0, 0, 0)

  return { easeFactor, intervalDays, repetitions, nextReviewAt }
}

/**
 * Check if a card is due for review
 */
export function isCardDue(nextReviewAt: Date): boolean {
  return new Date() >= nextReviewAt
}

/**
 * Get default SRS card state
 */
export function getDefaultSRSCard(): SRSCard {
  return {
    easeFactor: DEFAULT_EASE_FACTOR,
    intervalDays: 0,
    repetitions: 0,
  }
}
