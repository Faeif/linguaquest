import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type webpush from 'web-push'
import { sendPushNotification } from '@/lib/push'
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

    // 5 completions per minute — a real session takes at least a few minutes
    const rl = rateLimit('session-complete', user.id, { limit: 5, windowMs: 60_000 })
    if (!rl.ok) {
      return Response.json({ error: 'Too many requests' }, {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      })
    }

    const { xpEarned = 0, minutes = 0 } = (await req.json()) as {
      xpEarned?: number
      minutes?: number
    }

    // Update user_stats — increment lifetime_convos, speaking_minutes_total, total_xp, weekly_xp
    await supabase.rpc('increment_session_stats', {
      p_user_id: user.id,
      p_xp: xpEarned,
      p_minutes: minutes,
    })

    // Send push notification if user has a subscription
    const { data: profile } = await supabase
      .from('profiles')
      .select('push_subscription, display_name')
      .eq('id', user.id)
      .single()

    if (profile?.push_subscription) {
      const name = (profile.display_name as string | null) ?? 'ผู้เรียน'
      const xpText = xpEarned > 0 ? ` +${xpEarned} XP!` : ''
      await sendPushNotification(
        profile.push_subscription as webpush.PushSubscription,
        `${name} เก่งมาก! 🎉`,
        minutes > 0
          ? `เพิ่งฝึกไป ${minutes} นาที${xpText} — วันนี้ทำได้ดีมาก!`
          : `Session จบแล้ว${xpText} ทำได้ดีมาก!`,
        '/home'
      ).catch(() => {
        // Non-blocking — push failure shouldn't break the response
      })
    }

    return Response.json({ data: { ok: true }, error: null })
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
