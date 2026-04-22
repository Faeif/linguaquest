'use client'

import ChatInterface from '@/features/companion/components/ChatInterface'
import type { LearningDNA, SessionConfig } from '@/features/companion/types'

const DEFAULT_DNA: LearningDNA = {
  cefr: 'HSK1',
  goal_tag: 'daily_life',
  weak_clusters: [],
  mastered_clusters: [],
  preferred_companion: 'teacher_female',
  fatigue_signal: 'low',
  recommended_session_length_min: 10,
  push_real_talk: false,
  weak_tones: [],
  weak_chars: [],
  weak_grammar: [],
  correction_style: 'relaxed',
}

const DEFAULT_CONFIG: SessionConfig = {
  mode: 'learner',
  topic: 'ทักทายและแนะนำตัวทั่วไป (General Greeting)',
  difficulty: 'easy',
  companion_id: 'teacher_female',
  session_goal_th: 'ฝึกพูดทักทายและประโยคพื้นฐานในชีวิตประจำวัน',
  target_vocab: ['你好', '很高兴认识你', '你多大'],
  max_turns: 15,
  hint_allowed: true,
}

export default function CompanionPage() {
  // ⚡ Zero-latency load: instantly render ChatInterface with defaults.
  // It acts as a blank canvas drill environment. No loading screens.
  return (
    <div className="w-full h-dvh bg-background">
      <ChatInterface sessionConfig={DEFAULT_CONFIG} learningDNA={DEFAULT_DNA} />
    </div>
  )
}
