'use client'

import { useState, useRef } from 'react'
import { UserAvatar } from './UserAvatar'
import { Camera, X, Loader2 } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { updateProfileAction } from '@/app/actions/profile'

interface EditProfileModalProps {
  user: {
    display_name?: string | null
    avatar_url?: string | null
    email?: string
  }
}

export function EditProfileModal({ user }: EditProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [compressedFile, setCompressedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const options = {
        maxSizeMB: 0.2, // 200KB max
        maxWidthOrHeight: 400,
        useWebWorker: true,
        initialQuality: 0.8
      }
      const compressed = await imageCompression(file, options)
      
      const newFile = new File([compressed], file.name, { type: compressed.type })
      setCompressedFile(newFile)
      
      setPreviewUrl(URL.createObjectURL(newFile))
    } catch (error) {
      console.error('Error compressing image:', error)
      alert("Failed to compress image.")
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    if (compressedFile) {
      formData.set('avatarFile', compressedFile)
    }

    try {
      await updateProfileAction(formData)
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to save profile', error)
      alert("Failed to update profile.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => setIsOpen(true)}>
            <UserAvatar avatarUrl={user.avatar_url} width={72} height={72} className="shadow-sm" />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#3D3630]">
              {user.display_name || 'ผู้เรียน'}
            </h1>
            <button onClick={() => setIsOpen(true)} className="text-sm font-medium bg-[#E8E0D5]/50 px-3 py-1 rounded-full text-[#7A7067] hover:bg-[#E8E0D5] mt-1 transition-colors">
              แก้ไขโปรไฟล์
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-[#3D3630]/40 p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-[50%] sm:slide-in-from-bottom-[10%] duration-300">
            <div className="flex justify-between items-center p-4 sm:p-5 border-b border-[#E8E0D5]">
              <h2 className="text-lg font-semibold text-[#3D3630]">แก้ไขโปรไฟล์</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#E8E0D5]/50 hover:bg-[#E8E0D5] text-[#7A7067] transition-colors"
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
              <div className="flex flex-col items-center">
                <div 
                  className="relative group cursor-pointer mb-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UserAvatar avatarUrl={previewUrl || user.avatar_url} width={96} height={96} />
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={28} className="text-white" />
                  </div>
                </div>
                <span className="text-xs text-[#9A9179]">แตะที่รูปเพื่อเปลี่ยน</span>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="displayName" className="text-sm font-medium text-[#3D3630]">ชื่อที่ใช้แสดง</label>
                <input 
                  type="text" 
                  id="displayName"
                  name="displayName"
                  defaultValue={user.display_name || ''}
                  className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8E0D5] rounded-xl text-[#3D3630] focus:outline-none focus:ring-2 focus:ring-[#C4704B]/50 transition-all"
                  placeholder="เช่น หวังต้าลี่"
                  maxLength={30}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#C4704B] text-white rounded-xl font-medium hover:bg-[#A65E3E] active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center"
              >
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'บันทึกข้อมูล'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
