import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LinguaQuest — เรียนภาษาจีนด้วย AI',
  description: 'เข้าสู่ระบบ LinguaQuest แพลตฟอร์มเรียนภาษาจีนด้วย AI',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#FAF7F2]">
      {/* Left Panel: Branding & Value Proposition (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between bg-[#C4704B] text-white p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center">
            <span className="font-bold text-white">LQ</span>
          </div>
          <span className="font-bold tracking-tight text-xl">LinguaQuest</span>
        </div>

        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            ก้าวต่อไปของการเรียนภาษาจีน
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            ไม่ใช่แค่แอปท่องศัพท์ แต่คือเพื่อนคู่คิดที่รู้จักคุณดีที่สุด ประเมินจุดอ่อน ฝึกแต่งประโยค และจำลองสถานการณ์จริงด้วย AI
          </p>

          <div className="pt-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium">
              HSK 1 - HSK 6 & Business Chinese
            </div>
          </div>
        </div>

        <div className="text-sm text-white/60">
          &copy; {new Date().getFullYear()} LinguaQuest. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Auth Forms */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 h-screen overflow-y-auto">
        {/* Mobile Logo (Visible only on mobile) */}
        <div className="lg:hidden w-full max-w-[400px] mb-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#C4704B]/10 border border-[#C4704B]/20 flex items-center justify-center">
            <span className="font-bold text-[#C4704B]">LQ</span>
          </div>
          <span className="font-bold tracking-tight text-xl text-[#3D3630]">LinguaQuest</span>
        </div>

        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  )
}
