# Feature Template — แนวทางสร้าง Feature ใหม่

> ใช้ template นี้เมื่อสร้าง feature ใหม่ เพื่อให้โครงสร้างสอดคล้องกันทั้งระบบ

---

## Phase 1: วางแผน (ก่อนเขียนโค้ด)

1. **สร้าง Feature Spec** ที่ `docs/features/[feature-name].md`
2. **Design Data Flow**: Types → DB Schema → API → UI
3. **ระบุ dependencies**: ต้องใช้ AI? RLS policy? Rate limit?

---

## Phase 2: Backend (Type/DB → API → Business Logic)

### 2.1 Types & Zod Schemas

```typescript
// packages/db/src/schemas/[feature].ts
import { z } from 'zod'

export const CreateFeatureSchema = z.object({
  name: z.string().min(1).max(100),
  // ...
})

export type CreateFeatureInput = z.infer<typeof CreateFeatureSchema>
```

**Rules:**
- ทุก API input ต้องมี Zod schema
- ไม่มี inline schema ใน route files
- Export type ด้วย `z.infer<>`

### 2.2 Business Logic (packages/core)

```typescript
// packages/core/src/[feature]/service.ts
export class FeatureService {
  async process(input: CreateFeatureInput): Promise<FeatureResult> {
    // ไม่มี framework dependencies
    // ไม่มี DB queries โดยตรง (รับ data เป็น parameters)
  }
}
```

**Rules:**
- Pure TypeScript เท่านั้น
- ไม่ import React, Next.js, หรือ Tailwind
- รองรับ reuse จาก web + mobile

### 2.3 API Route

```typescript
// apps/web/src/app/api/[feature]/route.ts
import { successResponse, errorResponse, commonErrors } from '@linguaquest/core/api'
import { FeatureService } from '@linguaquest/core'

export async function POST(req: Request) {
  // 1. Auth (reuse existing pattern)
  // 2. Rate limit
  // 3. Validate with Zod
  // 4. Delegate to service
  // 5. Return standardized response
  return successResponse(result)
}
```

**Rules:**
- Thin routes: validation → delegate → respond
- ใช้ `successResponse()` และ `errorResponse()` helpers
- ไม่เกิน 50 บรรทัดต่อ route

---

## Phase 3: Frontend (UI Layer)

### 3.1 Feature Directory Structure

```
apps/web/src/features/[feature]/
├── components/          # Feature-specific UI
│   ├── FeatureList.tsx
│   ├── FeatureCard.tsx
│   └── FeatureForm.tsx
├── hooks/               # TanStack Query hooks
│   ├── useFeatureQuery.ts
│   └── useFeatureMutation.ts
├── constants/           # Feature constants
│   └── feature-labels.ts
├── types.ts             # Feature-specific types
├── utils.ts             # Pure helpers
├── api.ts               # API fetch wrappers
├── page.tsx             # Route entry (thin wrapper)
└── layout.tsx           # (optional) Feature layout
```

**Rules:**
- ไม่มี business logic ใน components
- ไม่มี direct DB queries
- ใช้ TanStack Query สำหรับ server state
- ใช้ `packages/ui` primitives (Button, Card, Input, Badge)

### 3.2 Component Pattern

```tsx
// features/[feature]/components/FeatureCard.tsx
import { Card, CardHeader, CardTitle, Badge } from '@linguaquest/ui'

export function FeatureCard({ data }: FeatureCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.name}</CardTitle>
        <Badge variant="success">{data.status}</Badge>
      </CardHeader>
      {/* ... */}
    </Card>
  )
}
```

**Rules:**
- ใช้ theme tokens เท่านั้น (`bg-surface`, `text-primary`)
- ไม่มี hardcoded hex values
- ไม่มี `style={{}}` inline styles

### 3.3 API Wrapper Pattern

```typescript
// features/[feature]/api.ts
import { type ApiResponse } from '@linguaquest/core/api'

export async function createFeature(input: CreateFeatureInput) {
  const res = await fetch('/api/feature', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return res.json() as Promise<ApiResponse<FeatureResult>>
}
```

---

## Phase 4: Review & Refactor

### Checklist ก่อน merge

- [ ] ไม่มี `any` types
- [ ] ไม่มี hardcoded colors (ใช้ theme tokens)
- [ ] Business logic อยู่ใน `packages/core`
- [ ] Zod schema อยู่ใน `packages/db/src/schemas/`
- [ ] API route ใช้ standardized response helpers
- [ ] Component ใช้ `packages/ui` primitives
- [ ] RLS policy ครบถ้วน (ถ้ามี DB table)
- [ ] มี error handling (ไม่มี bare `catch {}`)

---

## Example: Complete Feature Flow

```
New Feature: "Battle Zone"

1. docs/features/battle-zone.md         ← Spec
2. packages/db/src/schemas/battle.ts  ← Zod schema
3. packages/core/src/battle/service.ts ← Business logic
4. packages/core/src/battle/types.ts    ← Domain types
5. apps/web/src/app/api/battle/route.ts ← API route
6. apps/web/src/features/battle/       ← UI feature
   ├── components/
   ├── hooks/
   ├── types.ts
   ├── api.ts
   └── page.tsx
```

---

## Design Token Reference

| Token | CSS Variable | Usage |
|---|---|---|
| Background | `--color-background` | Page background |
| Surface | `--color-surface` | Cards, modals |
| Primary | `--color-accent` | Primary buttons |
| Secondary | `--color-accent-secondary` | Secondary actions |
| Text | `--color-text-primary` | Main text |
| Text Secondary | `--color-text-secondary` | Labels, hints |
| Success | `--color-success` | Positive status |
| Error | `--color-error` | Errors, destructive |
| Border | `--color-border` | Dividers, card borders |

**ห้ามใช้ hex values ใน components โดยเด็ดขาด**
