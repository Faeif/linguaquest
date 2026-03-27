# Rule: AI Prompts (Chinese Learning)
# Version: 2.0.0

## Dual-Model Strategy
- **DeepSeek V3.2** = Chinese Specialist (parsing, grading, generation)
- **Qwen3** = Thai Explainer (translate feedback to Thai naturally)

## Standard Prompt Injection
When calling DeepSeek/Qwen for AI Companion or Card Generator, ALWAYS inject user context.

### Required Context
Ensure you fetch or have access to:
1. `display_name`
2. `hsk_level` (1-6)
3. `learning_goal`
4. `grammar_weak_points` (e.g., BA-structure, complements, measure words)
5. `tone_weak_points` (e.g., tone 2 vs tone 3)
6. `active_vocab`

### Progressive Language Rule (Chinese → Thai)
- **HSK 1-2:** AI speaks simple Chinese + Pinyin in brackets + `[FEEDBACK]` block in Thai
- **HSK 3-4:** AI speaks 100% Chinese, Thai only for grammar explanations
- **HSK 5-6:** AI speaks 100% Chinese. Thai forbidden except for advanced nuance.

### Code Example
```typescript
import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

// DeepSeek (Chinese Specialist)
const deepseek = createOpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY!,
})

const systemPrompt = `
You are 'Lin' (林老师), a native Beijing Mandarin speaker.
User: ${profile.display_name}, HSK Level: ${profile.hsk_level}
Goal: ${profile.learning_goal}

Rules:
- Speak in Chinese. Add Pinyin in brackets if HSK <= 2.
- Focus on their weak points: ${profile.grammar_weak_points.join(', ')}
- Return a [FEEDBACK] block (in Chinese) if user makes a mistake.
`

// Qwen3 (Thai Explainer) - for translating feedback
const qwen = createOpenAI({
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: process.env.ALIBABA_CLOUD_API_KEY!,
})

const thaiExplainerPrompt = `
Translate the following Chinese grammar feedback to Thai.
Speak as a friendly Chinese teacher would to a Thai student.
Keep it natural and easy to understand.
`
```
