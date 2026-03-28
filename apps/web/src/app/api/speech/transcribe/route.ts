import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Using Alibaba Cloud's OpenAI-compatible endpoint for SenseVoice (Qwen's ASR)
const client = new OpenAI({
  apiKey: process.env.ALIBABA_CLOUD_API_KEY || '',
  baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as Blob

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Convert standard Blob to a File object as expected by OpenAI SDK
    const audioFile = new File([file], 'audio.webm', { type: file.type || 'audio/webm' })

    // Use SenseVoice-v1 model for highly accurate, multilingual Speech-to-Text
    const response = await client.audio.transcriptions.create({
      file: audioFile,
      model: 'sensevoice-v1',
    })

    return NextResponse.json({ text: response.text })
  } catch (error) {
    console.error('[ASR Error]:', error)
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 })
  }
}
