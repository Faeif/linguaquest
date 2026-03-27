import { FileText } from 'lucide-react'

export default function EssayPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-[#3D3630] tracking-tight">AI Essay Grader</h1>
        <p className="text-[#7A7067]">ส่งเรียงความภาษาจีนเพื่อรับ feedback จาก AI</p>
      </div>

      <div className="bg-[#FFFEFB] border border-[#E8E0D5] rounded-xl p-8 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#7D8B6A]/10 flex items-center justify-center mb-4">
          <FileText size={24} className="text-[#7D8B6A]" />
        </div>
        <h2 className="text-lg font-medium text-[#3D3630] mb-2">Coming Soon</h2>
        <p className="text-sm text-[#7A7067] max-w-md mx-auto">
          ส่งเรียงความหรือข้อเขียนภาษาจีนของคุณ AI จะตรวจไวยากรณ์
          โครงสร้างประโยค และให้คะแนนพร้อม feedback ที่เข้าใจง่าย
        </p>
      </div>
    </div>
  )
}
