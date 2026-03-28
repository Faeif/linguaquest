/**
 * generate-pos-tags.mts
 *
 * Classifies all 11,042 HSK words by Part-of-Speech using DeepSeek.
 * Output: { "爱": "动词", "美丽": "形容词", ... }
 *
 * Run: node --experimental-strip-types scripts/generate-pos-tags.mts
 * Then: pnpm hsk:generate  (bakes into TS bundle)
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const CACHE_DIR = join(ROOT, 'packages/db/src/data/hsk/pos')

const BASE_URL =
  'https://raw.githubusercontent.com/krmanik/HSK-3.0/c37aa00eafe0be2540e07d6ee2a191783cf046dd/Scripts%20and%20data/tsv'

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

export type PosTag =
  | '动词' | '名词' | '形容词' | '副词'
  | '连词' | '量词' | '介词' | '代词' | '其他'

const VALID_POS: Set<string> = new Set([
  '动词', '名词', '形容词', '副词', '连词', '量词', '介词', '代词', '其他',
])

type PosCache = Record<string, PosTag>

const BATCH_SIZE = 50  // POS is compact — send more at once
const DELAY_MS = 500
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function loadCache(level: number): Promise<PosCache> {
  const label = level === 7 ? '7-9' : String(level)
  const path = join(CACHE_DIR, `hsk-${label}-pos.json`)
  if (!existsSync(path)) return {}
  try { return JSON.parse(await readFile(path, 'utf-8')) as PosCache } catch { return {} }
}

async function saveCache(level: number, cache: PosCache): Promise<void> {
  const label = level === 7 ? '7-9' : String(level)
  await mkdir(CACHE_DIR, { recursive: true })
  const path = join(CACHE_DIR, `hsk-${label}-pos.json`)
  await writeFile(path, JSON.stringify(cache, null, 2), 'utf-8')
}

async function downloadTsv(file: string): Promise<string[]> {
  const url = `${BASE_URL}/${encodeURIComponent(file)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`)
  const text = await res.text()
  return text
    .split('\n')
    .map((l) => l.split('\t')[1]?.trim() ?? '')
    .filter(Boolean)
}

function stripThinking(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
}

async function callDeepSeek(words: string[]): Promise<PosCache> {
  const prompt = `/no_think
Classify these Chinese words by primary part-of-speech.
Words: ${words.join('、')}

Return ONLY a JSON object mapping each word to its POS tag.
Valid tags: 动词 名词 形容词 副词 连词 量词 介词 代词 其他

Example:
{
  "爱": "动词",
  "书": "名词",
  "美丽": "形容词",
  "很": "副词",
  "但是": "连词",
  "个": "量词",
  "在": "介词",
  "我": "代词"
}

Return exactly ${words.length} entries, no extra text.`

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
          max_tokens: 800,
          temperature: 0.1,
        }),
      })

      if (!res.ok) {
        await sleep(2000 * attempt)
        continue
      }

      const data = (await res.json()) as {
        choices: Array<{ message: { content: string } }>
      }
      const raw = stripThinking(data.choices?.[0]?.message?.content ?? '')
      const match = raw.match(/\{[\s\S]*\}/)
      if (!match) { await sleep(1500); continue }
      const parsed = JSON.parse(match[0]) as Record<string, string>

      const result: PosCache = {}
      for (const [word, tag] of Object.entries(parsed)) {
        if (VALID_POS.has(tag)) result[word] = tag as PosTag
        else result[word] = '其他'
      }
      return result
    } catch {
      await sleep(2000 * attempt)
    }
  }
  return {}
}

const HSK_FILES: Record<number, string> = {
  1: 'HSK 1.tsv', 2: 'HSK 2.tsv', 3: 'HSK 3.tsv',
  4: 'HSK 4.tsv', 5: 'HSK 5.tsv', 6: 'HSK 6.tsv', 7: 'HSK 7-9.tsv',
}

console.log('🏷️  HSK POS Tag Generator')
console.log('   Model:  DeepSeek V3')
console.log('   Batch:  50 words/request')
console.log('══════════════════════════════════════════════════\n')

await mkdir(CACHE_DIR, { recursive: true })

for (const [levelStr, file] of Object.entries(HSK_FILES)) {
  const level = parseInt(levelStr)
  const label = level === 7 ? 'HSK 7-9' : `HSK ${level}`
  console.log(`📚 ${label}`)

  const words = await downloadTsv(file)
  const cache = await loadCache(level)
  const missing = words.filter((w) => !cache[w])

  if (missing.length === 0) {
    console.log(`   ✅ All ${words.length} words already tagged\n`)
    continue
  }

  console.log(`   📦 ${missing.length} words → ${Math.ceil(missing.length / BATCH_SIZE)} batches`)

  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE)
    const bNum = Math.floor(i / BATCH_SIZE) + 1
    const total = Math.ceil(missing.length / BATCH_SIZE)
    process.stdout.write(`   [${bNum}/${total}] ${batch.length} words... `)

    const result = await callDeepSeek(batch)
    Object.assign(cache, result)
    await saveCache(level, cache)
    process.stdout.write(`✅ (${Object.keys(cache).length}/${words.length})\n`)

    if (i + BATCH_SIZE < missing.length) await sleep(DELAY_MS)
  }

  console.log(`   🎉 ${label} done\n`)
}

console.log('✨ All levels complete! Run `pnpm hsk:generate` to bake into bundle.')
