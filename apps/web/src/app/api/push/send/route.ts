import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type webpush from 'web-push'
import { sendPushNotification } from '@/lib/push'

export async function POST(req: Request) {
  try {
    // Internal endpoint — verify shared secret
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      String(process.env.NEXT_PUBLIC_SUPABASE_URL),
      String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    )

    const { userId, title, body, url } = (await req.json()) as {
      userId: string
      title: string
      body: string
      url?: string
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('push_subscription')
      .eq('id', userId)
      .single()

    if (!profile?.push_subscription) {
      return Response.json({ data: { sent: false, reason: 'no_subscription' }, error: null })
    }

    await sendPushNotification(
      profile.push_subscription as webpush.PushSubscription,
      title,
      body,
      url
    )

    return Response.json({ data: { sent: true }, error: null })
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
