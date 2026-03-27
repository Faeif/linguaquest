import { z } from 'zod'

export const HSK_LEVELS = [
  'HSK 1',
  'HSK 2',
  'HSK 3',
  'HSK 4',
  'HSK 5',
  'HSK 6',
  // Future proofing for new 9-level HSK system if needed
  'HSK 7-9',
] as const

export const LEARNING_GOALS = [
  'exam', // สอบ HSK
  'travel', // ท่องเที่ยว/สื่อสารทั่วไป
  'business', // ธุรกิจ/ทำงาน
  'media', // ดูซีรีส์/ฟังเพลง
  'casual', // เรียนเป็นงานอดิเรก
] as const

export const OnboardingSchema = z.object({
  learningGoal: z.enum(LEARNING_GOALS, {
    error: 'กรุณาเลือกเป้าหมายการเรียน',
  }),
  hskSelfAssessed: z.enum(HSK_LEVELS, {
    error: 'กรุณาเลือกระดับ HSK ปัจจุบันของคุณ',
  }),
  dailyGoalMinutes: z
    .number({ error: 'ต้องเป็นตัวเลข' })
    .min(5, 'เป้าหมายรายวันต้องอย่างน้อย 5 นาที')
    .max(120, 'เพื่อไม่ให้หนักเกินไป แนะนำไม่เกิน 120 นาทีต่อวัน'),
})

export type OnboardingInput = z.infer<typeof OnboardingSchema>
export type HskLevel = z.infer<typeof OnboardingSchema>['hskSelfAssessed']
export type LearningGoal = z.infer<typeof OnboardingSchema>['learningGoal']
