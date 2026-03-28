import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import { type NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 15

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'zh-CN-XiaoxiaoNeural' } = await req.json()

    const azureKey = process.env.AZURE_SPEECH_KEY
    const azureRegion = process.env.AZURE_SPEECH_REGION

    if (!azureKey || !azureRegion) {
      return NextResponse.json({ error: 'Azure Speech not configured' }, { status: 500 })
    }

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 })
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(azureKey, azureRegion)
    speechConfig.speechSynthesisVoiceName = voice
    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3

    // Synthesize to in-memory buffer
    const synthesizer = new sdk.SpeechSynthesizer(
      speechConfig,
      undefined as unknown as sdk.AudioConfig
    )

    const audioBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        (result) => {
          synthesizer.close()
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            resolve(result.audioData)
          } else {
            reject(new Error(`TTS failed: ${result.errorDetails}`))
          }
        },
        (err) => {
          synthesizer.close()
          reject(new Error(err))
        }
      )
    })

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    console.error('[/api/speech/tts] error:', err)
    return NextResponse.json({ error: 'TTS failed' }, { status: 500 })
  }
}
