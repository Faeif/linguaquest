# LinguaQuest 🌍

> AI-powered Chinese learning platform for Thai & SEA market

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 15 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + Design System |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Cache | Upstash Redis |
| AI | DeepSeek V3.2 + Qwen3 + Azure Speech |
| Deploy | Vercel |

## 🚀 Team Onboarding (Quick Start)

ทีมงานทุกคนต้องทำตามขั้นตอนด้านล่างนี้ในวันแรกที่ดึงโค้ด:

1. **เตรียมเครื่อง (Prerequisites):**
   - ลง [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ต้องเปิดโปรแกรมทิ้งไว้)
   - ลง Node.js 20.x และ `pnpm` (แนะนำให้ใช้ [Volta](https://volta.sh/))
   - ลง [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) (`brew install supabase/tap/supabase`)

2. **ติดตั้งโปรเจกต์:**
   ```bash
   git clone https://github.com/Faeif/linguaquest.git
   cd linguaquest
   pnpm install
   ```

3. **เตรียม Environment Variables:**
   - ก๊อปปี้ไฟล์ตัวอย่าง: `cp .env.example .env.local`
   - *หมายเหตุ: ขอ URL และ Keys ของ Supabase/AI จาก Lead Developer มาใส่ใน `.env.local`*

4. **รัน Local Database (Supabase):**
   ```bash
   supabase start
   ```
   *คำสั่งนี้จะโหลด Docker Image โลคอลมาลงเครื่อง (ครั้งแรกจะนานหน่อย) สตูดิโอฐานข้อมูลจะเปิดที่ `http://localhost:54323`*

5. **รันหน้าเว็บ (Next.js):**
   ```bash
   pnpm dev
   ```
   *เข้าเว็บได้ที่ `http://localhost:3000`*

## Project Structure

```
linguaquest/
├── apps/
│   ├── web/              ← Next.js 15
│   │   ├── src/app/      ← App Router (routes only)
│   │   ├── src/features/ ← Feature co-location
│   │   ├── src/components/ ← Shared UI components
│   │   └── src/lib/      ← Utilities, schemas, Supabase clients
│   └── mobile/           ← Expo (Phase 4)
│
├── packages/
│   ├── core/             ← Business logic (pure TypeScript)
│   │   ├── src/flashcard/  ← FSRS scheduling, AI generation
│   │   ├── src/api/      ← Standardized API response helpers
│   │   ├── src/i18n/     ← Shared locale constants
│   │   └── src/...       ← Writing coach, privacy, etc.
│   ├── db/               ← Types + queries + Zod schemas
│   ├── ui/               ← Shared primitive components (Button, Card, Input, Badge)
│   └── utils/            ← Shared utilities
│
├── supabase/             ← Migrations + seed + triggers
├── scripts/              ← Build & data generation scripts
└── docs/                 ← Architecture, security, API contracts, feature specs
```

## 🏗️ Architecture Principles

- **API-First, UI-Agnostic**: Business logic in `packages/core` only. UI is a consumer.
- **Feature Co-Location**: Each major feature lives in `apps/web/src/features/[feature]/` with its own `components/`, `hooks/`, `constants/`, `types.ts`, and `api.ts`.
- **Design System Tokens**: All visual values use CSS custom properties (`--color-*`). No hardcoded hex values in components.
- **Monorepo**: `apps/web` and `apps/mobile` (Phase 4) share `packages/core`, `packages/db`, and `packages/ui`.

## 📚 Documentation

| Document | Description |
|---|---|
| [Architecture](./docs/architecture.md) | System design & data flow |
| [Database Schema](./docs/database.md) | Table definitions, RLS policies, indexes |
| [API Contracts](./docs/api-contracts.md) | Endpoint specifications |
| [Security](./docs/security.md) | Auth, rate limiting, headers, monitoring |
| [Performance](./docs/performance.md) | Caching, query optimization |
| [i18n](./docs/i18n.md) | Internationalization strategy |
| [Feature Template](./docs/feature-template.md) | How to create a new feature |
| [Phase 0 Setup](./docs/features/phase-0-setup.md) | Initial project setup steps |

## 🛠️ Adding a New Feature

Follow the [Feature Template](./docs/feature-template.md). In short:

1. Write spec at `docs/features/[feature].md`
2. Define Zod schemas at `packages/db/src/schemas/[feature].ts`
3. Implement business logic at `packages/core/src/[feature]/`
4. Create API route at `apps/web/src/app/api/[feature]/route.ts`
5. Build UI at `apps/web/src/features/[feature]/`

## Team

4 developers | Phase: MVP (Week 1-9)

> See [CLAUDE.md](./CLAUDE.md) for full coding conventions.
