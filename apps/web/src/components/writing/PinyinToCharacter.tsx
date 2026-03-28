'use client'

/**
 * PinyinToCharacter — HSK 3
 * Show pinyin + meaning → user types the Chinese character(s).
 * Shows stroke order after answering.
 */

import type { PinyinToCharExercise } from '@linguaquest/core/writing/types'
import { CheckCircle, XCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { StrokeOrderViewer } from './StrokeOrderViewer'

interface PinyinToCharacterProps {
  exercise: PinyinToCharExercise
  onComplete: (correct: boolean, answer: string) => void
}

type CheckState = 'idle' | 'correct' | 'wrong'

export function PinyinToCharacter({ exercise, onComplete }: PinyinToCharacterProps) {
  const [input, setInput] = useState('')
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleCheck = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    const correct = trimmed === exercise.answer
    setCheckState(correct ? 'correct' : 'wrong')
    setTimeout(() => onComplete(correct, trimmed), correct ? 1500 : 3000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && checkState === 'idle') {
      handleCheck()
    }
  }

  const isDone = checkState !== 'idle'

  return (
    <div className="flex flex-col gap-5">
      {/* Instruction */}
      <p className="text-sm text-[#7A7067]">พินอินต่อไปนี้คือตัวอักษรจีนอะไร? พิมพ์คำตอบ</p>

      {/* Pinyin + meaning card */}
      <div className="p-6 bg-[#FFFEFB] border border-[#E8E0D5] rounded-2xl text-center space-y-2">
        <p className="text-3xl font-semibold text-[#C4704B] tracking-widest">{exercise.pinyin}</p>
        <p className="text-sm text-[#7A7067]">{exercise.meaning}</p>
      </div>

      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDone}
          placeholder="พิมพ์ตัวอักษรจีน…"
          className={[
            'w-full px-4 py-3 text-center text-2xl rounded-xl border-2 outline-none transition-all duration-200',
            'placeholder:text-[#B5AFA8] placeholder:text-sm placeholder:tracking-normal',
            isDone ? 'bg-[#FAF7F2] cursor-default' : 'bg-[#FFFEFB]',
            checkState === 'correct'
              ? 'border-[#6B7F5E] text-[#6B7F5E]'
              : checkState === 'wrong'
                ? 'border-[#B56B6B] text-[#B56B6B]'
                : 'border-[#E8E0D5] text-[#2C2824] focus:border-[#C4704B]/60 focus:shadow-[0_0_0_3px_rgba(196,112,75,0.08)]',
          ].join(' ')}
          style={{ fontFamily: 'serif' }}
        />
      </div>

      {/* Result feedback */}
      {checkState === 'correct' && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#F5F9F3] border border-[#6B7F5E]/30">
          <CheckCircle size={16} className="text-[#6B7F5E] shrink-0" />
          <p className="text-sm font-semibold text-[#6B7F5E]">ถูกต้อง! 🎉</p>
        </div>
      )}

      {checkState === 'wrong' && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-[#FDF5F5] border border-[#B56B6B]/30">
          <XCircle size={16} className="text-[#B56B6B] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#B56B6B]">คำตอบที่ถูกต้อง:</p>
            <p className="text-xl mt-1 text-[#2C2824]" style={{ fontFamily: 'serif' }}>
              {exercise.answer}
            </p>
          </div>
        </div>
      )}

      {/* Stroke order — shown after answering */}
      {isDone && (
        <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8E0D5]">
          <StrokeOrderViewer
            characters={exercise.characters}
            size={96}
            autoPlay={true}
            quizMode={false}
          />
        </div>
      )}

      {/* Check button */}
      {checkState === 'idle' && (
        <button
          type="button"
          onClick={handleCheck}
          disabled={!input.trim()}
          className="w-full py-2.5 bg-[#C4704B] hover:bg-[#A85A3A] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
        >
          ตรวจคำตอบ
        </button>
      )}
    </div>
  )
}
