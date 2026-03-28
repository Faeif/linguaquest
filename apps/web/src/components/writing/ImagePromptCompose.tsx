'use client'

/**
 * ImagePromptCompose — HSK 4
 * Show an image + required vocabulary words.
 * User writes a sentence using those words (AI graded).
 */

import type { GradeResult, ImageComposeExercise } from '@linguaquest/core/writing/types'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface ImagePromptComposeProps {
  exercise: ImageComposeExercise
  onComplete: (correct: boolean, answer: string) => void
}

type SubmitState = 'idle' | 'grading' | 'done'

export function ImagePromptCompose({ exercise, onComplete }: ImagePromptComposeProps) {
  const [text, setText] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null)

  const charCount = text.length
  const hasEnough = charCount >= exercise.minChars

  const handleSubmit = async () => {
    if (!hasEnough || submitState !== 'idle') return
    setSubmitState('grading')

    try {
      const res = await fetch('/api/writing/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exerciseType: 'image_compose',
          hskLevel: exercise.hskLevel,
          requiredWords: exercise.requiredWords,
          userAnswer: text,
        }),
      })
      const json = (await res.json()) as { data: GradeResult | null; error: string | null }
      if (json.data) {
        setGradeResult(json.data)
        setSubmitState('done')
        setTimeout(() => onComplete(json.data?.passed ?? false, text), 3000)
      } else {
        setSubmitState('idle')
      }
    } catch {
      setSubmitState('idle')
    }
  }

  const usedWords = exercise.requiredWords.filter((w) => text.includes(w))
  const missingWords = exercise.requiredWords.filter((w) => !text.includes(w))

  return (
    <div className="flex flex-col gap-5">
      {/* Instruction */}
      <p className="text-sm text-[#7A7067]">
        ดูรูปภาพและแต่งประโยคโดยใช้คำศัพท์ที่กำหนด (อย่างน้อย {exercise.minChars} ตัวอักษร)
      </p>

      {/* Image */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-[#E8E0D5] bg-[#F0EBE3]">
        <Image
          src={exercise.imageUrl}
          alt="Exercise image"
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 640px"
        />
      </div>

      {/* Required vocabulary */}
      <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8E0D5]">
        <p className="text-xs font-medium text-[#7A7067] mb-3 uppercase tracking-wider">
          คำศัพท์ที่ต้องใช้
        </p>
        <div className="flex flex-wrap gap-2">
          {exercise.requiredWords.map((word, idx) => {
            const isUsed = text.includes(word)
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: static word list
                key={idx}
                className={[
                  'flex flex-col items-center px-3 py-2 rounded-lg border transition-colors',
                  isUsed
                    ? 'bg-[#F5F9F3] border-[#6B7F5E]/40 text-[#6B7F5E]'
                    : 'bg-[#FFFEFB] border-[#E8E0D5] text-[#2C2824]',
                ].join(' ')}
              >
                <span className="text-lg font-medium" style={{ fontFamily: 'serif' }}>
                  {word}
                </span>
                <span className="text-xs text-[#9A9179]">{exercise.wordPinyin[idx]}</span>
                <span className="text-xs text-[#7A7067]">{exercise.wordThai[idx]}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Text area */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={submitState === 'grading' || submitState === 'done'}
          rows={4}
          placeholder="แต่งประโยคโดยใช้คำศัพท์ข้างต้น…"
          className={[
            'w-full px-4 py-3 rounded-xl border-2 text-base text-[#2C2824] outline-none resize-none transition-all duration-200',
            'placeholder:text-[#B5AFA8] placeholder:text-sm',
            submitState === 'done'
              ? 'bg-[#FAF7F2] cursor-default border-[#E8E0D5]'
              : 'bg-[#FFFEFB] focus:border-[#C4704B]/60 focus:shadow-[0_0_0_3px_rgba(196,112,75,0.08)] border-[#E8E0D5]',
          ].join(' ')}
          style={{ fontFamily: 'serif' }}
        />
        {/* Char count */}
        <span
          className={[
            'absolute bottom-3 right-3 text-xs tabular-nums',
            hasEnough ? 'text-[#6B7F5E]' : 'text-[#9A9179]',
          ].join(' ')}
        >
          {charCount} / {exercise.minChars}
        </span>
      </div>

      {/* Missing words warning */}
      {submitState === 'idle' && missingWords.length > 0 && text.length > 0 && (
        <p className="text-xs text-[#C4704B]">ยังไม่ได้ใช้: {missingWords.join('、')}</p>
      )}

      {/* Grade result */}
      {submitState === 'done' && gradeResult && (
        <div
          className={[
            'p-4 rounded-xl border space-y-2',
            gradeResult.passed
              ? 'bg-[#F5F9F3] border-[#6B7F5E]/30'
              : 'bg-[#FDF5F5] border-[#B56B6B]/30',
          ].join(' ')}
        >
          <div className="flex items-center gap-2">
            {gradeResult.passed ? (
              <CheckCircle size={16} className="text-[#6B7F5E] shrink-0" />
            ) : (
              <XCircle size={16} className="text-[#B56B6B] shrink-0" />
            )}
            <span
              className={[
                'text-sm font-semibold',
                gradeResult.passed ? 'text-[#6B7F5E]' : 'text-[#B56B6B]',
              ].join(' ')}
            >
              คะแนน {gradeResult.score}/100
            </span>
          </div>
          <p className="text-sm text-[#3D3630]">{gradeResult.feedback}</p>
          {gradeResult.corrections && (
            <p
              className="text-sm text-[#2C2824] border-t border-[#E8E0D5] pt-2 mt-2"
              style={{ fontFamily: 'serif' }}
            >
              {gradeResult.corrections}
            </p>
          )}
        </div>
      )}

      {/* Submit */}
      {submitState !== 'done' && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!hasEnough || submitState === 'grading' || missingWords.length > 0}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#C4704B] hover:bg-[#A85A3A] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
        >
          {submitState === 'grading' ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              กำลังตรวจ…
            </>
          ) : (
            'ส่งคำตอบ'
          )}
        </button>
      )}

      {/* Used word badges */}
      {usedWords.length > 0 && submitState === 'idle' && (
        <p className="text-xs text-[#6B7F5E]">ใช้แล้ว: {usedWords.join('、')}</p>
      )}
    </div>
  )
}
