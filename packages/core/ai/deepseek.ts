/**
 * DeepSeek V3.2 — Chinese Specialist
 * Use for: Card generation, AI Companion chat, Essay grading, Grammar analysis
 */
import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModelV3 } from '@ai-sdk/provider'

function getDeepSeekApiKey(): string {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) {
    throw new Error('DEEPSEEK_API_KEY is not set')
  }
  return key
}

export const deepseek = createOpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
  apiKey: getDeepSeekApiKey(),
})

export function getChineseModel(): LanguageModelV3 {
  return deepseek(process.env.DEEPSEEK_MODEL || 'deepseek-chat')
}
