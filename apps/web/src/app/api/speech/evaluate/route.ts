/**
 * POST /api/speech/evaluate
 * Azure Cognitive Services Pronunciation Assessment for Chinese (zh-CN).
 *
 * Request: { audio: base64, referenceText: string, pinyin?: string, language?: string }
 * Response: { score, accuracyScore, fluencyScore, completenessScore, recognized, syllables[] }
 *
 * syllables[] = per-syllable breakdown: initial, final, detectedTone,
 *               initialScore, finalScore, toneScore
 */
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import { type NextRequest, NextResponse } from 'next/server'

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
  'sh', // must check 2-char initials first
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
  // Strip diacritics, normalise ü
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
  const final = base.slice(initial.length)
  return { initial, final, tone }
}

// Detected tone from Azure syllable symbol e.g. "huang2" → 2
function detectedTone(syllableSymbol: string): number {
  const digit = syllableSymbol?.slice(-1)
  const n = Number.parseInt(digit ?? '', 10)
  return Number.isNaN(n) || n < 1 || n > 5 ? 5 : n
}

// ─── Azure JSON types ─────────────────────────────────────────────────────────

interface AzurePhoneme {
  Phoneme?: string
  PronunciationAssessment?: { AccuracyScore?: number }
}

interface AzureSyllable {
  Syllable?: string
  PronunciationAssessment?: { AccuracyScore?: number }
}

interface AzureWord {
  Phonemes?: AzurePhoneme[]
  Syllables?: AzureSyllable[]
}

interface AzureJsonResult {
  NBest?: Array<{ Words?: AzureWord[] }>
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      audio?: string
      referenceText?: string
      pinyin?: string
      language?: string
    }
    const { audio, referenceText, pinyin, language = 'zh-CN' } = body

    const azureKey = process.env.AZURE_SPEECH_KEY
    const azureRegion = process.env.AZURE_SPEECH_REGION

    if (!azureKey || !azureRegion) {
      return NextResponse.json({ error: 'Azure Speech not configured' }, { status: 500 })
    }
    if (!audio || !referenceText) {
      return NextResponse.json({ error: 'Missing audio or referenceText' }, { status: 400 })
    }

    // ── Speech config ──────────────────────────────────────────────────────
    const speechConfig = sdk.SpeechConfig.fromSubscription(azureKey, azureRegion)
    speechConfig.speechRecognitionLanguage = language

    // Enable detailed phoneme + syllable output
    speechConfig.setProperty(sdk.PropertyId.SpeechServiceConnection_RecoMode, 'INTERACTIVE')

    // Pronunciation Assessment at Phoneme granularity
    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme,
      true // enableMiscue
    )

    // ── Audio input: tell Azure the stream is WebM/Opus ────────────────────
    // AudioStreamContainerFormat is not exported in SDK 1.x — use getWaveFormat
    // with AudioFormatTag.WEBM_OPUS (tag value 7) instead.
    const audioBuffer = Buffer.from(audio, 'base64')
    const format = sdk.AudioStreamFormat.getWaveFormat(16000, 16, 1, sdk.AudioFormatTag.WEBM_OPUS)
    const pushStream = sdk.AudioInputStream.createPushStream(format)
    pushStream.write(
      audioBuffer.buffer.slice(
        audioBuffer.byteOffset,
        audioBuffer.byteOffset + audioBuffer.byteLength
      ) as ArrayBuffer
    )
    pushStream.close()

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream)
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)
    pronunciationConfig.applyTo(recognizer)

    // ── Recognize ──────────────────────────────────────────────────────────
    const result = await new Promise<sdk.SpeechRecognitionResult>((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        (res) => {
          recognizer.close()
          resolve(res)
        },
        (err) => {
          recognizer.close()
          reject(new Error(err))
        }
      )
    })

    if (result.reason === sdk.ResultReason.NoMatch) {
      return NextResponse.json({
        score: 0,
        accuracyScore: 0,
        fluencyScore: 0,
        completenessScore: 0,
        recognized: '',
        syllables: [],
      })
    }
    if (result.reason !== sdk.ResultReason.RecognizedSpeech) {
      return NextResponse.json(
        { error: 'Recognition failed', reason: result.reason },
        { status: 422 }
      )
    }

    const assessment = sdk.PronunciationAssessmentResult.fromResult(result)

    // ── Parse JSON result for syllable/phoneme detail ──────────────────────
    const jsonResult = JSON.parse(
      result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult) ?? '{}'
    ) as AzureJsonResult
    const words = jsonResult?.NBest?.[0]?.Words ?? []

    // Parse expected pinyin syllables
    const pinyinSyllables = pinyin ? pinyin.split(/\s+/).map(parsePinyinSyllable) : []

    // Build per-syllable breakdown
    const syllables = words.flatMap((word, wi) => {
      return (word.Syllables ?? []).map((syl, si) => {
        const phonemes = word.Phonemes ?? []

        // Split phonemes into initial + final group
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

        // Tone score: if detected tone matches expected → syllable accuracy, else penalise
        const detectedToneNum = detectedTone(syl.Syllable ?? '')
        const expected = pinyinSyllables[wi * (word.Syllables?.length ?? 1) + si]
        const expectedToneNum = expected?.tone ?? 5
        const tonesMatch = detectedToneNum === expectedToneNum
        const rawSylScore = Math.round(syl.PronunciationAssessment?.AccuracyScore ?? 0)
        const toneScore = tonesMatch ? rawSylScore : Math.round(rawSylScore * 0.5)

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
          syllableScore: rawSylScore,
        }
      })
    })

    return NextResponse.json({
      score: Math.round(assessment.pronunciationScore),
      accuracyScore: Math.round(assessment.accuracyScore),
      fluencyScore: Math.round(assessment.fluencyScore),
      completenessScore: Math.round(assessment.completenessScore),
      recognized: result.text,
      syllables,
    })
  } catch (err) {
    console.error('[/api/speech/evaluate] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
