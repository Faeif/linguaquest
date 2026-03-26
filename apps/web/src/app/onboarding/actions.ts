'use server'

import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { type OnboardingInput, OnboardingSchema } from '@/lib/schemas/onboarding'

export async function submitOnboarding(data: OnboardingInput) {
  try {
    // 1. Validate data
    const parsedData = OnboardingSchema.parse(data)

    // 2. Initialize Supabase
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
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          },
        },
      }
    )

    // 3. Get Auth User
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Unauthorized. Please login again.' }
    }

    // 4. Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        learning_goal: parsedData.learningGoal,
        hsk_self_assessed: parsedData.hskSelfAssessed,
        daily_goal_minutes: parsedData.dailyGoalMinutes,
        onboarding_completed: true,
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Failed to update profile:', profileError)
      return { success: false, error: 'Failed to save onboarding data.' }
    }

    // 5. Initialize ai_user_profile cache
    const { error: aiProfileError } = await supabase.from('ai_user_profile').upsert(
      {
        user_id: user.id,
        hsk_estimate: parsedData.hskSelfAssessed,
      },
      { onConflict: 'user_id', ignoreDuplicates: true }
    )

    if (aiProfileError) {
      console.error('Failed to initialize AI profile:', aiProfileError)
      // Non-fatal error, the main profile is saved.
    }

    // 6. Revalidate the home path where progress is shown
    revalidatePath('/home')

    return { success: true }
  } catch (err) {
    if (err instanceof Error) {
      return { success: false, error: err.message }
    }
    return { success: false, error: 'An unexpected error occurred during onboarding.' }
  }
}
