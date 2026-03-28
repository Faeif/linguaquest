/**
 * Card Generator Tests
 *
 * Verifies integration with:
 * - nieldlr/hanzi for character definitions and frequency
 * - plain-pinyin for tone numbering
 * - simple-ts-fsrs for initial assessment generation
 */
import { beforeAll, describe, expect, it } from 'vitest'
import { cardGenerator, initializeHanziJS } from './card-generator'
import type { CharacterRecognitionCard } from './types'
import { CardType } from './types'

// Initialize HanziJS once before all tests
beforeAll(async () => {
  await initializeHanziJS()
})

describe('generateCharacterCard', () => {
  it('should generate a Character Recognition card for a known single character', async () => {
    const word = '学'
    const userId = 'user_123'

    const card = await cardGenerator.generateCharacterCard(word, userId)

    expect(card).toBeDefined()
    expect(card.id).toContain('card_')
    expect(card.user_id).toBe(userId)
    expect(card.card_type).toBe(CardType.CHARACTER_RECOGNITION)

    // Chinese content checks
    expect(card.hanzi).toBe('学')
    expect(card.pinyin).toBe('xue2')
    expect(card.pinyin_numbered).toBe('xue2')
    expect(card.tones).toContain(2)

    // Hanzi definition check
    expect(card.english_meaning).toBeDefined()
    expect(card.english_meaning?.length).toBeGreaterThan(0)

    // FSRS Assessment check
    expect(card.fsrs_assessment).toBeDefined()
    expect(card.due).toBeInstanceOf(Date)
    expect(card.total_reviews).toBe(0)
  })

  it('should handle multi-character compound words and extract multiple tones', async () => {
    const word = '学习'
    const card = await cardGenerator.generateCharacterCard(word, 'user_123')

    expect(card.hanzi).toBe('学习')
    expect(card.pinyin_numbered).toBe('xue2 xi2')
    expect(card.tones).toEqual([2, 2])
    expect(card.english_meaning).toBeDefined()
  })

  it('should assign beginner difficulty to common characters', async () => {
    // "的" is one of the most common characters
    const card = await cardGenerator.generateCharacterCard('的', 'user_123')
    expect(card.difficulty_level).toBe('beginner')
  })

  it('should assign advanced difficulty to rare or unknown characters', async () => {
    // "龘" is a very rare character
    const card = await cardGenerator.generateCharacterCard('龘', 'user_123')
    expect(card.difficulty_level).toBe('advanced')
  })

  it('should generate multiple cards for advanced users', async () => {
    const cards = await cardGenerator.generateCardsFromWord('学习', 'user_1', 'advanced')

    // Should have at least the character recognition card
    expect(cards.length).toBeGreaterThan(0)
    expect(cards[0]?.card_type).toBe(CardType.CHARACTER_RECOGNITION)
    expect((cards[0] as CharacterRecognitionCard).hanzi).toBe('学习')
  })
})
