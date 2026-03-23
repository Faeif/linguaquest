'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { createClientSupabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  const supabase = createClientSupabase()

  async function handleGoogleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🌍 LinguaQuest</h1>
          <p className="text-purple-300 text-sm">เรียนภาษาอังกฤษด้วย AI — สนุก เร็ว ได้ผล</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          {errorParam && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm">
              เกิดข้อผิดพลาด กรุณาลองใหม่
            </div>
          )}

          {sent ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">📬</div>
              <h2 className="text-white text-xl font-semibold mb-2">เช็ค Email ของคุณ!</h2>
              <p className="text-purple-200 text-sm">
                ส่ง Magic Link ไปที่ <span className="font-medium text-white">{email}</span> แล้ว
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-4 text-purple-300 text-sm underline hover:text-white transition"
              >
                ส่งใหม่
              </button>
            </div>
          ) : (
            <>
              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-md disabled:opacity-50 mb-6"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-label="Google">
                  <title>Google</title>
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                เข้าสู่ระบบด้วย Google
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-white/40 text-xs">หรือ</span>
                <div className="flex-1 h-px bg-white/20" />
              </div>

              {/* Magic Link */}
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm text-purple-200 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition"
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-md"
                >
                  {loading ? 'กำลังส่ง...' : 'ส่ง Magic Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          By signing in, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </main>
  )
}
