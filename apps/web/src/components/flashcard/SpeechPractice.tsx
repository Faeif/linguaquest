'use client'

/**
 * SpeechPractice — inline pronunciation scorer on the FlashCard back face.
 *
 * Flow: idle → recording → analyzing → done | error
 * Uses Azure Cognitive Services Pronunciation Assessment via /api/speech/evaluate.
 * Displays Initial / Final / Tone breakdown per syllable (SpeechSuper-style).
 */

import { Mic, MicOff, RefreshCw } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SyllableResult {
  syllable: string
  detectedInitial: string
  detectedFinal: string
  detectedTone: number
  detectedToneName: string
  expectedInitial: string
  expectedFinal: string
  expectedTone: number
  expectedToneName: string
  initialScore: number
  finalScore: number
  toneScore: number
}

interface AzureResult {
  score: number
  accuracyScore: number
  fluencyScore: number
  completenessScore: number
  recognized: string
  syllables: SyllableResult[]
  debug?: string
}

type PracticeState = 'idle' | 'recording' | 'analyzing' | 'done' | 'error' | 'unsupported'

// ─── Score helpers ────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  return score >= 80 ? '#6B7F5E' : score >= 60 ? '#C4704B' : '#B56B6B'
}

function ScoreChip({ score }: { score: number }) {
  const color = scoreColor(score)
  const icon = score >= 80 ? '✓' : score >= 60 ? '△' : '✗'
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold tabular-nums"
      style={{ color }}
    >
      {icon} {score}
    </span>
  )
}

// ─── Waveform bars ────────────────────────────────────────────────────────────

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

// ─── WAV encoder ──────────────────────────────────────────────────────────────
// Azure Speech REST API works most reliably with WAV PCM 16kHz mono.
// We decode whatever MediaRecorder captured (WebM/OGG/MP4) via AudioContext,
// resample to 16 kHz mono, then encode as a proper WAV file.

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const dataLen = samples.length * 2 // 16-bit PCM
  const buf = new ArrayBuffer(44 + dataLen)
  const view = new DataView(buf)
  const str = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i))
  }
  str(0, 'RIFF')
  view.setUint32(4, 36 + dataLen, true)
  str(8, 'WAVE')
  str(12, 'fmt ')
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  str(36, 'data')
  view.setUint32(40, dataLen, true)
  let off = 44
  for (const s of samples) {
    const c = Math.max(-1, Math.min(1, s))
    view.setInt16(off, c < 0 ? c * 0x8000 : c * 0x7fff, true)
    off += 2
  }
  return new Blob([buf], { type: 'audio/wav' })
}

async function toWav(blob: Blob, targetRate = 16000): Promise<Blob> {
  const arrayBuf = await blob.arrayBuffer()
  const audioCtx = new AudioContext()
  const decoded = await audioCtx.decodeAudioData(arrayBuf)
  await audioCtx.close()
  const sampleCount = Math.ceil(decoded.duration * targetRate)
  const offline = new OfflineAudioContext(1, sampleCount, targetRate)
  const src = offline.createBufferSource()
  src.buffer = decoded
  src.connect(offline.destination)
  src.start()
  const rendered = await offline.startRendering()
  return encodeWav(rendered.getChannelData(0), targetRate)
}

// ─── Syllable breakdown table ─────────────────────────────────────────────────

function SyllableTable({ syl, idx }: { syl: SyllableResult; idx: number }) {
  const rows = [
    {
      label: 'เสียงต้น (声母)',
      expected: syl.expectedInitial || '∅',
      detected: syl.detectedInitial || '∅',
      score: syl.initialScore,
    },
    {
      label: 'เสียงสระ (韵母)',
      expected: syl.expectedFinal || '∅',
      detected: syl.detectedFinal || '∅',
      score: syl.finalScore,
    },
    {
      label: 'วรรณยุกต์ (声调)',
      expected: syl.expectedToneName,
      detected: syl.detectedToneName,
      score: syl.toneScore,
    },
  ]

  return (
    <div className="space-y-1">
      {idx > 0 && <div className="h-px bg-[#F0EBE3] my-1" />}
      <div className="grid grid-cols-[5.5rem_1fr_1fr_2.5rem] gap-x-2 mb-0.5">
        <span className="text-[9px] text-[#C8C2BB] uppercase tracking-wider" />
        <span className="text-[9px] text-[#9A9179] uppercase tracking-wider">เป้าหมาย</span>
        <span className="text-[9px] text-[#9A9179] uppercase tracking-wider">ที่ได้ยิน</span>
        <span className="text-[9px] text-[#9A9179] uppercase tracking-wider text-right">คะแนน</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[5.5rem_1fr_1fr_2.5rem] gap-x-2 items-center text-xs py-0.5"
        >
          <span className="text-[#9A9179] leading-tight">{row.label}</span>
          <span className="font-mono font-semibold text-[#2C2824] bg-[#F0EBE3] px-1.5 py-0.5 rounded text-[11px] truncate">
            {row.expected}
          </span>
          <span
            className="font-mono font-semibold px-1.5 py-0.5 rounded text-[11px] truncate"
            style={{
              color: row.expected === row.detected ? '#6B7F5E' : '#B56B6B',
              background: row.expected === row.detected ? '#EBF2E8' : '#F5E8E8',
            }}
          >
            {row.detected}
          </span>
          <div className="flex justify-end">
            <ScoreChip score={row.score} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SpeechPracticeProps {
  word: string // Chinese hanzi e.g. "黄"
  pinyin: string // pinyin with tone marks e.g. "huáng"
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
          const rawBlob = new Blob(chunksRef.current, { type: mimeType })

          if (rawBlob.size === 0) {
            setErrorMsg('ไม่ได้รับเสียง — กรุณากดค้างแล้วพูด แล้วกดหยุด')
            setState('error')
            return
          }

          // Convert to WAV PCM 16 kHz — Azure's most reliable input format
          const wavBlob = await toWav(rawBlob)
          const base64 = await blobToBase64(wavBlob)

          if (!base64) {
            setErrorMsg('แปลงเสียงไม่สำเร็จ — ลองอีกครั้ง')
            setState('error')
            return
          }

          const res = await fetch('/api/speech/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audio: base64,
              mimeType: 'audio/wav',
              referenceText: word,
              pinyin,
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
  }, [word, pinyin])

  const stopRecording = useCallback(() => {
    const rec = recorderRef.current
    if (rec?.state === 'recording') {
      // requestData flushes any buffered audio before stop fires onstop
      rec.requestData()
      rec.stop()
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setErrorMsg('')
    setState('idle')
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-3 bg-[#FAF7F2] border border-[#E8E0D5] rounded-xl space-y-3 fade-slide-up">
      {/* Header */}
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
            <span className="font-semibold text-[#2C2824] text-sm flex-1">
              {result.recognized || '—'}
            </span>
            {result.recognized && result.recognized.trim() === word ? (
              <span className="text-[#6B7F5E] text-xs font-semibold shrink-0">✓ ตรง</span>
            ) : result.recognized ? (
              <span className="text-[#B56B6B] text-xs font-semibold shrink-0">✗ ไม่ตรง</span>
            ) : null}
          </div>

          {/* Per-syllable breakdown — always show table, never bars */}
          {result.syllables.length > 0 ? (
            <div className="bg-[#FFFEFB] border border-[#E8E0D5] rounded-lg px-3 py-2.5 space-y-1">
              {result.syllables.map((syl, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: syllables are positional
                <SyllableTable key={i} syl={syl} idx={i} />
              ))}
            </div>
          ) : (
            /* No syllable data: Azure didn't hear clearly */
            <div className="flex flex-col items-center gap-1.5 py-3 bg-[#FFFEFB] border border-[#E8E0D5] rounded-lg">
              <p className="text-xs text-[#B56B6B] font-medium">ไม่ได้ยินเสียงชัดเจน</p>
              <p className="text-[10px] text-[#9A9179]">พูดใกล้ไมค์มากขึ้น แล้วออกเสียงให้ชัด</p>
              {result.debug && (
                <p className="text-[9px] text-[#C8C2BB] font-mono mt-0.5 text-center break-all px-2">
                  {result.debug}
                </p>
              )}
            </div>
          )}

          {/* Overall score + retry */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#3D3630] shrink-0">คะแนนรวม</span>
            <div className="flex-1 h-1.5 bg-[#E8E0D5] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${result.score}%`, backgroundColor: scoreColor(result.score) }}
              />
            </div>
            <span
              className="text-sm font-bold shrink-0 w-7 text-right tabular-nums"
              style={{ color: scoreColor(result.score) }}
            >
              {result.score}
            </span>
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
