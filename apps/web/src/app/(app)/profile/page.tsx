import { createServerClient } from '@supabase/ssr'
import {
  AlertCircle,
  BookOpen,
  Brain,
  Flame,
  LogOut,
  MessageSquare,
  Shield,
  Sparkles,
  Timer,
  TrendingUp,
} from 'lucide-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { signOutAction } from '@/app/actions/auth'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { NotificationToggle } from '@/components/profile/NotificationToggle'

// Approximate total word counts per HSK level
const HSK_TOTAL: Record<string, number> = {
  HSK1: 150,
  HSK2: 150,
  HSK3: 300,
  HSK4: 600,
  HSK5: 1300,
  HSK6: 2500,
}

function getHeatmapOpacity(xp: number, maxXp: number): string {
  if (xp === 0) return 'opacity-10'
  const ratio = xp / maxXp
  if (ratio < 0.25) return 'opacity-30'
  if (ratio < 0.5) return 'opacity-50'
  if (ratio < 0.75) return 'opacity-70'
  return 'opacity-100'
}

export default async function ProfilePage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    String(process.env.NEXT_PUBLIC_SUPABASE_URL),
    String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all needed data in parallel
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [profileRes, statsRes, aiProfileRes, sessionsRes, dueCardsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, avatar_url, hsk_self_assessed, email, notification_time')
      .eq('id', user.id)
      .single(),
    supabase
      .from('user_stats')
      .select(
        'current_streak, total_xp, total_cards_studied, speaking_minutes_total, lifetime_convos'
      )
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('ai_user_profile')
      .select('grammar_weak_points, hsk_estimate')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('study_sessions')
      .select('completed_at, xp_earned')
      .eq('user_id', user.id)
      .gte('completed_at', sevenDaysAgo.toISOString()),
    supabase
      .from('hsk_reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .lte('next_review_at', new Date().toISOString())
      .gt('state', 0),
  ])

  const profile = profileRes.data
  const stats = statsRes.data
  const aiProfile = aiProfileRes.data

  // HSK progress — words started (state >= 1) for user's level
  const hskLevel = profile?.hsk_self_assessed ?? 'HSK1'
  const { count: wordsStarted } = await supabase
    .from('hsk_reviews')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('hsk_level', hskLevel)
    .gte('state', 1)

  const totalForLevel = HSK_TOTAL[hskLevel] ?? 150
  const progressPct = Math.min(100, Math.round(((wordsStarted ?? 0) / totalForLevel) * 100))
  const cardsToReview = dueCardsRes.count ?? 0

  // Build weekly heatmap data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })

  const xpByDay: Record<string, number> = {}
  for (const s of sessionsRes.data ?? []) {
    const day = s.completed_at.slice(0, 10)
    xpByDay[day] = (xpByDay[day] ?? 0) + (s.xp_earned ?? 0)
  }

  const heatmapDays = last7Days.map((day) => ({
    day,
    xp: xpByDay[day] ?? 0,
    label: new Date(`${day}T12:00:00`).toLocaleDateString('th-TH', { weekday: 'short' }),
  }))
  const maxXp = Math.max(1, ...heatmapDays.map((d) => d.xp))

  const weakPoints: string[] = aiProfile?.grammar_weak_points ?? []

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 lg:pb-0">
      {/* User Header */}
      <EditProfileModal
        user={{
          display_name: profile?.display_name,
          avatar_url: profile?.avatar_url,
          email: profile?.email || user.email,
        }}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-[#E8E0D5] rounded-xl p-4 flex flex-col items-center text-center">
          <Timer size={20} className="text-[#C4704B] mb-2" />
          <span className="text-xl font-bold text-[#3D3630]">
            {stats?.speaking_minutes_total ?? 0}
          </span>
          <span className="text-xs text-[#9A9179] mt-1">นาทีที่พูด</span>
        </div>
        <div className="bg-white border border-[#E8E0D5] rounded-xl p-4 flex flex-col items-center text-center">
          <MessageSquare size={20} className="text-[#7D8B6A] mb-2" />
          <span className="text-xl font-bold text-[#3D3630]">
            {stats?.lifetime_convos ?? 0}
          </span>
          <span className="text-xs text-[#9A9179] mt-1">บทสนทนา</span>
        </div>
        <div className="bg-white border border-[#E8E0D5] rounded-xl p-4 flex flex-col items-center text-center">
          <Flame size={20} className="text-[#DA885B] mb-2" />
          <span className="text-xl font-bold text-[#3D3630]">
            {stats?.current_streak ?? 0}
          </span>
          <span className="text-xs text-[#9A9179] mt-1">วันต่อเนื่อง</span>
        </div>
      </div>

      {/* HSK Level Progress */}
      <div className="bg-white border border-[#E8E0D5] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-[#3D3630]" />
            <h2 className="font-semibold text-[#3D3630]">ความก้าวหน้า {hskLevel}</h2>
          </div>
          <span className="text-sm font-medium text-[#7A7067]">
            {wordsStarted ?? 0} / {totalForLevel} คำ
          </span>
        </div>
        <div className="h-2.5 w-full bg-[#E8E0D5] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C4704B] rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-[#9A9179] mt-2">
          {progressPct < 30
            ? 'เพิ่งเริ่มต้น — ลองคุยกับโค้ช AI ทุกวัน!'
            : progressPct < 70
              ? 'กำลังไปได้ดี — ทบทวนสม่ำเสมอนะ'
              : 'เกือบครบแล้ว! พร้อมขึ้นระดับถัดไป'}
        </p>
      </div>

      {/* Weekly Activity Heatmap */}
      <div className="bg-white border border-[#E8E0D5] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-[#3D3630]" />
          <h2 className="font-semibold text-[#3D3630]">กิจกรรม 7 วันที่ผ่านมา</h2>
        </div>
        <div className="flex gap-2 justify-between">
          {heatmapDays.map(({ day, xp, label }) => (
            <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`w-full aspect-square rounded-lg bg-[#C4704B] ${getHeatmapOpacity(xp, maxXp)}`}
                title={`${xp} XP`}
              />
              <span className="text-[10px] text-[#9A9179]">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#9A9179] mt-3">
          XP รวมสัปดาห์นี้:{' '}
          <span className="font-semibold text-[#3D3630]">
            {heatmapDays.reduce((sum, d) => sum + d.xp, 0).toLocaleString()}
          </span>
        </p>
      </div>

      {/* Weak Points */}
      {weakPoints.length > 0 && (
        <div className="bg-white border border-[#E8E0D5] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain size={18} className="text-[#3D3630]" />
            <h2 className="font-semibold text-[#3D3630]">จุดที่ควรฝึกเพิ่ม</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {weakPoints.map((point) => (
              <span
                key={point}
                className="px-3 py-1.5 rounded-full bg-[#B56B6B]/10 text-[#B56B6B] text-xs font-medium border border-[#B56B6B]/20"
              >
                {point}
              </span>
            ))}
          </div>
          <p className="text-xs text-[#9A9179] mt-3">
            วิเคราะห์จากบทสนทนาของคุณกับโค้ช AI
          </p>
        </div>
      )}

      {/* Review Banner */}
      <div
        className={`border rounded-xl p-5 flex items-center justify-between ${
          cardsToReview > 0
            ? 'bg-[#7D8B6A]/10 border-[#7D8B6A]/20'
            : 'bg-[#FAF7F2] border-[#E8E0D5]'
        }`}
      >
        <div>
          <h3 className="font-medium text-[#3D3630]">ทบทวนความจำระยะยาว</h3>
          <p className="text-sm text-[#7A7067] mt-1">
            {cardsToReview > 0
              ? `มีคำศัพท์ ${cardsToReview} คำรอให้คุณทบทวนวันนี้`
              : 'ไม่มีคำที่ต้องทบทวนวันนี้ — ดีมาก!'}
          </p>
        </div>
        {cardsToReview > 0 && (
          <Link
            href="/flashcard"
            className="px-4 py-2 bg-[#7D8B6A] text-white rounded-lg text-sm font-medium hover:bg-[#687458] transition-colors"
          >
            เริ่มทบทวน
          </Link>
        )}
      </div>

      {/* Settings */}
      <div className="bg-white border border-[#E8E0D5] rounded-xl overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#FAF7F2] transition-colors border-b border-[#E8E0D5]"
        >
          <div className="w-8 h-8 rounded-lg bg-[#DA885B]/10 flex items-center justify-center">
            <Sparkles size={18} className="text-[#DA885B]" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-[#3D3630]">Upgrade to Pro</span>
            <p className="text-xs text-[#9A9179]">ปลดล็อก 4-D Essay Grader & Advanced AI</p>
          </div>
        </button>
        <div className="w-full p-4 border-b border-[#E8E0D5]">
          <NotificationToggle savedTime={profile?.notification_time} />
        </div>
        <button
          type="button"
          className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#FAF7F2] transition-colors border-b border-[#E8E0D5]"
        >
          <div className="w-8 h-8 rounded-lg bg-[#9A9179]/10 flex items-center justify-center">
            <Shield size={18} className="text-[#9A9179]" />
          </div>
          <span className="text-sm font-medium text-[#3D3630] flex-1">
            Policies (Privacy & ToS)
          </span>
        </button>
        <button
          type="button"
          className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#FAF7F2] transition-colors border-b border-[#E8E0D5]"
        >
          <div className="w-8 h-8 rounded-lg bg-[#9A9179]/10 flex items-center justify-center">
            <AlertCircle size={18} className="text-[#9A9179]" />
          </div>
          <span className="text-sm font-medium text-[#3D3630] flex-1">Contact Support</span>
        </button>
        <form action={signOutAction} className="w-full">
          <button
            type="submit"
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#FAF7F2] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <LogOut size={18} className="text-red-500" />
            </div>
            <span className="text-sm font-medium text-red-500 flex-1">Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  )
}
