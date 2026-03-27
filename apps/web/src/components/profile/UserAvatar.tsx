'use client'

import Image from 'next/image'
import { User } from 'lucide-react'

interface UserAvatarProps {
  avatarUrl?: string | null
  className?: string
  alt?: string
  width?: number
  height?: number
}

export function UserAvatar({ avatarUrl, className = '', alt = 'User Avatar', width = 48, height = 48 }: UserAvatarProps) {
  if (!avatarUrl) {
    return (
      <div 
        className={`bg-[#E8E0D5]/50 flex items-center justify-center text-[#9A9179] rounded-full overflow-hidden shrink-0 ${className}`}
        style={{ width, height, minWidth: width, minHeight: height }}
      >
        <User size={Math.floor(width * 0.5)} />
      </div>
    )
  }

  return (
    <div 
      className={`rounded-full overflow-hidden shrink-0 border border-[#E8E0D5] bg-[#E8E0D5]/20 ${className}`}
      style={{ width, height, minWidth: width, minHeight: height }}
    >
      <Image
        src={avatarUrl}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-cover"
        unoptimized={avatarUrl.includes('supabase')} // Prevent Next.js double-optimization if Supabase already optimizes, but we should actually let Next.js optimize or use unoptimized for external URLs to save Vercel costs/errors if domains aren't configured.
      />
    </div>
  )
}
