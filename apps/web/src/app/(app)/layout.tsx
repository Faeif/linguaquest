import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
      {/* Nav */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-white font-bold text-xl">🌍 LinguaQuest</span>
          <div className="flex items-center gap-4">
            <a href="/home" className="text-purple-300 hover:text-white text-sm transition">
              Home
            </a>
            <a href="/learn" className="text-purple-300 hover:text-white text-sm transition">
              Learn
            </a>
            <a href="/profile" className="text-purple-300 hover:text-white text-sm transition">
              Profile
            </a>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-xs text-white/50 hover:text-white/80 transition border border-white/20 rounded-lg px-3 py-1.5"
              >
                ออกจากระบบ
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
    </div>
  )
}
