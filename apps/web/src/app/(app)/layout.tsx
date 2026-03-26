import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

// In Next.js App Router, we can cleanly sign out with a Server Action
async function signOutAction() {
  'use server'
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
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    String(process.env.NEXT_PUBLIC_SUPABASE_URL),
    String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {}, // Read-only in layout
      },
    }
  )
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-stone-800 flex flex-col">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/home" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#8B5E3C]/10 border border-[#8B5E3C]/20 flex items-center justify-center">
                <span className="font-bold text-[#8B5E3C] text-sm">LQ</span>
              </div>
              <span className="font-bold tracking-tight text-lg text-stone-800 hidden sm:block">
                LinguaQuest
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden sm:flex items-center gap-6">
              <Link
                href="/home"
                className="text-sm font-medium text-stone-900 border-b-2 border-[#8B5E3C] py-1"
              >
                หน้าหลัก
              </Link>
              <Link
                href="/learn"
                className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
              >
                ทบทวนศัพท์
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
              >
                โปรไฟล์
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-sm font-medium text-stone-500 hover:text-[#8B5E3C] transition-colors"
              >
                ออกจากระบบ
              </button>
            </form>
          </div>
        </div>

        {/* Mobile Nav Links (bottom scrollable row) */}
        <div className="sm:hidden border-t border-stone-100 bg-white/50 backdrop-blur-md px-4 py-2 flex items-center gap-4 overflow-x-auto">
          <Link
            href="/home"
            className="text-sm font-medium text-[#8B5E3C] whitespace-nowrap bg-[#8B5E3C]/5 px-3 py-1.5 rounded-full"
          >
            หน้าหลัก
          </Link>
          <Link
            href="/learn"
            className="text-sm font-medium text-stone-500 whitespace-nowrap px-3 py-1.5"
          >
            ทบทวนศัพท์
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium text-stone-500 whitespace-nowrap px-3 py-1.5"
          >
            โปรไฟล์
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  )
}
