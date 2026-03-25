# LinguaQuest 🌍

> AI-powered English learning platform for Thai & SEA market

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 15 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Cache | Upstash Redis |
| AI | Gemini 2.0 Flash + Azure Speech |
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
│   ├── web/          ← Next.js 15
│   └── mobile/       ← Expo (Phase 4)
├── packages/
│   ├── core/         ← Business logic
│   ├── db/           ← Types + queries
│   └── utils/        ← Shared utilities
├── supabase/         ← Migrations + seed
└── docs/             ← Documentation
```

## Documentation

- [Architecture](./docs/architecture.md)
- [Database Schema](./docs/database.md)
- [API Contracts](./docs/api-contracts.md)
- [Security](./docs/security.md)
- [Performance](./docs/performance.md)
- [i18n](./docs/i18n.md)
- [Phase 0 Setup](./docs/features/phase-0-setup.md)

## Team

4 developers | Phase: MVP (Week 1-9)

> See [CLAUDE.md](./CLAUDE.md) for full coding conventions.
