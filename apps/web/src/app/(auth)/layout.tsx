import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LinguaQuest — เข้าสู่ระบบ',
  description: 'เรียนภาษาจีน (HSK) ด้วย AI ที่ปรับตัวตามคุณ',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#FAFAF9]">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#8B5E3C]">
        <div>
          <span className="text-white text-xl font-semibold tracking-tight">LinguaQuest</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-semibold text-white leading-tight tracking-tight">
            เรียนภาษาจีน
            <br />
            ด้วย AI ที่เข้าใจคุณ
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-xs">
            ระบบ AI ปรับระดับ HSK ตามจุดอ่อนของคุณโดยเฉพาะ ไม่มีสูตรสำเร็จ มีแต่แผนที่ใช่สำหรับคุณ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-[2px] bg-white/40" />
          <p className="text-white/40 text-xs">สำหรับผู้เรียนภาษาจีน HSK 1–6</p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <span className="text-[#8B5E3C] text-lg font-semibold tracking-tight">LinguaQuest</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
