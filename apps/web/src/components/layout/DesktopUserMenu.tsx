'use client'

import { useState, useRef, useEffect } from 'react'
import { UserAvatar } from '@/components/profile/UserAvatar'
import { Sparkles, Bell, Shield, AlertCircle, LogOut } from 'lucide-react'
import { signOutAction } from '@/app/actions/auth'
import { useUserProfile } from '@/contexts/UserProfileContext'

export function DesktopUserMenu({
  isSidebarExpanded
}: {
  user?: { display_name?: string | null; avatar_url?: string | null; email?: string }
  isSidebarExpanded: boolean
}) {
  const { profile } = useUserProfile()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative mt-auto pt-4 border-t border-[#E8E0D5] w-full" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center w-full rounded-xl hover:bg-[#E8E0D5]/50 transition-colors p-2 ${
          isSidebarExpanded ? 'gap-3 justify-start' : 'justify-center'
        }`}
      >
        <UserAvatar avatarUrl={profile.avatar_url} width={36} height={36} />
        {isSidebarExpanded && (
          <div className="flex flex-col items-start overflow-hidden flex-1 text-left">
            <span className="text-sm font-semibold text-[#3D3630] truncate w-full">
              {profile.display_name || 'ผู้ใช้ LinguaQuest'}
            </span>
            <span className="text-[10px] text-[#9A9179] font-medium">
              Free plan
            </span>
          </div>
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute bottom-[110%] left-0 w-[240px] bg-white rounded-2xl shadow-xl border border-[#E8E0D5] overflow-hidden z-50 py-1 origin-bottom-left animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="px-4 py-3 border-b border-[#E8E0D5] flex items-center gap-3">
             <UserAvatar avatarUrl={profile.avatar_url} width={40} height={40} />
             <div className="flex flex-col overflow-hidden">
               <span className="text-sm font-semibold text-[#3D3630] truncate w-full">{profile.display_name || 'ผู้ใช้ LinguaQuest'}</span>
               <span className="text-xs text-[#9A9179] truncate w-full">{profile.email || 'Free plan'}</span>
             </div>
          </div>
          <div className="p-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#FAF7F2] rounded-xl transition-colors group">
              <div className="w-7 h-7 rounded-lg bg-[#DA885B]/10 flex items-center justify-center group-hover:bg-[#DA885B]/20 transition-colors">
                <Sparkles size={16} className="text-[#DA885B]" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-[#3D3630]">Upgrade to Pro</span>
                <span className="text-[10px] text-[#9A9179] truncate w-full">Unlock 4-D Essay Grader</span>
              </div>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#FAF7F2] rounded-xl transition-colors text-[#7A7067]">
              <Bell size={16} />
              <span className="text-sm font-medium">Preferences & WebPush</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#FAF7F2] rounded-xl transition-colors text-[#7A7067]">
              <Shield size={16} />
              <span className="text-sm font-medium">Policies (Privacy & ToS)</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[#FAF7F2] rounded-xl transition-colors text-[#7A7067]">
              <AlertCircle size={16} />
              <span className="text-sm font-medium">Contact Support</span>
            </button>
          </div>
          <div className="p-1 border-t border-[#E8E0D5]">
            <form action={signOutAction}>
              <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-red-50 text-red-500 rounded-xl transition-colors font-medium text-sm">
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
