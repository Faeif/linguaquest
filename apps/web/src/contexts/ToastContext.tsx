'use client'

import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) { clearTimeout(timer); timers.current.delete(id) }
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]) // max 4 at once
    const timer = setTimeout(() => dismiss(id), type === 'error' ? 5000 : 3500)
    timers.current.set(id, timer)
  }, [dismiss])

  // Cleanup on unmount
  useEffect(() => {
    const t = timers.current
    return () => { t.forEach(clearTimeout) }
  }, [])

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 size={16} className="text-[#6B7F5E] shrink-0" />,
    error: <XCircle size={16} className="text-[#B56B6B] shrink-0" />,
    info: <Info size={16} className="text-[#7D8B6A] shrink-0" />,
  }

  const borders: Record<ToastType, string> = {
    success: 'border-[#6B7F5E]/30',
    error: 'border-[#B56B6B]/30',
    info: 'border-[#7D8B6A]/30',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast stack — bottom-right on desktop, bottom-center on mobile */}
      <div
        aria-live="polite"
        className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-[200] flex flex-col gap-2 items-end pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 bg-white border rounded-xl shadow-md text-sm text-[#3D3630] max-w-xs animate-in slide-in-from-bottom-2 fade-in duration-200 ${borders[t.type]}`}
          >
            {icons[t.type]}
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="text-[#9A9179] hover:text-[#3D3630] transition-colors ml-1"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
