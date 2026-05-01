import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      String(process.env.NEXT_PUBLIC_SUPABASE_URL),
      String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    // 10 requests per minute — prevents subscription-spam abuse
    const rl = rateLimit('push-subscribe', user.id, { limit: 10, windowMs: 60_000 })
    if (!rl.ok) {
      return Response.json({ error: 'Too many requests' }, {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      })
    }

    const body = await req.json()
    const subscription = body.subscription !== undefined ? body.subscription : undefined
    const notificationTime = body.notificationTime !== undefined ? body.notificationTime : undefined

    // Build update object — only include fields that were sent
    const updates: Record<string, unknown> = {}
    if (subscription !== undefined) updates.push_subscription = subscription
    if (notificationTime !== undefined) updates.notification_time = notificationTime

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
      if (error) throw error
    }

    return Response.json({ data: { ok: true }, error: null })
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
