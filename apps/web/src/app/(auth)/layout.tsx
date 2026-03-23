import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login — LinguaQuest',
  description: 'เข้าสู่ระบบ LinguaQuest แพลตฟอร์มเรียนภาษาอังกฤษด้วย AI',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
