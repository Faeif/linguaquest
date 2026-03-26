import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LinguaQuest — เรียนภาษาจีนด้วย AI',
  description: 'เข้าสู่ระบบ LinguaQuest แพลตฟอร์มเรียนภาษาจีนด้วย AI',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#FAFAF9]">
      {/* Left Panel: Branding & Value Proposition (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between bg-[#8B5E3C] text-stone-50 p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
            <span className="font-bold text-orange-450">LQ</span>
          </div>
          <span className="font-bold tracking-tight text-xl">LinguaQuest</span>
        </div>

        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            ก้าวต่อไปของการเรียนภาษาจีน
          </h1>
          <p className="text-[#D6BCA6] text-lg leading-relaxed">
            ไม่ใช่แค่แอปท่องศัพท์ แต่คือเพื่อนคู่คิดที่รู้จักคุณดีที่สุด ประเมินจุดอ่อน ฝึกแต่งประโยค และจำลองสถานการณ์จริงด้วย AI
          </p>

          <div className="pt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm font-medium">
              <span>🎯</span> HSK 1 - HSK 6 & Business Chinese
            </div>
          </div>
        </div>

        <div className="text-sm text-[#A88B77]">
          &copy; {new Date().getFullYear()} LinguaQuest. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Auth Forms */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 h-screen overflow-y-auto">
        {/* Mobile Logo (Visible only on mobile) */}
        <div className="lg:hidden w-full max-w-[400px] mb-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#8B5E3C]/10 border border-[#8B5E3C]/20 flex items-center justify-center">
            <span className="font-bold text-[#8B5E3C]">LQ</span>
          </div>
          <span className="font-bold tracking-tight text-xl text-stone-800">LinguaQuest</span>
        </div>

        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  )
}
