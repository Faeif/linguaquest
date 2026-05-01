'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UserAvatar } from './UserAvatar'
import { Camera, X, Loader2 } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { updateProfileAction } from '@/app/actions/profile'
import { useToast } from '@/contexts/ToastContext'
import { useUserProfile } from '@/contexts/UserProfileContext'

interface EditProfileModalProps {
  user: {
    display_name?: string | null
    avatar_url?: string | null
    email?: string
  }
}

export function EditProfileModal({ user }: EditProfileModalProps) {
  const router = useRouter()
  const { updateProfile } = useUserProfile()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Optimistic local state — updates immediately on save without waiting for server refresh
  const [localName, setLocalName] = useState(user.display_name ?? '')
  const [localAvatarUrl, setLocalAvatarUrl] = useState(user.avatar_url ?? null)

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [compressedFile, setCompressedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 400,
        useWebWorker: true,
        initialQuality: 0.8,
      })
      const newFile = new File([compressed], file.name, { type: compressed.type })
      setCompressedFile(newFile)
      setPreviewUrl(URL.createObjectURL(newFile))
    } catch (err) {
      console.error('Image compression error:', err)
      toast('บีบอัดรูปไม่สำเร็จ ลองใหม่อีกครั้ง', 'error')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault() // ← stops browser default form submit/navigate
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    if (compressedFile) formData.set('avatarFile', compressedFile)

    // Read the name the user typed (for optimistic update)
    const typedName = (formData.get('displayName') as string | null) ?? ''

    try {
      await updateProfileAction(formData)

      // Optimistic update — update local state AND global context instantly
      if (typedName) setLocalName(typedName)
      if (previewUrl) setLocalAvatarUrl(previewUrl)

      // Push to context → sidebar & other components update immediately (no reload needed)
      updateProfile({
        ...(typedName ? { display_name: typedName } : {}),
        ...(previewUrl ? { avatar_url: previewUrl } : {}),
      })

      setIsOpen(false)
      setPreviewUrl(null)
      setCompressedFile(null)

      router.refresh() // Re-fetch server components quietly in background
    } catch (err) {
      console.error('Failed to save profile:', err)
      setError('บันทึกไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Profile header — uses local state for instant feedback */}
      <div className="flex items-center gap-4">
        <div
          className="relative group cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <UserAvatar
            avatarUrl={localAvatarUrl}
            width={72}
            height={72}
            className="shadow-sm"
          />
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={20} className="text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[#3D3630]">
            {localName || 'ผู้เรียน'}
          </h1>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-sm font-medium bg-[#E8E0D5]/50 px-3 py-1 rounded-full text-[#7A7067] hover:bg-[#E8E0D5] mt-1 transition-colors"
          >
            แก้ไขโปรไฟล์
          </button>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[#3D3630]/40 p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-[50%] sm:slide-in-from-bottom-[10%] duration-300">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-[#E8E0D5]">
              <h2 className="text-lg font-semibold text-[#3D3630]">แก้ไขโปรไฟล์</h2>
              <button
                type="button"
                onClick={() => { setIsOpen(false); setError(null) }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#E8E0D5]/50 hover:bg-[#E8E0D5] text-[#7A7067] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
              {/* Avatar picker */}
              <div className="flex flex-col items-center">
                <div
                  className="relative group cursor-pointer mb-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UserAvatar
                    avatarUrl={previewUrl || localAvatarUrl}
                    width={96}
                    height={96}
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={28} className="text-white" />
                  </div>
                </div>
                <span className="text-xs text-[#9A9179]">แตะที่รูปเพื่อเปลี่ยน</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                />
              </div>

              {/* Name input */}
              <div className="space-y-1.5">
                <label htmlFor="displayName" className="text-sm font-medium text-[#3D3630]">
                  ชื่อที่ใช้แสดง
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  defaultValue={localName}
                  className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8E0D5] rounded-xl text-[#3D3630] focus:outline-none focus:ring-2 focus:ring-[#C4704B]/50 transition-all"
                  placeholder="เช่น หวังต้าลี่"
                  maxLength={30}
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-[#B56B6B]">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#C4704B] text-white rounded-xl font-medium hover:bg-[#A65E3E] active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
