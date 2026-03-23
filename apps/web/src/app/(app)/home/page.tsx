import type { Metadata } from 'next'
import { createServerSupabase } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Home — LinguaQuest',
}

export default async function HomePage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'display_name, username, level, goal, current_streak:user_stats(current_streak), total_xp:user_stats(total_xp)'
    )
    .eq('id', user?.id ?? '')
    .single()

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section>
        <h1 className="text-3xl font-bold text-white mb-1">
          สวัสดี {profile?.display_name ?? profile?.username ?? 'นักเรียน'} 👋
        </h1>
        <p className="text-purple-300">พร้อมเรียนรู้วันนี้ไหม?</p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Streak', value: '0 วัน', emoji: '🔥' },
          { label: 'XP วันนี้', value: '0 XP', emoji: '⚡' },
          { label: 'Cards Due', value: '0 ใบ', emoji: '🃏' },
          { label: 'Level', value: 'Lv. 1', emoji: '🌟' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center"
          >
            <div className="text-3xl mb-2">{stat.emoji}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-purple-300 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">เริ่มเลย</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/learn"
            className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-2xl p-6 flex items-center gap-4 transition-all shadow-lg"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">🃏</span>
            <div>
              <div className="text-white font-bold text-lg">ทบทวนวันนี้</div>
              <div className="text-purple-200 text-sm">0 การ์ดรอทบทวน</div>
            </div>
          </a>

          <a
            href="/learn/new"
            className="group bg-white/10 hover:bg-white/15 border border-white/20 rounded-2xl p-6 flex items-center gap-4 transition-all"
          >
            <span className="text-4xl group-hover:scale-110 transition-transform">📚</span>
            <div>
              <div className="text-white font-bold text-lg">เรียนรู้คำใหม่</div>
              <div className="text-purple-300 text-sm">เพิ่มคำศัพท์ใหม่</div>
            </div>
          </a>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
        <p className="text-white/40 text-sm">🚧 Phase 1 — Study features coming soon</p>
      </section>
    </div>
  )
}
