import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import { type NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 15 // seconds

export async function POST(req: NextRequest) {
  try {
    const { audio, referenceText, language = 'zh-CN' } = await req.json()

    const azureKey = process.env.AZURE_SPEECH_KEY
    const azureRegion = process.env.AZURE_SPEECH_REGION

    if (!azureKey || !azureRegion) {
      return NextResponse.json({ error: 'Azure Speech not configured' }, { status: 500 })
    }

    if (!audio || !referenceText) {
      return NextResponse.json({ error: 'Missing audio or referenceText' }, { status: 400 })
    }

    // Decode base64 audio to buffer
    const audioBuffer = Buffer.from(audio, 'base64')

    // Build Azure speech config
    const speechConfig = sdk.SpeechConfig.fromSubscription(azureKey, azureRegion)
    speechConfig.speechRecognitionLanguage = language

    // Pronunciation Assessment config (Phoneme granularity for per-character scoring)
    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Phoneme
    )

    // Use push stream so we can feed the audio buffer directly (no file path needed)
    const pushStream = sdk.AudioInputStream.createPushStream()
    // Convert Node.js Buffer to ArrayBuffer
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
      return NextResponse.json({ score: 0, recognized: '', phonemes: [] })
    }

    if (result.reason !== sdk.ResultReason.RecognizedSpeech) {
      return NextResponse.json(
        { error: 'Recognition failed', reason: result.reason },
        { status: 422 }
      )
    }

    const assessment = sdk.PronunciationAssessmentResult.fromResult(result)

    // Map phoneme-level scores for character coloring
    const phonemes: Array<{ phoneme: string; score: number }> = []
    const jsonResult = JSON.parse(
      result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult) || '{}'
    )
    const words = jsonResult?.NBest?.[0]?.Words ?? []

    for (const word of words) {
      for (const ph of word.Phonemes ?? []) {
        phonemes.push({
          phoneme: ph.Phoneme ?? '',
          score: Math.round(ph.PronunciationAssessment?.AccuracyScore ?? 0),
        })
      }
    }

    return NextResponse.json({
      score: Math.round(assessment.pronunciationScore),
      accuracyScore: Math.round(assessment.accuracyScore),
      fluencyScore: Math.round(assessment.fluencyScore),
      completenessScore: Math.round(assessment.completenessScore),
      recognized: result.text,
      phonemes,
    })
  } catch (err) {
    console.error('[/api/speech/evaluate] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
