'use client'

import { Loader2, Mail, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const supabase = createClient()

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState('')

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return // Only allow digits

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only keep last digit
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      setOtp(pastedData.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  async function handleVerify() {
    if (!email) return
    const code = otp.join('')
    if (code.length !== 6) {
      setError('กรุณากรอกรหัส OTP 6 หลัก')
      return
    }

    setVerifying(true)
    setError('')

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    })

    setVerifying(false)

    if (error) {
      setError('รหัส OTP ไม่ถูกต้องหรือหมดอายุ กรุณาลองใหม่')
      return
    }

    if (data.user) {
      // Check onboarding status
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single()

      if (!profile?.onboarding_completed) {
        router.push('/onboarding')
      } else {
        router.push('/home')
      }
      router.refresh()
    }
  }

  async function handleResend() {
    if (!email) return
    setResending(true)
    setError('')

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
          เราส่งรหัส OTP 6 หลักไปที่
          {email && <span className="block font-medium text-[#3D3630] mt-1">{email}</span>}
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center gap-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-10 h-12 flex-shrink-0 text-center text-xl font-semibold rounded-lg border border-[#E8E0D5] bg-white text-[#3D3630] focus:outline-none focus:ring-2 focus:ring-[#C4704B] focus:border-[#C4704B] transition"
          />
        ))}
      </div>

      {error && <p className="text-sm text-[#B56B6B]">{error}</p>}

      <button
        type="button"
        onClick={handleVerify}
        disabled={verifying || otp.join('').length !== 6}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#C4704B] text-white text-sm font-medium rounded-lg hover:bg-[#A85A3A] transition-colors disabled:opacity-60"
      >
        {verifying && <Loader2 size={15} className="animate-spin" />}
        ยืนยัน
      </button>

      <div className="border border-[#E8E0D5] rounded-xl p-4 bg-[#FFFEFB] text-left space-y-3">
        <p className="text-sm font-medium text-[#3D3630]">ไม่ได้รับรหัส?</p>
        <ul className="text-sm text-[#7A7067] space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-[#9A9179]">•</span>
            ลองเช็คโฟลเดอร์ Spam หรือ Junk
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#9A9179]">•</span>
            รหัสจะหมดอายุใน 1 ชั่วโมง
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
            {resent ? 'ส่งรหัสใหม่แล้ว' : 'ส่งรหัสใหม่'}
          </button>
        )}
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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 text-center">
          <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-[#C4704B]/10">
            <Mail size={24} className="text-[#C4704B]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[#3D3630] tracking-tight">ยืนยันอีเมลของคุณ</h2>
            <p className="text-sm text-[#7A7067]">กำลังโหลด...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
