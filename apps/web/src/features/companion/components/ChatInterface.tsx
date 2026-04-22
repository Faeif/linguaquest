'use client'

import { GraduationCap, Send, Settings2, Sparkles, Volume2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { useCompanionChat } from '../hooks/useCompanionChat'
import type { CompanionResponseBlock, LearningDNA, SessionConfig } from '../types'
import MegaMicButton from './MegaMicButton'
import PracticeCard from './PracticeCard'
import SessionCompleteCard from './SessionCompleteCard'

// Predefined topic suggestions for the Lobby
const TOPIC_SUGGESTIONS = [
  { emoji: '☕', label: 'Order Coffee', value: 'สั่งกาแฟในร้าน' },
  { emoji: '✈️', label: 'Airport / Immigration', value: 'ผ่านตรวจคนเข้าเมืองที่สนามบิน' },
  { emoji: '💼', label: 'Job Interview', value: 'สัมภาษณ์งานภาษาจีน' },
  { emoji: '🛍️', label: 'Shopping', value: 'ต่อรองราคาในตลาด' },
  { emoji: '🏨', label: 'Check in Hotel', value: 'เช็คอินที่โรงแรม' },
  { emoji: '🍜', label: 'Order Food', value: 'สั่งอาหารตามร้านบะหมี่' },
]

// Global audio reference to prevent overlapping and bypass Safari Autoplay
let globalAudio: HTMLAudioElement | null = null

export function unlockAudio() {
  if (typeof window !== 'undefined') {
    if (!globalAudio) {
      globalAudio = new Audio()
    }
    // Attempt play to unlock context during a user interaction
    globalAudio.play().catch(() => {})
  }
}

// Play AI speech via Azure TTS and return a Promise that resolves when finished
export async function speakText(
  text: string,
  companionId: string,
  customVoice?: string
): Promise<void> {
  if (!globalAudio) {
    globalAudio = new Audio()
  } else {
    globalAudio.pause()
    globalAudio.currentTime = 0
  }

  try {
    const voice =
      customVoice ||
      (companionId === 'backpacker_male' ? 'zh-CN-YunxiNeural' : 'zh-CN-XiaoxiaoNeural')
    const res = await fetch('/api/speech/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    })
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)

    const audio = globalAudio
    if (!audio) return

    return new Promise((resolve) => {
      audio.src = url

      const finish = () => {
        // Do NOT revoke immediately to prevent WebKitBlobResource error on Safari
        setTimeout(() => URL.revokeObjectURL(url), 5000)
        resolve()
      }

      audio.onended = finish
      audio.onerror = finish
      audio.play().catch((err) => {
        console.warn('TTS Autoplay prevented:', err)
        finish()
      })
    })
  } catch (err) {
    console.error('TTS error:', err)
  }
}

export default function ChatInterface({
  sessionConfig: initialSessionConfig,
  learningDNA,
}: {
  sessionConfig: SessionConfig
  learningDNA: LearningDNA
}) {
  const [activeConfig, setActiveConfig] = useState<SessionConfig>(initialSessionConfig)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [lobbyVisible, setLobbyVisible] = useState(true)
  const [draftConfig, setDraftConfig] = useState<SessionConfig>(initialSessionConfig)
  // pendingTopic: set this to auto-kickoff AI once append is ready after a topic pick
  const [pendingTopic, setPendingTopic] = useState<{ topic: string; mode: string } | null>(null)
  const spokenMessages = useRef<Set<string>>(new Set())
  const currentTtsPromise = useRef<Promise<void> | null>(null)

  const handleSpeechReady = useCallback((text: string, companionId: string) => {
    currentTtsPromise.current = speakText(text, companionId)
  }, [])

  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    bottomRef,
    parseAiMessage,
    sendVoiceText,
    sendMessage,
    isLoading,
  } = useCompanionChat(activeConfig, learningDNA, handleSpeechReady)
  const { isRecording, isProcessing, startRecording, stopRecording } = useAudioRecorder()

  // ✅ KEY FIX: useEffect watches for pendingTopic, fires sendMessage only after React commits
  useEffect(() => {
    if (pendingTopic) {
      const kickoffText = `[START SESSION: Topic="${pendingTopic.topic}", Mode="${pendingTopic.mode}". Please greet me warmly in Chinese and start the scenario. Speak first and give me my TARGET_SENTENCE to practice.]`
      sendMessage(kickoffText)
      setPendingTopic(null)
    }
  }, [pendingTopic, sendMessage])

  const handleMicStop = async () => {
    const text = await stopRecording()
    if (text && text.trim().length > 0) {
      sendVoiceText(text)
    }
  }

  const startTopic = useCallback(
    (topicValue: string) => {
      unlockAudio()
      const newConfig = { ...activeConfig, topic: topicValue }
      setActiveConfig(newConfig)
      setMessages([])
      setLobbyVisible(false)
      spokenMessages.current.clear()
      // Queue the kickoff — will fire in useEffect once append is available
      setPendingTopic({ topic: topicValue, mode: newConfig.mode })
    },
    [activeConfig, setMessages]
  )

  const applySettings = useCallback(() => {
    unlockAudio()
    const isMajorChange =
      draftConfig.topic !== activeConfig.topic ||
      draftConfig.companion_id !== activeConfig.companion_id

    setActiveConfig(draftConfig)
    setIsSettingsOpen(false)

    if (isMajorChange) {
      setMessages([])
      setLobbyVisible(false)
      spokenMessages.current.clear()
      setPendingTopic({ topic: draftConfig.topic, mode: draftConfig.mode })
    } else if (draftConfig.mode !== activeConfig.mode && messages.length > 0) {
      // Mode-only switch — inform AI via a system-style user message
      sendMessage(
        `[SYSTEM INJECT: Mode switched to "${draftConfig.mode}". Adjust coaching style immediately.]`
      )
    }
  }, [draftConfig, activeConfig, setMessages, messages.length, sendMessage])

  const toggleMode = useCallback(() => {
    unlockAudio()
    const newMode = (
      activeConfig.mode === 'learner' ? 'real_talk' : 'learner'
    ) as SessionConfig['mode']
    const newConfig: SessionConfig = { ...activeConfig, mode: newMode }
    setActiveConfig(newConfig)
    setDraftConfig(newConfig)
    if (messages.length > 0) {
      sendMessage(
        `[SYSTEM INJECT: Mode switched to "${newMode}". Adjust coaching style immediately.]`
      )
    }
  }, [activeConfig, messages.length, sendMessage])

  const handleRealTalk = useCallback(() => {
    unlockAudio()
    const newConfig: SessionConfig = { ...activeConfig, mode: 'real_talk' }
    setActiveConfig(newConfig)
    setDraftConfig(newConfig)
    sendMessage(
      '[SYSTEM INJECT: Session complete. User chose RealTalk. Switch to native speed, no TARGET_SENTENCE. Be natural.]'
    )
  }, [activeConfig, sendMessage])

  const handleRepeatTopic = useCallback(() => {
    startTopic(activeConfig.topic)
  }, [activeConfig.topic, startTopic])

  const handlePracticePassed = useCallback(
    (sentence: string) => {
      sendMessage(sentence)
    },
    [sendMessage]
  )

  const handleNewTopic = useCallback(() => {
    setLobbyVisible(true)
    setMessages([])
    spokenMessages.current.clear()
  }, [setMessages])

  // TTS: auto-play new AI messages
  // We now watch isLoading to ensure we only play the complete message
  useEffect(() => {
    if (isLoading || messages.length === 0) return
    const lastMsg = messages[messages.length - 1]
    if (lastMsg.role !== 'user' && lastMsg.role !== 'system') {
      if (!spokenMessages.current.has(lastMsg.id)) {
        spokenMessages.current.add(lastMsg.id)
        const parsed = parseAiMessage(lastMsg.content)
        const speechText = parsed.speech?.split('\n')[0]?.trim()

        // Sequential Auto-Play Logic
        const playSequence = async () => {
          // 1. Wait for the main speech to finish (if it was triggered zero-latency during the stream)
          if (currentTtsPromise.current) {
            await currentTtsPromise.current
            currentTtsPromise.current = null
          } else if (speechText) {
            // Fallback: If it didn't trigger during stream, play it now
            await speakText(speechText, activeConfig.companion_id)
          }

          // 2. Play Target Sentence flow if it exists
          if (
            parsed.targetSentence &&
            activeConfig.mode === 'learner' &&
            parsed.intent !== 'COACH_QUESTION' &&
            parsed.intent !== 'CONFUSION'
          ) {
            const isMale = activeConfig.companion_id === 'backpacker_male'
            const thaiIntro = isMale ? 'ตาคุณแล้ว ลองพูดตามนี้นะครับ' : 'ตาคุณแล้ว ลองพูดตามนี้นะคะ'
            const thaiVoice = isMale ? 'th-TH-NiwatNeural' : 'th-TH-PremwadeeNeural'

            // Wait 300ms before giving Thai instruction
            await new Promise((r) => setTimeout(r, 300))
            await speakText(thaiIntro, activeConfig.companion_id, thaiVoice)

            // Wait 200ms before reading the target sentence
            await new Promise((r) => setTimeout(r, 200))
            await speakText(parsed.targetSentence, activeConfig.companion_id)
          }
        }

        playSequence()
      }
    }
  }, [messages, isLoading, parseAiMessage, activeConfig.companion_id, activeConfig.mode])

  // Determine if the last message contains an active PracticeCard
  const isPracticeCardActive = useMemo(() => {
    if (messages.length === 0 || activeConfig.mode !== 'learner') return false
    const lastMsg = messages[messages.length - 1]
    if (lastMsg.role === 'user' || lastMsg.role === 'system') return false
    const parsed = parseAiMessage(lastMsg.content)
    return Boolean(parsed.targetSentence && parsed.targetThai)
  }, [messages, activeConfig.mode, parseAiMessage])

  return (
    <div className="flex flex-col h-dvh bg-background w-full max-w-2xl mx-auto relative font-sans">
      {/* Settings Overlay */}
      {isSettingsOpen && (
        <div className="absolute inset-0 z-50 bg-background flex flex-col overflow-y-auto animate-in fade-in slide-in-from-top-4 duration-200">
          {/* Settings Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface sticky top-0">
            <div>
              <p className="text-[10px] font-bold text-text-hint uppercase tracking-widest">
                Session Setup
              </p>
              <p className="text-base font-bold text-foreground">
                {draftConfig.companion_id === 'backpacker_male' ? 'Wei (伟)' : 'Ling (玲)'} ·{' '}
                {draftConfig.mode === 'learner' ? '🎓 Learner' : '🗣️ Real Talk'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="p-2 bg-background border border-border rounded-full text-text-secondary active:scale-95 transition-transform"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-5 py-6 space-y-8 max-w-md w-full mx-auto">
            {/* Topic */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                🎯 Topic
              </span>
              <input
                type="text"
                value={draftConfig.topic}
                onChange={(e) => setDraftConfig({ ...draftConfig, topic: e.target.value })}
                placeholder="e.g. Order coffee, Job interview..."
                className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-foreground font-medium outline-none focus:border-accent/50 focus:ring-2 ring-accent/20 transition-all"
              />
              <div className="flex flex-wrap gap-2">
                {TOPIC_SUGGESTIONS.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setDraftConfig({ ...draftConfig, topic: t.value })}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${draftConfig.topic === t.value ? 'bg-foreground text-background border-foreground' : 'bg-surface border-border text-text-secondary hover:bg-border/50'}`}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coach */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                👤 Coach
              </span>
              <div className="flex gap-3">
                {[
                  {
                    id: 'teacher_female',
                    emoji: '👩🏻‍🏫',
                    name: 'Ling (玲)',
                    sub: 'Kind & Formal',
                  },
                  { id: 'backpacker_male', emoji: '👨🏻', name: 'Wei (伟)', sub: 'Casual & Fun' },
                ].map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() =>
                      setDraftConfig({
                        ...draftConfig,
                        companion_id: c.id as SessionConfig['companion_id'],
                      })
                    }
                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${draftConfig.companion_id === c.id ? 'border-accent bg-accent/5' : 'border-border bg-surface opacity-70 hover:opacity-100'}`}
                  >
                    <span className="text-3xl">{c.emoji}</span>
                    <div className="text-center">
                      <p className="font-bold text-foreground text-sm">{c.name}</p>
                      <p className="text-[10px] text-text-secondary">{c.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                ⚡ Mode
              </span>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'learner', label: '🎓 Learner', sub: 'Guided, hints, corrects errors.' },
                  { id: 'real_talk', label: '🗣️ Real Talk', sub: 'Native speed, no hints.' },
                ].map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() =>
                      setDraftConfig({ ...draftConfig, mode: m.id as SessionConfig['mode'] })
                    }
                    className={`flex flex-col gap-1 p-3 rounded-xl border-2 text-left transition-all ${draftConfig.mode === m.id ? 'border-foreground bg-foreground text-background' : 'border-border bg-surface text-foreground hover:bg-border/50'}`}
                  >
                    <span className="font-bold text-sm">{m.label}</span>
                    <span
                      className={`text-[10px] leading-tight ${draftConfig.mode === m.id ? 'text-surface/70' : 'text-text-secondary'}`}
                    >
                      {m.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <button
                type="button"
                onClick={applySettings}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-accent text-white font-bold text-lg rounded-2xl hover:opacity-90 active:scale-95 transition-all"
              >
                <Sparkles className="w-5 h-5" /> Start Speaking
              </button>
              <p className="text-center text-xs text-text-hint">
                Changing Topic or Coach resets the chat.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Top Navigation Bar ─── */}
      <div className="bg-surface sticky top-0 z-10 flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-lg font-bold text-text-secondary shrink-0 shadow-sm">
            {activeConfig.companion_id === 'backpacker_male' ? '伟' : '玲'}
          </div>

          {/* Name + Topic */}
          <button
            type="button"
            className="flex flex-col min-w-0 flex-1 text-left"
            onClick={() => {
              setDraftConfig(activeConfig)
              setIsSettingsOpen(true)
            }}
          >
            <span className="text-sm font-bold text-foreground leading-tight">
              {activeConfig.companion_id === 'backpacker_male' ? 'Wei (伟)' : 'Ling (玲)'}
            </span>
            {!lobbyVisible && (
              <span className="text-xs text-text-secondary truncate font-medium">
                {activeConfig.topic}
              </span>
            )}
          </button>

          {/* Mode Toggle Pill — quick switch */}
          <button
            type="button"
            onClick={toggleMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all active:scale-95 shrink-0 ${
              activeConfig.mode === 'learner'
                ? 'bg-foreground text-background border-foreground'
                : 'bg-orange-500 text-white border-orange-500'
            }`}
          >
            {activeConfig.mode === 'learner' ? '🎓 Learner' : '🗣️ Real Talk'}
          </button>

          {/* Settings Gear */}
          <button
            type="button"
            onClick={() => {
              setDraftConfig(activeConfig)
              setIsSettingsOpen(true)
            }}
            className="p-2 bg-background border border-border hover:bg-surface rounded-full text-text-secondary transition-colors shrink-0 active:scale-95"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar (Visible outside Lobby) */}
        {!lobbyVisible && (
          <div className="w-full h-1 bg-border">
            <div
              className="h-full bg-accent transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(100, (messages.filter((m) => m.role === 'assistant').length / activeConfig.max_turns) * 100)}%`,
              }}
            />
          </div>
        )}
        {/* Fallback border for lobby */}
        {lobbyVisible && <div className="w-full h-px bg-border" />}
      </div>

      {/* ─── Main Scroll Area ─── */}
      <div className="flex-1 overflow-y-auto w-full px-4 py-5 flex flex-col gap-5">
        {/* LOBBY: Topic Grid */}
        {lobbyVisible && (
          <div className="flex flex-col items-center w-full gap-5 py-2">
            <div className="text-center">
              <div className="text-5xl mb-3">
                {activeConfig.companion_id === 'backpacker_male' ? '👨🏻' : '👩🏻‍🏫'}
              </div>
              <h2 className="text-xl font-black text-foreground">สวัสดี! 👋</h2>
              <p className="text-text-secondary text-sm mt-1">วันนี้อยากฝึกสถานการณ์ไหนดี?</p>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
              {TOPIC_SUGGESTIONS.map((topic) => (
                <button
                  type="button"
                  key={topic.value}
                  onClick={() => startTopic(topic.value)}
                  className="flex flex-col items-center gap-2 p-4 bg-surface border border-border rounded-2xl hover:border-accent/40 hover:bg-accent/5 active:scale-95 transition-all text-center"
                >
                  <span className="text-2xl">{topic.emoji}</span>
                  <span className="text-xs font-bold text-foreground leading-tight">
                    {topic.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom Topic */}
            <div className="flex items-center gap-2 w-full max-w-xs bg-surface border border-border rounded-2xl px-4 py-3">
              <input
                type="text"
                placeholder="หรือพิมพ์หัวข้อเองตรงนี้..."
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-text-hint"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    startTopic(e.currentTarget.value.trim())
                  }
                }}
              />
              <span className="text-text-hint text-xs">↵</span>
            </div>
          </div>
        )}

        {/* Loading dots after topic selection */}
        {!lobbyVisible &&
          messages.filter((m: { role: string }) => m.role !== 'system').length === 0 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-1.5">
                {[0, 150, 300].map((d) => (
                  <div
                    key={d}
                    className="w-2 h-2 bg-text-hint rounded-full animate-bounce"
                    style={{ animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

        {messages.map((m) => {
          if (m.role === 'system') return null
          const isUser = m.role === 'user'
          if (isUser && m.content.startsWith('[START SESSION')) return null
          if (isUser && m.content.startsWith('[SYSTEM INJECT')) return null

          const parsed: CompanionResponseBlock = isUser
            ? { speech: m.content }
            : parseAiMessage(m.content)

          return (
            <div
              key={m.id}
              className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-border shrink-0 flex items-center justify-center text-xs font-bold text-text-secondary shadow-sm mb-1">
                  {activeConfig.companion_id === 'backpacker_male' ? '伟' : '玲'}
                </div>
              )}
              <div
                className={`flex flex-col gap-2 ${isUser ? 'items-end max-w-[80%]' : 'items-start w-full max-w-[90%]'}`}
              >
                {/* Speech Bubble */}
                <div
                  className={`rounded-3xl px-4 py-3 ${
                    isUser
                      ? 'bg-accent text-white rounded-br-sm'
                      : 'bg-surface text-foreground border border-border rounded-bl-sm'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">
                        {activeConfig.companion_id === 'backpacker_male' ? 'Wei (伟)' : 'Ling (玲)'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const ttsText = parsed.speechZh || parsed.speech
                          if (ttsText && !isLoading) speakText(ttsText, activeConfig.companion_id)
                        }}
                        className="p-1 rounded-full hover:bg-black/5 active:scale-90 transition-all text-text-hint hover:text-accent"
                        title="ฟังอีกครั้ง (Listen again)"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  {/* 3-Layer Speech Content */}

                  {/* Layer 1: Thai context — help learner understand what AI is saying */}
                  {!isUser && parsed.speechTh && (
                    <p className="text-sm text-text-secondary mb-2 leading-snug border-b border-border pb-2">
                      {parsed.speechTh}
                    </p>
                  )}

                  {/* Layer 2: Chinese (main speech) */}
                  <p className="text-[18px] font-bold leading-relaxed whitespace-pre-wrap chinese">
                    {parsed.speechZh || parsed.speech}
                  </p>

                  {/* Layer 3: Pinyin — displayed below Chinese */}
                  {!isUser && parsed.speechPinyin && (
                    <p className="text-xs italic text-text-secondary mt-1 leading-relaxed">
                      {parsed.speechPinyin}
                    </p>
                  )}
                </div>

                {/* SESSION_COMPLETE: Show Summary Card */}
                {!isUser && parsed.sessionComplete && parsed.sentenceSummary && (
                  <SessionCompleteCard
                    sentenceSummary={parsed.sentenceSummary}
                    vocabSummary={parsed.vocabSummary || []}
                    companionId={activeConfig.companion_id}
                    onNewTopic={handleNewTopic}
                    onRepeat={handleRepeatTopic}
                    onRealTalk={handleRealTalk}
                  />
                )}

                {/* COACH MODE: Show badge for COACH_QUESTION or CONFUSION intent */}
                {!isUser &&
                  (parsed.intent === 'COACH_QUESTION' || parsed.intent === 'CONFUSION') && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-700">
                      <GraduationCap className="w-3.5 h-3.5" />
                      โหมดโค้ช — ถามได้เลยครับ
                    </div>
                  )}

                {/* Practice Card — suppressed for COACH/CONFUSION/SESSION_COMPLETE */}
                {!isUser &&
                  parsed.targetSentence &&
                  parsed.targetThai &&
                  activeConfig.mode === 'learner' &&
                  parsed.intent !== 'COACH_QUESTION' &&
                  parsed.intent !== 'CONFUSION' &&
                  !parsed.sessionComplete && (
                    <div className="w-full">
                      <PracticeCard
                        targetSentence={parsed.targetSentence}
                        targetThai={parsed.targetThai}
                        onPassed={handlePracticePassed}
                        companionId={activeConfig.companion_id}
                      />
                    </div>
                  )}
              </div>
            </div>
          )
        })}

        {/* Typing Indicator for AI (Real Talk / Long Processing TTFB) */}
        {isLoading &&
          messages.length > 0 &&
          messages[messages.length - 1].role === 'assistant' &&
          !parseAiMessage(messages[messages.length - 1].content).speechZh && (
            <div className="flex items-end gap-2.5">
              <div className="w-8 h-8 rounded-full bg-border shrink-0 flex items-center justify-center text-xs font-bold text-text-secondary shadow-sm mb-1">
                {activeConfig.companion_id === 'backpacker_male' ? '伟' : '玲'}
              </div>
              <div className="bg-surface border border-border rounded-3xl rounded-bl-sm px-4 py-3 flex items-center justify-center min-w-[60px] h-[46px]">
                <div className="flex items-center gap-1.5">
                  {[0, 150, 300].map((d) => (
                    <div
                      key={d}
                      className="w-2 h-2 bg-text-hint rounded-full animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

        <div ref={bottomRef} className="h-4 w-full shrink-0" />
      </div>

      {/* Bottom Interaction (hidden if Lobby is shown or an active PracticeCard needs focus) */}
      {!lobbyVisible && !isPracticeCardActive && (
        <div className="w-full bg-background border-t border-border pt-5 pb-8 px-4 flex flex-col items-center sticky bottom-0 z-10 shadow-[0_-20px_30px_rgba(250,247,242,0.9)]">
          <div className="-mt-12 mb-4">
            <MegaMicButton
              isRecording={isRecording}
              isProcessing={isProcessing}
              onStart={startRecording}
              onStop={handleMicStop}
            />
          </div>

          <form
            data-chat-form
            onSubmit={handleSubmit}
            className="w-full max-w-lg flex items-center gap-2 bg-surface p-1.5 rounded-full border border-border"
          >
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Type manually if you prefer..."
              className="flex-1 bg-transparent px-4 py-1 text-sm outline-none text-foreground placeholder:text-text-hint chinese"
            />
            <button
              type="submit"
              disabled={!input?.trim() || isLoading}
              className="p-2.5 bg-foreground text-surface rounded-full hover:opacity-90 disabled:opacity-30 transition-opacity active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
