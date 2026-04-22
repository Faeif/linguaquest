'use client'

/**
 * SentenceOrdering — HSK 3-4
 * Drag-and-drop word tokens to form a correct Chinese sentence.
 * Uses @dnd-kit/sortable.
 */

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { SentenceOrderingExercise } from '@linguaquest/core/writing/types'
import { CheckCircle, RefreshCw, XCircle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

// ─── Sortable Token ────────────────────────────────────────────────────────────

interface SortableTokenProps {
  id: string
  token: string
  disabled: boolean
}

function SortableToken({ id, token, disabled }: SortableTokenProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const mergedStyle = { fontFamily: 'serif', ...style }

  return (
    <div
      ref={setNodeRef}
      style={mergedStyle}
      {...attributes}
      {...listeners}
      className={[
        'px-3 py-2 rounded-lg border text-sm font-medium select-none',
        'transition-colors duration-150',
        disabled
          ? 'cursor-default'
          : 'cursor-grab active:cursor-grabbing hover:border-[#C4704B]/50',
        isDragging
          ? 'opacity-50 bg-[#FFF3ED] border-[#C4704B]/60 shadow-sm z-10'
          : 'bg-[#FFFEFB] border-[#E8E0D5] text-[#2C2824]',
      ].join(' ')}
    >
      {token}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface SentenceOrderingProps {
  exercise: SentenceOrderingExercise
  onComplete: (correct: boolean, answer: string) => void
}

type CheckState = 'idle' | 'correct' | 'wrong'

export function SentenceOrdering({ exercise, onComplete }: SentenceOrderingProps) {
  // Unique IDs per token to allow duplicate words
  const initialItems = useMemo(
    () => exercise.tokens.map((t, i) => ({ id: `token-${i}-${t}`, token: t })),
    [exercise.tokens]
  )

  const [items, setItems] = useState(initialItems)
  const [checkState, setCheckState] = useState<CheckState>('idle')
  const [showAnswer, setShowAnswer] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (checkState !== 'idle') return
      const { active, over } = event
      if (over && active.id !== over.id) {
        setItems((prev) => {
          const oldIndex = prev.findIndex((i) => i.id === active.id)
          const newIndex = prev.findIndex((i) => i.id === over.id)
          return arrayMove(prev, oldIndex, newIndex)
        })
      }
    },
    [checkState]
  )

  const currentSentence = items.map((i) => i.token).join('')

  const handleCheck = () => {
    const correct = currentSentence === exercise.targetSentence
    setCheckState(correct ? 'correct' : 'wrong')
    if (correct) {
      setTimeout(() => onComplete(true, currentSentence), 1200)
    }
  }

  const handleReset = () => {
    setItems(initialItems)
    setCheckState('idle')
    setShowAnswer(false)
  }

  const handleSkip = () => {
    setShowAnswer(true)
    setCheckState('wrong')
    setTimeout(() => onComplete(false, currentSentence), 2500)
  }

  // Keyboard shortcut: Enter to check
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && checkState === 'idle') handleCheck()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const isDone = checkState !== 'idle'

  return (
    <div className="flex flex-col gap-5">
      {/* Instruction */}
      <div className="text-sm text-[#7A7067]">
        เรียงคำต่อไปนี้ให้เป็นประโยคที่ถูกต้อง
        {exercise.hint && (
          <span className="ml-2 text-[#C4704B] font-medium">คำใบ้: {exercise.hint}</span>
        )}
      </div>

      {/* Drop zone — assembled sentence preview */}
      <div
        className={[
          'min-h-[52px] px-4 py-3 rounded-xl border-2 border-dashed transition-colors',
          checkState === 'correct'
            ? 'border-[#6B7F5E]/50 bg-[#F5F9F3]'
            : checkState === 'wrong'
              ? 'border-[#B56B6B]/50 bg-[#FDF5F5]'
              : 'border-[#E8E0D5] bg-[#FAF7F2]',
        ].join(' ')}
      >
        <p
          className="text-xl text-[#2C2824] tracking-wide leading-relaxed"
          style={{ fontFamily: 'serif' }}
        >
          {currentSentence || <span className="text-[#B5AFA8] text-sm">ลากคำมาวางที่นี่…</span>}
        </p>
      </div>

      {/* Drag tokens */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <SortableToken key={item.id} id={item.id} token={item.token} disabled={isDone} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Result banner */}
      {checkState === 'correct' && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#F5F9F3] border border-[#6B7F5E]/30">
          <CheckCircle size={16} className="text-[#6B7F5E] shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#6B7F5E]">ถูกต้อง!</p>
            <p className="text-xs text-[#7A7067] mt-0.5">{exercise.targetThai}</p>
          </div>
        </div>
      )}

      {checkState === 'wrong' && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-[#FDF5F5] border border-[#B56B6B]/30">
          <XCircle size={16} className="text-[#B56B6B] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#B56B6B]">ยังไม่ถูก</p>
            {showAnswer && (
              <div className="mt-1.5 space-y-1">
                <p className="text-sm text-[#2C2824]" style={{ fontFamily: 'serif' }}>
                  {exercise.targetSentence}
                </p>
                <p className="text-xs text-[#9A9179]">{exercise.targetPinyin}</p>
                <p className="text-xs text-[#7A7067]">{exercise.targetThai}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {checkState === 'idle' && (
          <>
            <button
              type="button"
              onClick={handleCheck}
              className="flex-1 py-2.5 bg-[#C4704B] hover:bg-[#A85A3A] text-white text-sm font-semibold rounded-xl transition-colors"
            >
              ตรวจ
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2.5 border border-[#E8E0D5] text-[#7A7067] hover:text-[#3D3630] hover:bg-[#F0EBE3] text-sm rounded-xl transition-colors"
            >
              <RefreshCw size={14} />
              รีเซต
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="px-3 py-2.5 text-[#9A9179] hover:text-[#3D3630] text-sm rounded-xl transition-colors"
            >
              ข้าม
            </button>
          </>
        )}

        {checkState === 'wrong' && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-[#E8E0D5] text-[#7A7067] hover:text-[#3D3630] hover:bg-[#F0EBE3] text-sm rounded-xl transition-colors"
          >
            <RefreshCw size={14} />
            ลองใหม่
          </button>
        )}
      </div>
    </div>
  )
}
