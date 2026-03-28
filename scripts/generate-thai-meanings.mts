/**
 * generate-thai-meanings.mts
 *
 * Generates Thai meanings for all 11,042 HSK 3.0 words using Cloudflare Workers AI
 * (Qwen3-30B — free tier, multilingual, excellent Chinese/Thai support)
 *
 * Saves progress per batch → safe to interrupt & resume.
 *
 * Run: node --experimental-strip-types scripts/generate-thai-meanings.mts
 *
 * After completion, re-run generate-hsk-data.mts to bake Thai meanings into TS bundle:
 *   pnpm hsk:generate
 *
 * Requires env vars:
 *   CLOUDFLARE_ACCOUNT_ID   — found at dash.cloudflare.com (right sidebar)
 *   CLOUDFLARE_API_TOKEN    — dash.cloudflare.com → My Profile → API Tokens
 *                             (needs "Workers AI:Read" permission)
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CACHE_DIR = join(ROOT, 'packages/db/src/data/hsk/th')

const BASE_URL =
  'https://raw.githubusercontent.com/krmanik/HSK-3.0/c37aa00eafe0be2540e07d6ee2a191783cf046dd/Scripts%20and%20data/tsv'

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN

// Qwen3 on Cloudflare — best for Chinese/Thai, free tier
const CF_MODEL = '@cf/qwen/qwen3-30b-a3b-fp8'

// Cloudflare free tier: 10,000 requests/day
// Batch 30 words to stay safe and keep prompts short
const BATCH_SIZE = 30
const DELAY_MS = 500 // Cloudflare is fast, 500ms is enough

// ─── Types ───────────────────────────────────────────────────────────────────

interface RawWord {
  traditional: string
  simplified: string
  pinyin: string
  definitionEn: string
}

type ThaiCache = Record<string, string>

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function loadCache(level: number): Promise<ThaiCache> {
  const label = level === 7 ? '7-9' : String(level)
  const path = join(CACHE_DIR, `hsk-${label}-th.json`)
  if (!existsSync(path)) return {}
  const raw = await readFile(path, 'utf-8')
  return JSON.parse(raw) as ThaiCache
}

async function saveCache(level: number, cache: ThaiCache): Promise<void> {
  const label = level === 7 ? '7-9' : String(level)
  const path = join(CACHE_DIR, `hsk-${label}-th.json`)
  await writeFile(path, JSON.stringify(cache, null, 2), 'utf-8')
}

async function downloadTsv(file: string): Promise<RawWord[]> {
  const url = `${BASE_URL}/${encodeURIComponent(file)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const text = await res.text()

  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((line) => {
      const [traditional, simplified, pinyin, ...defParts] = line.split('\t')
      return {
        traditional: traditional?.trim() ?? '',
        simplified: simplified?.trim() ?? '',
        pinyin: pinyin?.trim() ?? '',
        definitionEn: defParts.join('\t').trim(),
      }
    })
    .filter((w) => w.simplified && w.pinyin)
}

// ─── Cloudflare AI Call ───────────────────────────────────────────────────────

/** Strip Qwen3 <think>...</think> reasoning blocks from response */
function stripThinking(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
}

/** Extract outermost JSON array from text robustly (handles nested arrays/objects) */
function extractJsonArray(text: string): string | null {
  const start = text.indexOf('[')
  if (start === -1) return null
  let depth = 0
  let inString = false
  let escape = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (escape) { escape = false; continue }
    if (ch === '\\' && inString) { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === '[' || ch === '{') depth++
    else if (ch === ']' || ch === '}') {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return null
}

async function translateBatch(words: RawWord[]): Promise<string[]> {
  const wordList = words
    .map(
      (w, i) =>
        `${i + 1}. ${w.simplified} (${w.pinyin}) — ${w.definitionEn.split(',')[0].trim()}`,
    )
    .join('\n')

  // /no_think disables Qwen3 extended thinking mode
  const userPrompt = `/no_think
แปลคำศัพท์จีน HSK ต่อไปนี้เป็นภาษาไทย

กฎ:
- ให้ความหมายหลัก 1-3 คำ คั่นด้วยจุลภาค ให้กระชับ
- ใช้คำไทยธรรมชาติสำหรับนักเรียนไทย
- ถ้าเป็น particle หรือ measure word ให้อธิบายสั้น เช่น "(คำช่วย)" หรือ "(ลักษณนาม)"
- ตอบเป็น JSON array เท่านั้น ห้ามมีข้อความอื่น
- จำนวน element ต้องเท่ากับ ${words.length} พอดี

คำศัพท์:
${wordList}

ตอบ: ["...","...",...] (${words.length} รายการ)`

  const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/${CF_MODEL}`

  const res = await fetch(cfUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CF_API_TOKEN}`,
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are a Chinese-Thai dictionary. Reply ONLY with a JSON array of Thai translations. No explanations. No thinking.',
        },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 2048,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Cloudflare AI error ${res.status}: ${err}`)
  }

  const data = (await res.json()) as {
    result?: {
      response?: string
      choices?: Array<{ message?: { content?: string; reasoning_content?: string } }>
    }
    success?: boolean
    errors?: Array<{ message: string }>
  }

  if (!data.success) {
    const errMsg = data.errors?.map((e) => e.message).join(', ') ?? 'Unknown error'
    throw new Error(`Cloudflare AI failed: ${errMsg}`)
  }

  // Cloudflare Qwen3 returns OpenAI chat format: result.choices[0].message.content
  // (reasoning is in reasoning_content, not in <think> tags)
  const raw =
    data.result?.choices?.[0]?.message?.content ?? // Chat completion format (Qwen3)
    data.result?.response ??                        // Legacy format (older models)
    ''
  const content = stripThinking(raw) // strip any residual <think> blocks just in case

  let parsed: unknown
  try {
    parsed = JSON.parse(content)
  } catch {
    const jsonStr = extractJsonArray(content)
    if (!jsonStr) {
      console.error(`\n   Raw response: ${raw.slice(0, 400)}`)
      throw new Error(`Cannot find JSON array in response`)
    }
    parsed = JSON.parse(jsonStr)
  }

  // Normalize: plain array, { translations: [...] }, or nested arrays
  let arr: unknown[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as Record<string, unknown>)?.translations)
      ? ((parsed as Record<string, unknown[]>).translations)
      : Object.values(parsed as Record<string, unknown>)

  // Flatten if model returned nested arrays (e.g. 3 chunks of 10)
  if (arr.length > 0 && Array.isArray(arr[0])) {
    arr = (arr as unknown[][]).flat()
  }

  if (arr.length !== words.length) {
    console.warn(`  ⚠️  Batch mismatch: expected ${words.length}, got ${arr.length}`)
  }

  // Only accept if we got Thai translations (contains Thai script)
  const thaiRange = /[\u0E00-\u0E7F]/
  const results = arr.map((v) => String(v).trim())
  const thaiCount = results.filter((v) => thaiRange.test(v)).length
  if (thaiCount < results.length * 0.5) {
    throw new Error(`Response has too few Thai translations (${thaiCount}/${results.length}) — retrying`)
  }

  return results
}

// ─── Process One Level ────────────────────────────────────────────────────────

async function processLevel(file: string, level: number, levelLabel: string): Promise<void> {
  console.log(`\n📚 HSK ${levelLabel}`)

  const words = await downloadTsv(file)
  const cache = await loadCache(level)

  const todo = words.filter((w) => !cache[w.simplified])
  const alreadyDone = words.length - todo.length

  if (alreadyDone > 0) {
    console.log(`   ↩️  Resuming — ${alreadyDone}/${words.length} already translated`)
  }

  if (todo.length === 0) {
    console.log(`   ✅ All ${words.length} words already translated`)
    return
  }

  const batches: RawWord[][] = []
  for (let i = 0; i < todo.length; i += BATCH_SIZE) {
    batches.push(todo.slice(i, i + BATCH_SIZE))
  }

  console.log(`   📦 ${todo.length} words → ${batches.length} batches (${BATCH_SIZE}/batch)`)

  let done = 0
  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b]!
    process.stdout.write(`   [${b + 1}/${batches.length}] ${batch.length} words... `)

    let translations: string[]
    let retries = 0
    while (true) {
      try {
        translations = await translateBatch(batch)
        break
      } catch (err) {
        retries++
        if (retries >= 3) {
          console.error(`\n   ❌ Batch failed after ${retries} tries: ${err}`)
          console.log('   💾 Saving progress...')
          await saveCache(level, cache)
          throw err
        }
        console.warn(`\n   ↩️  Retry ${retries}/3: ${err}`)
        await sleep(2000 * retries)
      }
    }

    for (let i = 0; i < batch.length; i++) {
      const word = batch[i]!
      cache[word.simplified] = translations[i] ?? word.definitionEn.split(',')[0].trim()
    }

    done += batch.length
    console.log(`✅  (${alreadyDone + done}/${words.length})`)

    // Save after every batch — safe to Ctrl+C anytime
    await saveCache(level, cache)

    if (b < batches.length - 1) await sleep(DELAY_MS)
  }

  console.log(`   🎉 HSK ${levelLabel} done — ${words.length} words`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const LEVELS = [
  { file: 'HSK 1.tsv', level: 1, label: '1' },
  { file: 'HSK 2.tsv', level: 2, label: '2' },
  { file: 'HSK 3.tsv', level: 3, label: '3' },
  { file: 'HSK 4.tsv', level: 4, label: '4' },
  { file: 'HSK 5.tsv', level: 5, label: '5' },
  { file: 'HSK 6.tsv', level: 6, label: '6' },
  { file: 'HSK 7-9.tsv', level: 7, label: '7-9' },
]

async function main() {
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN) {
    console.error('❌ Missing Cloudflare credentials\n')
    console.error('   Set these env vars:')
    console.error('   export CLOUDFLARE_ACCOUNT_ID=your_account_id')
    console.error('   export CLOUDFLARE_API_TOKEN=your_api_token\n')
    console.error('   Get them at: https://dash.cloudflare.com')
    console.error('   Account ID → right sidebar on any page')
    console.error('   API Token  → My Profile → API Tokens → Create Token')
    console.error('              → "Workers AI" template (Read permission)')
    process.exit(1)
  }

  const totalWords = LEVELS.reduce((s) => s, 0)
  const estimatedBatches = Math.ceil(11042 / BATCH_SIZE)
  const estimatedMinutes = Math.ceil((estimatedBatches * DELAY_MS) / 60000)

  console.log('🚀 HSK Thai Meanings Generator')
  console.log(`   Provider: Cloudflare Workers AI`)
  console.log(`   Model:    ${CF_MODEL}`)
  console.log(`   Batch:    ${BATCH_SIZE} words/request`)
  console.log(`   Est. time: ~${estimatedMinutes} min (Ctrl+C to pause, resumes safely)`)
  console.log('═'.repeat(50))

  await mkdir(CACHE_DIR, { recursive: true })

  const startTime = Date.now()

  for (const { file, level, label } of LEVELS) {
    await processLevel(file, level, label)
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000)
  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60

  console.log('\n' + '═'.repeat(50))
  console.log(`✅ All done in ${mins}m ${secs}s`)
  console.log(`📁 Cache: packages/db/src/data/hsk/th/`)
  console.log('\nNext → bake Thai into TypeScript bundle:')
  console.log('   pnpm hsk:generate')
}

main().catch((err) => {
  console.error('\n❌ Fatal:', err)
  process.exit(1)
})
