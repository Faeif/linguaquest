'use client'

import { useState } from 'react'
import { getDueCardsAction, getNewCardsForCategoryAction } from '@/app/actions/flashcard'
import { CategorySelector } from '@/components/flashcard/CategorySelector'
import { type ExtendedFlashcard, FlashcardSession } from '@/components/flashcard/FlashcardSession'

interface Category {
  id: string
  name: string
  description: string
  cardCount: number
}

interface FlashcardClientAppProps {
  categories: Category[]
  dueCardsCount: number
}

type View = 'selector' | 'session'

export function FlashcardClientApp({ categories, dueCardsCount }: FlashcardClientAppProps) {
  const [view, setView] = useState<View>('selector')
  const [activeCards, setActiveCards] = useState<ExtendedFlashcard[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // When a category has no due cards, hold it here so user can choose to learn new words
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null)

  const launchSession = (cards: ExtendedFlashcard[]) => {
    setActiveCards(cards)
    setView('session')
    setError(null)
    setPendingCategoryId(null)
  }

  const startDueSession = async (categoryId?: string) => {
    setError(null)
    setPendingCategoryId(null)
    setIsLoading(true)
    try {
      // 1. Try to get due cards
      console.log('Fetching due cards for category:', categoryId)
      let cards = await getDueCardsAction(categoryId, 20)
      console.log('Due cards found:', cards?.length || 0)

      // 2. If no due cards and we have a category, look for new cards to learn
      if ((!cards || cards.length === 0) && categoryId) {
        console.log('No due cards. Checking for new words to learn...')
        if (
          confirm(
            'No due cards for this topic. Would you like to learn new words from this category?'
          )
        ) {
          const { getNewCardsForCategoryAction } = await import('@/app/actions/flashcard')
          cards = await getNewCardsForCategoryAction(categoryId, 10)
          console.log('New cards enrolled:', cards?.length || 0)
        }
      }

      // 3. Launch session if cards are found, otherwise show error
      if (cards && cards.length > 0) {
        launchSession(cards as unknown as ExtendedFlashcard[])
      } else {
        setError('No cards available for this session. Come back later or choose a different deck.')
      }
    } catch (err: unknown) {
      console.error('Session start error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load cards. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const startNewWordsSession = async (categoryId: string) => {
    setError(null)
    setPendingCategoryId(null)
    setIsLoading(true)
    try {
      const cards = await getNewCardsForCategoryAction(categoryId, 10)
      if (cards && cards.length > 0) {
        launchSession(cards as unknown as ExtendedFlashcard[])
      } else {
        setError('No new words available in this deck yet.')
      }
    } catch {
      setError('Failed to load new words. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = () => {
    setView('selector')
    setActiveCards([])
    setError(null)
    setPendingCategoryId(null)
  }

  if (view === 'session') {
    return <FlashcardSession initialCards={activeCards} onComplete={handleComplete} />
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="w-5 h-5 border-2 border-[#E8E0D5] border-t-[#7D8B6A] rounded-full animate-spin" />
        <p className="text-sm text-[#9A9179]">Loading deck…</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-3">
      {/* Inline error */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 py-3 rounded-lg bg-[#FDF6F0] border border-[#E8C8B8] text-sm text-[#B56B6B]">
          {error}
        </div>
      )}

      {/* Inline prompt: no due cards — offer to learn new words */}
      {pendingCategoryId && (
        <div className="max-w-2xl mx-auto px-4 py-4 rounded-xl bg-[#FFFEFB] border border-[#E8E0D5] flex items-center justify-between gap-4">
          <p className="text-sm text-[#7A7067]">No cards due in this deck. Learn new words?</p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setPendingCategoryId(null)}
              className="text-sm text-[#9A9179] hover:text-[#3D3630] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => startNewWordsSession(pendingCategoryId)}
              className="px-4 py-1.5 bg-[#C4704B] hover:bg-[#A85A3A] text-white text-sm font-medium rounded-lg transition-colors"
            >
              Learn new words
            </button>
          </div>
        </div>
      )}

      <CategorySelector
        categories={categories}
        dueCardsCount={dueCardsCount}
        onSelect={(categoryId) => startDueSession(categoryId)}
        onStartDueSession={() => startDueSession()}
      />
    </div>
  )
}
