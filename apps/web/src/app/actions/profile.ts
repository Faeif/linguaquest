'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    String(process.env.NEXT_PUBLIC_SUPABASE_URL),
    String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('Unauthorized')

  const displayName = formData.get('displayName') as string
  const avatarFile = formData.get('avatarFile') as File | null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: any = {}

  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const filePath = `${user.id}-${Date.now()}.${fileExt}`
    
    // Upload standard file to Supabase via server (since client already compressed it)
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile)

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
    updates.avatar_url = data.publicUrl
  }

  if (displayName) updates.display_name = displayName

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) throw error
  }

  revalidatePath('/', 'layout') // Revalidate entire app to reflect new avatar globally
}
