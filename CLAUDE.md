# LinguaQuest — Claude Code Context
# Version: 2.0.0 | Updated: 2025-03

## 🎯 Architecture Principle
"API-First, UI-Agnostic, Mobile-Ready"
- Business logic in `packages/core` ONLY. UI is just a consumer.
- Mobile app (Phase 4) will reuse `packages/core` completely.

## 📁 Token-Efficient Context Rules
Do NOT load everything. Only load the specific `@rule` file you need for the current task:

| If working on... | Read this file first |
|-----------------|---------------------|
| Next.js API Routes | `@api-routes` (`.claude/rules/api-routes.md`) |
| Supabase DB & RLS | `@database` (`.claude/rules/database.md`) |
| UI & Components | `@ui-components` (`.claude/rules/ui-components.md`) |
| AI Prompts & Flow | `@ai-prompts` (`.claude/rules/ai-prompts.md`) |

## 🚫 Non-Negotiable Core Rules
1. **Types:** `const data: ExpectedType = response` (NO `any`, NO `@ts-ignore`)
2. **Database:** EVERY new table MUST have an RLS policy.
3. **Zod:** Define globally in `packages/db/src/schemas/`, use everywhere.
4. **Security:** `process.env.GEMINI_API_KEY!` (NEVER hardcode secrets).
5. **UI Logic:** NO direct DB queries or heavy business logic in React components! Use `TanStack Query` and `packages/core`.

## 🔄 Workflow
1. Check `docs/features/[feature].md` before starting.
2. Steps: Types/DB → API Route → UI Component.
3. Use Conventional Commits (`feat:`, `fix:`, `docs:`, etc.).
