'use client'

import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  Mic,
  RotateCcw,
  Volume2,
  XCircle,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useWavRecorder } from '../hooks/useWavRecorder'
import { speakText } from './ChatInterface'

interface PronunciationResult {
  score: number
  accuracyScore: number
  fluencyScore: number
  completenessScore: number
  phonemes?: Array<{
    phoneme: string
    score: number
  }>
}

interface PracticeCardProps {
  targetSentence: string
  targetThai: string
  onPassed: (sentence: string) => void // Called when user passes with > 75% score
  isLastCard?: boolean
  companionId: string
}

type CardState = 'idle' | 'recording' | 'evaluating' | 'passed' | 'failed'

export default function PracticeCard({
  targetSentence,
  targetThai,
  onPassed,
  companionId,
}: PracticeCardProps) {
  const [cardState, setCardState] = useState<CardState>('idle')
  const [score, setScore] = useState<number | null>(null)
  const [result, setResult] = useState<PronunciationResult | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const { startRecording: startWav, stopRecording: stopWav } = useWavRecorder()

  const evaluatePronunciation = useCallback(
    async (audioBlob: Blob) => {
      try {
        // Convert blob to base64 to send to API
        const arrayBuffer = await audioBlob.arrayBuffer()
        const base64Audio = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        )

        const res = await fetch('/api/speech/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio: base64Audio,
            referenceText: targetSentence,
            language: 'zh-CN',
          }),
        })

        if (!res.ok) throw new Error('Evaluation failed')

        const data = await res.json()
        const pronunciationScore = data.score ?? 0

        setScore(pronunciationScore)
        setResult(data)

        if (pronunciationScore >= 75) {
          // Happy success haptic pattern
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200])
          }
          setCardState('passed')
          // Auto-advance after 1.2s so user can see score
          setTimeout(() => {
            onPassed(targetSentence)
          }, 1200)
        } else {
          // Error haptic pattern
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 100])
          }
          setCardState('failed')
        }
      } catch (err) {
        console.error('Evaluation error:', err)
        // Fallback: still pass the user so the flow is not blocked
        setCardState('passed')
        setTimeout(() => onPassed(targetSentence), 800)
      }
    },
    [targetSentence, onPassed]
  )

  const startRecording = useCallback(async () => {
    // Light haptic tap to acknowledge button press
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50])
    }
    setCardState('recording')
    await startWav()
  }, [startWav])

  const stopRecording = useCallback(async () => {
    if (cardState !== 'recording') return
    // Distinct haptic tap to confirm stop
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100])
    }
    setCardState('evaluating')
    const wavBlob = await stopWav()
    if (wavBlob) {
      await evaluatePronunciation(wavBlob)
    } else {
      setCardState('idle')
    }
  }, [cardState, stopWav, evaluatePronunciation])

  // Handle Spacebar logic for Desktop users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent normal scrolling if it's spacebar and we're not inside an input
      if (
        e.code === 'Space' &&
        (e.target as HTMLElement).tagName !== 'INPUT' &&
        (e.target as HTMLElement).tagName !== 'TEXTAREA'
      ) {
        if (!e.repeat && cardState === 'idle') {
          e.preventDefault()
          startRecording()
        }
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      // Small delay on key up so it doesn't immediately cancel if users tap lightly
      if (e.code === 'Space' && cardState === 'recording') {
        e.preventDefault()
        stopRecording()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [cardState, startRecording, stopRecording])

  const retry = () => {
    setCardState('idle')
    setScore(null)
    setResult(null)
    setShowDetails(false)
  }

  // Determine per-character coloring based on phoneme score
  const getCharClass = (index: number): string => {
    if (
      !result?.phonemes ||
      cardState === 'idle' ||
      cardState === 'recording' ||
      cardState === 'evaluating'
    ) {
      return 'text-foreground'
    }
    const phoneme = result.phonemes[index]
    if (!phoneme) return 'text-foreground'
    if (phoneme.score >= 80) return 'bg-emerald-100 text-emerald-700 rounded px-0.5'
    if (phoneme.score >= 50) return 'bg-amber-100 text-amber-700 rounded px-0.5'
    return 'bg-red-100 text-red-600 rounded px-0.5'
  }

  // Split target sentence into characters for per-char coloring
  const chars = targetSentence.split('')

  return (
    <div
      className={`relative w-full rounded-3xl border-2 p-5 transition-all duration-300 shadow-sm ${
        cardState === 'passed'
          ? 'border-emerald-400 bg-emerald-50'
          : cardState === 'failed'
            ? 'border-red-300 bg-red-50'
            : 'border-accent/30 bg-accent/5'
      }`}
    >
      {/* Card Label */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-accent">
          🎯 Your Turn
        </span>
        {cardState === 'passed' && (
          <span className="text-[10px] font-bold text-emerald-600 ml-auto">✓ Sent!</span>
        )}
      </div>

      {/* The Target Sentence (large Chinese with tooltips) */}
      <div className="flex flex-col items-center gap-2 mb-2">
        <div className="flex justify-center flex-wrap gap-x-2 gap-y-1">
          {chars.map((char, i) => {
            const phonemeData = result?.phonemes?.[i]
            // We use a zero-width space default or actual text for spacing
            return (
              <div key={i} className="flex flex-col items-center">
                <span
                  className="text-xs font-bold text-text-hint/80 mb-0.5"
                  style={{ minHeight: '1.2rem' }}
                >
                  {phonemeData?.phoneme || ''}
                </span>
                <span
                  className={`text-4xl leading-tight font-bold transition-colors duration-500 chinese ${getCharClass(i)}`}
                >
                  {char}
                </span>
              </div>
            )
          })}
        </div>
        <button
          onClick={() => speakText(targetSentence, companionId)}
          className="flex items-center gap-1.5 px-3 py-1.5 mt-2 rounded-full bg-accent/10 text-accent text-xs font-bold hover:bg-accent/20 active:scale-95 transition-all"
        >
          <Volume2 className="w-3.5 h-3.5" /> ฟังเสียงโค้ช
        </button>
      </div>

      {/* Thai translation */}
      <p className="text-center text-sm text-text-secondary mb-4 leading-relaxed">{targetThai}</p>

      {/* Score Display & Details Toggle */}
      {score !== null && result !== null && (
        <div className="flex flex-col items-center mb-4">
          <div
            className={`text-center text-2xl font-black transition-all ${
              score >= 75 ? 'text-emerald-500' : 'text-red-500'
            }`}
          >
            {score >= 75 ? '🔥' : '❌'} {score}%
            <span className="text-sm font-medium ml-2">
              {score >= 90 ? 'Perfect!' : score >= 75 ? 'Great!' : 'ลองอีกครั้ง!'}
            </span>
          </div>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 text-xs font-bold text-text-hint hover:text-accent mt-2 transition-colors"
          >
            {showDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            {showDetails ? 'ซ่อนรายละเอียด (Hide Info)' : 'ดูรายละเอียด (View Info)'}
          </button>

          {/* Expanded 4-D Score Analytics */}
          {showDetails && (
            <div className="w-full mt-4 p-4 rounded-2xl bg-surface border border-border space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
              <h4 className="text-xs font-black uppercase text-text-secondary flex items-center gap-1 mb-1">
                <Info className="w-3.5 h-3.5" /> Score Analysis
              </h4>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">Accuracy (ความถูกต้อง)</span>
                  <span className="text-emerald-500">{result.accuracyScore}%</span>
                </div>
                <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${result.accuracyScore}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">Fluency (ความลื่นไหล)</span>
                  <span
                    className={result.fluencyScore >= 75 ? 'text-emerald-500' : 'text-amber-500'}
                  >
                    {result.fluencyScore}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${result.fluencyScore >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${result.fluencyScore}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">Completeness (ความครบถ้วน)</span>
                  <span
                    className={result.completenessScore >= 95 ? 'text-emerald-500' : 'text-red-500'}
                  >
                    {result.completenessScore}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${result.completenessScore >= 95 ? 'bg-emerald-500' : 'bg-red-500'}`}
                    style={{ width: `${result.completenessScore}%` }}
                  />
                </div>
              </div>

              <p className="text-[10px] text-text-hint text-center mt-2 pt-2 border-t border-border">
                Detailed metrics verified by Azure Speech
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <div className="flex flex-col items-center gap-3">
        {cardState === 'idle' && (
          <button
            onPointerDown={startRecording}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-white font-bold rounded-2xl shadow-sm active:scale-95 transition-all text-sm"
          >
            <Mic className="w-4 h-4" />
            กดค้างหรือ Spacebar เพื่อพูด
          </button>
        )}

        {cardState === 'recording' && (
          <button
            onPointerUp={stopRecording}
            onPointerLeave={stopRecording}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-bold rounded-2xl shadow-sm animate-pulse"
          >
            <div className="w-3 h-3 bg-white rounded-full animate-ping" />
            กำลังฟัง... ปล่อยเมื่อพูดจบ
          </button>
        )}

        {cardState === 'evaluating' && (
          <div className="flex items-center gap-2 px-6 py-3 text-text-secondary text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            กำลังตรวจสอบ...
          </div>
        )}

        {cardState === 'passed' && (
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <CheckCircle2 className="w-5 h-5" />
            ผ่านแล้ว! กำลังต่อ...
          </div>
        )}

        {cardState === 'failed' && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-red-500 text-sm font-semibold">
              <XCircle className="w-4 h-4" />
              เกือบแล้ว! ลองออกเสียงส่วนสีแดงใหม่นะ
            </div>
            <button
              onClick={retry}
              className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-surface text-sm font-bold rounded-2xl active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              ลองอีกครั้ง
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
