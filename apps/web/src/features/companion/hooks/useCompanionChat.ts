import { useEffect, useRef, useState } from 'react'
import type {
  CompanionResponseBlock,
  IntentType,
  LearningDNA,
  SentenceSummaryItem,
  SessionConfig,
  VocabTag,
} from '../types'

// Custom interface for messages since we removed @ai-sdk/react
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

export function useCompanionChat(
  sessionConfig: SessionConfig,
  learningDNA: LearningDNA,
  onSpeechReady?: (text: string, companionId: string) => void
) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Parse AI structured blocks from response text
  const parseAiMessage = (content: string): CompanionResponseBlock => {
    const result: CompanionResponseBlock = { speech: content }

    // Generic block extractor: finds content between a BLOCK_NAME: marker and next UPPERCASE block
    const extractBlock = (marker: string, text: string): string | null => {
      const regex = new RegExp(`${marker}:\\s*([\\s\\S]*?)(?=(?:[A-Z_]+:|$))`, 'i')
      const match = text.match(regex)
      return match ? match[1].trim() : null
    }

    // Parse INTENT
    const intentMatch = extractBlock('INTENT', content)
    if (intentMatch && intentMatch !== '-') {
      result.intent = intentMatch.trim() as IntentType
    }

    // Parse 3-part speech blocks (new format)
    const speechThMatch = extractBlock('SPEECH_TH', content)
    if (speechThMatch && speechThMatch !== '-') result.speechTh = speechThMatch

    const speechZhMatch = extractBlock('SPEECH_ZH', content)
    if (speechZhMatch && speechZhMatch !== '-') {
      result.speechZh = speechZhMatch
      result.speech = speechZhMatch // use ZH as canonical speech for TTS
    }

    const speechPinyinMatch = extractBlock('SPEECH_PINYIN', content)
    if (speechPinyinMatch && speechPinyinMatch !== '-') result.speechPinyin = speechPinyinMatch

    // Fallback: legacy SPEECH block (for backward compat or if new blocks absent)
    if (!result.speechZh) {
      const speechMatch = extractBlock('SPEECH', content)
      if (speechMatch) {
        // Strip inline pinyin in parentheses before using in TTS
        result.speech = speechMatch
          .replace(/\([^)]*[a-zA-ZāáǎàēéěèīíǐìōóǒòūúǔùüǘǚǛ][^)]*\)/g, '')
          .trim()
      }
    }

    const targetSentenceMatch = extractBlock('TARGET_SENTENCE', content)
    if (targetSentenceMatch && targetSentenceMatch !== '-')
      result.targetSentence = targetSentenceMatch

    const targetPinyinMatch = extractBlock('TARGET_PINYIN', content)
    if (targetPinyinMatch && targetPinyinMatch !== '-') result.targetPinyin = targetPinyinMatch

    const targetThaiMatch = extractBlock('TARGET_THAI', content)
    if (targetThaiMatch && targetThaiMatch !== '-') result.targetThai = targetThaiMatch

    const hintMatch = extractBlock('HINT', content)
    if (hintMatch && hintMatch !== '-') result.hint = hintMatch

    // Parse SESSION_COMPLETE
    const sessionCompleteBlock = extractBlock('SESSION_COMPLETE', content)
    if (sessionCompleteBlock && sessionCompleteBlock !== '-') {
      result.sessionComplete = true
    }

    // Parse SENTENCE_SUMMARY
    const sentenceSummaryBlock = extractBlock('SENTENCE_SUMMARY', content)
    if (sentenceSummaryBlock && sentenceSummaryBlock !== '-') {
      const lines = sentenceSummaryBlock
        .split('\n')
        .filter((l) => l.trim().startsWith('-') || l.includes('|'))
      result.sentenceSummary = lines.reduce<SentenceSummaryItem[]>((acc, line) => {
        const clean = line.replace(/^-\s*/, '').trim()
        const parts = clean.split('|').map((p) => p.trim())
        if (parts.length >= 3) {
          acc.push({ chinese: parts[0], pinyin: parts[1], thai: parts[2] })
        }
        return acc
      }, [])
    }

    // Parse VOCAB_SUMMARY
    const vocabSummaryBlock = extractBlock('VOCAB_SUMMARY', content)
    if (vocabSummaryBlock && vocabSummaryBlock !== '-') {
      const lines = vocabSummaryBlock.split('\n').filter((l) => l.trim().startsWith('-'))
      result.vocabSummary = lines.reduce<VocabTag[]>((acc, line) => {
        const clean = line.replace(/^-\s*/, '').trim()
        const match = clean.match(/^(.+?)\s+\((.+?)\)\s*=\s*(.+)$/)
        if (match) {
          acc.push({ word: match[1].trim(), pinyin: match[2].trim(), meaning_th: match[3].trim() })
        }
        return acc
      }, [])
    }

    return result
  }

  // Pure custom stream handling — no SDK dependency!
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsgId = Date.now().toString()
    const userMessage: Message = { id: userMsgId, role: 'user', content: text }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const sendHistory = [...messages, userMessage]

    try {
      const res = await fetch('/api/session/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: sendHistory,
          sessionConfig,
          learningDNA,
        }),
      })

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No readable stream')

      const decoder = new TextDecoder()
      const aiMsgId = (Date.now() + 1).toString()
      let aiContent = ''
      let speechTriggered = false
      const sessionStartMs = Date.now()

      setMessages((prev) => [...prev, { id: aiMsgId, role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        aiContent += chunk

        // Zero-latency TTS trigger: If SPEECH_PINYIN block starts, SPEECH_ZH is fully generated!
        if (!speechTriggered && aiContent.includes('SPEECH_PINYIN:')) {
          speechTriggered = true
          const parsed = parseAiMessage(aiContent)
          if (parsed.speechZh && onSpeechReady) {
            onSpeechReady(parsed.speechZh, sessionConfig.companion_id)
          }
        }

        setMessages((prev) =>
          prev.map((msg) => (msg.id === aiMsgId ? { ...msg, content: aiContent } : msg))
        )
      }

      // Fallback: If it was too short and didn't trigger during the stream
      if (!speechTriggered) {
        const parsed = parseAiMessage(aiContent)
        const finalZh = parsed.speechZh || parsed.speech
        if (finalZh && onSpeechReady) {
          onSpeechReady(finalZh, sessionConfig.companion_id)
        }
      }

      // Fire session-complete endpoint (non-blocking) when AI signals end of session
      if (aiContent.includes('SESSION_COMPLETE:')) {
        const minutes = Math.round((Date.now() - sessionStartMs) / 60000)
        fetch('/api/session/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ xpEarned: 20, minutes }),
        }).catch(() => {})
      }
    } catch (err) {
      console.error('Chat stream error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const sendVoiceText = (transcribedText: string) => {
    sendMessage(transcribedText)
  }

  return {
    messages,
    setMessages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    isRecording,
    setIsRecording,
    sendVoiceText,
    sendMessage,
    parseAiMessage,
    bottomRef,
  }
}
