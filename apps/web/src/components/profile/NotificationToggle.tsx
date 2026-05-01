'use client'

import { Bell, BellOff, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type State = 'loading' | 'unsupported' | 'denied' | 'enabled' | 'disabled'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

const TIME_OPTIONS = [
  { value: '07:00', label: '07:00 — เช้าเริ่มวัน' },
  { value: '12:00', label: '12:00 — พักเที่ยง' },
  { value: '18:00', label: '18:00 — เลิกงาน/เลิกเรียน' },
  { value: '20:00', label: '20:00 — ช่วงเย็น (แนะนำ)' },
  { value: '21:00', label: '21:00 — ก่อนนอน' },
  { value: '22:00', label: '22:00 — ดึกหน่อย' },
]

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

const SW_STATE_KEY = 'lq_push_state'

export function NotificationToggle({ savedTime }: { savedTime?: string | null }) {
  // Read cached state from localStorage for instant render (no flash/spinner)
  const [state, setState] = useState<State>(() => {
    if (typeof window === 'undefined') return 'loading'
    const cached = localStorage.getItem(SW_STATE_KEY) as State | null
    return cached ?? 'loading'
  })
  const [busy, setBusy] = useState(false)
  const [reminderTime, setReminderTime] = useState(savedTime ?? '20:00')
  const [timeSaved, setTimeSaved] = useState(false)
  const resolvedRef = useRef(false)

  // Persist state changes to localStorage
  function setPersistedState(next: State) {
    setState(next)
    if (next !== 'loading') localStorage.setItem(SW_STATE_KEY, next)
  }

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPersistedState('unsupported')
      return
    }
    if (Notification.permission === 'denied') {
      setPersistedState('denied')
      return
    }

    // Timeout fallback: if SW isn't ready in 4s, assume disabled
    const timeout = setTimeout(() => {
      if (!resolvedRef.current) {
        resolvedRef.current = true
        setPersistedState('disabled')
      }
    }, 4000)

    navigator.serviceWorker.ready
      .then(async (reg) => {
        if (resolvedRef.current) return
        resolvedRef.current = true
        clearTimeout(timeout)
        const sub = await reg.pushManager.getSubscription()
        setPersistedState(sub ? 'enabled' : 'disabled')
      })
      .catch(() => {
        if (!resolvedRef.current) {
          resolvedRef.current = true
          clearTimeout(timeout)
          setPersistedState('disabled')
        }
      })

    return () => clearTimeout(timeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function enable() {
    setBusy(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setPersistedState('denied')
        return
      }

      if (!('serviceWorker' in navigator)) {
        alert('Service Worker ไม่รองรับ — ลอง reload หน้าอีกครั้ง')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as string,
      })

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), notificationTime: reminderTime }),
      })

      if (!res.ok) throw new Error('Subscribe API failed')
      setPersistedState('enabled')
    } catch (err) {
      console.error('Push subscribe error:', err)
    } finally {
      setBusy(false)
    }
  }

  async function disable() {
    setBusy(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) await sub.unsubscribe()
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: null, notificationTime: null }),
      })
      setPersistedState('disabled')
    } catch (err) {
      console.error('Push unsubscribe error:', err)
    } finally {
      setBusy(false)
    }
  }

  async function saveTime(newTime: string) {
    setReminderTime(newTime)
    if (state !== 'enabled') return
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationTime: newTime }),
    })
    setTimeSaved(true)
    setTimeout(() => setTimeSaved(false), 2000)
  }

  // Always render — never return null
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[#3D3630]">การแจ้งเตือนประจำวัน</span>
          <span className="text-xs text-[#9A9179]">
            {state === 'loading'
              ? 'กำลังตรวจสอบ...'
              : state === 'unsupported'
                ? 'เบราว์เซอร์นี้ไม่รองรับ Push Notification'
                : state === 'denied'
                  ? 'ถูกบล็อกโดยเบราว์เซอร์ — เปิดใน Site Settings'
                  : state === 'enabled'
                    ? 'เปิดอยู่ — รับแจ้งเตือนทุกวัน'
                    : 'ปิดอยู่ — กด เปิด เพื่อรับแจ้งเตือนทุกวัน'}
          </span>
        </div>

        {/* Button: show for disabled/enabled, hide for unsupported/denied/loading */}
        {(state === 'enabled' || state === 'disabled') && (
          <button
            type="button"
            onClick={state === 'enabled' ? disable : enable}
            disabled={busy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-60 ${
              state === 'enabled'
                ? 'bg-[#7D8B6A]/10 text-[#7D8B6A] hover:bg-[#7D8B6A]/20'
                : 'bg-[#C4704B]/10 text-[#C4704B] hover:bg-[#C4704B]/20'
            }`}
          >
            {busy ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : state === 'enabled' ? (
              <BellOff className="w-3.5 h-3.5" />
            ) : (
              <Bell className="w-3.5 h-3.5" />
            )}
            {state === 'enabled' ? 'ปิด' : 'เปิด'}
          </button>
        )}

        {state === 'loading' && (
          <Loader2 className="w-4 h-4 animate-spin text-[#9A9179]" />
        )}
      </div>

      {/* Time picker — shown only when enabled */}
      {state === 'enabled' && (
        <div className="rounded-xl bg-[#FAF7F2] border border-[#E8E0D5] p-3 space-y-2">
          <p className="text-xs font-medium text-[#7A7067]">เวลาที่อยากรับแจ้งเตือน</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => saveTime(opt.value)}
                className={`px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                  reminderTime === opt.value
                    ? 'bg-[#C4704B] text-white font-medium'
                    : 'bg-white border border-[#E8E0D5] text-[#7A7067] hover:border-[#C4704B]/50 hover:text-[#C4704B]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {timeSaved && <p className="text-xs text-[#7D8B6A] font-medium">บันทึกแล้ว ✓</p>}
          <p className="text-[10px] text-[#9A9179] pt-1 border-t border-[#E8E0D5]">
            จะได้รับ: แจ้งเตือนเวลาฝึก + เตือน streak ตอน 21:00 ถ้ายังไม่ได้ฝึก
          </p>
        </div>
      )}
    </div>
  )
}
