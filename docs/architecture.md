# Architecture — LinguaQuest
# Version: 1.0.0

## 🏗️ Guiding Principles

```
1. API-First
   ทุก feature มี API endpoint ก่อน
   UI เป็นแค่ consumer
   Mobile (Phase 4) ใช้ API เดียวกัน

2. Business Logic Isolation
   packages/core = Pure TypeScript
   Zero framework dependencies
   Web และ Mobile share 100%

3. Managed Services First
   ไม่ self-host อะไรที่ managed service ทำได้
   ลด operational overhead ให้ทีมเล็ก

4. Cache Aggressively
   AI responses: 30 days
   Static content: as long as possible
   Dynamic data: TanStack Query handles

5. Security by Default
   RLS on every table
   Rate limit on every endpoint
   Validate every input with Zod
```

---

## 🔄 Data Flow

```
Client Request
     ↓
Cloudflare (CDN + DDoS protection)
     ↓
Vercel Edge Network
     ↓
Next.js Middleware (Auth check)
     ↓
API Route Handler
  ├── Rate limit check (Upstash Redis)
  ├── Auth verification (Supabase)
  ├── Input validation (Zod)
  ├── Cache check (Redis) ← AI endpoints only
  │     ├── HIT → Return cached response
  │     └── MISS → Continue to business logic
  ├── Business logic (packages/core)
  ├── Database query (Supabase)
  └── Return standardized response
     ↓
Client receives { data, error }
```

---

## 📦 Package Dependencies

```
apps/web depends on:
  - packages/core    (business logic)
  - packages/db      (types + queries)
  - packages/utils   (helpers)

apps/mobile (Phase 4) depends on:
  - packages/core    (same business logic!)
  - packages/db      (same types!)
  - packages/utils   (same helpers!)

packages/core depends on:
  - packages/utils
  - (nothing else — pure TypeScript)

packages/db depends on:
  - @supabase/supabase-js
  - packages/utils
```

---

## 🌐 Deployment Architecture

```
                    ┌─────────────────┐
                    │   Cloudflare    │
                    │  CDN + DDoS     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼─────┐  ┌────▼────┐  ┌──────▼──────┐
        │  Vercel   │  │  R2     │  │  Supabase   │
        │  Next.js  │  │ Storage │  │  (SG region)│
        │  (Edge)   │  │ (Media) │  │  DB+Auth+RT │
        └─────┬─────┘  └─────────┘  └──────┬──────┘
              │                            │
    ┌─────────▼──────────────────┐         │
    │      Upstash               │         │
    │  Redis (Cache+RateLimit)   │         │
    │  QStash (Jobs+Cron)        │         │
    └─────────────────────────── ┘         │
                                           │
    ┌──────────────────────────────────────▼─┐
    │              AI Services               │
    │  DeepSeek V3.2 (Chinese Specialist)    │
    │  Qwen3 (Thai Explainer)                │
    │  Qwen3-ASR (Speech-to-Text)            │
    │  SpeechSuper (Tone/Pronunciation)      │
    └────────────────────────────────────────┘
```

---

## 🔌 External Services Integration

### Supabase
```typescript
// Three client types:
// 1. Server (API routes, Server Components)
import { createServerSupabase } from '@/lib/supabase/server'

// 2. Browser (Client Components)
import { createBrowserSupabase } from '@/lib/supabase/client'

// 3. Admin (Bypass RLS — use sparingly)
import { createAdminSupabase } from '@/lib/supabase/server'
// ⚠️ Only use in background jobs and webhooks
```

### DeepSeek (Chinese Specialist)
```typescript
// packages/core/ai/deepseek.ts
import { createOpenAI } from '@ai-sdk/openai'

export const deepseek = createOpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY!,
})

// Use for: Card generation, AI Companion chat, Essay grading, Grammar analysis
export const chineseModel = deepseek('deepseek-chat', {
  // DeepSeek V3.2 - excellent at Chinese parsing
})
```

### Qwen3 (Thai Explainer)
```typescript
// packages/core/ai/qwen.ts
import { createOpenAI } from '@ai-sdk/openai'

export const qwen = createOpenAI({
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: process.env.ALIBABA_CLOUD_API_KEY!,
})

// Use for: Translating feedback to Thai, explaining grammar in Thai
export const thaiModel = qwen('qwen-max', {
  // Qwen3 with thinking OFF for fast responses
})
```

### SpeechSuper (Pronunciation Assessment)
```typescript
// packages/core/ai/speechsuper.ts
// Use for: Tone assessment, phoneme-level pronunciation scoring

export async function assessPronunciation(audio: Blob, refText: string) {
  const formData = new FormData()
  formData.append('audio', audio)
  formData.append('refText', refText)
  formData.append('coreType', 'cn.word.eval') // Chinese word evaluation

  const response = await fetch('https://api.speechsuper.com/v1/eval', {
    method: 'POST',
    headers: {
      'X-App-Key': process.env.SPEECHSUPER_APP_KEY!,
      'X-App-Secret': process.env.SPEECHSUPER_SECRET_KEY!,
    },
    body: formData,
  })
  return response.json()
}
```

---

## 🔄 Background Jobs (QStash)

```typescript
// Scheduled jobs via QStash cron:

Daily at 13:00 UTC (20:00 ICT):
  POST /api/cron/streak-check
  → Check all users for streak breaks
  → Send reminder notifications

Daily at 02:00 UTC (09:00 ICT):
  POST /api/cron/weekly-reset
  → Reset weekly_xp on Mondays
  → Calculate leaderboard winners

Every 2 hours:
  POST /api/cron/news-fetch
  → Fetch latest articles from BBC/Reuters
  → Run Gemini annotation
  → Store in database

Monthly:
  POST /api/cron/creator-payout
  → Calculate creator earnings
  → Trigger PromptPay transfers
```

---

## 📱 Mobile Readiness (Phase 4)

### What's shared (100%):
```
packages/core/*     → All business logic
packages/db/types   → All TypeScript types
packages/utils/*    → All utilities
API endpoints       → All REST APIs
Supabase Auth       → SDK supports React Native
```

### What's NOT shared:
```
UI Components       → React Native uses different primitives
CSS/Tailwind        → StyleSheet instead
Next.js specifics   → Routing, RSC, etc.
Browser APIs        → Use Expo equivalents
```

### Migration path to mobile:
```bash
# Phase 4: Add Expo app
pnpm dlx create-expo-app@latest apps/mobile --template blank-typescript

# Connect to shared packages
# packages already available via pnpm workspace

# All API calls work identically
# Auth works identically (Supabase RN SDK)
# Business logic works identically (pure TypeScript)
# Only UI needs to be rebuilt (~6-8 weeks)
```
