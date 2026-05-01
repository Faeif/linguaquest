'use client'

import { createContext, useCallback, useContext, useState } from 'react'

interface UserProfile {
  display_name: string | null
  avatar_url: string | null
  email?: string
}

interface UserProfileContextValue {
  profile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null)

export function UserProfileProvider({
  initial,
  children,
}: {
  initial: UserProfile
  children: React.ReactNode
}) {
  const [profile, setProfile] = useState<UserProfile>(initial)

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }))
  }, [])

  return (
    <UserProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </UserProfileContext.Provider>
  )
}

export function useUserProfile(): UserProfileContextValue {
  const ctx = useContext(UserProfileContext)
  if (!ctx) throw new Error('useUserProfile must be used inside UserProfileProvider')
  return ctx
}
