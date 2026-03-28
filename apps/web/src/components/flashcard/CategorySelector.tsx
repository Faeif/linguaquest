'use client'

import { ChevronRight, Layers } from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string
  cardCount: number
}

interface CategorySelectorProps {
  categories: Category[]
  dueCardsCount: number
  onSelect: (categoryId: string) => void
  onStartDueSession: () => void
}

export function CategorySelector({
  categories,
  dueCardsCount,
  onSelect,
  onStartDueSession,
}: CategorySelectorProps) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-semibold text-[#3D3630] tracking-tight">Vocabulary</h1>
        <p className="mt-1 text-sm text-[#7A7067]">Choose what to study</p>
      </div>

      {/* ── Daily Review ─────────────────────────── */}
      <section>
        <button
          type="button"
          onClick={onStartDueSession}
          disabled={dueCardsCount === 0}
          className={[
            'w-full flex items-center gap-4 p-5 rounded-xl border text-left',
            'transition-colors duration-150',
            dueCardsCount > 0
              ? 'bg-[#FFFEFB] border-[#E8E0D5] hover:border-[#C4704B]/40 hover:bg-[#FDF6F0] cursor-pointer'
              : 'bg-[#FAF7F2] border-[#E8E0D5] opacity-50 cursor-not-allowed',
          ].join(' ')}
        >
          <div className="w-10 h-10 rounded-lg bg-[#7D8B6A]/15 flex items-center justify-center shrink-0">
            <Layers size={20} className="text-[#7D8B6A]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#3D3630]">Daily Review</span>
              {dueCardsCount > 0 && (
                <span className="px-2 py-0.5 bg-[#C4704B] text-white text-[10px] font-bold rounded-full">
                  {dueCardsCount}
                </span>
              )}
            </div>
            <p className="text-xs text-[#7A7067] mt-0.5">
              {dueCardsCount > 0
                ? `${dueCardsCount} card${dueCardsCount === 1 ? '' : 's'} ready for review`
                : 'All caught up for today'}
            </p>
          </div>

          {dueCardsCount > 0 && <ChevronRight size={16} className="text-[#9A9179] shrink-0" />}
        </button>
      </section>

      {/* ── Vocabulary Decks ─────────────────────── */}
      {categories.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-[#9A9179] uppercase tracking-wider px-1">
            Vocabulary Decks
          </h2>

          <div className="divide-y divide-[#E8E0D5] rounded-xl border border-[#E8E0D5] bg-[#FFFEFB] overflow-hidden">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat.id}
                onClick={() => onSelect(cat.id)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#FAF7F2] transition-colors duration-100 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#3D3630] group-hover:text-[#C4704B] transition-colors">
                    {cat.name}
                  </p>
                  {cat.description && (
                    <p className="text-xs text-[#9A9179] mt-0.5 truncate">{cat.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {cat.cardCount > 0 && (
                    <span className="text-xs text-[#9A9179]">{cat.cardCount} words</span>
                  )}
                  <ChevronRight size={15} className="text-[#C8C0B8]" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Empty state — no categories loaded */}
      {categories.length === 0 && dueCardsCount === 0 && (
        <div className="text-center py-12 text-[#9A9179]">
          <p className="text-sm">No decks available yet.</p>
          <p className="text-xs mt-1">Add words from the AI Card Generator to get started.</p>
        </div>
      )}
    </div>
  )
}
