/**
 * AI Enrichment — DeepSeek V3.2 (Chinese Specialist)
 *
 * Fills in Thai definition + example sentences for a Chinese word.
 * SERVER-SIDE ONLY — requires DEEPSEEK_API_KEY environment variable.
 */

import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import type { ExampleSentence } from './types'

const SYSTEM_PROMPT = `You are a Chinese-Thai language expert specializing in teaching Mandarin to Thai speakers.
Return ONLY valid JSON. No markdown fences. No extra text.`

export interface EnrichedContent {
  thai_meaning: string
  example_sentences: ExampleSentence[]
}

/**
 * Enrich a Chinese word with Thai meaning + example sentences via DeepSeek V3.2.
 *
 * @param hanzi          - Chinese word, e.g. "学习"
 * @param pinyin         - Numbered pinyin, e.g. "xue2 xi2"
 * @param english_meaning - English gloss from HanziJS, used as context
 */
export async function enrichCardWithThai(
  hanzi: string,
  pinyin: string,
  english_meaning: string
): Promise<EnrichedContent> {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    console.warn('DEEPSEEK_API_KEY is not set. Skipping AI enrichment.')
    return {
      thai_meaning: '',
      example_sentences: [],
    }
  }

  const deepseek = createOpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey,
  })

  const { text } = await generateText({
    model: deepseek('deepseek-chat'),
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Translate this Chinese word into Thai and provide 2 beginner-friendly example sentences.

Word: ${hanzi}
Pinyin: ${pinyin}
English: ${english_meaning}

Return this exact JSON shape:
{
  "thai_meaning": "<short Thai meaning, 1–5 words, natural Thai>",
  "example_sentences": [
    { "chinese": "<simple sentence using ${hanzi}>", "pinyin": "<full pinyin with tones>", "thai": "<natural Thai translation>" },
    { "chinese": "<another simple sentence>", "pinyin": "<full pinyin>", "thai": "<Thai translation>" }
  ]
}

Rules:
- thai_meaning: concise, avoid English loanwords
- Use simplified Chinese characters only
- Sentences should be HSK 1–3 level vocabulary`,
      },
    ],
  })

  const parsed: EnrichedContent = JSON.parse(text)
  return {
    thai_meaning: parsed.thai_meaning ?? '',
    example_sentences: parsed.example_sentences ?? [],
  }
}
