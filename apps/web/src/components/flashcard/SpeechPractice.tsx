'use client'

/**
 * SpeechPractice — inline pronunciation scorer on the FlashCard back face.
 *
 * Flow: idle → recording → analyzing → done | error
 * Audio is recorded via MediaRecorder (webm/opus), sent base64-encoded to
 * /api/speech/evaluate (Azure Cognitive Services Pronunciation Assessment).
 *
 * Azure returns: score, accuracyScore, fluencyScore, completenessScore,
 * recognized (what Azure heard), phonemes[]
 */

import { Mic, MicOff, RefreshCw } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AzureResult {
  score: number // overall pronunciation score 0-100
  accuracyScore: number // phoneme accuracy
  fluencyScore: number // speech fluency / naturalness
  completenessScore: number // % of words correctly spoken
  recognized: string // what Azure heard
  phonemes: Array<{ phoneme: string; score: number }>
}

type PracticeState = 'idle' | 'recording' | 'analyzing' | 'done' | 'error' | 'unsupported'

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? '#6B7F5E' : score >= 60 ? '#C4704B' : '#B56B6B'
  return (
    <div className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-x-2 text-xs">
      <span className="text-[#9A9179] truncate">{label}</span>
      <div className="h-1.5 bg-[#E8E0D5] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-right font-semibold text-[11px]" style={{ color }}>
        {score}
      </span>
    </div>
  )
}

// ─── Waveform bars (recording animation) ─────────────────────────────────────

const WAVE_BARS = [
  { duration: '0.5s', delay: '0s' },
  { duration: '0.7s', delay: '0.12s' },
  { duration: '0.4s', delay: '0.06s' },
  { duration: '0.9s', delay: '0.18s' },
  { duration: '0.6s', delay: '0.09s' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      const idx = result.indexOf(',')
      resolve(idx >= 0 ? result.slice(idx + 1) : result)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function getBestMimeType(): string {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
  for (const t of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) return t
  }
  return ''
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SpeechPracticeProps {
  word: string // Chinese hanzi to pronounce e.g. "黄"
  pinyin: string // pinyin shown as hint e.g. "huáng"
}

export function SpeechPractice({ word, pinyin }: SpeechPracticeProps) {
  const [state, setState] = useState<PracticeState>(() => {
    if (typeof window === 'undefined') return 'idle'
    if (!navigator.mediaDevices?.getUserMedia) return 'unsupported'
    return 'idle'
  })
  const [result, setResult] = useState<AzureResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  // ── Start recording ────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    const mimeType = getBestMimeType()
    if (!mimeType) {
      setState('unsupported')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000 },
      })
      streamRef.current = stream
      chunksRef.current = []

      const recorder = new MediaRecorder(stream, { mimeType })
      recorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        for (const track of streamRef.current?.getTracks() ?? []) track.stop()
        streamRef.current = null
        setState('analyzing')

        try {
          const blob = new Blob(chunksRef.current, { type: mimeType })
          const base64 = await blobToBase64(blob)

          const res = await fetch('/api/speech/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audio: base64,
              referenceText: word,
              language: 'zh-CN',
            }),
          })

          const json = (await res.json()) as AzureResult & { error?: string }

          if (json.error) {
            setErrorMsg(json.error)
            setState('error')
          } else {
            setResult(json)
            setState('done')
          }
        } catch {
          setErrorMsg('ไม่สามารถส่งข้อมูลเสียงได้')
          setState('error')
        }
      }

      recorder.start(100)
      setState('recording')
    } catch {
      setErrorMsg('ไม่สามารถเข้าถึงไมโครโฟนได้ — กรุณาอนุญาตการเข้าถึง')
      setState('error')
    }
  }, [word])

  // ── Stop recording ─────────────────────────────────────────────────────────

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
    }
  }, [])

  // ── Reset ──────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setResult(null)
    setErrorMsg('')
    setState('idle')
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-3 bg-[#FAF7F2] border border-[#E8E0D5] rounded-xl space-y-3 fade-slide-up">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="w-0.5 h-3.5 bg-[#C4704B] rounded-full" />
        <p className="text-[10px] text-[#9A9179] font-semibold uppercase tracking-widest">
          ฝึกออกเสียง
        </p>
      </div>

      {/* ── UNSUPPORTED ── */}
      {state === 'unsupported' && (
        <p className="text-xs text-[#9A9179] text-center py-1">เบราว์เซอร์นี้ไม่รองรับการบันทึกเสียง</p>
      )}

      {/* ── IDLE ── */}
      {state === 'idle' && (
        <div className="flex flex-col items-center gap-2.5 py-0.5">
          <p className="text-xs text-[#7A7067]">
            พูดว่า <span className="font-semibold text-[#2C2824]">{word}</span>
            <span className="mx-1.5 text-[#C8C2BB]">·</span>
            <span className="text-[#9A9179]">{pinyin}</span>
          </p>
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#C4704B] hover:bg-[#A85A3A] active:scale-[0.97] text-white text-sm font-medium rounded-xl transition-all"
          >
            <Mic size={14} />
            กดพูด
          </button>
        </div>
      )}

      {/* ── RECORDING ── */}
      {state === 'recording' && (
        <div className="flex flex-col items-center gap-2.5 py-0.5">
          <div className="flex items-end gap-1 h-6">
            {WAVE_BARS.map((bar, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: waveform bars are positional
                key={i}
                className="w-1.5 rounded-full bg-[#C4704B]"
                style={{
                  animation: `speechWave ${bar.duration} ease-in-out infinite alternate`,
                  animationDelay: bar.delay,
                  height: '4px',
                }}
              />
            ))}
          </div>
          <p className="text-xs text-[#C4704B] font-medium">กำลังบันทึก...</p>
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#B56B6B] hover:bg-[#9E5555] text-white text-sm font-medium rounded-xl transition-colors active:scale-[0.97]"
          >
            <MicOff size={14} />
            หยุดบันทึก
          </button>
        </div>
      )}

      {/* ── ANALYZING ── */}
      {state === 'analyzing' && (
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="w-5 h-5 border-2 border-[#C4704B] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[#9A9179]">กำลังวิเคราะห์เสียง...</p>
        </div>
      )}

      {/* ── DONE ── */}
      {state === 'done' && result && (
        <div className="space-y-2.5">
          {/* What Azure heard */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#FFFEFB] border border-[#E8E0D5] rounded-lg">
            <span className="text-[10px] text-[#9A9179] shrink-0">Azure ได้ยิน</span>
            <span className="font-medium text-[#2C2824] text-sm flex-1">
              {result.recognized || '(ไม่ได้ยิน)'}
            </span>
            {result.recognized === word ? (
              <span className="text-[#6B7F5E] text-xs font-semibold shrink-0">✓ ถูก</span>
            ) : (
              <span className="text-[#B56B6B] text-xs font-semibold shrink-0">✗ ผิด</span>
            )}
          </div>

          {/* Score bars */}
          <div className="space-y-1.5">
            <ScoreBar score={result.accuracyScore} label="ความถูกต้อง" />
            <ScoreBar score={result.fluencyScore} label="ความลื่นไหล" />
            <ScoreBar score={result.completenessScore} label="ครบถ้วน" />
          </div>

          {/* Overall + retry */}
          <div className="flex items-center gap-3 pt-1.5 border-t border-[#E8E0D5]">
            <span className="text-xs font-semibold text-[#3D3630] shrink-0">คะแนนรวม</span>
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-[1fr_2rem] items-center gap-x-2">
                <div className="h-1.5 bg-[#E8E0D5] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${result.score}%`,
                      backgroundColor:
                        result.score >= 80 ? '#6B7F5E' : result.score >= 60 ? '#C4704B' : '#B56B6B',
                    }}
                  />
                </div>
                <span
                  className="text-right font-bold text-[12px]"
                  style={{
                    color:
                      result.score >= 80 ? '#6B7F5E' : result.score >= 60 ? '#C4704B' : '#B56B6B',
                  }}
                >
                  {result.score}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1 px-2.5 py-1 border border-[#E8E0D5] text-[#7A7067] text-xs rounded-lg hover:bg-[#F0EBE3] transition-colors shrink-0"
            >
              <RefreshCw size={10} />
              ลองอีก
            </button>
          </div>
        </div>
      )}

      {/* ── ERROR ── */}
      {state === 'error' && (
        <div className="flex items-start justify-between gap-3 py-0.5">
          <p className="text-xs text-[#B56B6B] leading-snug">{errorMsg}</p>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-[#7A7067] underline underline-offset-2 shrink-0"
          >
            ลองใหม่
          </button>
        </div>
      )}
    </div>
  )
}
