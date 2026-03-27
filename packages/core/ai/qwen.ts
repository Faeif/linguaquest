/**
 * Qwen3 — Thai Explainer
 * Use for: Translating feedback to Thai, explaining grammar in Thai
 */
import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModelV3 } from '@ai-sdk/provider'

function getAlibabaApiKey(): string {
  const key = process.env.ALIBABA_CLOUD_API_KEY
  if (!key) {
    throw new Error('ALIBABA_CLOUD_API_KEY is not set')
  }
  return key
}

export const qwen = createOpenAI({
  baseURL: process.env.QWEN3_CHAT_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: getAlibabaApiKey(),
})

export function getThaiModel(): LanguageModelV3 {
  return qwen(process.env.QWEN3_CHAT_MODEL || 'qwen-max')
}
