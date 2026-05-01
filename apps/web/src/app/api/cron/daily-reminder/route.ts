import { createServerClient } from '@supabase/ssr'
import type webpush from 'web-push'
import { sendPushNotification } from '@/lib/push'

export const runtime = 'nodejs'
// Vercel calls this every hour via cron
export const maxDuration = 60

export async function GET(req: Request) {
  // Verify Vercel cron secret
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = createServerClient(
    String(process.env.NEXT_PUBLIC_SUPABASE_URL),
    String(process.env.SUPABASE_SERVICE_ROLE_KEY), // service role to read all users
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  const nowUtc = new Date()
  const utcHour = nowUtc.getUTCHours()
  const utcMinute = nowUtc.getUTCMinutes()

  // Find users whose local time matches the current UTC hour (within this cron window)
  // notification_time is stored as "HH:MM", timezone_offset is hours ahead of UTC
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, notification_time, timezone_offset, push_subscription')
    .not('push_subscription', 'is', null)
    .not('notification_time', 'is', null)

  if (!profiles?.length) return Response.json({ sent: 0 })

  const todayUtc = nowUtc.toISOString().slice(0, 10)
  let sent = 0

  for (const profile of profiles) {
    const [prefHour, prefMinute] = (profile.notification_time as string)
      .split(':')
      .map(Number)
    const offset = (profile.timezone_offset as number) ?? 7
    // Convert user's preferred local time → UTC hour for comparison
    const targetUtcHour = ((prefHour - offset) % 24 + 24) % 24
    const targetUtcMinute = prefMinute ?? 0

    // Only fire if we're in the right hour and within the first 15 minutes of it
    if (targetUtcHour !== utcHour) continue
    if (utcMinute > 15) continue // cron runs every hour; fire only in first 15 min

    // Check if user already studied today (has a study session or hsk review today)
    const { count: studiedToday } = await supabase
      .from('study_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .gte('completed_at', `${todayUtc}T00:00:00Z`)

    // Count cards due
    const { count: cardsDue } = await supabase
      .from('hsk_reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .lte('next_review_at', nowUtc.toISOString())
      .gt('state', 0)

    const name = (profile.display_name as string | null) ?? 'ผู้เรียน'
    const due = cardsDue ?? 0

    let title: string
    let body: string

    if ((studiedToday ?? 0) > 0) {
      // Already studied — send encouragement, not a nag
      title = `${name} ทำได้ดีมากวันนี้! 🌟`
      body = due > 0 ? `ยังมีคำศัพท์อีก ${due} คำรอทบทวนถ้าอยากฝึกเพิ่ม` : 'เยี่ยมมาก ฝึกมาแล้ววันนี้!'
    } else {
      title = due > 0 ? `มาฝึกกันเถอะ ${name}! 🎯` : `ถึงเวลาฝึกแล้ว ${name}! 🥢`
      body =
        due > 0
          ? `มีคำศัพท์ ${due} คำรอให้ทบทวนวันนี้ — ใช้เวลาแค่ 5 นาที!`
          : 'คุยกับโค้ช AI สักสองสามประโยคก็ดีนะ'
    }

    try {
      await sendPushNotification(
        profile.push_subscription as webpush.PushSubscription,
        title,
        body,
        due > 0 ? '/flashcard' : '/companion'
      )
      sent++
    } catch (err) {
      // Subscription may have expired — clear it
      console.error(`Push failed for ${profile.id}:`, err)
      await supabase
        .from('profiles')
        .update({ push_subscription: null })
        .eq('id', profile.id)
    }
  }

  return Response.json({ sent, checked: profiles.length })
}
