import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'LinguaQuest — เรียนภาษาจีนด้วย AI',
  description: 'เข้าสู่ระบบ LinguaQuest แพลตฟอร์มเรียนภาษาจีนด้วย AI',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#FAF7F2]">
      {/* Left Panel: Branding & Value Proposition (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between bg-[#C4704B] text-white p-12">
        <div className="flex items-center gap-3">
          <Image src="/icons/icon-192x192.png" alt="LQ Logo" width={36} height={36} className="rounded-xl shadow-lg border border-white/20" />
          <span className="font-bold tracking-tight text-xl">LinguaQuest</span>
        </div>

        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight leading-tight">
            ก้าวต่อไปของการเรียนภาษาจีน
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            ไม่ใช่แค่แอปท่องศัพท์ แต่คือเพื่อนคู่คิดที่รู้จักคุณดีที่สุด ประเมินจุดอ่อน ฝึกแต่งประโยค และจำลองสถานการณ์จริงด้วย AI
          </p>

          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-medium">
              HSK 1 - HSK 6 & Business Chinese
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center py-10 opacity-90 hover:opacity-100 transition-opacity">
          <Image 
            src="/icons/icon-512x512.png" 
            alt="LinguaQuest Mascot" 
            width={340} 
            height={340} 
            className="rounded-3xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 saturate-150" 
            priority
          />
        </div>

        <div className="text-sm text-white/80">
          &copy; {new Date().getFullYear()} LinguaQuest. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Auth Forms */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12 h-screen overflow-y-auto">
        {/* Mobile Logo (Visible only on mobile) */}
        <div className="lg:hidden w-full max-w-[400px] mb-8 flex items-center gap-3">
          <Image src="/icons/icon-192x192.png" alt="LQ Logo" width={36} height={36} className="rounded-xl shadow-md border border-[#E8E0D5]" />
          <span className="font-bold tracking-tight text-xl text-[#3D3630]">LinguaQuest</span>
        </div>

        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  )
}
