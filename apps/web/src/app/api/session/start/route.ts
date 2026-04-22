import { generateText } from 'ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ORCHESTRATOR_PROMPT, PROFILE_BUILDER_PROMPT } from '@/features/companion/constants/prompts'
import { deepseek } from '@/lib/ai/clients'
import { createServerSupabase } from '@/lib/supabase/server'

export const maxDuration = 60

// Robust JSON extraction — strips markdown fences then finds outermost JSON object
function extractJSON(text: string): string {
  // Strip ```json ... ``` code fences if present
  const stripped = text
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/```\s*$/m, '')
    .trim()

  // Find the first `{` and scan forward counting braces to find the balanced close
  const start = stripped.indexOf('{')
  if (start === -1) throw new Error(`No JSON object found in response: ${text.slice(0, 200)}`)

  let depth = 0
  let inString = false
  let escaped = false
  for (let i = start; i < stripped.length; i++) {
    const ch = stripped[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (ch === '\\' && inString) {
      escaped = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return stripped.slice(start, i + 1)
    }
  }
  throw new Error(`Unbalanced JSON braces in response: ${text.slice(0, 200)}`)
}

// The schemas expected by the orchestrator prompts
const learningDNASchema = z.object({
  cefr: z.enum(['HSK1', 'HSK2', 'HSK3', 'HSK4+']),
  goal_tag: z.enum(['connect_people', 'travel', 'business', 'daily_life', 'media']),
  weak_clusters: z.array(z.string()),
  mastered_clusters: z.array(z.string()),
  preferred_companion: z.enum(['backpacker_male', 'teacher_female']),
  fatigue_signal: z.enum(['low', 'medium', 'high']),
  recommended_session_length_min: z.number(),
  push_real_talk: z.boolean(),
  weak_tones: z.array(z.number()),
  weak_chars: z.array(z.string()),
  weak_grammar: z.array(z.string()),
  correction_style: z.enum(['strict', 'relaxed']),
})

const sessionConfigSchema = z.object({
  mode: z.enum(['learner', 'real_talk']),
  topic: z.string(),
  difficulty: z.enum(['very_easy', 'easy', 'medium', 'hard']),
  companion_id: z.enum(['backpacker_male', 'teacher_female']),
  session_goal_th: z.string(),
  target_vocab: z.array(z.string()),
  max_turns: z.number(),
  hint_allowed: z.boolean(),
})

const RequestSchema = z.object({
  manual_override: z
    .object({
      companion_id: z.enum(['backpacker_male', 'teacher_female']).optional(),
      mode: z.enum(['learner', 'real_talk']).optional(),
      topic: z.string().optional(),
    })
    .optional(),
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

    // Parse body for manual overrides (User picked Persona or Mode in UI)
    const body = await req.json().catch(() => ({}))
    const parsedBody = RequestSchema.safeParse(body)
    const manualOverride = parsedBody.success ? parsedBody.data.manual_override : {}

    // 1. Gather User Raw Data from Supabase
    const [{ data: profile }, { data: aiMemory }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('ai_user_profile').select('*').eq('id', user.id).maybeSingle(),
    ])

    const rawUserData = {
      profile: profile || {},
      aiMemory: aiMemory || {},
      // We could also fetch recent user_stats, pronunciation_errors here.
    }

    // 2. LAYER 1: Profile Builder (Qwen3) -> LearningDNA
    const profileBuilderSystemPrompt = PROFILE_BUILDER_PROMPT.replace(
      '{raw_user_data_json}',
      JSON.stringify(rawUserData)
    )

    const { text: profileRaw } = await generateText({
      model: deepseek,
      messages: [{ role: 'user', content: profileBuilderSystemPrompt }],
      temperature: 0.2, // low temp for deterministic profiling
    })

    // Fallback parsing: Extract strictly everything between { and }
    const jsonStr = extractJSON(profileRaw)
    let learningDNA: z.infer<typeof learningDNASchema>
    try {
      learningDNA = learningDNASchema.parse(JSON.parse(jsonStr))
    } catch {
      throw new Error(`Profile builder returned invalid JSON: ${jsonStr.slice(0, 200)}`)
    }

    // 3. LAYER 2: Configuration Orchestrator (Qwen3) -> SessionConfig
    const orchestratorPrompt = ORCHESTRATOR_PROMPT.replace(
      '{learning_dna_json}',
      JSON.stringify(learningDNA)
    ).replace('{manual_override_json}', JSON.stringify(manualOverride || {}))

    const { text: sessionRaw } = await generateText({
      model: deepseek,
      messages: [{ role: 'user', content: orchestratorPrompt }],
      temperature: 0.7, // slightly higher for topic variety
    })

    const configStr = extractJSON(sessionRaw)
    let sessionConfig: z.infer<typeof sessionConfigSchema>
    try {
      sessionConfig = sessionConfigSchema.parse(JSON.parse(configStr))
    } catch {
      throw new Error(`Orchestrator returned invalid JSON: ${configStr.slice(0, 200)}`)
    }

    // 4. Return the configured session to the client
    // Expected next step: The client saves this configuration and starts calling /api/session/turn
    return NextResponse.json({
      success: true,
      learningDNA,
      sessionConfig,
    })
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err))
    console.error('Session Start Error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize session', details: error.message },
      { status: 500 }
    )
  }
}
