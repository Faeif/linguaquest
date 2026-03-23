'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClientSupabase } from '@/lib/supabase/client'

type Goal = 'ielts' | 'toeic' | 'daily' | 'business' | 'other'
type Level = 'beginner' | 'intermediate' | 'advanced'

const GOALS: { id: Goal; label: string; emoji: string; desc: string }[] = [
  { id: 'ielts', label: 'IELTS', emoji: '🎓', desc: 'เตรียมสอบ IELTS' },
  { id: 'toeic', label: 'TOEIC', emoji: '💼', desc: 'เตรียมสอบ TOEIC' },
  { id: 'daily', label: 'Daily English', emoji: '💬', desc: 'ใช้งานชีวิตประจำวัน' },
  { id: 'business', label: 'Business', emoji: '📊', desc: 'ภาษาอังกฤษธุรกิจ' },
  { id: 'other', label: 'Other', emoji: '✨', desc: 'เป้าหมายอื่น ๆ' },
]

const LEVELS: { id: Level; label: string; emoji: string; desc: string }[] = [
  { id: 'beginner', label: 'Beginner', emoji: '🌱', desc: 'เริ่มต้น / พื้นฐาน' },
  { id: 'intermediate', label: 'Intermediate', emoji: '🌿', desc: 'พอสื่อสารได้' },
  { id: 'advanced', label: 'Advanced', emoji: '🌳', desc: 'ใช้ได้คล่อง' },
]

export default function OnboardingPage() {
  const [step, setStep] = useState<'goal' | 'level'>('goal')
  const [goal, setGoal] = useState<Goal | null>(null)
  const [level, setLevel] = useState<Level | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClientSupabase()

  async function handleFinish() {
    if (!goal || !level) return
    setSaving(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('profiles')
        .update({ goal, level, onboarding_completed: true })
        .eq('id', user.id)
    }

    router.push('/home')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          <div
            className={`flex-1 h-1.5 rounded-full transition-all ${step === 'goal' || step === 'level' ? 'bg-purple-400' : 'bg-white/20'}`}
          />
          <div
            className={`flex-1 h-1.5 rounded-full transition-all ${step === 'level' ? 'bg-purple-400' : 'bg-white/20'}`}
          />
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          {step === 'goal' ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">เป้าหมายของคุณคืออะไร?</h2>
              <p className="text-purple-300 text-sm mb-6">เราจะปรับบทเรียนให้เหมาะกับคุณ</p>
              <div className="space-y-3">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoal(g.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      goal === g.id
                        ? 'border-purple-400 bg-purple-500/20 text-white'
                        : 'border-white/20 bg-white/5 text-white/70 hover:border-purple-500/50 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-2xl">{g.emoji}</span>
                    <div className="text-left">
                      <div className="font-semibold">{g.label}</div>
                      <div className="text-xs text-purple-300">{g.desc}</div>
                    </div>
                    {goal === g.id && <span className="ml-auto text-purple-400">✓</span>}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setStep('level')}
                disabled={!goal}
                className="w-full mt-6 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-medium py-3 rounded-xl transition"
              >
                ถัดไป →
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">ระดับภาษาอังกฤษของคุณ?</h2>
              <p className="text-purple-300 text-sm mb-6">ไม่ต้องกดดัน — สามารถเปลี่ยนได้ภายหลัง</p>
              <div className="space-y-3">
                {LEVELS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLevel(l.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      level === l.id
                        ? 'border-purple-400 bg-purple-500/20 text-white'
                        : 'border-white/20 bg-white/5 text-white/70 hover:border-purple-500/50 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-2xl">{l.emoji}</span>
                    <div className="text-left">
                      <div className="font-semibold">{l.label}</div>
                      <div className="text-xs text-purple-300">{l.desc}</div>
                    </div>
                    {level === l.id && <span className="ml-auto text-purple-400">✓</span>}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep('goal')}
                  className="flex-1 border border-white/20 text-white/70 font-medium py-3 rounded-xl hover:bg-white/10 transition"
                >
                  ← ย้อนกลับ
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={!level || saving}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-medium py-3 rounded-xl transition"
                >
                  {saving ? 'กำลังบันทึก...' : 'เริ่มเรียนเลย! 🚀'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
