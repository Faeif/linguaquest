/**
 * DeepSeek V3.2 — Chinese Specialist
 * Use for: Card generation, AI Companion chat, Essay grading, Grammar analysis
 */
import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModelV3 } from '@ai-sdk/provider'

let _deepseek: ReturnType<typeof createOpenAI>

function getDeepSeek() {
  if (!_deepseek) {
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not set')
    }
    _deepseek = createOpenAI({
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      apiKey,
    })
  }
  return _deepseek
}

export const deepseek = new Proxy(() => {}, {
  apply(_target, _thisArg, argumentsList) {
    return (getDeepSeek() as unknown as (...args: unknown[]) => unknown)(...argumentsList)
  },
  get(_target, prop, receiver) {
    return Reflect.get(getDeepSeek(), prop, receiver)
  },
}) as unknown as ReturnType<typeof createOpenAI>

export function getChineseModel(): LanguageModelV3 {
  return deepseek(process.env.DEEPSEEK_MODEL || 'deepseek-chat')
}
