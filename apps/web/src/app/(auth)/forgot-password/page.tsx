'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { type ForgotPasswordInput, ForgotPasswordSchema } from '@/lib/schemas/auth'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${location.origin}/reset-password`,
    })
    // Always show success (don't reveal if email exists)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-[#C4704B]/10">
          <Mail size={22} className="text-[#C4704B]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-[#3D3630] tracking-tight">เช็คอีเมลของคุณ</h2>
          <p className="text-sm text-[#7A7067] leading-relaxed">
            หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้ภายในไม่กี่นาที
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-[#C4704B] hover:underline"
        >
          <ArrowLeft size={14} />
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-[#3D3630] tracking-tight">ลืมรหัสผ่าน</h2>
        <p className="text-sm text-[#7A7067]">กรอกอีเมลของคุณ แล้วเราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-[#3D3630]">
            อีเมล
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full px-3 py-2.5 rounded-lg border border-[#E8E0D5] bg-white text-sm text-[#3D3630] placeholder:text-[#9A9179] focus:outline-none focus:ring-1 focus:ring-[#C4704B] focus:border-[#C4704B] transition"
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#C4704B] text-white text-sm font-medium rounded-lg hover:bg-[#A85A3A] transition-colors disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          ส่งลิงก์รีเซ็ตรหัสผ่าน
        </button>
      </form>

      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm text-[#7A7067] hover:text-[#3D3630] transition-colors"
      >
        <ArrowLeft size={14} />
        กลับไปหน้าเข้าสู่ระบบ
      </Link>
    </div>
  )
}
