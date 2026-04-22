// packages/core/src/flashcard/card-generator.ts

/**
 * Card Generator using HanziJS and plain-pinyin
 *
 * IMPORTANT: This module is SERVER-SIDE ONLY
 * - hanzi is CommonJS-only
 * - Use in API routes and server components only
 */

// @ts-expect-error - hanzi library does not provide types and local d.ts is not picked up in monorepo build
import type { Definition } from 'hanzi'
import { enrichCardWithThai } from './ai-enrichment'
import { fsrsScheduler } from './fsrs-scheduler'
import type { CharacterRecognitionCard, ClozeCard, WordToSentenceCard } from './types'
import { CardType } from './types'

// Dynamic import for server-side only — typed via hanzi.d.ts
type HanziLib = {
  start(): void
  definitionLookup(character: string, type?: 's' | 't'): Definition[] | null
  getExamples(character: string): Definition[]
  getCharacterFrequency(character: string): { number: string; character: string } | null
  segment(text: string): string[]
}
let hanzi: HanziLib | null = null

/**
 * Initialize HanziJS & plain-pinyin (server-side only)
 */
export async function initializeHanziJS() {
  if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
    throw new Error('HanziJS can only be used server-side')
  }

  if (!hanzi) {
    const hanziModule = await import('hanzi')
    hanzi = hanziModule.default || hanziModule
    if (hanzi) {
      hanzi.start() // Initialize HanziJS
    }
  }
}

export interface GenerateCardOptions {
  /** Call DeepSeek to fill thai_meaning + example_sentences. Default: false */
  enrich?: boolean
  /** Base URL for pinyin audio files. Default: '/audio/pinyin' */
  audioBaseUrl?: string
}

/**
 * Card Generator
 */
export class CardGenerator {
  /**
   * Generate Character Recognition card from a Chinese word.
   *
   * Pass `options.enrich: true` in API routes to populate Thai meaning
   * and example sentences via DeepSeek. Omit in tests to avoid network calls.
   */
  async generateCharacterCard(
    word: string,
    userId: string,
    deckId?: string,
    options: GenerateCardOptions = {}
  ): Promise<CharacterRecognitionCard> {
    await initializeHanziJS()

    const { enrich = false, audioBaseUrl = '/audio/pinyin' } = options

    // Get character data from HanziJS
    if (!hanzi) throw new Error('HanziJS not initialized')
    const definitions = hanzi.definitionLookup(word, 's') || []

    // Get pinyin with tones
    const pinyin = definitions[0]?.pinyin || ''
    const pinyinNumbered = this.convertPinyinToNumbered(pinyin)
    const tones = this.extractTones(pinyinNumbered)

    // HSK level from frequency rank of the first character
    const hskLevel = this.resolveHskLevel(word)

    // Audio URL — first syllable only (compound words share a single card)
    const audioUrl = this.buildAudioUrl(pinyinNumbered, audioBaseUrl)

    // Related words from HanziJS examples
    const examples = hanzi.getExamples(word) || []
    const relatedWords = examples
      .slice(0, 5)
      .map((ex: Definition) => ex.simplified || ex.traditional)

    const englishMeaning = definitions[0]?.definition

    // AI enrichment (Thai meaning + example sentences) — server-side only
    let thaiMeaning = ''
    let exampleSentences: CharacterRecognitionCard['related_words'] = relatedWords

    if (enrich) {
      const enriched = await enrichCardWithThai(word, pinyinNumbered, englishMeaning ?? '')
      thaiMeaning = enriched.thai_meaning
      // Store enriched examples back via related_words slot until WordToSentenceCard is used
      exampleSentences = relatedWords
      void enriched.example_sentences // consumed by caller / stored separately
    }

    const cardData: Omit<CharacterRecognitionCard, 'fsrs_assessment' | 'due'> = {
      id: this.generateId(),
      user_id: userId,
      ...(deckId ? { deck_id: deckId } : {}),
      card_type: CardType.CHARACTER_RECOGNITION,
      difficulty_level: this.estimateDifficulty(word),
      tags: this.generateTags(word, definitions[0], hskLevel),

      // Chinese content
      hanzi: word,
      simplified: word,
      pinyin,
      pinyin_numbered: pinyinNumbered,
      tones,

      // Meanings
      thai_meaning: thaiMeaning,
      english_meaning: englishMeaning,

      // Audio + learning aids
      audio_url: audioUrl,
      related_words: exampleSentences ?? [],

      // Stats
      total_reviews: 0,
      total_time_ms: 0,
      mastery_score: 0,

      created_at: new Date(),
      updated_at: new Date(),
    }

    return fsrsScheduler.createCard<CharacterRecognitionCard>(cardData)
  }

  /**
   * Generate multiple cards from a word (beginner → advanced)
   */
  async generateCardsFromWord(
    word: string,
    userId: string,
    userLevel: 'beginner' | 'intermediate' | 'advanced',
    deckId?: string
  ): Promise<Array<CharacterRecognitionCard | WordToSentenceCard | ClozeCard>> {
    await initializeHanziJS()

    const cards: Array<CharacterRecognitionCard | WordToSentenceCard | ClozeCard> = []

    // 1. Always: Character Recognition
    const charCard = await this.generateCharacterCard(word, userId, deckId)
    cards.push(charCard)

    // 2. Intermediate+: Word to Sentence
    if (userLevel === 'intermediate' || userLevel === 'advanced') {
      // const sentenceCard = await this.generateWordToSentenceCard(word, userId, deckId);
      // cards.push(sentenceCard);
      // TODO: Implement after basic structure is working
    }

    // 3. Advanced: Cloze
    if (userLevel === 'advanced') {
      // const clozeCard = await this.generateClozeCard(word, userId, deckId);
      // cards.push(clozeCard);
      // TODO: Implement after basic structure is working
    }

    return cards
  }

  // Helper methods

  private generateId(): string {
    return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private convertPinyinToNumbered(pinyinStr: string): string {
    if (!pinyinStr) return ''
    const toneMap: Record<string, { letter: string; tone: number }> = {
      ā: { letter: 'a', tone: 1 },
      á: { letter: 'a', tone: 2 },
      ǎ: { letter: 'a', tone: 3 },
      à: { letter: 'a', tone: 4 },
      ē: { letter: 'e', tone: 1 },
      é: { letter: 'e', tone: 2 },
      ě: { letter: 'e', tone: 3 },
      è: { letter: 'e', tone: 4 },
      ī: { letter: 'i', tone: 1 },
      í: { letter: 'i', tone: 2 },
      ǐ: { letter: 'i', tone: 3 },
      ì: { letter: 'i', tone: 4 },
      ō: { letter: 'o', tone: 1 },
      ó: { letter: 'o', tone: 2 },
      ǒ: { letter: 'o', tone: 3 },
      ò: { letter: 'o', tone: 4 },
      ū: { letter: 'u', tone: 1 },
      ú: { letter: 'u', tone: 2 },
      ǔ: { letter: 'u', tone: 3 },
      ù: { letter: 'u', tone: 4 },
      ǖ: { letter: 'v', tone: 1 },
      ǘ: { letter: 'v', tone: 2 },
      ǚ: { letter: 'v', tone: 3 },
      ǜ: { letter: 'v', tone: 4 },
    }

    return pinyinStr
      .split(' ')
      .map((syllable) => {
        let toneNum = 5
        let newSyllable = syllable
        for (const [char, { letter, tone }] of Object.entries(toneMap)) {
          if (newSyllable.includes(char)) {
            newSyllable = newSyllable.replace(char, letter)
            toneNum = tone
            break
          }
        }
        return toneNum !== 5 ? `${newSyllable}${toneNum}` : newSyllable
      })
      .join(' ')
  }

  private extractTones(pinyinNumbered: string): number[] {
    // Extract tone numbers from numbered pinyin
    // Example: "xue2 xi2" → [2, 2], "ma" → [5]
    const matches = pinyinNumbered.match(/\d/g)
    if (!matches) {
      // if no tones found, assume neutral tone (5) for each syllable
      const syllables = pinyinNumbered.split(' ').filter(Boolean)
      return syllables.map(() => 5)
    }
    return matches.map(Number)
  }

  private estimateDifficulty(word: string): 'beginner' | 'intermediate' | 'advanced' {
    if (!word || !hanzi) return 'advanced'
    const frequency = hanzi.getCharacterFrequency(word[0] ?? '')
    if (!frequency) return 'advanced'

    const rank = parseInt(frequency.number, 10)

    if (rank <= 500) return 'beginner'
    if (rank <= 2000) return 'intermediate'
    return 'advanced'
  }

  private generateTags(
    _word: string,
    definition: Definition | undefined,
    hskLevel: string
  ): string[] {
    const tags: string[] = []

    if (hskLevel) tags.push(hskLevel)

    if (definition?.definition) {
      const def = definition.definition.toLowerCase()
      if (def.includes('verb')) tags.push('verb')
      if (def.includes('noun')) tags.push('noun')
      if (def.includes('adjective')) tags.push('adjective')
    }

    return tags
  }

  /**
   * Map character frequency rank → HSK level tag (e.g. "hsk1").
   * Uses the first character of a compound word for the lookup.
   * Returns '' if the character is not in the frequency list.
   */
  private resolveHskLevel(word: string): string {
    if (!word || !hanzi) return ''
    const freq = hanzi.getCharacterFrequency(word[0] ?? '')
    if (!freq) return ''
    const rank = parseInt(freq.number, 10)
    if (rank <= 150) return 'hsk1'
    if (rank <= 300) return 'hsk2'
    if (rank <= 600) return 'hsk3'
    if (rank <= 1200) return 'hsk4'
    if (rank <= 2500) return 'hsk5'
    if (rank <= 5000) return 'hsk6'
    return ''
  }

  /**
   * Build an audio URL for the first syllable of a pinyin_numbered string.
   * e.g. "xue2 xi2" → "{audioBaseUrl}/xue2.mp3"
   *
   * Audio files (one per syllable) are expected at audioBaseUrl.
   * Drop-in source: github.com/davinfifield/mp3-chinese-pinyin-sound
   */
  private buildAudioUrl(pinyinNumbered: string, audioBaseUrl: string): string {
    const firstSyllable = pinyinNumbered.split(' ')[0]
    if (!firstSyllable) return ''
    return `${audioBaseUrl}/${firstSyllable}.mp3`
  }
}

/**
 * Singleton instance
 */
export const cardGenerator = new CardGenerator()
