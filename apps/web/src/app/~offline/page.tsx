import { WifiOff } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-[#E8E0D5]/50 flex items-center justify-center rounded-2xl mb-6">
        <WifiOff size={40} className="text-[#9A9179]" />
      </div>
      <h1 className="text-2xl font-semibold text-[#3D3630] mb-2">ออฟไลน์ (Offline)</h1>
      <p className="text-[#7A7067] max-w-sm mb-8">
        ดูเหมือนว่าคุณกำลังไม่ได้เชื่อมต่ออินเทอร์เน็ตอยู่ ฟีเจอร์ AI จะไม่สามารถใช้งานได้ในตอนนี้
        แต่คุณสามารถทบทวนคำศัพท์ที่โหลดไว้แล้วได้
      </p>
      
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 bg-[#C4704B] text-white rounded-xl font-medium hover:bg-[#A65E3E] transition-colors"
        >
          ลองเชื่อมต่อใหม่
        </button>
        <Link
          href="/flashcard"
          className="w-full py-3 bg-white text-[#3D3630] border border-[#E8E0D5] rounded-xl font-medium hover:bg-[#E8E0D5]/30 transition-colors"
        >
          ทบทวนคำศัพท์ (Offline)
        </Link>
      </div>
    </div>
  )
}
