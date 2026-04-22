import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      String(process.env.NEXT_PUBLIC_SUPABASE_URL),
      String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[auth/callback] exchangeCodeForSession error:', error.message)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    // Check if user has completed onboarding
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (!profile?.onboarding_completed) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }
    }

    return NextResponse.redirect(`${origin}${next}`)
  }

  // No code - check if this is an error from OAuth provider
  const errorParam = searchParams.get('error')
  const errorDesc = searchParams.get('error_description')
  if (errorParam) {
    console.error('[auth/callback] OAuth error:', errorParam, errorDesc)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDesc || errorParam)}`
    )
  }

  console.error('[auth/callback] No code provided')
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
