# LinguaQuest — Claude Code Instructions
# Version: 1.0.0 | Updated: 2025-03

## 🎯 Project Overview
AI-powered English learning platform for Thai & SEA market.
Team: 4 developers | Stack: Next.js 15 + Supabase + Vercel
Phase: MVP (Week 1-9)

## 🏗️ Architecture Principle
"API-First, UI-Agnostic, Mobile-Ready"

- Business logic อยู่ใน packages/core เท่านั้น
- UI เป็นแค่ consumer ของ API
- ทุก feature ต้องมี API endpoint ก่อน UI เสมอ
- Mobile app (Phase 4) จะ reuse packages/core ทั้งหมด

---

## 📁 Project Structure

```
linguaquest/
├── CLAUDE.md                    ← อ่านทุกครั้งก่อนเริ่ม session
├── apps/
│   ├── web/                     ← Next.js 15 (Primary)
│   │   ├── app/
│   │   │   ├── (auth)/          ← Login, Register, Onboarding
│   │   │   ├── (app)/           ← Protected pages
│   │   │   │   ├── home/
│   │   │   │   ├── learn/
│   │   │   │   ├── battle/      ← Phase 2
│   │   │   │   ├── community/   ← Phase 2
│   │   │   │   └── profile/
│   │   │   └── api/             ← API Routes
│   │   │       ├── auth/
│   │   │       ├── study/
│   │   │       ├── ai/
│   │   │       ├── battle/      ← Phase 2
│   │   │       └── webhooks/
│   │   ├── components/
│   │   │   ├── ui/              ← shadcn/ui components
│   │   │   ├── features/        ← Feature components
│   │   │   └── layouts/
│   │   ├── lib/
│   │   │   ├── supabase/        ← Supabase clients
│   │   │   ├── validations/     ← Zod schemas
│   │   │   └── utils/
│   │   └── hooks/
│   └── mobile/                  ← Expo (Phase 4 - folder ว่างไว้ก่อน)
├── packages/
│   ├── core/                    ← Business logic (NO framework dependencies)
│   │   ├── srs/                 ← SM-2 Algorithm
│   │   ├── ai/                  ← AI prompt builders
│   │   ├── gamification/        ← XP, streak, badges
│   │   └── content-moderation/  ← UGC moderation logic
│   ├── db/
│   │   ├── types/               ← Generated Supabase types
│   │   └── queries/             ← Reusable typed queries
│   └── utils/
│       ├── formatting/
│       ├── constants/
│       └── helpers/
├── supabase/
│   ├── migrations/              ← SQL migrations (version controlled)
│   └── seed.sql                 ← Local dev seed data
└── docs/
    ├── architecture.md
    ├── database.md
    ├── api-contracts.md
    ├── security.md
    ├── performance.md
    └── features/                ← 1 file per feature
```

---

## 🛠️ Tech Stack (Final — Do Not Change)

| Layer | Tool | Version |
|-------|------|---------|
| Framework | Next.js App Router | 15.x |
| Language | TypeScript | strict mode |
| Styling | Tailwind CSS + shadcn/ui | v4 |
| State (Server) | TanStack Query | v5 |
| State (Client) | Zustand | v5 |
| Validation | Zod | v3 |
| Database | Supabase (PostgreSQL) | latest |
| Auth | Supabase Auth | latest |
| Realtime | Supabase Realtime | latest |
| Cache | Upstash Redis | latest |
| Queue | Upstash QStash | latest |
| AI (Text) | Gemini 2.0 Flash/Pro | latest |
| AI (Speech) | Azure Speech API | latest |
| Storage | Cloudflare R2 | latest |
| Deploy | Vercel | latest |
| Linting | Biome | latest |
| Testing | Vitest + Playwright | latest |
| Monitoring | Sentry + PostHog | latest |
| Payment | Omise | latest |

---

## ⚠️ NON-NEGOTIABLE RULES

### TypeScript
```typescript
// ❌ NEVER
const data: any = response
// @ts-ignore
const value = someFunction()

// ✅ ALWAYS
const data: UserProgress = response
const value = someFunction() satisfies ExpectedType
```

### API Routes — Standard Pattern
```typescript
// ✅ Every API route MUST follow this pattern
export async function POST(req: Request) {
  try {
    // 1. Auth check
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json(
      { data: null, error: 'Unauthorized' },
      { status: 401 }
    )

    // 2. Rate limit check
    const { success } = await ratelimit.limit(user.id)
    if (!success) return Response.json(
      { data: null, error: 'Rate limit exceeded' },
      { status: 429 }
    )

    // 3. Input validation (Zod)
    const body = await req.json()
    const input = zSchema.parse(body)

    // 4. Business logic (from packages/core)
    const result = await coreFunction(input)

    // 5. Return standard response
    return Response.json({ data: result, error: null })

  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { data: null, error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    // Log to Sentry
    Sentry.captureException(error)
    return Response.json(
      { data: null, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Database — RLS Required
```sql
-- ✅ Every new table MUST have RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- ✅ Users can only see their own data
CREATE POLICY "users_own_data" ON table_name
  FOR ALL USING (auth.uid() = user_id);
```

### Zod — Single Source of Truth
```typescript
// ✅ Define once, use everywhere
export const zCompleteSession = z.object({
  sessionId: z.string().uuid(),
  results: z.array(z.object({
    cardId: z.string().uuid(),
    rating: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    timeSpent: z.number().positive(),
  })),
})

export type CompleteSessionInput = z.infer<typeof zCompleteSession>
// ใช้เป็น: API input, Form validation, Type definition
```

### Security — Mandatory
```typescript
// ✅ Never expose sensitive data
// ✅ Always sanitize before AI prompts
// ✅ Never store payment data (Omise handles it)
// ✅ Rate limit ALL AI endpoints
// ✅ Validate file uploads (type + size)

// ❌ NEVER hardcode secrets
const apiKey = "sk-xxxx" // NEVER
const apiKey = process.env.GEMINI_API_KEY! // ALWAYS
```

---

## 🚫 DO NOT DO THESE

```
❌ Business logic ใน React components
❌ Direct DB queries ใน components (ใช้ TanStack Query)
❌ useEffect สำหรับ data fetching (ใช้ TanStack Query)
❌ Install packages โดยไม่บอกทีม
❌ Custom UI ถ้า shadcn/ui มีอยู่แล้ว
❌ Skip Zod validation
❌ Skip RLS policy บน table ใหม่
❌ Skip error/loading/empty states
❌ Hardcode strings ภาษาไทย (เตรียมไว้สำหรับ i18n)
❌ Direct AI calls โดยไม่มี rate limiting + caching
❌ Skip Sentry error tracking
```

---

## 📝 Naming Conventions

```
Files:
Components:     PascalCase    → StudyCard.tsx
Pages:          lowercase     → page.tsx
API routes:     lowercase     → route.ts
Utilities:      camelCase     → calculateNextReview.ts
Hooks:          use prefix    → useStudySession.ts
Types:          PascalCase    → UserProgress.ts
Zod schemas:    z prefix      → zUserProgress.ts

Code:
Variables:      camelCase     → userProgress
Constants:      UPPER_SNAKE   → MAX_CARDS_PER_SESSION
DB tables:      snake_case    → user_progress
Functions:      camelCase     → getCardsForReview()
Components:     PascalCase    → FlashcardStudy
Env vars:       UPPER_SNAKE   → NEXT_PUBLIC_SUPABASE_URL
```

---

## 🔄 Git Workflow

```
Branches:
main          → Production (protected, require PR)
develop       → Staging (merge ก่อน main)
feat/xxx      → New feature
fix/xxx       → Bug fix
hotfix/xxx    → Urgent production fix

Commit format (Conventional Commits):
feat:         New feature
fix:          Bug fix
docs:         Documentation
refactor:     Refactor (no behavior change)
test:         Add/fix tests
chore:        Maintenance
perf:         Performance improvement

ตัวอย่าง:
feat: add SM-2 algorithm for SRS
fix: correct XP calculation on session complete
perf: cache Oxford 3000 AI responses in Redis
```

---

## 🎯 Current Sprint

**Phase: 0 — Foundation**
Target: Infrastructure + Auth + DB ready

Active feature: See docs/features/phase-0-setup.md

> ⚠️ อัพเดท section นี้ทุกครั้งที่เริ่ม sprint ใหม่

---

## 📋 Before Starting ANY Feature

1. อ่าน `docs/features/[feature-name].md`
2. ถ้าไฟล์ยังไม่มี → สร้างก่อนเสมอ
3. Confirm scope กับทีมก่อน implement
4. เริ่มจาก types + DB migration ก่อน
5. API route ถัดไป
6. UI component สุดท้าย
7. เพิ่ม tests
8. อัพเดท docs

---

## 🔑 Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
GEMINI_API_KEY=
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=southeastasia

# Cache + Queue
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
QSTASH_URL=
QSTASH_TOKEN=

# Storage
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_BUCKET=linguaquest-media
CLOUDFLARE_R2_ENDPOINT=

# Email
RESEND_API_KEY=

# Payment
OMISE_PUBLIC_KEY=
OMISE_SECRET_KEY=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# App
NEXTAUTH_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
