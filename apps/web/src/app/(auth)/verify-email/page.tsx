'use client'

import { Loader2, Mail, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState('')

  async function handleResend() {
    if (!email) return
    setResending(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    setResending(false)
    if (error) {
      setError('ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง')
    } else {
      setResent(true)
      setTimeout(() => setResent(false), 5000)
    }
  }

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-[#C4704B]/10">
        <Mail size={24} className="text-[#C4704B]" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-[#3D3630] tracking-tight">ยืนยันอีเมลของคุณ</h2>
        <p className="text-sm text-[#7A7067] leading-relaxed max-w-xs mx-auto">
          เราส่งลิงก์ยืนยันตัวตนไปที่
          {email && <span className="block font-medium text-[#3D3630] mt-1">{email}</span>}
        </p>
      </div>

      <div className="border border-[#E8E0D5] rounded-xl p-4 bg-[#FFFEFB] text-left space-y-3">
        <p className="text-sm font-medium text-[#3D3630]">ไม่เจออีเมล?</p>
        <ul className="text-sm text-[#7A7067] space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-[#9A9179]">•</span>
            ลองเช็คโฟลเดอร์ Spam หรือ Junk
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#9A9179]">•</span>
            ลิงก์จะหมดอายุใน 24 ชั่วโมง
          </li>
        </ul>

        {email && (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || resent}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 border border-[#E8E0D5] rounded-lg text-sm font-medium text-[#3D3630] bg-white hover:bg-[#FAF7F2] transition-colors disabled:opacity-60"
          >
            {resending ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            {resent ? 'ส่งอีเมลอีกครั้งแล้ว' : 'ส่งอีเมลอีกครั้ง'}
          </button>
        )}

        {error && <p className="text-xs text-[#B56B6B] text-center">{error}</p>}
      </div>

      <p className="text-sm text-[#7A7067]">
        กลับไป{' '}
        <Link href="/login" className="text-[#C4704B] font-medium hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  )
}
