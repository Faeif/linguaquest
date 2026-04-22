/**
 * POST /api/speech/evaluate
 * Azure Cognitive Services Pronunciation Assessment — REST API (no SDK).
 *
 * Using the REST API directly avoids the SDK's audio-format issues with WebM/Opus.
 * Endpoint: https://{region}.stt.speech.microsoft.com/speech/recognition/conversation/…
 * Pronunciation-Assessment header carries base64-encoded JSON config.
 *
 * Request:  { audio: base64, referenceText: string, pinyin?: string, language?: string }
 * Response: { score, accuracyScore, fluencyScore, completenessScore, recognized, syllables[] }
 */
import { type NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 20

// ─── Pinyin helpers ───────────────────────────────────────────────────────────

const TONE_MARKS: Record<string, number> = {
  ā: 1,
  á: 2,
  ǎ: 3,
  à: 4,
  ē: 1,
  é: 2,
  ě: 3,
  è: 4,
  ī: 1,
  í: 2,
  ǐ: 3,
  ì: 4,
  ō: 1,
  ó: 2,
  ǒ: 3,
  ò: 4,
  ū: 1,
  ú: 2,
  ǔ: 3,
  ù: 4,
  ǖ: 1,
  ǘ: 2,
  ǚ: 3,
  ǜ: 4,
}

const INITIALS = [
  'zh',
  'ch',
  'sh',
  'b',
  'p',
  'm',
  'f',
  'd',
  't',
  'n',
  'l',
  'g',
  'k',
  'h',
  'j',
  'q',
  'x',
  'r',
  'z',
  'c',
  's',
  'y',
  'w',
]

const TONE_NAME: Record<number, string> = {
  1: 'เสียงระดับ (¯)',
  2: 'เสียงขึ้น (↗)',
  3: 'เสียงต่ำ (↘↗)',
  4: 'เสียงตก (↘)',
  5: 'เสียงเบา (·)',
}

function parsePinyinSyllable(py: string): { initial: string; final: string; tone: number } {
  let tone = 5
  for (const [mark, num] of Object.entries(TONE_MARKS)) {
    if (py.includes(mark)) {
      tone = num
      break
    }
  }
  const base = py
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ü/g, 'u')
    .toLowerCase()
    .trim()
  let initial = ''
  for (const ini of INITIALS) {
    if (base.startsWith(ini)) {
      initial = ini
      break
    }
  }
  return { initial, final: base.slice(initial.length), tone }
}

function detectedTone(syllableSymbol: string): number {
  const digit = syllableSymbol?.slice(-1)
  const n = Number.parseInt(digit ?? '', 10)
  return Number.isNaN(n) || n < 1 || n > 5 ? 5 : n
}

// ─── Azure REST response types ────────────────────────────────────────────────

interface AzurePAScore {
  AccuracyScore?: number
  FluencyScore?: number
  CompletenessScore?: number
  PronScore?: number
  ErrorType?: string
}

interface AzurePhoneme {
  Phoneme?: string
  PronunciationAssessment?: AzurePAScore
}

interface AzureSyllable {
  Syllable?: string
  PronunciationAssessment?: AzurePAScore
}

interface AzureWord {
  Word?: string
  PronunciationAssessment?: AzurePAScore
  Syllables?: AzureSyllable[]
  Phonemes?: AzurePhoneme[]
}

interface AzureNBest {
  Confidence?: number
  Lexical?: string
  ITN?: string
  Display?: string
  PronunciationAssessment?: AzurePAScore
  Words?: AzureWord[]
}

interface AzureSpeechResult {
  RecognitionStatus?: string
  DisplayText?: string
  NBest?: AzureNBest[]
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await req.json()) as {
      audio?: string
      mimeType?: string
      referenceText?: string
      pinyin?: string
      language?: string
    }
    const { audio, mimeType = 'audio/wav', referenceText, pinyin, language = 'zh-CN' } = body

    const azureKey = process.env.AZURE_SPEECH_KEY
    const azureRegion = process.env.AZURE_SPEECH_REGION

    if (!azureKey || !azureRegion) {
      return NextResponse.json({ error: 'Azure Speech not configured' }, { status: 500 })
    }
    if (!audio || !referenceText) {
      return NextResponse.json({ error: 'Missing audio or referenceText' }, { status: 400 })
    }

    // ── Build Pronunciation-Assessment header (base64 JSON) ────────────────
    const paConfig = {
      ReferenceText: referenceText,
      GradingSystem: 'HundredMark',
      Granularity: 'Phoneme',
      EnableMiscue: true,
    }
    const paHeader = Buffer.from(JSON.stringify(paConfig)).toString('base64')

    // ── Call Azure REST API ────────────────────────────────────────────────
    const audioBuffer = Buffer.from(audio, 'base64')
    const url =
      `https://${azureRegion}.stt.speech.microsoft.com` +
      `/speech/recognition/conversation/cognitiveservices/v1` +
      `?language=${language}&format=detailed&profanity=removed`

    // For WAV, add explicit codec+samplerate so Azure knows exactly what it's getting
    const contentType =
      mimeType === 'audio/wav' ? 'audio/wav; codecs=audio/pcm; samplerate=16000' : mimeType

    console.log(
      '[evaluate] sending',
      audioBuffer.length,
      'bytes as',
      contentType,
      'ref:',
      referenceText
    )

    const azureRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureKey,
        'Content-Type': contentType,
        'Pronunciation-Assessment': paHeader,
      },
      body: audioBuffer,
    })

    if (!azureRes.ok) {
      const errText = await azureRes.text()
      console.error('[evaluate] Azure REST error:', azureRes.status, errText)
      return NextResponse.json({ error: `Azure error ${azureRes.status}` }, { status: 502 })
    }

    const raw = (await azureRes.json()) as AzureSpeechResult
    // Log full raw response for debugging
    const nBestRaw = raw.NBest?.[0]
    console.log('[evaluate] status:', raw.RecognitionStatus, 'display:', raw.DisplayText)
    console.log('[evaluate] pa:', JSON.stringify(nBestRaw?.PronunciationAssessment))
    console.log('[evaluate] words[0]:', JSON.stringify(nBestRaw?.Words?.[0]).slice(0, 1200))

    if (raw.RecognitionStatus !== 'Success') {
      // NoMatch — user was silent or audio too short
      return NextResponse.json({
        score: 0,
        accuracyScore: 0,
        fluencyScore: 0,
        completenessScore: 0,
        recognized: '',
        syllables: [],
        debug: raw.RecognitionStatus ?? 'unknown',
      })
    }

    // ── Parse overall scores ───────────────────────────────────────────────
    const nBest = raw.NBest?.[0]
    const pa = nBest?.PronunciationAssessment
    const rawRecognized = nBest?.ITN ?? nBest?.Lexical ?? raw.DisplayText ?? ''
    // Strip all punctuation (Chinese + ASCII) then trim
    const recognized = rawRecognized.replace(/[。，！？、.,!?;:]/g, '').trim()
    const words = nBest?.Words ?? []

    // ── If Azure heard only noise / punctuation → treat as no-match ───────
    if (!recognized && words.length === 0) {
      const debugInfo = `Success/empty — ITN:"${nBest?.ITN ?? ''}" Lex:"${nBest?.Lexical ?? ''}" Disp:"${raw.DisplayText ?? ''}"`
      console.log('[evaluate] no-match after Success:', debugInfo)
      return NextResponse.json({
        score: 0,
        accuracyScore: 0,
        fluencyScore: 0,
        completenessScore: 0,
        recognized: '',
        syllables: [],
        debug: debugInfo,
      })
    }

    // ── Parse expected pinyin ──────────────────────────────────────────────
    const pinyinSyllables = pinyin ? pinyin.split(/\s+/).map(parsePinyinSyllable) : []

    // ── Build per-syllable breakdown ───────────────────────────────────────
    let syllableIdx = 0
    const syllables = words.flatMap((word) =>
      (word.Syllables ?? []).map((syl) => {
        const phonemes = word.Phonemes ?? []
        const firstPhoneme = phonemes[0]?.Phoneme?.toLowerCase() ?? ''
        const hasInitial = INITIALS.some((ini) => firstPhoneme === ini)

        const initialPh = hasInitial ? phonemes[0] : null
        const finalPhs = hasInitial ? phonemes.slice(1) : phonemes

        const initialScore = Math.round(
          initialPh?.PronunciationAssessment?.AccuracyScore ??
            syl.PronunciationAssessment?.AccuracyScore ??
            0
        )
        const finalScore =
          finalPhs.length > 0
            ? Math.round(
                finalPhs.reduce(
                  (acc, p) => acc + (p.PronunciationAssessment?.AccuracyScore ?? 0),
                  0
                ) / finalPhs.length
              )
            : Math.round(syl.PronunciationAssessment?.AccuracyScore ?? 0)

        const detectedToneNum = detectedTone(syl.Syllable ?? '')
        const expected = pinyinSyllables[syllableIdx]
        syllableIdx++

        const expectedToneNum = expected?.tone ?? 5
        const rawSylScore = Math.round(syl.PronunciationAssessment?.AccuracyScore ?? 0)
        const toneScore =
          detectedToneNum === expectedToneNum ? rawSylScore : Math.round(rawSylScore * 0.5)

        return {
          syllable: syl.Syllable ?? '',
          detectedInitial: initialPh?.Phoneme ?? '',
          detectedFinal: finalPhs.map((p) => p.Phoneme ?? '').join(''),
          detectedTone: detectedToneNum,
          detectedToneName: TONE_NAME[detectedToneNum] ?? '',
          expectedInitial: expected?.initial ?? '',
          expectedFinal: expected?.final ?? '',
          expectedTone: expectedToneNum,
          expectedToneName: TONE_NAME[expectedToneNum] ?? '',
          initialScore,
          finalScore,
          toneScore,
        }
      })
    )

    return NextResponse.json({
      _v: 3,
      score: Math.round(pa?.PronScore ?? 0),
      accuracyScore: Math.round(pa?.AccuracyScore ?? 0),
      fluencyScore: Math.round(pa?.FluencyScore ?? 0),
      completenessScore: Math.round(pa?.CompletenessScore ?? 0),
      recognized,
      syllables,
      _debug: {
        status: raw.RecognitionStatus,
        pa: nBest?.PronunciationAssessment,
        wordCount: nBest?.Words?.length ?? 0,
        word0: nBest?.Words?.[0]
          ? {
              word: nBest.Words[0].Word,
              pa: nBest.Words[0].PronunciationAssessment,
              syllables: nBest.Words[0].Syllables,
              phonemes: nBest.Words[0].Phonemes,
            }
          : null,
      },
    })
  } catch (err) {
    console.error('[/api/speech/evaluate] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
