/**
 * generate-sentences.mts
 *
 * Pre-generates example sentences for all 11,042 HSK words using DeepSeek V3.
 * Each sentence wraps the target word in [[brackets]] for easy highlighting.
 *
 * Output format per word:
 *   { "zh": "我很[[爱]]我的家人。", "pinyin": "Wǒ hěn [[ài]] wǒ de jiārén。", "th": "ฉัน[[รัก]]ครอบครัว..." }
 *
 * Run: node --experimental-strip-types scripts/generate-sentences.mts
 *
 * After completion, run: pnpm hsk:generate  (bakes into TS bundle)
 *
 * Requires env vars (already in .env.local):
 *   DEEPSEEK_API_KEY
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CACHE_DIR = join(ROOT, 'packages/db/src/data/hsk/sentences')

const BASE_URL =
  'https://raw.githubusercontent.com/krmanik/HSK-3.0/c37aa00eafe0be2540e07d6ee2a191783cf046dd/Scripts%20and%20data/tsv'

// Load env from .env.local
const envPath = join(ROOT, 'apps/web/.env.local')
if (existsSync(envPath)) {
  const raw = await readFile(envPath, 'utf-8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_0-9]+)=(.+)$/)
    if (m) process.env[m[1]] = m[2].trim()
  }
}

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
if (!DEEPSEEK_API_KEY) {
  console.error('❌  DEEPSEEK_API_KEY not set in .env.local')
  process.exit(1)
}

// DeepSeek V3 — best Chinese quality
const BATCH_SIZE = 10 // sentences are longer than single words
const DELAY_MS = 800

// ─── Types ───────────────────────────────────────────────────────────────────

interface RawWord {
  simplified: string
  pinyin: string
  level: number
}

export interface HskSentence {
  zh: string     // "我很[[爱]]我的家人。"
  pinyin: string // "Wǒ hěn [[ài]] wǒ de jiārén。"
  th: string     // "ฉัน[[รัก]]ครอบครัวของฉันมาก"
}

type SentenceCache = Record<string, HskSentence>

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function loadCache(level: number): Promise<SentenceCache> {
  const label = level === 7 ? '7-9' : String(level)
  const path = join(CACHE_DIR, `hsk-${label}-sentences.json`)
  if (!existsSync(path)) return {}
  const raw = await readFile(path, 'utf-8')
  try { return JSON.parse(raw) as SentenceCache } catch { return {} }
}

async function saveCache(level: number, cache: SentenceCache): Promise<void> {
  const label = level === 7 ? '7-9' : String(level)
  await mkdir(CACHE_DIR, { recursive: true })
  const path = join(CACHE_DIR, `hsk-${label}-sentences.json`)
  await writeFile(path, JSON.stringify(cache, null, 2), 'utf-8')
}

async function downloadTsv(file: string): Promise<RawWord[]> {
  const url = `${BASE_URL}/${encodeURIComponent(file)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`)
  const text = await res.text()
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [, simplified, pinyin] = l.split('\t')
      return { simplified: simplified ?? '', pinyin: pinyin ?? '', level: 0 }
    })
    .filter((w) => w.simplified)
}

function stripThinking(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/^thinking[\s\S]*?(?=\[)/i, '')
    .trim()
}

function extractJsonArray(text: string): unknown[] {
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) return []
  try { return JSON.parse(match[0]) as unknown[] } catch { return [] }
}

function isValidSentence(s: unknown): s is HskSentence {
  if (typeof s !== 'object' || s === null) return false
  const o = s as Record<string, unknown>
  return (
    typeof o.zh === 'string' && o.zh.includes('[[') &&
    typeof o.pinyin === 'string' && o.pinyin.includes('[[') &&
    typeof o.th === 'string' && o.th.includes('[[') &&
    o.zh.length > 4 && o.th.length > 2
  )
}

async function callDeepSeek(words: RawWord[], level: number): Promise<SentenceCache> {
  const levelDesc = level <= 2 ? 'beginner' : level <= 4 ? 'intermediate' : 'advanced'
  const wordList = words.map((w) => `${w.simplified} (${w.pinyin})`).join(', ')

  const prompt = `/no_think
Generate example sentences for these HSK ${level} (${levelDesc}) Chinese words: ${wordList}

Return ONLY a JSON array, no other text:
[
  {
    "simplified": "爱",
    "zh": "妈妈很[[爱]]我。",
    "pinyin": "Māma hěn [[ài]] wǒ。",
    "th": "แม่[[รัก]]ฉันมาก"
  }
]

Rules:
1. "simplified" = the exact word from the input list
2. Wrap ONLY the target word with [[double brackets]] in ALL three fields (zh, pinyin, th)
3. Pinyin must use tone marks (ā á ǎ à ē é ě è ī í ǐ ì ō ó ǒ ò ū ú ǔ ù ǖ ǘ ǚ ǜ), NOT numbers
4. Thai (th) must be natural Thai — [[brackets]] wrap the Thai translation of that word
5. Sentence complexity must match HSK ${level} level — simpler for lower levels
6. Return exactly ${words.length} objects, one per word, in the same order
`

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000,
          temperature: 0.3,
        }),
      })

      if (!res.ok) {
        const txt = await res.text()
        console.error(`    DeepSeek error ${res.status}: ${txt.slice(0, 200)}`)
        await sleep(2000 * attempt)
        continue
      }

      const data = (await res.json()) as {
        choices: Array<{ message: { content: string } }>
      }

      const raw = data.choices?.[0]?.message?.content ?? ''
      const cleaned = stripThinking(raw)
      let arr = extractJsonArray(cleaned)
      if (arr.length === 0) {
        console.error(`    ⚠️  No JSON array found (attempt ${attempt})`)
        await sleep(1500)
        continue
      }
      if (Array.isArray(arr[0]) && Array.isArray(arr[0])) {
        arr = (arr as unknown[][]).flat()
      }

      const result: SentenceCache = {}
      let valid = 0
      for (const item of arr) {
        if (!isValidSentence(item)) continue
        const simplified = (item as Record<string, string>).simplified
        if (!simplified) continue
        result[simplified] = { zh: item.zh, pinyin: item.pinyin, th: item.th }
        valid++
      }

      if (valid < words.length * 0.5) {
        console.error(`    ⚠️  Only ${valid}/${words.length} valid sentences (attempt ${attempt})`)
        await sleep(1500)
        continue
      }

      return result
    } catch (e) {
      console.error(`    ⚠️  Network error (attempt ${attempt}):`, e)
      await sleep(2000 * attempt)
    }
  }
  return {}
}

// ─── Level config ─────────────────────────────────────────────────────────────

const HSK_FILES: Record<number, string> = {
  1: 'HSK 1.tsv', 2: 'HSK 2.tsv', 3: 'HSK 3.tsv',
  4: 'HSK 4.tsv', 5: 'HSK 5.tsv', 6: 'HSK 6.tsv', 7: 'HSK 7-9.tsv',
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('🈶 HSK Sentence Generator')
console.log('   Model:  DeepSeek V3 (deepseek-chat)')
console.log('   Batch:  10 words/request')
console.log('══════════════════════════════════════════════════\n')

await mkdir(CACHE_DIR, { recursive: true })

for (const [levelStr, file] of Object.entries(HSK_FILES)) {
  const level = parseInt(levelStr)
  const label = level === 7 ? 'HSK 7-9' : `HSK ${level}`
  console.log(`📚 ${label}`)

  const words = await downloadTsv(file)
  const cache = await loadCache(level)

  const missing = words.filter((w) => !cache[w.simplified])
  const alreadyDone = words.length - missing.length

  if (alreadyDone > 0) {
    console.log(`   ↩️  Resuming — ${alreadyDone}/${words.length} already done`)
  }
  if (missing.length === 0) {
    console.log(`   ✅ All ${words.length} sentences already generated\n`)
    continue
  }

  const batches: RawWord[][] = []
  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    batches.push(missing.slice(i, i + BATCH_SIZE))
  }

  console.log(`   📦 ${missing.length} words → ${batches.length} batches`)

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b]!
    process.stdout.write(`   [${b + 1}/${batches.length}] ${batch.length} words... `)

    const result = await callDeepSeek(batch.map((w) => ({ ...w, level })), level)
    const gotCount = Object.keys(result).length
    Object.assign(cache, result)
    await saveCache(level, cache)

    if (gotCount < batch.length) {
      process.stdout.write(`  ⚠️  got ${gotCount}/${batch.length}\n`)
    } else {
      process.stdout.write(`✅  (${alreadyDone + (b + 1) * BATCH_SIZE}/${words.length})\n`)
    }

    if (b < batches.length - 1) await sleep(DELAY_MS)
  }

  console.log(`   🎉 ${label} done — ${Object.keys(cache).length} sentences\n`)
}

console.log('✨ All levels complete! Run `pnpm hsk:generate` to bake into bundle.')
