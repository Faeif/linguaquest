# Feature: Phase 0 — Foundation Setup
# Version: 1.0.0
# Duration: Week 1-3

## 🎯 Goal
Setup infrastructure ทั้งหมดให้พร้อม
ก่อนเขียน feature code บรรทัดแรก

## ✅ Acceptance Criteria
- [ ] Turborepo monorepo setup สมบูรณ์
- [ ] Supabase local dev ทำงานได้
- [ ] Next.js 15 deploy บน Vercel
- [ ] Auth (Google + Magic Link) ทำงาน end-to-end
- [ ] CI/CD pipeline ผ่าน (typecheck + lint + test + deploy)
- [ ] Security headers configured
- [ ] Error tracking (Sentry) ทำงาน
- [ ] Analytics (PostHog) ทำงาน
- [ ] All env vars configured

---

## 📋 Step-by-Step Implementation

### Step 1 — Repository Setup
```bash
# 1. Create GitHub repo: linguaquest (private)

# 2. Init Turborepo
pnpm dlx create-turbo@latest linguaquest
cd linguaquest

# 3. Setup Volta (Node version locking)
curl https://get.volta.sh | bash
volta pin node@20.11.0
volta pin pnpm@9.0.0

# 4. Install Biome
pnpm add -D --workspace-root @biomejs/biome
npx biome init

# 5. Setup Husky
pnpm add -D --workspace-root husky lint-staged
npx husky init
```

### Step 2 — Create Apps & Packages
```bash
# Web app
pnpm dlx create-next-app@latest apps/web \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

# Mobile placeholder (Phase 4)
mkdir -p apps/mobile
echo "# Mobile App (Phase 4 — Expo)" > apps/mobile/README.md

# Packages
mkdir -p packages/core/src/{srs,ai,gamification,content-moderation}
mkdir -p packages/db/src/{types,queries}
mkdir -p packages/utils/src/{formatting,constants,helpers}
```

### Step 3 — Supabase Setup
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Init in project root
supabase init

# Start local dev
supabase start

# Output จะแสดง:
# API URL: http://127.0.0.1:54321
# DB URL:  postgresql://postgres:postgres@127.0.0.1:54322/postgres
# Studio:  http://127.0.0.1:54323
```

### Step 4 — Database Migrations
```bash
# Create migrations
supabase migration new create_profiles
supabase migration new create_decks
supabase migration new create_cards
supabase migration new create_user_progress
supabase migration new create_user_stats
supabase migration new create_rls_policies
supabase migration new create_functions_triggers

# Run migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > packages/db/src/types/database.ts
```

### Step 5 — Supabase Auth Configuration
```
In Supabase Dashboard → Authentication → Providers:

Google OAuth:
- Client ID: (from Google Cloud Console)
- Client Secret: (from Google Cloud Console)
- Redirect URL: https://[project-ref].supabase.co/auth/v1/callback

Email (Magic Link):
- Enable email confirmations: ON
- Magic Link expiry: 15 minutes (900 seconds)
```

### Step 6 — Environment Variables
```bash
# Copy template
cp .env.example .env.local

# Fill in all values from:
# - Supabase Dashboard → Settings → API
# - Google Cloud Console → OAuth 2.0
# - Upstash Console
# - Cloudflare Dashboard
# - Other services
```

### Step 7 — CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm run typecheck
      - run: pnpm run lint
      - run: pnpm run test

  deploy:
    needs: quality
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📁 Key Files to Create

```
apps/web/
├── lib/supabase/
│   ├── server.ts        ← createServerClient
│   ├── client.ts        ← createBrowserClient
│   └── middleware.ts    ← Auth middleware
├── middleware.ts         ← Next.js middleware
└── app/
    ├── (auth)/
    │   ├── login/page.tsx
    │   └── onboarding/page.tsx
    └── (app)/
        ├── layout.tsx   ← Protected layout
        └── home/page.tsx
```

---

## 🔑 Files Content

### apps/web/lib/supabase/server.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@linguaquest/db/types'

export function createServerSupabase() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) {
          try { cookieStore.set(name, value, options) } catch {}
        },
        remove(name, options) {
          try { cookieStore.set(name, '', options) } catch {}
        },
      },
    }
  )
}

export function createAdminSupabase() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
```

### apps/web/middleware.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        },
        remove(name, options) {
          request.cookies.set(name, '')
          response.cookies.set(name, '', options)
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to login if accessing protected routes
  if (!user && request.nextUrl.pathname.startsWith('/(app)')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to home if already logged in
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

---

## 🧪 Tests Required
```typescript
// Phase 0 tests
describe('Auth', () => {
  it('should redirect to login when not authenticated')
  it('should redirect to home when authenticated')
  it('should create profile on first signup')
  it('should create user_stats on first signup')
})

describe('Database', () => {
  it('should enforce RLS on profiles table')
  it('should enforce RLS on decks table')
  it('should enforce RLS on user_progress table')
})
```

---

## ✅ Definition of Done
```
□ pnpm build succeeds without errors
□ pnpm typecheck succeeds (zero errors)
□ pnpm lint succeeds (zero warnings)
□ pnpm test succeeds
□ Auth flow works end-to-end (test manually)
□ Supabase migrations run cleanly
□ Vercel deploy succeeds
□ Sentry receives test error
□ PostHog receives test event
□ Lighthouse score ≥ 90 on /login page
```
