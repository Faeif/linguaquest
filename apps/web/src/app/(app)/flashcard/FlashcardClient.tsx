'use client'

import { useState } from 'react'
import type { SessionCard } from '@/app/api/flashcard/session/route'
import { HskFlashcardSession } from '@/components/flashcard/HskFlashcardSession'
import type { LevelStat } from '@/components/flashcard/LevelSelector'
import { LevelSelector } from '@/components/flashcard/LevelSelector'
import { PosTabView } from '@/components/flashcard/PosTabView'
import { ReviewTabView } from '@/components/flashcard/ReviewTabView'

interface FlashcardClientProps {
  levelStats: LevelStat[]
  posCountsByLevel?: Record<number, Partial<Record<string, number>>>
}

type MainTab = 'hsk' | 'pos' | 'review'
type View = 'selector' | 'session'

interface SessionContext {
  level: number | 'all'
  pos?: string
  isReviewAll?: boolean
}

const POS_THAI: Record<string, string> = {
  动词: 'กริยา',
  名词: 'คำนาม',
  形容词: 'คุณศัพท์',
  副词: 'กริยาวิเศษณ์',
  连词: 'คำเชื่อม',
  量词: 'ลักษณนาม',
  介词: 'บุพบท',
  代词: 'สรรพนาม',
  其他: 'อื่นๆ',
}

export function FlashcardClient({ levelStats, posCountsByLevel }: FlashcardClientProps) {
  const [view, setView] = useState<View>('selector')
  const [mainTab, setMainTab] = useState<MainTab>('hsk')
  const [sessionCards, setSessionCards] = useState<SessionCard[]>([])
  const [sessionCtx, setSessionCtx] = useState<SessionContext | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartSession = async (level: number | 'all', pos?: string, shuffle?: boolean) => {
    setError(null)
    setIsLoading(true)
    try {
      let url: string

      if (level === 'all' && pos) {
        // Mode A: POS across all levels
        url = `/api/flashcard/session?level=all&pos=${encodeURIComponent(pos)}&limit=20&shuffle=true`
      } else if (level === 'all' && !pos) {
        // Mode B: Review all levels
        url = `/api/flashcard/session?review=all&limit=30`
      } else {
        // Default: single level
        const numLevel = level as number
        const shuffleStr = shuffle ? '&shuffle=true' : ''
        const posStr = pos ? `&pos=${encodeURIComponent(pos)}` : ''
        url = `/api/flashcard/session?level=${numLevel}&limit=15${posStr}${shuffleStr}`
      }

      const res = await fetch(url)
      const json = (await res.json()) as {
        data: { cards: SessionCard[] } | null
        error: string | null
      }
      if (json.error || !json.data) {
        setError(json.error ?? 'ไม่สามารถโหลดการ์ดได้')
        return
      }
      if (json.data.cards.length === 0) {
        setError('ไม่มีคำศัพท์ในหมวดนี้')
        return
      }
      setSessionCards(json.data.cards)
      setSessionCtx({
        level,
        pos,
        isReviewAll: level === 'all' && !pos,
      })
      setView('session')
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setIsLoading(false)
    }
  }

  // Legacy wrapper for LevelSelector which uses (level: number, pos?: string)
  const handleSelectLevel = (level: number, pos?: string) => {
    void handleStartSession(level, pos, false)
  }

  const handleStartReview = (level: number | 'all') => {
    void handleStartSession(level, undefined, false)
  }

  const handleComplete = () => {
    setView('selector')
    setSessionCards([])
    setSessionCtx(null)
    setError(null)
  }

  // Build context label for session header
  function buildContextLabel(ctx: SessionContext): string {
    if (ctx.isReviewAll) {
      return 'ทบทวนทั้งหมด'
    }
    if (ctx.level === 'all' && ctx.pos) {
      const thaiLabel = POS_THAI[ctx.pos] ?? ctx.pos
      return `${ctx.pos} · ${thaiLabel} · ทุกระดับ`
    }
    const levelLabel = ctx.level === 7 ? 'HSK 7-9' : `HSK ${ctx.level}`
    if (ctx.pos) {
      const thaiLabel = POS_THAI[ctx.pos] ?? ctx.pos
      return `${levelLabel} · ${ctx.pos} · ${thaiLabel}`
    }
    return levelLabel
  }

  if (view === 'session' && sessionCtx) {
    return (
      <HskFlashcardSession
        initialCards={sessionCards}
        onComplete={handleComplete}
        contextLabel={buildContextLabel(sessionCtx)}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#7D8B6A] rounded-full animate-spin" />
        <p className="text-sm text-[#9A9179]">กำลังโหลด…</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="max-w-2xl mx-auto px-4 py-3 rounded-lg bg-[#FDF6F0] border border-[#E8C8B8] text-sm text-[#B56B6B]">
          {error}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 border-b border-[#E8E0D5] pb-4 max-w-lg mx-auto">
        {(['hsk', 'pos', 'review'] as MainTab[]).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setMainTab(tab)}
            className={[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              mainTab === tab
                ? 'bg-[#3D3630] text-white'
                : 'text-[#7A7067] hover:text-[#3D3630] hover:bg-[#F0EBE3]',
            ].join(' ')}
          >
            {tab === 'hsk' ? 'HSK' : tab === 'pos' ? 'หมวดคำ' : 'ทบทวน'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {mainTab === 'hsk' && (
        <LevelSelector
          levelStats={levelStats}
          onSelectLevel={handleSelectLevel}
          posCountsByLevel={posCountsByLevel}
        />
      )}

      {mainTab === 'pos' && posCountsByLevel && (
        <PosTabView posCountsByLevel={posCountsByLevel} onStartSession={handleStartSession} />
      )}

      {mainTab === 'review' && (
        <ReviewTabView levelStats={levelStats} onStartReview={handleStartReview} />
      )}
    </div>
  )
}
