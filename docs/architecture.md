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
    │  Gemini Flash/Pro (Text AI)            │
    │  Azure Speech (STT+TTS+Pronunciation)  │
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

### Gemini AI
```typescript
// packages/core/ai/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const flashModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 1000,
  },
})

export const proModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-pro-exp',
  generationConfig: {
    temperature: 0.3, // Lower for essay grading accuracy
    maxOutputTokens: 2000,
  },
})
```

### Azure Speech
```typescript
// packages/core/ai/azure-speech.ts
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

export function createSpeechConfig() {
  const config = sdk.SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY!,
    process.env.AZURE_SPEECH_REGION!
  )
  config.speechRecognitionLanguage = 'en-US'
  config.speechSynthesisLanguage = 'en-US'
  config.speechSynthesisVoiceName = 'en-US-AriaNeural' // Natural voice
  return config
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
