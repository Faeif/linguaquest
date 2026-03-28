export type CefrLevel = 'HSK1' | 'HSK2' | 'HSK3' | 'HSK4+'
export type GoalTag = 'connect_people' | 'travel' | 'business' | 'daily_life' | 'media'
export type CompanionId = 'backpacker_male' | 'teacher_female'
export type SessionMode = 'learner' | 'real_talk'
export type FatigueSignal = 'low' | 'medium' | 'high'
export type CorrectionStyle = 'strict' | 'relaxed'
export type IntentType =
  | 'SCENARIO_FLOW'
  | 'COACH_QUESTION'
  | 'CONFUSION'
  | 'OFF_TOPIC'
  | 'SESSION_COMPLETE'

export interface LearningDNA {
  cefr: CefrLevel
  goal_tag: GoalTag
  weak_clusters: string[]
  mastered_clusters: string[]
  preferred_companion: CompanionId
  fatigue_signal: FatigueSignal
  recommended_session_length_min: number
  push_real_talk: boolean
  weak_tones: number[]
  weak_chars: string[]
  weak_grammar: string[]
  correction_style: CorrectionStyle
}

export interface SessionConfig {
  mode: SessionMode
  topic: string
  difficulty: 'very_easy' | 'easy' | 'medium' | 'hard'
  companion_id: CompanionId
  session_goal_th: string
  target_vocab: string[]
  max_turns: number
  hint_allowed: boolean
}

export interface ExplainItem {
  word: string
  pinyin: string
  meaning_th: string
  note?: string
}

export interface VocabTag {
  word: string
  pinyin: string
  meaning_th: string
}

export interface SentenceSummaryItem {
  chinese: string
  pinyin: string
  thai: string
}

export interface CompanionResponseBlock {
  // Legacy field retained for fallback compatibility
  speech: string
  // New 3-part speech fields
  speechTh?: string // Thai context for learner
  speechZh?: string // Pure Chinese (sent to TTS)
  speechPinyin?: string // Pinyin for display
  intent?: IntentType
  explain?: ExplainItem[]
  hint?: string | null
  targetSentence?: string | null
  targetPinyin?: string | null
  targetThai?: string | null
  vocab_tags?: VocabTag[]
  sessionComplete?: boolean
  sentenceSummary?: SentenceSummaryItem[]
  vocabSummary?: VocabTag[]
}
