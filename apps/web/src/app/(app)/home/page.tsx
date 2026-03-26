import { createServerClient } from '@supabase/ssr'
import { BookOpen, Bot, Flame, Star, Target, TrendingUp } from 'lucide-react'
import { cookies } from 'next/headers'
import Link from 'next/link'

// Allow slightly stale data for dashboard performance (revalidate every 60s)
export const revalidate = 60

export default async function HomeDashboard() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    String(process.env.NEXT_PUBLIC_SUPABASE_URL),
    String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {},
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch Profile (HSK goal, name)
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, learning_goal, hsk_self_assessed, daily_goal_minutes')
    .eq('id', user?.id)
    .single()

  // Fetch User Stats (Streak, XP)
  // Note: if user_stats doesn't exist yet (new user), we fallback to 0
  const { data: stats } = await supabase
    .from('user_stats')
    .select('current_streak, total_xp, total_cards_studied')
    .eq('user_id', user?.id)
    .single()

  const displayName = profile?.display_name || 'ผู้เรียน'
  const hskGoal = profile?.hsk_self_assessed || 'HSK 1'
  const streak = stats?.current_streak || 0
  const xp = stats?.total_xp || 0
  const cardsLearned = stats?.total_cards_studied || 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Welcome Section */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-stone-900 tracking-tight">
            สวัสดี, {displayName} 👋
          </h1>
          <p className="text-stone-500">เป้าหมายของคุณคือ {hskGoal} — วันนี้พร้อมลุยหรือยัง?</p>
        </div>

        {/* Quick Stats Top-Right */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl text-orange-600 font-medium">
            <Flame size={18} className="text-orange-500" />
            <span>{streak} วันติด</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-100 rounded-xl text-yellow-600 font-medium">
            <Star size={18} className="text-yellow-500" />
            <span>{xp} XP</span>
          </div>
        </div>
      </section>

      {/* Main Action Modules */}
      <section className="grid md:grid-cols-2 gap-4">
        {/* Action 1: Vocab Review (SRS) */}
        <Link
          href="/learn"
          className="group relative overflow-hidden bg-white border border-stone-200 hover:border-[#8B5E3C] rounded-2xl p-6 transition-all hover:shadow-md h-full flex flex-col justify-between"
          prefetch={true}
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#8B5E3C]/10 flex items-center justify-center">
              <BookOpen size={24} className="text-[#8B5E3C]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-stone-800">ทบทวนคำศัพท์ (SRS)</h2>
              <p className="text-stone-500 mt-1 text-sm leading-relaxed">
                ระบบคำนวณการจำด้วยอัลกอริทึม ts-fsrs ให้คุณทบทวนคำในจังหวะที่สมองกำลังจะลืมได้อย่างแม่นยำ
              </p>
            </div>
          </div>
          <div className="mt-8 flex items-center text-[#8B5E3C] font-medium text-sm group-hover:translate-x-1 transition-transform">
            เริ่มทบทวนตอนนี้ &rarr;
          </div>
        </Link>

        {/* Action 2: AI Companion */}
        <Link
          href="/companion"
          className="group relative overflow-hidden bg-[#8B5E3C] border border-[#8B5E3C] rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-[#8B5E3C]/20 h-full flex flex-col justify-between"
          prefetch={true}
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">ฝึกสนทนากับ AI</h2>
              <p className="text-[#D6BCA6] mt-1 text-sm leading-relaxed">
                จำลองสถานการณ์จริง ตอบสนองตามระดับ HSK ของคุณ และแก้ไขแกรมม่าให้เป็นธรรมชาติ
              </p>
            </div>
          </div>
          <div className="mt-8 flex items-center text-white font-medium text-sm group-hover:translate-x-1 transition-transform">
            คุยกับเพื่อน AI &rarr;
          </div>
        </Link>
      </section>

      {/* Additional Analytics / Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-100 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-stone-500 text-sm font-medium">
            <Target size={16} />
            <span>เป้าหมายรายวัน</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-semibold text-stone-800">0</span>
            <span className="text-stone-500 mb-1">/ {profile?.daily_goal_minutes || 15} นาที</span>
          </div>
          {/* Simple progress bar */}
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-stone-300 w-[0%]"></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-100 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-stone-500 text-sm font-medium">
            <TrendingUp size={16} />
            <span>คำศัพท์ที่ได้เรียน</span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-semibold text-stone-800">{cardsLearned}</span>
            <span className="text-stone-500 mb-1">คำ</span>
          </div>
          <p className="text-xs text-stone-400 mt-1">จำได้ดีเยี่ยม 0 คำ</p>
        </div>
      </section>
    </div>
  )
}
