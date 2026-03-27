'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Eye, EyeOff, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { type RegisterInput, RegisterSchema } from '@/lib/schemas/auth'
import { createClient } from '@/lib/supabase/client'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8 ตัวอักษรขึ้นไป', ok: password.length >= 8 },
    { label: 'ตัวพิมพ์ใหญ่', ok: /[A-Z]/.test(password) },
    { label: 'อักขระพิเศษ', ok: /[!@#$%^&*(),.?\":{}|<>]/.test(password) },
  ]
  if (!password) return null
  return (
    <div className="flex gap-3 mt-2">
      {checks.map((c) => (
        <div key={c.label} className="flex items-center gap-1">
          {c.ok ? (
            <Check size={12} className="text-emerald-500" />
          ) : (
            <X size={12} className="text-red-400" />
          )}
          <span className={`text-[11px] ${c.ok ? 'text-emerald-600' : 'text-[#9A9179]'}`}>
            {c.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  })

  const password = watch('password', '')

  async function onSubmit(data: RegisterInput) {
    setServerError('')
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })
    if (error) {
      setServerError(
        error.message === 'User already registered'
          ? 'อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบ'
          : `เกิดข้อผิดพลาด: ${error.message}`
      )
      return
    }
    // Redirect to OTP verification page
    router.push(`/verify-email?email=${encodeURIComponent(data.email)}`)
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-[#3D3630] tracking-tight">สร้างบัญชีใหม่</h2>
        <p className="text-sm text-[#7A7067]">เริ่มต้นเรียนภาษาจีนได้ฟรี</p>
      </div>

      {/* Google Sign-up */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-[#E8E0D5] rounded-lg text-sm font-medium text-[#3D3630] bg-white hover:bg-[#FAF7F2] transition-colors disabled:opacity-60"
      >
        {googleLoading ? (
          <Loader2 size={16} className="animate-spin text-[#9A9179]" />
        ) : (
          <GoogleIcon />
        )}
        สมัครด้วย Google
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#E8E0D5]" />
        <span className="text-xs text-[#9A9179]">หรือ</span>
        <div className="flex-1 h-px bg-[#E8E0D5]" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            {serverError}
          </div>
        )}

        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-[#3D3630]">
            ชื่อ
          </label>
          <input
            {...register('name')}
            id="name"
            type="text"
            placeholder="ชื่อที่แสดงในระบบ"
            autoComplete="name"
            className="w-full px-3 py-2.5 rounded-lg border border-[#E8E0D5] bg-white text-sm text-[#3D3630] placeholder:text-[#9A9179] focus:outline-none focus:ring-1 focus:ring-[#C4704B] focus:border-[#C4704B] transition"
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        {/* Email */}
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

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-[#3D3630]">
            รหัสผ่าน
          </label>
          <div className="relative">
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full px-3 py-2.5 pr-10 rounded-lg border border-[#E8E0D5] bg-white text-sm text-[#3D3630] placeholder:text-[#9A9179] focus:outline-none focus:ring-1 focus:ring-[#C4704B] focus:border-[#C4704B] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9179] hover:text-[#3D3630] transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <PasswordStrength password={password} />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-[#3D3630]">
            ยืนยันรหัสผ่าน
          </label>
          <input
            {...register('confirmPassword')}
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className="w-full px-3 py-2.5 rounded-lg border border-[#E8E0D5] bg-white text-sm text-[#3D3630] placeholder:text-[#9A9179] focus:outline-none focus:ring-1 focus:ring-[#C4704B] focus:border-[#C4704B] transition"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            {...register('acceptTerms')}
            id="acceptTerms"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-[#E8E0D5] text-[#C4704B] focus:ring-[#C4704B] cursor-pointer"
          />
          <label
            htmlFor="acceptTerms"
            className="text-xs text-[#7A7067] leading-relaxed cursor-pointer"
          >
            ฉันยอมรับ{' '}
            <Link href="/policies/terms" className="text-[#C4704B] hover:underline" target="_blank">
              ข้อตกลงการใช้งาน
            </Link>{' '}
            และ{' '}
            <Link
              href="/policies/privacy"
              className="text-[#C4704B] hover:underline"
              target="_blank"
            >
              นโยบายความเป็นส่วนตัว
            </Link>
          </label>
        </div>
        {errors.acceptTerms && <p className="text-xs text-red-500">{errors.acceptTerms.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#C4704B] text-white text-sm font-medium rounded-lg hover:bg-[#A85A3A] transition-colors disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          สร้างบัญชี
        </button>
      </form>

      <p className="text-center text-sm text-[#7A7067]">
        มีบัญชีอยู่แล้ว?{' '}
        <Link href="/login" className="text-[#C4704B] font-medium hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-label="Google" role="img">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}
