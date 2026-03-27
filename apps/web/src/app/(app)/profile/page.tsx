import { createServerClient } from '@supabase/ssr'
import { BarChart2, Brain, Flame, Timer, LogOut, Bell, Shield, Sparkles, AlertCircle } from 'lucide-react'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { signOutAction } from '@/app/actions/auth'

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, hsk_self_assessed, email')
    .eq('id', user.id)
    .single()

  const { data: stats } = await supabase
    .from('user_stats')
    .select('current_streak, total_xp, total_cards_studied')
    .eq('user_id', user.id)
    .single()

  // Mock data for new requirements
  const minutesSpeaking = 120 // mock
  const lifetimeConvos = 15 // mock
  const cardsToReview = 42 // mock

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 lg:pb-0">
      {/* User Header & Edit Modal Component */}
      <EditProfileModal user={{
        display_name: profile?.display_name,
        avatar_url: profile?.avatar_url,
        email: profile?.email || user.email
      }} />

      {/* Main Stats (Top Row) */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-[#E8E0D5] rounded-xl p-4 flex flex-col items-center text-center">
          <Timer size={22} className="text-[#C4704B] mb-2" />
          <span className="text-xl font-bold text-[#3D3630]">{minutesSpeaking}</span>
          <span className="text-xs text-[#9A9179] mt-1">นาทีที่พูด (รวม)</span>
        </div>
        <div className="bg-white border border-[#E8E0D5] rounded-xl p-4 flex flex-col items-center text-center">
          <Brain size={22} className="text-[#7D8B6A] mb-2" />
          <span className="text-xl font-bold text-[#3D3630]">{lifetimeConvos}</span>
          <span className="text-xs text-[#9A9179] mt-1">บทสนทนา (รวม)</span>
        </div>
        <div className="bg-white border border-[#E8E0D5] rounded-xl p-4 flex flex-col items-center text-center">
          <Flame size={22} className="text-[#DA885B] mb-2" />
          <span className="text-xl font-bold text-[#3D3630]">{stats?.current_streak || 0}</span>
          <span className="text-xs text-[#9A9179] mt-1">วันต่อเนื่อง</span>
        </div>
      </div>

      {/* Daily Vocabulary Progress (Chart Placeholder) */}
      <div className="bg-white border border-[#E8E0D5] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 size={18} className="text-[#3D3630]" />
          <h2 className="font-semibold text-[#3D3630]">คำศัพท์ที่แอคทีฟ (Active Vocab)</h2>
        </div>
        <div className="h-32 flex items-end gap-2 justify-between mt-6">
          {/* Mock Bar Chart */}
          {[20, 35, 45, 40, 60, 85, 110].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-[#C4704B]/20 rounded-t-sm relative group"
                style={{ height: `${(height / 150) * 100}%` }}
              >
                <div
                  className="absolute bottom-0 left-0 w-full bg-[#C4704B] rounded-t-sm"
                  style={{ height: `${height}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-[#9A9179]">อ.{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Section (Anki Style) */}
      <div className="bg-[#7D8B6A]/10 border border-[#7D8B6A]/20 rounded-xl p-5 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-[#3D3630]">ทบทวนความจำระยะยาว</h3>
          <p className="text-sm text-[#7A7067] mt-1">มีคำศัพท์ {cardsToReview} คำรอให้คุณทบทวนวันนี้</p>
        </div>
        <Link
          href="/flashcard"
          className="px-4 py-2 bg-[#7D8B6A] text-white rounded-lg text-sm font-medium hover:bg-[#687458]"
        >
          เริ่มทบทวน
        </Link>
      </div>

      {/* Settings List */}
      <div className="bg-white border border-[#E8E0D5] rounded-xl overflow-hidden mt-8">
        <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#FAF7F2] transition-colors border-b border-[#E8E0D5]">
          <div className="w-8 h-8 rounded-lg bg-[#DA885B]/10 flex items-center justify-center">
            <Sparkles size={18} className="text-[#DA885B]" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-[#3D3630]">Upgrade to Pro</span>
            <p className="text-xs text-[#9A9179]">ปลดล็อก 4-D Essay Grader & Advanced AI</p>
          </div>
        </button>
        <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#FAF7F2] transition-colors border-b border-[#E8E0D5]">
          <div className="w-8 h-8 rounded-lg bg-[#9A9179]/10 flex items-center justify-center">
            <Bell size={18} className="text-[#9A9179]" />
          </div>
          <span className="text-sm font-medium text-[#3D3630] flex-1">Preferences & WebPush</span>
        </button>
        <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#FAF7F2] transition-colors border-b border-[#E8E0D5]">
          <div className="w-8 h-8 rounded-lg bg-[#9A9179]/10 flex items-center justify-center">
            <Shield size={18} className="text-[#9A9179]" />
          </div>
          <span className="text-sm font-medium text-[#3D3630] flex-1">Policies (Privacy & ToS)</span>
        </button>
        <button className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#FAF7F2] transition-colors border-b border-[#E8E0D5]">
          <div className="w-8 h-8 rounded-lg bg-[#9A9179]/10 flex items-center justify-center">
            <AlertCircle size={18} className="text-[#9A9179]" />
          </div>
          <span className="text-sm font-medium text-[#3D3630] flex-1">Contact Support</span>
        </button>
        <form action={signOutAction} className="w-full">
          <button type="submit" className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#FAF7F2] transition-colors">
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
