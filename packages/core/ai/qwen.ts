/**
 * Qwen3 — Thai Explainer
 * Use for: Translating feedback to Thai, explaining grammar in Thai
 */
import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModelV3 } from '@ai-sdk/provider'

let _qwen: ReturnType<typeof createOpenAI>

function getQwen() {
  if (!_qwen) {
    const apiKey = process.env.ALIBABA_CLOUD_API_KEY
    if (!apiKey) {
      throw new Error('ALIBABA_CLOUD_API_KEY is not set')
    }
    _qwen = createOpenAI({
      baseURL:
        process.env.QWEN3_CHAT_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      apiKey,
    })
  }
  return _qwen
}

export const qwen = new Proxy(() => {}, {
  apply(_target, _thisArg, argumentsList) {
    return (getQwen() as unknown as (...args: unknown[]) => unknown)(...argumentsList)
  },
  get(_target, prop, receiver) {
    return Reflect.get(getQwen(), prop, receiver)
  },
}) as unknown as ReturnType<typeof createOpenAI>

export function getThaiModel(): LanguageModelV3 {
  return qwen(process.env.QWEN3_CHAT_MODEL || 'qwen-max')
}
