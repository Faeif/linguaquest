import type { SupabaseClient } from '@supabase/supabase-js'
import { type ModelMessage, streamText } from 'ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { MODE_INSTRUCTIONS } from '@/features/companion/constants/modes'
import { PERSONAS } from '@/features/companion/constants/personas'
import { CONVERSATION_ENGINE_PROMPT } from '@/features/companion/constants/prompts'
import type { LearningDNA, SessionConfig } from '@/features/companion/types'
import { deepseek } from '@/lib/ai/clients'
import { createServerSupabase } from '@/lib/supabase/server'

export const maxDuration = 60

const RequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  ),
  sessionConfig: z.custom<SessionConfig>(), // Expecting strictly passed from frontend matching SessionConfig type
  learningDNA: z.custom<LearningDNA>(),
})

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
    }

    const { messages, sessionConfig, learningDNA } = parsed.data
    const { profile, aiMemory } = await fetchUserContext(supabase, user.id)

    // Build the dynamic system prompt
    const personaCard = PERSONAS[sessionConfig.companion_id]
    const modeInstructions = MODE_INSTRUCTIONS[sessionConfig.mode]

    const turnNumber = Math.max(1, Math.floor(messages.length / 2) + 1)

    const systemPrompt = CONVERSATION_ENGINE_PROMPT.replace(
      '{companion_id}',
      sessionConfig.companion_id
    )
      .replace('{persona_card}', JSON.stringify(personaCard))
      .replace('{mode}', sessionConfig.mode)
      .replace('{mode_instructions}', modeInstructions)
      .replace('{cefr}', learningDNA.cefr)
      .replace('{goal_tag}', learningDNA.goal_tag)
      .replace('{display_name}', profile.display_name || 'ผู้เรียน')
      .replace('{weak_clusters}', learningDNA.weak_clusters.join(', '))
      .replace('{target_vocab_list}', sessionConfig.target_vocab.join(', '))
      .replace('{weak_tones_joined}', learningDNA.weak_tones.join(', '))
      .replace('{weak_chars_joined}', learningDNA.weak_chars.join(', '))
      .replace('{weak_grammar_joined}', learningDNA.weak_grammar.join(', '))
      .replace('{personality_notes}', aiMemory.personality_notes || 'No specific notes')
      .replace('{correction_style}', learningDNA.correction_style || 'relaxed')
      .replace('{turn_number}', turnNumber.toString())
      .replace('{max_turns}', sessionConfig.max_turns.toString())
      .replace('{hint_allowed}', sessionConfig.hint_allowed ? 'true' : 'false')

    // Optional: We can stream the text, but since we have a strict Block formatting,
    // handling standard text streaming over Vercel AI SDK is simple.
    const result = streamText({
      model: deepseek,
      system: systemPrompt,
      messages: messages as ModelMessage[],
    })

    return result.toTextStreamResponse()
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Session Turn Error:', error)
    return NextResponse.json(
      { error: 'Failed to process turn', details: error.message },
      { status: 500 }
    )
  }
}

async function fetchUserContext(supabase: SupabaseClient, userId: string) {
  const [{ data: profile }, { data: aiMemory }] = await Promise.all([
    supabase.from('profiles').select('display_name').eq('id', userId).single(),
    supabase.from('ai_user_profile').select('*').eq('user_id', userId).maybeSingle(),
  ])
  return {
    profile: (profile as { display_name?: string }) || {},
    aiMemory: (aiMemory as { personality_notes?: string } | null) || {},
  }
}
