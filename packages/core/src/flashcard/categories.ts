/**
 * Vocabulary Categories — LinguaQuest
 *
 * 3-Level taxonomy for Chinese vocabulary:
 *   Level 1 (Major):  HSK | Topic | Grammar | Special | Custom
 *   Level 2 (Category): Food | Travel | Measure Words | Idioms | ...
 *   Level 3 (Sub):      Food Basics | Ordering | Chinese Dishes | ...
 */

// ─── Category Types ─────────────────────────────────────────

export type CategoryType = 'hsk' | 'topic' | 'grammar' | 'special' | 'custom'
export type CategoryLevel = 1 | 2 | 3
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface LocalizedText {
  en: string
  th: string
  zh?: string
}

export interface VocabularyCategory {
  id: string
  parentId: string | null
  level: CategoryLevel
  slug: string
  type: CategoryType

  name: LocalizedText
  description?: LocalizedText

  icon?: string
  color?: string
  priority: number

  wordCount: number
  difficulty?: Difficulty

  isOfficial: boolean
  isActive: boolean
}

// ─── Unlock Conditions (Gamification) ────────────────────────

export type UnlockType = 'free' | 'progress' | 'streak' | 'mastery' | 'premium'

export interface UnlockCondition {
  type: UnlockType
  /** Category slug that must be completed first */
  requiredCategorySlug?: string
  /** Minimum progress percentage required (0–100) */
  requiredProgress?: number
  /** Minimum streak days */
  requiredStreak?: number
  /** Minimum mastery score (0–100) */
  requiredMasteryScore?: number
  /** Requires premium subscription */
  isPremium?: boolean
}

// ─── User Progress per Category ──────────────────────────────

export interface UserCategoryProgress {
  userId: string
  categoryId: string
  totalWords: number
  learnedWords: number
  masteredWords: number
  progressPercentage: number
  lastStudiedAt: Date | null
  isCompleted: boolean
  completedAt: Date | null
}

// ─── Seed Data Constants ─────────────────────────────────────

/** HSK level definitions */
export const HSK_LEVELS = [
  { level: 1, totalWords: 150, newWords: 150, difficulty: 'beginner' as const },
  { level: 2, totalWords: 300, newWords: 150, difficulty: 'beginner' as const },
  { level: 3, totalWords: 600, newWords: 300, difficulty: 'intermediate' as const },
  { level: 4, totalWords: 1200, newWords: 600, difficulty: 'intermediate' as const },
  { level: 5, totalWords: 2500, newWords: 1300, difficulty: 'advanced' as const },
  { level: 6, totalWords: 5000, newWords: 2500, difficulty: 'advanced' as const },
] as const

/** Topic category definitions with Thai/English names */
export const TOPIC_CATEGORIES = [
  {
    slug: 'food_dining',
    icon: '🍜',
    priority: 1,
    name: { en: 'Food & Dining', th: 'อาหารและการทานอาหาร' },
  },
  { slug: 'travel', icon: '✈️', priority: 2, name: { en: 'Travel', th: 'การเดินทาง' } },
  { slug: 'shopping', icon: '🛍️', priority: 3, name: { en: 'Shopping', th: 'ช้อปปิ้ง' } },
  {
    slug: 'work_business',
    icon: '💼',
    priority: 4,
    name: { en: 'Work & Business', th: 'งานและธุรกิจ' },
  },
  {
    slug: 'health_medical',
    icon: '💊',
    priority: 5,
    name: { en: 'Health & Medical', th: 'สุขภาพและการแพทย์' },
  },
  { slug: 'technology', icon: '📱', priority: 6, name: { en: 'Technology', th: 'เทคโนโลยี' } },
  { slug: 'daily_life', icon: '🏠', priority: 7, name: { en: 'Daily Life', th: 'ชีวิตประจำวัน' } },
  { slug: 'education', icon: '📖', priority: 8, name: { en: 'Education', th: 'การศึกษา' } },
  {
    slug: 'entertainment',
    icon: '🎬',
    priority: 9,
    name: { en: 'Entertainment', th: 'ความบันเทิง' },
  },
  {
    slug: 'relationships',
    icon: '❤️',
    priority: 10,
    name: { en: 'Relationships', th: 'ความสัมพันธ์' },
  },
] as const

/** Special category definitions */
export const SPECIAL_CATEGORIES = [
  { slug: 'idioms', icon: '🎭', name: { en: 'Chinese Idioms (成语)', th: 'สำนวนจีน (成语)' } },
  { slug: 'slang', icon: '💬', name: { en: 'Slang & Colloquial', th: 'ภาษาพูด/แสลง' } },
  { slug: 'business_formal', icon: '🎩', name: { en: 'Business Formal', th: 'ภาษาธุรกิจ (formal)' } },
  {
    slug: 'thai_context',
    icon: '🇹🇭',
    name: { en: 'Essential for Thai Learners', th: 'คำที่คนไทยต้องรู้' },
  },
] as const

/** Grammar category definitions */
export const GRAMMAR_CATEGORIES = [
  { slug: 'measure_words', name: { en: 'Measure Words (量词)', th: 'ลักษณนาม (量词)' } },
  { slug: 'particles', name: { en: 'Particles (助词)', th: 'คำช่วย (助词)' } },
  { slug: 'time_expressions', name: { en: 'Time Expressions', th: 'การบอกเวลา' } },
  { slug: 'connectors', name: { en: 'Connectors', th: 'คำเชื่อม' } },
] as const
