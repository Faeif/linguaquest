import { createServerClient } from '@supabase/ssr'
import type webpush from 'web-push'
import { sendPushNotification } from '@/lib/push'

export const runtime = 'nodejs'
export const maxDuration = 60

// Runs at 21:00 in user's local time — warns if streak is at risk
export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createServerClient(
    String(process.env.NEXT_PUBLIC_SUPABASE_URL),
    String(process.env.SUPABASE_SERVICE_ROLE_KEY),
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  const nowUtc = new Date()
  const utcHour = nowUtc.getUTCHours()
  const utcMinute = nowUtc.getUTCMinutes()
  const todayUtc = nowUtc.toISOString().slice(0, 10)

  // Find users where local time is ~21:00 and they have a streak
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, timezone_offset, push_subscription')
    .not('push_subscription', 'is', null)

  if (!profiles?.length) return Response.json({ sent: 0 })

  // Join with user_stats to filter those with streaks
  const { data: streakUsers } = await supabase
    .from('user_stats')
    .select('user_id, current_streak')
    .gt('current_streak', 0)
    .in(
      'user_id',
      profiles.map((p) => p.id)
    )

  const streakMap = new Map((streakUsers ?? []).map((u) => [u.user_id, u.current_streak]))
  let sent = 0

  for (const profile of profiles) {
    const streak = streakMap.get(profile.id as string)
    if (!streak || streak < 1) continue

    const offset = (profile.timezone_offset as number) ?? 7
    const targetUtcHour = ((21 - offset) % 24 + 24) % 24

    if (targetUtcHour !== utcHour) continue
    if (utcMinute > 15) continue

    // Already studied today?
    const { count: studiedToday } = await supabase
      .from('study_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .gte('completed_at', `${todayUtc}T00:00:00Z`)

    if ((studiedToday ?? 0) > 0) continue // safe, skip

    const name = (profile.display_name as string | null) ?? 'ผู้เรียน'

    try {
      await sendPushNotification(
        profile.push_subscription as webpush.PushSubscription,
        `Streak ${streak} วัน กำลังจะหาย! 🔥`,
        `${name} ยังไม่ได้ฝึกวันนี้เลย คุยกับโค้ช AI สักแป๊บเดียวก็ได้นะ`,
        '/companion'
      )
      sent++
    } catch {
      await supabase
        .from('profiles')
        .update({ push_subscription: null })
        .eq('id', profile.id)
    }
  }

  return Response.json({ sent })
}
