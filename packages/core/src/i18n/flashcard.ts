/**
 * Flashcard i18n Constants
 * 
 * Centralized language mappings for flashcard-related UI strings.
 * Import these instead of hardcoding in components.
 */

/**
 * Part of Speech (POS) labels in Thai
 * 
 * Used in:
 * - LevelSelector component
 * - PosTabView component
 * - Session context labels
 */
export const POS_THAI: Record<string, string> = {
  动词: 'กริยา',
  名词: 'คำนาม',
  形容词: 'คุณศัพท์',
  副词: 'กริยาวิเศษณ์',
  连词: 'คำเชื่อม',
  量词: 'ลักษณนาม',
  介词: 'บุพบท',
  代词: 'สรรพนาม',
  其他: 'อื่นๆ',
} as const

/**
 * CEFR Level labels
 */
export const CEFR_LABELS: Record<string, { en: string; th: string }> = {
  A1: { en: 'Beginner', th: 'ระดับเริ่มต้น' },
  A2: { en: 'Elementary', th: 'ระดับพื้นฐาน' },
  B1: { en: 'Intermediate', th: 'ระดับกลาง' },
  B2: { en: 'Upper Intermediate', th: 'ระดับกลาง-สูง' },
  C1: { en: 'Advanced', th: 'ระดับสูง' },
  C2: { en: 'Mastery', th: 'ระดับเชี่ยวชาญ' },
} as const

/**
 * HSK Level labels with display names
 */
export const HSK_LABELS: Record<number, { en: string; th: string }> = {
  1: { en: 'HSK 1', th: 'HSK 1' },
  2: { en: 'HSK 2', th: 'HSK 2' },
  3: { en: 'HSK 3', th: 'HSK 3' },
  4: { en: 'HSK 4', th: 'HSK 4' },
  5: { en: 'HSK 5', th: 'HSK 5' },
  6: { en: 'HSK 6', th: 'HSK 6' },
  7: { en: 'HSK 7-9', th: 'HSK 7-9' },
} as const

/**
 * Review ratings with Thai translations
 */
export const REVIEW_RATINGS: Record<string, { en: string; th: string }> = {
  Forgot: { en: 'Forgot', th: 'จำไม่ได้' },
  Struggled: { en: 'Struggled', th: 'จำยาก' },
  Remembered: { en: 'Remembered', th: 'จำได้' },
  Mastered: { en: 'Mastered', th: 'จำขึ้นใจ' },
} as const

/**
 * Session tab labels
 */
export const SESSION_TABS: Record<string, { th: string }> = {
  hsk: { th: 'HSK' },
  pos: { th: 'หมวดคำ' },
  review: { th: 'ทบทวน' },
} as const

/**
 * Common action labels
 */
export const ACTIONS: Record<string, { th: string }> = {
  start: { th: 'เริ่ม' },
  continue: { th: 'ต่อไป' },
  complete: { th: 'เสร็จสิ้น' },
  cancel: { th: 'ยกเลิก' },
  save: { th: 'บันทึก' },
  delete: { th: 'ลบ' },
  edit: { th: 'แก้ไข' },
  loading: { th: 'กำลังโหลด…' },
  error: { th: 'เกิดข้อผิดพลาด' },
  retry: { th: 'ลองใหม่' },
} as const

/**
 * Context labels for flashcard sessions
 * 
 * Used in session header to show current study context
 */
export function buildSessionContextLabel(
  level: number | 'all',
  pos?: string,
  isReviewAll?: boolean
): string {
  if (isReviewAll) {
    return 'ทบทวนทั้งหมด'
  }

  if (level === 'all' && pos) {
    const thaiLabel = POS_THAI[pos] ?? pos
    return `${pos} · ${thaiLabel} · ทุกระดับ`
  }

  const levelLabel = level === 7 ? 'HSK 7-9' : `HSK ${level}`
  if (pos) {
    const thaiLabel = POS_THAI[pos] ?? pos
    return `${levelLabel} · ${pos} · ${thaiLabel}`
  }

  return levelLabel
}
