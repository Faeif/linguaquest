/**
 * POST /api/speech/speechsuper
 * Proxies audio + reference text to SpeechSuper word.eval.promax
 * Returns: { overall, toneScore, initialScore, finalScore, syllables[] }
 */
import { createHash } from 'node:crypto'
import { createServerClient } from '@linguaquest/db/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 30

// ─── Types ────────────────────────────────────────────────────────────────────

interface RequestBody {
  audio: string // base64-encoded audio blob
  audioType: string // 'webm' | 'mp4' | 'wav'
  word: string // Chinese reference text e.g. "黄"
}

interface RawSyllable {
  initial?: string
  final?: string
  tone?: number
  score?: number
  initialScore?: number
  finalScore?: number
  toneScore?: number
}

interface RawWordResult {
  score?: number
  toneScore?: number
  syllables?: RawSyllable[]
}

interface SpeechSuperResponse {
  status?: number
  result?: {
    words?: RawWordResult[]
  }
  msg?: string
}

// ─── Auth helper ─────────────────────────────────────────────────────────────

function buildAuth(appKey: string, secretKey: string) {
  const timestamp = Date.now().toString()
  const sig = createHash('sha1').update(`${appKey}${timestamp}${secretKey}`).digest('hex')
  return { sig, timestamp }
}

// ─── Route ───────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // 1. Auth
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse body
    const body = (await req.json()) as RequestBody
    const { audio, audioType, word } = body

    if (!audio || !word) {
      return Response.json({ data: null, error: 'Missing audio or word' }, { status: 400 })
    }

    // 3. Check credentials
    const appKey = process.env.SPEECHSUPER_APP_KEY
    const secretKey = process.env.SPEECHSUPER_SECRET_KEY

    if (!appKey || !secretKey) {
      return Response.json(
        {
          data: null,
          error:
            'SpeechSuper not configured — add SPEECHSUPER_APP_KEY and SPEECHSUPER_SECRET_KEY to .env.local',
        },
        { status: 503 }
      )
    }

    // 4. Build SpeechSuper params
    const { sig, timestamp } = buildAuth(appKey, secretKey)
    // userId must be ≤ 32 chars, alphanumeric
    const userId = user.id.replace(/-/g, '').slice(0, 32)

    const params = {
      connect: {
        cmd: 'connect',
        param: {
          sdk: { version: 16777472, source: 9, protocol: 2 },
        },
      },
      start: {
        cmd: 'start',
        param: {
          app: {
            applicationId: appKey,
            sig,
            alg: 'sha1',
            timestamp,
            userId,
          },
          audio: {
            // SpeechSuper accepts: wav, mp3, opus, webm, mp4
            audioType: audioType ?? 'webm',
            channel: 1,
            sampleBytes: 2,
            sampleRate: 16000,
          },
          request: {
            coreType: 'word.eval.promax',
            refText: word,
            tokenId: `token_${Date.now()}`,
          },
        },
      },
    }

    // 5. Build multipart body manually (Node.js FormData doesn't handle binary well in edge)
    const audioBuffer = Buffer.from(audio, 'base64')
    const boundary = `SpeechSuperBoundary${Date.now()}`
    const paramsJson = JSON.stringify(params)
    const ext = audioType ?? 'webm'

    const bodyParts = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\n` +
          'Content-Disposition: form-data; name="param"\r\n' +
          'Content-Type: application/json\r\n\r\n' +
          `${paramsJson}\r\n`
      ),
      Buffer.from(
        `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="audio"; filename="audio.${ext}"\r\n` +
          `Content-Type: audio/${ext}\r\n\r\n`
      ),
      audioBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ])

    // 6. Call SpeechSuper
    const ssRes = await fetch('https://api.speechsuper.com/word.eval.promax', {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': bodyParts.length.toString(),
      },
      body: bodyParts,
    })

    if (!ssRes.ok) {
      const errText = await ssRes.text()
      console.error('[SpeechSuper] HTTP error:', ssRes.status, errText)
      return Response.json({ data: null, error: 'SpeechSuper API error' }, { status: 502 })
    }

    const raw = (await ssRes.json()) as SpeechSuperResponse

    if (raw.status !== 0) {
      console.error('[SpeechSuper] Non-zero status:', raw)
      return Response.json(
        { data: null, error: raw.msg ?? 'SpeechSuper returned an error' },
        { status: 502 }
      )
    }

    // 7. Parse result
    const wordResult = raw.result?.words?.[0]
    if (!wordResult) {
      return Response.json({ data: null, error: 'No result from SpeechSuper' }, { status: 502 })
    }

    const syllables = (wordResult.syllables ?? []).map((syl) => ({
      initial: syl.initial ?? '',
      final: syl.final ?? '',
      tone: syl.tone ?? 5,
      score: Math.round(syl.score ?? 0),
      initialScore: Math.round(syl.initialScore ?? 0),
      finalScore: Math.round(syl.finalScore ?? 0),
      toneScore: Math.round(syl.toneScore ?? 0),
    }))

    // Aggregate multi-syllable averages
    const avg = (key: keyof (typeof syllables)[0]) =>
      syllables.length > 0
        ? Math.round(syllables.reduce((acc, s) => acc + (s[key] as number), 0) / syllables.length)
        : 0

    return Response.json({
      data: {
        overall: Math.round(wordResult.score ?? 0),
        toneScore: Math.round(wordResult.toneScore ?? avg('toneScore')),
        initialScore: avg('initialScore'),
        finalScore: avg('finalScore'),
        syllables,
      },
      error: null,
    })
  } catch (error) {
    console.error('[SpeechSuper route] unexpected error:', error)
    return Response.json({ data: null, error: 'Internal server error' }, { status: 500 })
  }
}
