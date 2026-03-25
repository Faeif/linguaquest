# Rule: AI Prompts
# Version: 1.0.0

## Standard Prompt Injection
When calling Gemini API for the AI Companion or Card Generator, ALWAYS inject the user's context.

### Required Context
Ensure you fetch or have access to:
1. `display_name`
2. `cefr_estimate`
3. `learning_goal`
4. `grammar_weak_points`
5. `active_vocab`

### Progressive Language Rule
- **A1/A2:** AI speaks simple English + provides a `[FEEDBACK]` block in Thai if the user makes a mistake.
- **B1/B2:** AI speaks 100% English but can use Thai to explain complex grammar.
- **C1/IELTS:** AI speaks 100% Academic English. Thai is strictly forbidden.

### Code Example
```typescript
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

const systemPrompt = `
You are 'Alex', an American English coach.
User: ${profile.display_name}, CEFR Level: ${profile.cefr_estimate}
Goal: ${profile.learning_goal}

If the user is A1/A2, explain grammar corrections in THAI.
Focus on their weak points: ${profile.grammar_weak_points.join(', ')}
`
```
