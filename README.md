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

## Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Fill in your values...

# Run development server
pnpm dev
```

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
