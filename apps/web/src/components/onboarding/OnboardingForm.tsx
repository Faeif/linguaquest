'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Briefcase,
  Coffee,
  Loader2,
  Music,
  Plane,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { submitOnboarding } from '@/app/onboarding/actions'
import {
  HSK_LEVELS,
  LEARNING_GOALS,
  type OnboardingInput,
  OnboardingSchema,
} from '@/lib/schemas/onboarding'

const GOAL_ICONS = {
  exam: BookOpen,
  travel: Plane,
  business: Briefcase,
  media: Music,
  casual: Coffee,
}

const GOAL_LABELS = {
  exam: 'สอบ HSK',
  travel: 'ท่องเที่ยว/สื่อสาร',
  business: 'ธุรกิจ/ทำงาน',
  media: 'ดูซีรีส์/ฟังเพลง',
  casual: 'งานอดิเรก',
}

const TIME_PRESETS = [5, 15, 30, 60]

export function OnboardingForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(OnboardingSchema),
    defaultValues: {
      learningGoal: 'casual',
      hskSelfAssessed: 'HSK 1',
      dailyGoalMinutes: 15,
    },
  })

  const formValues = watch()

  const onNext = () => setStep((s) => Math.min(s + 1, 3))
  const onPrev = () => setStep((s) => Math.max(s - 1, 1))

  async function onSubmit(data: OnboardingInput) {
    if (step < 3) return // Prevent actual submit on enter key if not on last step
    setServerError('')
    const res = await submitOnboarding(data)
    if (!res.success) {
      setServerError(res.error || 'Something went wrong')
      return
    }
    router.push('/companion')
  }

  // Common button styles
  const btnBase =
    'w-full py-3.5 px-4 rounded-xl border text-left transition-all flex items-center gap-4'
  const btnActive = 'border-[#8B5E3C] bg-orange-50/30 text-[#8B5E3C] ring-1 ring-[#8B5E3C]'
  const btnInactive =
    'border-stone-200 bg-white hover:border-stone-300 text-stone-700 hover:bg-stone-50'

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white border border-stone-100 shadow-sm rounded-2xl">
      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-[#8B5E3C]' : 'bg-stone-100'
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <div className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-sm">
            {serverError}
          </div>
        )}

        {/* STEP 1: Goal */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-stone-800 tracking-tight">
                คุณเรียนภาษาจีนไปทำไม?
              </h2>
              <p className="text-sm text-stone-500">เพื่อที่ AI จะได้ปรับเนื้อหาให้ตรงกับสิ่งที่คุณจะได้ใช้จริง</p>
            </div>

            <div className="space-y-3">
              {LEARNING_GOALS.map((goal) => {
                const Icon = GOAL_ICONS[goal]
                const isActive = formValues.learningGoal === goal
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setValue('learningGoal', goal)}
                    className={`${btnBase} ${isActive ? btnActive : btnInactive}`}
                  >
                    <div
                      className={`p-2 rounded-lg ${isActive ? 'bg-[#8B5E3C]/10' : 'bg-stone-100'}`}
                    >
                      <Icon size={18} className={isActive ? 'text-[#8B5E3C]' : 'text-stone-500'} />
                    </div>
                    <span className="font-medium">{GOAL_LABELS[goal]}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Level */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-stone-800 tracking-tight">
                ระดับภาษาของคุณตอนนี้?
              </h2>
              <p className="text-sm text-stone-500">ประเมินเพื่อให้ระบบจัดความยากของคำศัพท์ได้ถูกต้อง</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {HSK_LEVELS.map((level) => {
                const isActive = formValues.hskSelfAssessed === level
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setValue('hskSelfAssessed', level)}
                    className={`p-4 rounded-xl border text-center font-medium transition-all ${
                      isActive
                        ? 'border-[#8B5E3C] bg-orange-50/30 text-[#8B5E3C] ring-1 ring-[#8B5E3C]'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    {level}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Daily Time */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-stone-800 tracking-tight">
                เป้าหมายเวลาเรียนต่อวัน?
              </h2>
              <p className="text-sm text-stone-500">ความสม่ำเสมอสำคัญกว่าความหนัก เลือกเวลาที่คุณทำได้จริง</p>
            </div>

            <div className="pt-4 pb-8 space-y-8">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold tracking-tight text-[#8B5E3C]">
                  {formValues.dailyGoalMinutes}
                </span>
                <span className="text-stone-500 font-medium">นาที/วัน</span>
              </div>

              <input
                type="range"
                min="5"
                max="120"
                step="5"
                {...register('dailyGoalMinutes', { valueAsNumber: true })}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-[#8B5E3C]"
              />

              <div className="flex justify-between gap-2">
                {TIME_PRESETS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setValue('dailyGoalMinutes', m)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                      formValues.dailyGoalMinutes === m
                        ? 'border-[#8B5E3C] bg-[#8B5E3C] text-white'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {m} นาที
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex gap-3 pt-4 border-t border-stone-100">
          {step > 1 && (
            <button
              type="button"
              onClick={onPrev}
              className="px-5 py-2.5 rounded-lg border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors flex items-center justify-center"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={onNext}
              className="flex-1 px-5 py-2.5 rounded-lg bg-[#8B5E3C] hover:bg-[#724C30] text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              ถัดไป <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-5 py-2.5 rounded-lg bg-[#8B5E3C] hover:bg-[#724C30] text-white font-medium disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  กำลังเริ่มการผจญภัย...
                </>
              ) : (
                <>
                  เริ่มเรียนเลย <ArrowRight size={18} />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
