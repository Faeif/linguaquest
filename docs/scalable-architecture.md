# Scalable Architecture — LinguaQuest
# Version: 1.0.0

## 🏗️ Architecture Evolution by Phase

```
Phase 1 (0-5K MAU):    Monolith on Vercel + Supabase
Phase 2 (5K-50K MAU):  Same stack + more caching
Phase 3 (50K-200K MAU): Add read replicas + CDN optimization
Phase 4 (200K-1M MAU): Microservices for AI + multi-region
Phase 5 (1M+ MAU):     Full multi-region + dedicated infra
```

---

## Phase 1-2 — Current Architecture (0-50K MAU)

```
┌─────────────────────────────────────────────┐
│            Cloudflare (CDN + DDoS)           │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│         Vercel Edge Network                  │
│    Next.js 15 (Web + API Routes)             │
│    Region: Singapore (closest to TH)         │
└──────┬───────────┬───────────────────────────┘
       │           │
┌──────▼───┐ ┌─────▼──────────────────────────┐
│ Upstash  │ │        Supabase (Singapore)      │
│  Redis   │ │  PostgreSQL + Auth + Realtime    │
│  QStash  │ │  RLS on every table              │
└──────────┘ └────────────────────────────────┘
       │
┌──────▼───────────────────────────────────────┐
│            External AI Services               │
│  Gemini Flash/Pro  │  Azure Speech API        │
└──────────────────────────────────────────────┘
```

---

## Phase 3 — Scale Out (50K-200K MAU)

### เพิ่ม Supabase Read Replicas
```
Write traffic → Primary DB (Singapore)
Read traffic  → Read Replica (Singapore + Bangkok TH)

ทำใน Supabase Dashboard:
Settings → Database → Read Replicas → Add replica

Code change (minimal):
```typescript
// packages/db/client.ts
export function createReadClient() {
  return createClient(
    process.env.SUPABASE_READ_REPLICA_URL!,  // New env var
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Usage: read-heavy queries use readClient
const cards = await createReadClient()
  .from('cards')
  .select('*')
  .eq('deck_id', deckId)
```

### เพิ่ม Redis Caching Layers
```typescript
// Cache hierarchy:
// 1. Next.js ISR (static pages, 60s)
// 2. Redis (dynamic data, 1min-30days)
// 3. Database (source of truth)

// Aggressive caching for read-heavy data:
const CACHE_STRATEGY = {
  // ไม่ค่อยเปลี่ยน = cache นาน
  officialDecks:     60 * 60,        // 1 hour
  cardContent:       60 * 60 * 24,   // 1 day
  aiCardGeneration:  60 * 60 * 24 * 30, // 30 days
  newsAnnotations:   60 * 60 * 2,    // 2 hours

  // เปลี่ยนบ่อย = cache สั้น
  leaderboard:       60 * 5,         // 5 min
  userStats:         60,             // 1 min
  battleState:       5,              // 5 sec
}
```

---

## Phase 4 — Multi-region (200K-1M MAU)

### Multi-region Strategy
```
ผู้ใช้ในแต่ละประเทศ → ส่งไปที่ region ที่ใกล้ที่สุด

TH + SEA users  → Singapore (SIN)
JP + KR users   → Tokyo (TYO)    [Phase 5+]
EU users        → Frankfurt (FRA) [Phase 6+]

Cloudflare Routes:
*.linguaquest.app → Nearest Vercel region
/api/ai/*         → AI processing region
/api/battle/*     → Same region as both players
```

### Separate AI Service (Phase 4)
```
เมื่อ AI cost > ฿50,000/เดือน
→ แยก AI processing ออกเป็น service แยก

┌─────────────────────────────────────────┐
│           Next.js (Web + Core API)       │
└──────────────────┬──────────────────────┘
                   │ internal API
┌──────────────────▼──────────────────────┐
│         AI Service (Separate)            │
│  - Card generation                       │
│  - Essay grading                         │
│  - Speaking analysis                     │
│  - Companion                             │
│  Deploy: Google Cloud Run                │
│  Region: asia-southeast1 (Singapore)     │
└──────────────────────────────────────────┘

Benefits:
- Scale AI independently
- Cost isolation
- Can switch AI providers easily
- Rate limiting per service
```

### Supabase Multi-region (Phase 4)
```
Primary:  Singapore (WRITE + READ)
Replica:  Bangkok or HK (READ)
Replica:  Tokyo (READ for JP/KR users)

Data residency compliance:
Indonesia → Store sensitive data locally
           Use Supabase on GCP Jakarta region
           or Turso (edge DB with data pinning)
```

---

## Language Scaling Architecture

### Content Delivery per Language
```
Language pack = เก็บใน Cloudflare R2
โหลดตาม user's learning language

Folder structure:
r2://linguaquest-media/
├── audio/
│   ├── en/              ← English pronunciation
│   │   ├── oxford-3000/ ← Pre-generated TTS
│   │   └── ielts-awl/
│   ├── ja/              ← Japanese (Phase 5)
│   │   ├── jlpt-n5/
│   │   └── jlpt-n4/
│   └── ko/              ← Korean (Phase 5)
├── images/
│   └── [lang]/
└── models/              ← TF.js models (Phase 5)
    └── [lang]/
```

### AI Cost per Language
```
English (current):
- Gemini Flash card gen: $0.075/1M tokens
- Azure Pronunciation: $1.32/hr
- Caching saves: 80%

Japanese (Phase 5):
- Gemini Flash card gen: same
- Azure STT only (no pronunciation): $1.32/hr
- Furigana generation: +20% tokens
- Estimated cost: +15% vs English

Arabic (Phase 5+):
- Gemini Flash: same
- Azure STT: same
- RTL rendering: no extra cost
- Right-to-left content: needs review

Chinese (Phase 7):
- Different model needed for tones
- Potential: Azure Mandarin STT
- Stroke order data: custom dataset needed
- Estimated: 2x cost vs English
```

---

## Performance at Scale

### Database Query Optimization per Language
```sql
-- Index สำหรับ multi-language queries
CREATE INDEX idx_cards_target_lang_level
  ON cards(target_lang, proficiency_level)
  WHERE target_lang != 'en';  -- EN มี index แยกอยู่แล้ว

-- Partial index for active languages only
CREATE INDEX idx_cards_active_langs
  ON cards(target_lang)
  WHERE target_lang IN ('en', 'vi', 'id', 'ja', 'ko');

-- JSONB index สำหรับ meaning queries
CREATE INDEX idx_cards_meanings_th
  ON cards USING gin((meanings -> 'th'));

-- ใช้เมื่อต้องการ search by meaning:
-- WHERE meanings @> '{"th": "คลุมเครือ"}'
```

### Translation Caching
```typescript
// Translations cached at multiple levels:

// 1. Build time (static strings)
// apps/web/messages/th.json → bundled in app

// 2. Redis (dynamic content)
const translatedCard = await withCache(
  `card:${cardId}:meanings:${userLang}`,
  CACHE_TTL.AI_CARD,
  () => getCardWithMeaning(cardId, userLang)
)

// 3. Service Worker (offline support)
// Cache language pack for offline use
// sw.ts: cache messages/{lang}.json
```

---

## Monitoring per Language

### Track Language-specific Metrics
```typescript
// PostHog events to track:

// User language distribution
posthog.capture('language_selected', {
  interface_lang: user.interfaceLang,
  learning_lang: user.learningLang,
  native_lang: user.nativeLang,
})

// AI quality per language
posthog.capture('ai_card_generated', {
  target_lang: lang,
  cached: wasCached,
  tokens_used: tokensUsed,
  cost_usd: cost,
  user_rating: rating,  // Did user edit the card?
})

// Speech assessment quality
posthog.capture('speaking_session_complete', {
  target_lang: lang,
  azure_locale: azureLocale,
  session_duration_ms: duration,
  overall_score: score,
  user_satisfaction: thumbsUp,  // Optional feedback
})
```

---

## Tech Recommendations

### ✅ Recommended Additions for Scale

```
1. Turso (LibSQL) — Edge Database
   Use case: ไม่ต้องการ: ยังไม่ถึง Phase 4
   แต่เตรียม interface ไว้:
   - ถ้าต้องการ data locality (Indonesia law)
   - Edge reads ที่เร็วกว่า Supabase
   Implementation: แค่ swap createClient()

2. Cloudflare Workers — Edge AI Cache
   Use case: Pre-warm AI cache ก่อน user ถึง
   Cost: ฿0 สำหรับ 100K requests/วัน
   Pattern: Worker intercepts /api/ai/*
            → check CF cache → Upstash → AI

3. Vector Search (pgvector)
   Use case: Phase 3 — "Similar words" feature
   Implementation: เพิ่ม embedding column ใน cards
   Cost: เพิ่ม ~50% storage สำหรับ cards table
   When: เมื่อมี content > 50,000 cards

4. LangSmith — AI Prompt Management
   Use case: Phase 3 — track prompt performance
   Monitor: ความแม่นยำของ AI responses
   A/B test: prompts ต่างๆ
   Cost: $39/เดือน (Team plan)
```

### ❌ อย่าเพิ่งทำ

```
1. Kubernetes / Docker Swarm
   เมื่อไหร่จึงทำ: เมื่อ Vercel ไม่เพียงพอ (>1M MAU)
   ตอนนี้: Vercel ดีพอ และถูกกว่า ops cost มาก

2. Kafka / Event Streaming
   เมื่อไหร่จึงทำ: เมื่อต้องการ real-time analytics
   ตอนนี้: QStash + PostHog เพียงพอ

3. Separate Auth Service
   เมื่อไหร่จึงทำ: เมื่อ Supabase Auth ไม่เพียงพอ
   ตอนนี้: Supabase Auth รองรับ millions of users

4. Custom ML Models
   เมื่อไหร่จึงทำ: เมื่อมี proprietary data เพียงพอ
                   (>1M user sessions)
   ตอนนี้: Gemini + Azure > custom model
           ทั้งใน accuracy และ cost
```

---

## Checklist — Scale Preparation

```
ทำตั้งแต่ต้น (ไม่ต้อง migrate ทีหลัง):
□ CSS logical properties แทน directional
□ JSONB meanings ใน cards table
□ Language configs เป็น data ไม่ใช่ hardcode
□ dir attribute บน html element
□ Font strategy: only load needed fonts
□ Zod schemas รองรับ multi-lang inputs
□ API responses include language metadata

ทำเมื่อ scale:
□ Phase 3: Add Supabase read replica
□ Phase 3: pgvector for similar words
□ Phase 4: Separate AI service
□ Phase 4: Multi-region Vercel
□ Phase 4: LangSmith for prompt management
□ Phase 5: Cloudflare Workers edge cache
```
