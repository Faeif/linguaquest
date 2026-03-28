import { createOpenAI } from '@ai-sdk/openai'

// DeepSeek — Chinese specialist (Card generation, Essay grader, Grammar correction)
export const deepseekProvider = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com') + '/v1'
})
export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat'
export const deepseek = deepseekProvider.chat(DEEPSEEK_MODEL)

// Qwen3 — Thai explainer & AI Companion Orchestrator
export const qwenProvider = createOpenAI({
  apiKey: process.env.ALIBABA_CLOUD_API_KEY || '',
  baseURL: process.env.QWEN3_CHAT_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
})
export const QWEN_MODEL = process.env.QWEN3_CHAT_MODEL || 'qwen-max'
export const qwen = qwenProvider.chat(QWEN_MODEL)
