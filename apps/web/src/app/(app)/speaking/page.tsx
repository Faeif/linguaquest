import { Mic } from 'lucide-react'

export default function SpeakingPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-[#3D3630] tracking-tight">Speaking Coach</h1>
        <p className="text-[#7A7067]">ฝึกออกเสียงและโทนเสียงภาษาจีน</p>
      </div>

      <div className="bg-[#FFFEFB] border border-[#E8E0D5] rounded-xl p-8 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#C4704B]/10 flex items-center justify-center mb-4">
          <Mic size={24} className="text-[#C4704B]" />
        </div>
        <h2 className="text-lg font-medium text-[#3D3630] mb-2">Coming Soon</h2>
        <p className="text-sm text-[#7A7067] max-w-md mx-auto">
          พูดภาษาจีนแล้วให้ AI วิเคราะห์การออกเสียง โทนเสียง (声调) พร้อมให้คะแนนและแนะนำวิธีปรับปรุง
        </p>
      </div>
    </div>
  )
}
