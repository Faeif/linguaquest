'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { type ResetPasswordInput, ResetPasswordSchema } from '@/lib/schemas/auth'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
  })

  async function onSubmit(data: ResetPasswordInput) {
    setServerError('')
    const { error } = await supabase.auth.updateUser({ password: data.password })
    if (error) {
      setServerError('เกิดข้อผิดพลาด ลิงก์อาจหมดอายุแล้ว กรุณาขอลิงก์ใหม่')
      return
    }
    router.push('/login?reset=success')
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-stone-800 tracking-tight">ตั้งรหัสผ่านใหม่</h2>
        <p className="text-sm text-stone-500">รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-stone-700">
            รหัสผ่านใหม่
          </label>
          <div className="relative">
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 pr-10 rounded-lg border border-stone-200 bg-white text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-stone-700">
            ยืนยันรหัสผ่านใหม่
          </label>
          <input
            {...register('confirmPassword')}
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            className="w-full px-3 py-2.5 rounded-lg border border-stone-200 bg-white text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] transition"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#8B5E3C] text-white text-sm font-medium rounded-lg hover:bg-[#724C30] transition-colors disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          บันทึกรหัสผ่านใหม่
        </button>
      </form>
    </div>
  )
}
