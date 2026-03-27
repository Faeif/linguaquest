import { MessageSquare } from 'lucide-react'

export default function CompanionPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-[#C4704B]/10 flex items-center justify-center">
        <MessageSquare size={32} className="text-[#C4704B]" />
      </div>
      <h1 className="text-2xl font-semibold text-[#3D3630]">AI Companion</h1>
      <p className="text-[#7A7067] text-center max-w-md">
        ฝึกสนทนาภาษาจีนกับ AI ที่เรียนรู้จากจุดอ่อนและการออกเสียงของคุณ (Coming Soon in Phase 4)
      </p>
    </div>
  )
}
