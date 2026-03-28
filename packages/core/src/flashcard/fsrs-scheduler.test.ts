import { describe, expect, it } from 'vitest'
import { fsrsScheduler } from './fsrs-scheduler'
import { CardType, type CharacterRecognitionCard, type FlashCard } from './types'

describe('FSRSScheduler', () => {
  const createMockCardData = (): Omit<CharacterRecognitionCard, 'fsrs_assessment' | 'due'> => ({
    id: 'test_123',
    user_id: 'user_1',
    card_type: CardType.CHARACTER_RECOGNITION,
    difficulty_level: 'beginner',
    tags: ['hsk1'],

    hanzi: '好',
    pinyin: 'hao3',
    pinyin_numbered: 'hao3',
    tones: [3],
    thai_meaning: 'ดี',

    total_reviews: 0,
    total_time_ms: 0,
    mastery_score: 0,
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  })

  it('createCard initializes assessment successfully', () => {
    const cardData = createMockCardData()
    const card = fsrsScheduler.createCard(cardData)

    expect(card.fsrs_assessment).toBeDefined()
    expect(card.fsrs_assessment?.state).toBe('Learning')
    expect(card.due).toBeInstanceOf(Date)
    expect(card.total_reviews).toBe(0)
  })

  it('scheduleReview updates review stats and pushes due date', () => {
    const card = fsrsScheduler.createCard(createMockCardData())

    const reviewDate = new Date()
    const result = fsrsScheduler.scheduleReview(card, 'Remembered', reviewDate)

    expect(result.card.total_reviews).toBe(1)
    expect(result.next_review_date.getTime()).toBeGreaterThan(reviewDate.getTime())
    expect(result.interval_days).toBeGreaterThan(0)

    // Memory state checks
    expect(result.assessment.stability).toBeDefined()
    expect(result.assessment.difficulty).toBeDefined()
  })

  it('predictIntervals predicts different intervals for Remembered vs Struggled', () => {
    const card = fsrsScheduler.createCard(createMockCardData())

    const intervals = fsrsScheduler.predictIntervals(card)

    expect(intervals.Remembered).toBeDefined()
    expect(intervals.Struggled).toBeDefined()
    expect(intervals.Mastered).toBeDefined()
    expect(intervals.Forgot).toBeDefined()

    // Mastered interval should be longer than Struggled interval
    expect(intervals.Mastered).toBeGreaterThan(intervals.Struggled)
  })

  it('getDueCards filters correctly based on due dates', () => {
    const now = new Date('2026-03-28T12:00:00Z')
    const past = new Date('2026-03-27T12:00:00Z')
    const future = new Date('2026-03-29T12:00:00Z')

    const cards: FlashCard[] = [
      { ...createMockCardData(), id: 'due_past', due: past } as FlashCard,
      { ...createMockCardData(), id: 'due_now', due: now } as FlashCard,
      { ...createMockCardData(), id: 'not_due', due: future } as FlashCard,
    ]

    const dueCards = fsrsScheduler.getDueCards(cards, now)

    expect(dueCards.length).toBe(2)
    expect(dueCards.map((c) => c.id)).toContain('due_past')
    expect(dueCards.map((c) => c.id)).toContain('due_now')
    expect(dueCards.map((c) => c.id)).not.toContain('not_due')
  })
})
