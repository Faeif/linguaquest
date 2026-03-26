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
        <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-stone-100">
          <Mail size={22} className="text-[#8B5E3C]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-stone-800 tracking-tight">เช็คอีเมลของคุณ</h2>
          <p className="text-sm text-stone-500 leading-relaxed">
            หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านให้ภายในไม่กี่นาที
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-[#8B5E3C] hover:underline"
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
        <h2 className="text-2xl font-semibold text-stone-800 tracking-tight">ลืมรหัสผ่าน</h2>
        <p className="text-sm text-stone-500">กรอกอีเมลของคุณ แล้วเราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-stone-700">
            อีเมล
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] transition"
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#8B5E3C] text-white text-sm font-medium rounded-lg hover:bg-[#724C30] transition-colors disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          ส่งลิงก์รีเซ็ตรหัสผ่าน
        </button>
      </form>

      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
      >
        <ArrowLeft size={14} />
        กลับไปหน้าเข้าสู่ระบบ
      </Link>
    </div>
  )
}
