import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { WritingClient } from './WritingClient'

export const metadata = {
  title: 'ฝึกเขียน | LinguaQuest',
}

export default async function WritingPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 lg:p-8">
      <WritingClient />
    </div>
  )
}
