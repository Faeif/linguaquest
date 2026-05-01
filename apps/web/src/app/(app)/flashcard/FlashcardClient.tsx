'use client'

import { useState } from 'react'
import type { SessionCard } from '@/app/api/flashcard/session/route'
import { HskFlashcardSession } from '@/components/flashcard/HskFlashcardSession'
import type { LevelStat } from '@/features/flashcard/types'
import { PosTabView } from '@/features/flashcard/components/PosTabView'
import { ReviewTabView } from '@/features/flashcard/components/ReviewTabView'
import { buildSessionContextLabel, SESSION_TABS } from '@/features/flashcard/constants'
import { LevelSelector } from '@/components/flashcard/LevelSelector'

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
    return buildSessionContextLabel(ctx.level, ctx.pos, ctx.isReviewAll)
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
        <div className="w-5 h-5 border-2 border-border border-t-accent-secondary rounded-full animate-spin" />
        <p className="text-sm text-text-hint">{SESSION_TABS.review.th}</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="max-w-2xl mx-auto px-4 py-3 rounded-lg bg-error-subtle border border-error/20 text-sm text-error">
          {error}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 border-b border-border pb-4 max-w-lg mx-auto">
        {(['hsk', 'pos', 'review'] as MainTab[]).map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => setMainTab(tab)}
            className={[
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              mainTab === tab
                ? 'bg-foreground text-text-inverse'
                : 'text-text-secondary hover:text-text-primary hover:bg-accent-muted',
            ].join(' ')}
          >
            {tab === 'hsk' ? 'HSK' : tab === 'pos' ? SESSION_TABS.pos.th : SESSION_TABS.review.th}
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
