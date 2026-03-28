'use client'

import { Bookmark, BookOpen, MessageCircle, RotateCcw, Volume2 } from 'lucide-react'
import { useState } from 'react'
import type { CompanionId, SentenceSummaryItem, VocabTag } from '../types'
import { speakText } from './ChatInterface'

interface SessionCompleteCardProps {
  sentenceSummary: SentenceSummaryItem[]
  vocabSummary: VocabTag[]
  companionId: CompanionId
  onNewTopic: () => void
  onRepeat: () => void
  onRealTalk: () => void
}

export default function SessionCompleteCard({
  sentenceSummary,
  vocabSummary,
  companionId,
  onNewTopic,
  onRepeat,
  onRealTalk,
}: SessionCompleteCardProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)

  const handlePlay = async (text: string, index: number) => {
    setPlayingIndex(index)
    await speakText(text, companionId)
    setPlayingIndex(null)
  }

  return (
    <div className="w-full rounded-3xl border-2 border-accent/30 bg-gradient-to-b from-accent/5 to-background overflow-hidden shadow-lg my-4">
      {/* Header */}
      <div className="bg-accent/10 px-5 py-4 flex items-center gap-3 border-b border-accent/20">
        <span className="text-2xl">🎉</span>
        <div>
          <h3 className="font-black text-foreground text-base">จบบทเรียนแล้ว!</h3>
          <p className="text-xs text-text-secondary">เก่งมากเลย คุณผ่านทุกภารกิจในวันนี้</p>
        </div>
      </div>

      {/* Sentence Summary */}
      {sentenceSummary.length > 0 && (
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-1.5 mb-3">
            <BookOpen className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-black uppercase text-accent tracking-wider">
              ประโยคที่ฝึกวันนี้
            </span>
          </div>
          <div className="space-y-3">
            {sentenceSummary.map((item, i) => (
              <div key={`${item.chinese}-${i}`} className="bg-surface rounded-2xl p-3 border border-border">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xl font-bold chinese text-foreground leading-snug">
                      {item.chinese}
                    </p>
                    <p className="text-xs italic text-text-secondary mt-0.5">{item.pinyin}</p>
                    <p className="text-sm text-text-secondary mt-1">{item.thai}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePlay(item.chinese, i)}
                    className={`p-2 rounded-full transition-all shrink-0 ${
                      playingIndex === i
                        ? 'bg-accent text-white animate-pulse'
                        : 'bg-border text-text-secondary hover:bg-accent/10 hover:text-accent'
                    }`}
                    title="ฟังเสียงอีกครั้ง"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vocab Summary */}
      {vocabSummary && vocabSummary.length > 0 && (
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-1.5 mb-3">
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-black uppercase text-amber-600 tracking-wider">
              คำศัพท์สำคัญ
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {vocabSummary.map((v, i) => (
              <div key={`${v.word}-${i}`} className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
                <span className="font-bold text-amber-900 text-sm chinese">{v.word}</span>
                <span className="text-amber-600 text-xs ml-1">({v.pinyin})</span>
                <span className="text-amber-700 text-xs ml-1">= {v.meaning_th}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-5 py-4">
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-3">
          ต่อไปคุณอยากทำอะไร?
        </p>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={onNewTopic}
            className="flex items-center gap-3 px-4 py-3 bg-accent text-white font-bold rounded-2xl text-sm hover:bg-accent/90 active:scale-[0.98] transition-all"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <div>📚 เรียนหัวข้อใหม่</div>
              <div className="text-xs font-normal opacity-80">กลับ Lobby เลือก Topic ใหม่</div>
            </div>
          </button>

          <button
            type="button"
            onClick={onRepeat}
            className="flex items-center gap-3 px-4 py-3 bg-surface border-2 border-border text-foreground font-bold rounded-2xl text-sm hover:border-accent hover:text-accent active:scale-[0.98] transition-all"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <div>🔄 เรียนซ้ำ เพิ่มความคล่อง</div>
              <div className="text-xs font-normal text-text-secondary">ฝึก Topic เดิมให้คล่องขึ้น</div>
            </div>
          </button>

          <button
            type="button"
            onClick={onRealTalk}
            className="flex items-center gap-3 px-4 py-3 bg-surface border-2 border-emerald-300 text-emerald-700 font-bold rounded-2xl text-sm hover:bg-emerald-50 active:scale-[0.98] transition-all"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <div className="text-left">
              <div>🗣️ ลุย RealTalk Mode</div>
              <div className="text-xs font-normal text-emerald-600">สนทนาอิสระ ไม่มีสคริปต์</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
