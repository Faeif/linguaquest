'use client'

import { useChat } from 'ai/react'
import { Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface CompanionProfile {
  displayName: string
  hskLevel: string
  learningGoal: string
}

export default function CompanionPage() {
  const [profile, setProfile] = useState<CompanionProfile | null>(null)
  const [turnNumber, setTurnNumber] = useState(1)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/companion/chat',
    body: { turnNumber },
    onFinish: () => setTurnNumber((n) => n + 1),
  })

  useEffect(() => {
    fetch('/api/companion/profile')
      .then((r) => r.json())
      .then(({ data }) => data && setProfile(data))
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto">
      <div className="px-4 py-4 border-b border-[#E8E0D5]">
        <p className="text-xs text-[#9A9179] uppercase tracking-widest">AI Companion</p>
        <h1 className="text-lg font-semibold text-[#3D3630]">林老师</h1>
        {profile && (
          <p className="text-sm text-[#7A7067]">
            {profile.hskLevel} · {profile.learningGoal}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#7A7067] text-sm">สวัสดีครับ — เริ่มสนทนาได้เลย</p>
            <p className="text-[#9A9179] text-xs mt-1">林老师 พร้อมฝึกภาษาจีนกับคุณ</p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-[#C4704B] text-white rounded-br-sm'
                  : 'bg-[#FFFEFB] border border-[#E8E0D5] text-[#3D3630] rounded-bl-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="px-4 py-2.5 rounded-xl rounded-bl-sm bg-[#FFFEFB] border border-[#E8E0D5]">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7A7067] animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#7A7067] animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#7A7067] animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 border-t border-[#E8E0D5] flex gap-2 items-end"
      >
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="พิมพ์ภาษาจีนหรือไทย..."
          rows={1}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e as unknown as React.FormEvent)
            }
          }}
          className="flex-1 resize-none rounded-lg border border-[#E8E0D5] bg-[#FFFEFB] px-3 py-2 text-sm text-[#3D3630] placeholder:text-[#9A9179] focus:outline-none focus:ring-1 focus:ring-[#C4704B] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2 rounded-lg bg-[#C4704B] text-white hover:bg-[#A85A3A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
