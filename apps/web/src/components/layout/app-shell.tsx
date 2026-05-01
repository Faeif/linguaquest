'use client'

import type { ReactNode } from 'react'
import { UserProfileProvider } from '@/contexts/UserProfileContext'
import { Sidebar } from './sidebar'

interface AppShellProps {
  children: ReactNode
  user?: { display_name?: string | null; avatar_url?: string | null; email?: string }
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <UserProfileProvider
      initial={{
        display_name: user?.display_name ?? null,
        avatar_url: user?.avatar_url ?? null,
        email: user?.email,
      }}
    >
      <div className="bg-[#FAF7F2] lg:flex">
        <Sidebar user={user} />
        <main className="flex-1 min-h-screen pb-24 lg:pb-0">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </UserProfileProvider>
  )
}
