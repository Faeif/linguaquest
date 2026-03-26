import { Mail } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-stone-100">
        <Mail size={22} className="text-[#8B5E3C]" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-stone-800 tracking-tight">ยืนยันอีเมลของคุณ</h2>
        <p className="text-sm text-stone-500 leading-relaxed max-w-xs mx-auto">
          เราส่งลิงก์ยืนยันตัวตนไปที่อีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายและกดลิงก์เพื่อเปิดใช้งานบัญชี
        </p>
      </div>

      <div className="border border-stone-100 rounded-lg p-4 bg-stone-50 text-left space-y-2">
        <p className="text-xs font-medium text-stone-600">ไม่เจออีเมล?</p>
        <ul className="text-xs text-stone-500 space-y-1 list-disc list-inside">
          <li>ลองเช็คโฟลเดอร์ Spam หรือ Junk</li>
          <li>ลิงก์จะหมดอายุใน 15 นาที</li>
        </ul>
      </div>

      <p className="text-sm text-stone-500">
        กลับไป{' '}
        <Link href="/login" className="text-[#8B5E3C] font-medium hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  )
}
