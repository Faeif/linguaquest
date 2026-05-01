/**
 * Flashcard Feature Constants
 * 
 * Re-exports from @linguaquest/core i18n for feature use
 */

export {
  POS_THAI,
  HSK_LABELS,
  REVIEW_RATINGS,
  SESSION_TABS,
  ACTIONS,
  buildSessionContextLabel,
} from '@linguaquest/core/i18n'

/**
 * POS display order (most common first)
 */
export const POS_ORDER = ['动词', '名词', '形容词', '副词', '代词', '量词', '介词', '连词', '其他'] as const

/**
 * Typewriter placeholder for search input
 */
export const PLACEHOLDER_CYCLE = [
  '你好  ·  สวัสดี',
  '动词  ·  กริยา',
  '学习  ·  เรียนรู้',
  'HSK 3  ·  ระดับกลาง',
  '名词  ·  คำนาม',
  '朋友  ·  เพื่อน',
  '形容词  ·  คุณศัพท์',
] as const

/**
 * Get HSK level display label
 */
export function getLevelLabel(level: number): string {
  return level === 7 ? 'HSK 7-9' : `HSK ${level}`
}

/**
 * Get level description in Thai
 */
export function getLevelDescription(level: number): string {
  const descriptions: Record<number, string> = {
    1: 'คำพื้นฐาน',
    2: 'ระดับพื้นฐาน',
    3: 'ระดับกลาง',
    4: 'ระดับกลาง-สูง',
    5: 'ระดับสูง',
    6: 'ระดับสูงมาก',
    7: 'ระดับเชี่ยวชาญ',
  }
  return descriptions[level] ?? ''
}
