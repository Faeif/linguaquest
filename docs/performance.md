# Performance Standards — LinguaQuest
# Version: 1.0.0

## 🎯 Performance Targets

```
Core Web Vitals (Target):
LCP (Largest Contentful Paint):   < 2.5s
FID (First Input Delay):          < 100ms
CLS (Cumulative Layout Shift):    < 0.1
INP (Interaction to Next Paint):  < 200ms

API Response Times (p95):
Standard endpoints:   < 500ms
AI endpoints:         < 3,000ms
Realtime (Battle):    < 200ms
Database queries:     < 100ms

Lighthouse Score:
Performance:    ≥ 90
Accessibility:  ≥ 90
Best Practices: ≥ 90
SEO:            ≥ 90
```

---

## 🗃️ Database Performance

### Indexes — Required
```sql
-- SRS: Due cards query (critical — runs every user session)
CREATE INDEX CONCURRENTLY idx_user_progress_due
  ON user_progress(user_id, next_review_at)
  WHERE next_review_at IS NOT NULL;

-- Library: Public decks with score
CREATE INDEX CONCURRENTLY idx_decks_public_score
  ON decks(is_public, score DESC)
  WHERE is_public = true AND is_approved = true;

-- Full-text search on decks
CREATE INDEX CONCURRENTLY idx_decks_fts
  ON decks USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- User stats leaderboard
CREATE INDEX CONCURRENTLY idx_user_stats_weekly_xp
  ON user_stats(weekly_xp DESC);

-- Battle: Active sessions
CREATE INDEX CONCURRENTLY idx_battles_status
  ON battles(status, created_at)
  WHERE status IN ('waiting', 'active');

-- Audit logs: Admin queries
CREATE INDEX CONCURRENTLY idx_audit_logs_admin
  ON audit_logs(admin_id, created_at DESC);
```

### Query Optimization Rules
```typescript
// ❌ N+1 Query — Never do this
const decks = await supabase.from('decks').select('*')
for (const deck of decks.data) {
  const cards = await supabase.from('cards')
    .select('*').eq('deck_id', deck.id)
  // This causes N+1 queries!
}

// ✅ Join in single query
const decks = await supabase
  .from('decks')
  .select(`
    *,
    cards(id, word, meaning_th),
    profiles!decks_user_id_fkey(username, avatar_url)
  `)
  .eq('is_public', true)
  .limit(20)

// ✅ Select only needed columns
const { data } = await supabase
  .from('user_progress')
  .select('card_id, next_review_at, ease_factor') // Not 'select(*)'
  .eq('user_id', userId)
  .lte('next_review_at', new Date().toISOString())
  .limit(100)
```

### Pagination — Always Required
```typescript
// ✅ Cursor-based pagination for large lists
const PAGE_SIZE = 20

export async function getDecksCursor(cursor?: string) {
  let query = supabase
    .from('decks')
    .select('id, title, description, card_count, score')
    .eq('is_public', true)
    .order('score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE + 1) // Fetch one extra to check hasMore

  if (cursor) {
    query = query.lt('score', cursor)
  }

  const { data } = await query
  const hasMore = data!.length > PAGE_SIZE

  return {
    items: data!.slice(0, PAGE_SIZE),
    hasMore,
    nextCursor: hasMore ? data![PAGE_SIZE - 1].score : null,
  }
}
```

---

## ⚡ Caching Strategy

### Redis Cache Layers
```typescript
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

// Cache TTL Constants
export const CACHE_TTL = {
  AI_CARD:          60 * 60 * 24 * 30,  // 30 days (AI responses)
  NEWS_ARTICLE:     60 * 60 * 2,          // 2 hours (news feed)
  LEADERBOARD:      60 * 5,               // 5 minutes
  USER_STATS:       60 * 1,               // 1 minute
  DECK_LIBRARY:     60 * 10,              // 10 minutes
  OXFORD_3000:      60 * 60 * 24 * 365,  // 1 year (pre-generated)
} as const

// Generic cache wrapper
export async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  // Try cache first
  const cached = await redis.get<T>(key)
  if (cached !== null) return cached

  // Fetch fresh data
  const fresh = await fetcher()

  // Store in cache (don't await — fire and forget)
  redis.setex(key, ttl, JSON.stringify(fresh))

  return fresh
}

// Usage example
const cardData = await withCache(
  `ai:card:${word}:th`,
  CACHE_TTL.AI_CARD,
  () => generateCardWithAI(word)
)
```

### Next.js Caching
```typescript
// Static pages with ISR
export const revalidate = 60 // Revalidate every 60 seconds

// Dynamic routes with cache tags
import { unstable_cache } from 'next/cache'

const getCachedDeck = unstable_cache(
  async (deckId: string) => {
    return supabase.from('decks').select('*').eq('id', deckId).single()
  },
  ['deck'],
  {
    revalidate: 300, // 5 minutes
    tags: [`deck-${deckId}`],
  }
)

// Invalidate on update
import { revalidateTag } from 'next/cache'
revalidateTag(`deck-${deckId}`)
```

---

## 🤖 AI Performance Optimization

### Pre-generation Strategy
```typescript
// Oxford 3000 Pre-generate Script (run once)
// Cost: ~฿15 one-time, saves 80%+ on repeated requests

export async function pregenerateOxford3000() {
  const words = await getOxfordWords() // 3,000 words

  for (const word of words) {
    const cacheKey = `ai:card:${word.toLowerCase()}:th`

    // Check if already cached
    const existing = await redis.get(cacheKey)
    if (existing) continue

    // Generate with AI
    const cardData = await generateCardWithAI(word)

    // Cache permanently (1 year TTL)
    await redis.setex(cacheKey, CACHE_TTL.OXFORD_3000, JSON.stringify(cardData))

    // Rate limit: 10 requests/second
    await sleep(100)
  }
}
```

### AI Request Batching
```typescript
// ❌ Multiple sequential AI calls
const meaning = await ai.getMeaning(word)
const ipa = await ai.getIPA(word)
const examples = await ai.getExamples(word)

// ✅ Single AI call for all data
const cardData = await ai.generateFullCard(word)
// Returns: { meaning, ipa, examples, collocations, ... } in one request
```

---

## 📊 Frontend Performance

### Image Optimization
```typescript
// ✅ Always use Next.js Image
import Image from 'next/image'

<Image
  src={avatarUrl}
  alt={username}
  width={40}
  height={40}
  className="rounded-full"
  loading="lazy"           // Lazy load below fold
  placeholder="blur"       // Show blur while loading
  blurDataURL={blurHash}   // Pre-generated blur hash
/>

// ❌ Never use plain <img>
<img src={avatarUrl} /> // No optimization
```

### Code Splitting
```typescript
// ✅ Dynamic imports for heavy components
import dynamic from 'next/dynamic'

const FlashcardStudy = dynamic(
  () => import('@/components/features/study/FlashcardStudy'),
  {
    loading: () => <StudySkeleton />,
    ssr: false, // Client-only (uses animations)
  }
)

const BattleZone = dynamic(
  () => import('@/components/features/battle/BattleZone'),
  { ssr: false }
)
```

### Bundle Analysis
```bash
# Check bundle size before merging
pnpm build
pnpm analyze # Runs @next/bundle-analyzer

# Bundle size targets:
# First load JS: < 200KB
# Per-route JS:  < 100KB
```

---

## 🔄 API Performance

### Response Streaming (AI)
```typescript
// ✅ Stream AI responses for better UX
export async function POST(req: Request) {
  const encoder = new TextEncoder()

  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  // Start AI generation
  const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const result = await model.generateContentStream(prompt)

  // Stream chunks to client
  ;(async () => {
    for await (const chunk of result.stream) {
      const text = chunk.text()
      await writer.write(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
    }
    await writer.write(encoder.encode('data: [DONE]\n\n'))
    await writer.close()
  })()

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

### Database Connection Pooling
```typescript
// Supabase handles connection pooling automatically
// But configure for serverless environments

// apps/web/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerSupabase() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) { cookieStore.set(name, value, options) },
        remove(name, options) { cookieStore.set(name, '', options) },
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: { 'x-app-version': process.env.npm_package_version! },
      },
    }
  )
}
```

---

## 📈 Monitoring & Alerting

### Performance Tracking
```typescript
// Track AI costs per user in PostHog
export async function trackAICost(
  userId: string,
  feature: 'speaking' | 'essay' | 'companion' | 'card_gen',
  tokensUsed: number,
  costUSD: number
) {
  posthog.capture('ai_cost', {
    distinct_id: userId,
    feature,
    tokens_used: tokensUsed,
    cost_usd: costUSD,
    cost_thb: costUSD * 36, // Approx conversion
  })
}

// Alert if single user costs > $1/day
export async function checkAICostAlert(userId: string) {
  const dailyCost = await redis.get<number>(`ai:cost:${userId}:${today()}`)
  if (dailyCost && dailyCost > 1.0) {
    // Auto-limit and alert
    await redis.setex(`ai:blocked:${userId}`, 86400, '1')
    Sentry.captureMessage('AI cost alert', {
      level: 'warning',
      extra: { userId, dailyCost },
    })
  }
}
```

### Azure Budget Alert
```
Set in Azure Portal:
Budget: $200/month
Alert at: 80% ($160) → Email + Slack notification
Alert at: 100% ($200) → Email + auto-scale back
```

---

## ✅ Performance Checklist (Before Deploy)

```
Database:
□ All required indexes created
□ No N+1 queries in new code
□ Pagination on all list endpoints
□ RLS policies not causing full table scans

Caching:
□ AI responses cached in Redis
□ Static pages using ISR
□ Dynamic data using TanStack Query

Frontend:
□ Images using next/image
□ Heavy components lazy-loaded
□ Bundle size < 200KB first load

API:
□ Response time < 500ms (non-AI)
□ AI responses streaming
□ Rate limits configured

Monitoring:
□ Sentry tracking errors
□ PostHog tracking AI costs
□ Azure budget alerts set
□ Lighthouse score ≥ 90
```
