'use client'

/**
 * SpeechPractice — inline pronunciation scorer on the FlashCard back face.
 *
 * Flow: idle → recording → analyzing → done | error
 * Audio is recorded via MediaRecorder (webm/opus) and sent base64-encoded
 * to /api/speech/speechsuper which proxies to SpeechSuper word.eval.promax.
 */

import { Mic, MicOff, RefreshCw } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SyllableScore {
  initial: string
  final: string
  tone: number
  score: number
  initialScore: number
  finalScore: number
  toneScore: number
}

interface SpeechResult {
  overall: number
  toneScore: number
  initialScore: number
  finalScore: number
  syllables: SyllableScore[]
}

type PracticeState = 'idle' | 'recording' | 'analyzing' | 'done' | 'error' | 'unsupported'

// ─── Tone display ─────────────────────────────────────────────────────────────

function toneSymbol(tone: number): string {
  const map: Record<number, string> = {
    1: '¯', // flat
    2: '↗', // rising
    3: '↘↗', // dipping
    4: '↘', // falling
    5: '·', // neutral
  }
  return map[tone] ?? '?'
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? '#6B7F5E' : score >= 60 ? '#C4704B' : '#B56B6B'
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div className="flex-1 h-1.5 bg-[#E8E0D5] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[11px] font-semibold w-7 text-right shrink-0" style={{ color }}>
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
  word: string // Chinese hanzi to pronounce
  pinyin: string // pinyin hint shown to user
}

export function SpeechPractice({ word, pinyin }: SpeechPracticeProps) {
  const [state, setState] = useState<PracticeState>(() => {
    if (typeof window === 'undefined') return 'idle'
    if (!navigator.mediaDevices?.getUserMedia) return 'unsupported'
    return 'idle'
  })
  const [result, setResult] = useState<SpeechResult | null>(null)
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
        // Release mic
        for (const track of streamRef.current?.getTracks() ?? []) track.stop()
        streamRef.current = null

        setState('analyzing')

        try {
          const blob = new Blob(chunksRef.current, { type: mimeType })
          const base64 = await blobToBase64(blob)
          // Map mimeType → simple audioType string for SpeechSuper
          const audioType = mimeType.includes('webm')
            ? 'webm'
            : mimeType.includes('ogg')
              ? 'ogg'
              : 'mp4'

          const res = await fetch('/api/speech/speechsuper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: base64, audioType, word }),
          })

          const json = (await res.json()) as { data: SpeechResult | null; error: string | null }

          if (json.error || !json.data) {
            setErrorMsg(json.error ?? 'เกิดข้อผิดพลาด')
            setState('error')
          } else {
            setResult(json.data)
            setState('done')
          }
        } catch {
          setErrorMsg('ไม่สามารถส่งข้อมูลเสียงได้')
          setState('error')
        }
      }

      recorder.start(100) // chunk every 100 ms
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
          {/* Waveform animation */}
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
          {/* Per-syllable breakdown */}
          {result.syllables.map((syl, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: syllables are positional
            <div key={i} className="space-y-1.5">
              {/* Header row: tone marker */}
              <p className="text-[10px] text-[#9A9179] font-medium">
                พยางค์ {i + 1} —{' '}
                <span className="font-mono text-[#3D3630]">
                  {syl.initial}
                  {syl.final}
                </span>{' '}
                <span className="text-[#C4704B]">{toneSymbol(syl.tone)}</span>
              </p>

              <div className="grid grid-cols-[5.5rem_1fr] gap-y-1.5 gap-x-2 text-xs items-center">
                {/* Initial */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[#9A9179]">เสียงต้น</span>
                  <span className="font-mono font-semibold text-[#2C2824] bg-[#F0EBE3] px-1.5 rounded text-[11px]">
                    {syl.initial || '∅'}
                  </span>
                </div>
                <ScoreBar score={syl.initialScore} />

                {/* Final */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[#9A9179]">เสียงสระ</span>
                  <span className="font-mono font-semibold text-[#2C2824] bg-[#F0EBE3] px-1.5 rounded text-[11px]">
                    {syl.final || '∅'}
                  </span>
                </div>
                <ScoreBar score={syl.finalScore} />

                {/* Tone */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[#9A9179]">วรรณยุกต์</span>
                  <span className="font-mono font-semibold text-[#C4704B] bg-[#FFF3ED] px-1.5 rounded text-[11px]">
                    {toneSymbol(syl.tone)}
                  </span>
                </div>
                <ScoreBar score={syl.toneScore} />
              </div>
            </div>
          ))}

          {/* Overall score row */}
          <div className="flex items-center gap-3 pt-1.5 border-t border-[#E8E0D5]">
            <span className="text-xs font-semibold text-[#3D3630] shrink-0">คะแนนรวม</span>
            <div className="flex-1 min-w-0">
              <ScoreBar score={result.overall} />
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
