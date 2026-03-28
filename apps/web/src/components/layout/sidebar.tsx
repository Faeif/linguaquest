'use client'

import {
  BookOpen,
  FileText,
  MessageSquare,
  Mic,
  PanelLeft,
  PanelLeftClose,
  PenLine,
  ShoppingBag,
  Sparkles,
  User,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { DesktopUserMenu } from './DesktopUserMenu'

const mainNav = [
  { href: '/companion', icon: MessageSquare, label: 'Speak' },
  { href: '/flashcard', icon: BookOpen, label: 'Vocab' },
  { href: '/exam', icon: FileText, label: 'Exam' },
  { href: '/community', icon: ShoppingBag, label: 'Community' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function Sidebar({
  user,
}: {
  user?: { display_name?: string | null; avatar_url?: string | null; email?: string }
}) {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(true)

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <>
      {/* 💻 Desktop Sidebar (Hidden on Mobile) */}
      <aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 bg-[#FFFEFB] border-r border-[#E8E0D5] p-3 shrink-0 transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-64' : 'w-20 items-center'
        }`}
      >
        <div
          className={`flex items-center mb-6 px-2 py-3 ${isExpanded ? 'justify-between' : 'justify-center flex-col gap-4'}`}
        >
          <Link
            href="/companion"
            className={`flex items-center gap-2.5 ${!isExpanded && 'justify-center'}`}
          >
            <Image
              src="/icons/icon-192x192.png"
              alt="LQ Logo"
              width={32}
              height={32}
              className="rounded-lg shadow-sm"
            />
            {isExpanded && (
              <span className="font-bold tracking-tight text-[#3D3630] text-lg whitespace-nowrap overflow-hidden">
                LinguaQuest
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-[#9A9179] hover:text-[#3D3630] hover:bg-[#E8E0D5]/50 rounded-lg transition-colors"
          >
            {isExpanded ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
          </button>
        </div>

        <nav className="space-y-1 w-full">
          {mainNav.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${isExpanded ? 'gap-3 px-3' : 'justify-center px-0 w-12 mx-auto'} py-3 text-sm rounded-xl transition-colors group relative ${
                  active
                    ? 'bg-[#C4704B]/10 text-[#C4704B] font-medium'
                    : 'text-[#7A7067] hover:bg-[#E8E0D5]/50 hover:text-[#3D3630]'
                }`}
                title={!isExpanded ? item.label : undefined}
              >
                <item.icon size={20} className="shrink-0" />
                {isExpanded && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Secondary Links (Only on Desktop - Hidden if collapsed) */}
        <div
          className={`mt-8 mb-4 w-full transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}
        >
          <p className="px-3 py-2 text-[10px] font-bold text-[#9A9179] uppercase tracking-wider">
            พิเศษ
          </p>
          <nav className="space-y-1 w-full">
            <Link
              href="/essay"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#7A7067] rounded-lg hover:bg-[#E8E0D5]/50 transition-colors"
            >
              <Sparkles size={18} className="shrink-0" />
              <span className="whitespace-nowrap">Essay Grader</span>
            </Link>
            <Link
              href="/speaking"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#7A7067] rounded-lg hover:bg-[#E8E0D5]/50 transition-colors"
            >
              <Mic size={18} className="shrink-0" />
              <span className="whitespace-nowrap">Speaking Coach</span>
            </Link>
            <Link
              href="/writing"
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-[#7A7067] rounded-lg hover:bg-[#E8E0D5]/50 transition-colors"
            >
              <PenLine size={18} className="shrink-0" />
              <span className="whitespace-nowrap">Writing Coach</span>
            </Link>
          </nav>
        </div>

        <DesktopUserMenu user={user} isSidebarExpanded={isExpanded} />
      </aside>

      {/* 📱 Mobile Bottom Navigation (Hidden on Desktop) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[84px] pb-safe bg-[#FFFEFB] border-t border-[#E8E0D5] flex items-center justify-around px-2 z-50">
        {mainNav.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                active ? 'text-[#C4704B]' : 'text-[#9A9179]'
              }`}
            >
              <div
                className={`p-1.5 rounded-full transition-colors ${
                  active ? 'bg-[#C4704B]/10' : 'bg-transparent'
                }`}
              >
                <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
