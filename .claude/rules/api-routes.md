# API Routes Pattern
# Version: 1.0.0

## Standard Pattern
Every API route in `apps/web/app/api/` MUST follow this exact structure:

```typescript
import { createServerClient } from '@linguaquest/db/supabase/server'
import { zSomething } from '@linguaquest/db/src/schemas'

export async function POST(req: Request) {
  try {
    // 1. Auth Check (Server Client)
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Body Parsing & Validation (Zod MUST be from shared schemas)
    const body = await req.json()
    const input = zSomething.parse(body)

    // 3. Rate Limiting (Upstash / optional per route)
    // const { success } = await ratelimit.limit(user.id)
    // if (!success) return Response.json({ error: 'Rate limit' }, { status: 429 })

    // 4. Core Business Logic (Delegate to packages/core!)
    // const result = await coreFunction(input, user.id)

    // 5. Standard Response Format
    return Response.json({ data: { /* ... */ }, error: null })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ data: null, error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    // Sentry.captureException(error)
    return Response.json({ data: null, error: 'Internal Server Error' }, { status: 500 })
  }
}
```

## Important Rules
- Do NOT write SQL queries directly in the API route if the logic is complex; put it in `packages/core`.
- ALWAYS return `{ data, error }` format.
- ALWAYS use `zod` for parsing `req.json()`.
