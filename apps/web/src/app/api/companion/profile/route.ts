import { z } from 'zod'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const [{ data: profile }, { data: aiProfile }] = await Promise.all([
      supabase
        .from('profiles')
        .select('display_name, hsk_self_assessed, learning_goal')
        .eq('id', user.id)
        .single(),
      supabase
        .from('ai_user_profile')
        .select('grammar_weak_points, phoneme_errors, hsk_estimate, active_vocab')
        .eq('user_id', user.id)
        .maybeSingle(),
    ])

    return Response.json({
      data: {
        displayName: profile?.display_name ?? 'นักเรียน',
        hskLevel: profile?.hsk_self_assessed ?? aiProfile?.hsk_estimate ?? 'HSK1',
        learningGoal: profile?.learning_goal ?? 'general',
        grammarWeakPoints: aiProfile?.grammar_weak_points ?? [],
        toneWeakPoints: (aiProfile?.phoneme_errors as string[] | null) ?? [],
      },
      error: null,
    })
  } catch (error) {
    console.error('GET /api/companion/profile error:', error)
    return Response.json({ data: null, error: 'Internal Server Error' }, { status: 500 })
  }
}

const UpdateProfileSchema = z.object({
  grammarWeakPoints: z.array(z.string()).optional(),
  toneWeakPoints: z.array(z.string()).optional(),
  hskEstimate: z.string().optional(),
})

export async function PATCH(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const input = UpdateProfileSchema.parse(body)

    const { error } = await supabase.from('ai_user_profile').upsert(
      {
        user_id: user.id,
        ...(input.grammarWeakPoints !== undefined && {
          grammar_weak_points: input.grammarWeakPoints,
        }),
        ...(input.toneWeakPoints !== undefined && {
          phoneme_errors: input.toneWeakPoints,
        }),
        ...(input.hskEstimate !== undefined && { hsk_estimate: input.hskEstimate }),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )

    if (error) {
      return Response.json({ data: null, error: 'Failed to update profile' }, { status: 500 })
    }

    return Response.json({ data: { ok: true }, error: null })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { data: null, error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    console.error('PATCH /api/companion/profile error:', error)
    return Response.json({ data: null, error: 'Internal Server Error' }, { status: 500 })
  }
}
