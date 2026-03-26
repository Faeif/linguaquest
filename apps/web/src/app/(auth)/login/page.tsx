'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { type LoginInput, LoginSchema } from '@/lib/schemas/auth'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setServerError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      setServerError('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      return
    }
    router.push('/home')
    router.refresh()
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-stone-800 tracking-tight">ยินดีต้อนรับกลับ</h2>
        <p className="text-sm text-stone-500">เข้าสู่ระบบเพื่อเรียนต่อ</p>
      </div>

      {/* Google Login */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-stone-200 rounded-lg text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 transition-colors disabled:opacity-60"
      >
        {googleLoading ? (
          <Loader2 size={16} className="animate-spin text-stone-400" />
        ) : (
          <GoogleIcon />
        )}
        เข้าสู่ระบบด้วย Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-stone-200" />
        <span className="text-xs text-stone-400">หรือ</span>
        <div className="flex-1 h-px bg-stone-200" />
      </div>

      {/* Email Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            {serverError}
          </div>
        )}

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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-stone-700">
              รหัสผ่าน
            </label>
            <Link href="/forgot-password" className="text-xs text-[#8B5E3C] hover:underline">
              ลืมรหัสผ่าน?
            </Link>
          </div>
          <div className="relative">
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#8B5E3C] text-white text-sm font-medium rounded-lg hover:bg-[#724C30] transition-colors disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={15} className="animate-spin" />}
          เข้าสู่ระบบ
        </button>
      </form>

      <p className="text-center text-sm text-stone-500">
        ยังไม่มีบัญชี?{' '}
        <Link href="/register" className="text-[#8B5E3C] font-medium hover:underline">
          สมัครสมาชิก
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
