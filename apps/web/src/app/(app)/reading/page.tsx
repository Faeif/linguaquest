import { BookOpen } from 'lucide-react'

export default function ReadingPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-[#3D3630] tracking-tight">Reading</h1>
        <p className="text-[#7A7067]">อ่านบทความภาษาจีนตามระดับของคุณ</p>
      </div>

      <div className="bg-[#FFFEFB] border border-[#E8E0D5] rounded-xl p-8 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#9A9179]/10 flex items-center justify-center mb-4">
          <BookOpen size={24} className="text-[#9A9179]" />
        </div>
        <h2 className="text-lg font-medium text-[#3D3630] mb-2">Coming Soon</h2>
        <p className="text-sm text-[#7A7067] max-w-md mx-auto">
          อ่านบทความที่คัดสรรมาตามระดับ HSK ของคุณ
          พร้อมคำแปลและคำอธิบายไวยากรณ์แบบ interactive
        </p>
      </div>
    </div>
  )
}
