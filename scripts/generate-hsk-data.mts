/**
 * generate-hsk-data.mts
 *
 * Downloads HSK 3.0 (2021) TSV files from GitHub and generates
 * TypeScript static data files in packages/db/src/data/hsk/
 *
 * Run: node --experimental-strip-types scripts/generate-hsk-data.mts
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUTPUT_DIR = join(ROOT, 'packages/db/src/data/hsk')
const THAI_CACHE_DIR = join(OUTPUT_DIR, 'th')
const POS_CACHE_DIR = join(OUTPUT_DIR, 'pos')
const SENTENCES_CACHE_DIR = join(OUTPUT_DIR, 'sentences')

type ThaiCache = Record<string, string>
type PosCache = Record<string, string>
interface HskSentence { zh: string; pinyin: string; th: string }
type SentenceCache = Record<string, HskSentence>

const BASE_URL =
  'https://raw.githubusercontent.com/krmanik/HSK-3.0/c37aa00eafe0be2540e07d6ee2a191783cf046dd/Scripts%20and%20data/tsv'

interface TsvSource {
  file: string
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7
  outputName: string
  constName: string
}

const SOURCES: TsvSource[] = [
  { file: 'HSK 1.tsv', level: 1, outputName: 'hsk-1.ts', constName: 'hsk1' },
  { file: 'HSK 2.tsv', level: 2, outputName: 'hsk-2.ts', constName: 'hsk2' },
  { file: 'HSK 3.tsv', level: 3, outputName: 'hsk-3.ts', constName: 'hsk3' },
  { file: 'HSK 4.tsv', level: 4, outputName: 'hsk-4.ts', constName: 'hsk4' },
  { file: 'HSK 5.tsv', level: 5, outputName: 'hsk-5.ts', constName: 'hsk5' },
  { file: 'HSK 6.tsv', level: 6, outputName: 'hsk-6.ts', constName: 'hsk6' },
  { file: 'HSK 7-9.tsv', level: 7, outputName: 'hsk-7-9.ts', constName: 'hsk79' },
]

interface ParsedWord {
  traditional: string
  simplified: string
  pinyin: string
  definitionEn: string
  level: number
  frequencyRank: number
  meaningTh?: string
  pos?: string
  sentence?: HskSentence
}

async function loadThaiCache(level: number): Promise<ThaiCache> {
  const label = level === 7 ? '7-9' : String(level)
  const path = join(THAI_CACHE_DIR, `hsk-${label}-th.json`)
  if (!existsSync(path)) return {}
  const raw = await readFile(path, 'utf-8')
  return JSON.parse(raw) as ThaiCache
}

async function loadPosCache(level: number): Promise<PosCache> {
  const label = level === 7 ? '7-9' : String(level)
  const path = join(POS_CACHE_DIR, `hsk-${label}-pos.json`)
  if (!existsSync(path)) return {}
  const raw = await readFile(path, 'utf-8')
  return JSON.parse(raw) as PosCache
}

async function loadSentenceCache(level: number): Promise<SentenceCache> {
  const label = level === 7 ? '7-9' : String(level)
  const path = join(SENTENCES_CACHE_DIR, `hsk-${label}-sentences.json`)
  if (!existsSync(path)) return {}
  const raw = await readFile(path, 'utf-8')
  try { return JSON.parse(raw) as SentenceCache } catch { return {} }
}

function parseTsv(content: string, level: number): ParsedWord[] {
  const lines = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const words: ParsedWord[] = []

  for (let i = 0; i < lines.length; i++) {
    const cols = lines[i].split('\t')

    // Expected columns: Traditional | Simplified | Pinyin | Definition
    if (cols.length < 4) {
      console.warn(`  ⚠️  Skipping malformed row ${i + 1}: "${lines[i].slice(0, 50)}"`)
      continue
    }

    const [traditional, simplified, pinyin, ...defParts] = cols
    const definitionEn = defParts.join('\t').trim() // rejoin in case def has tabs

    if (!simplified || !pinyin) continue

    words.push({
      traditional: traditional.trim(),
      simplified: simplified.trim(),
      pinyin: pinyin.trim(),
      definitionEn: definitionEn,
      level,
      frequencyRank: i + 1, // 1-indexed, row order = frequency rank
    })
  }

  return words
}

const CHUNK_SIZE = 2000 // TS struggles with union types on very large inline arrays

function renderWordLine(w: ParsedWord): string {
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')
  const thaiPart = w.meaningTh ? `, meaningTh: \`${esc(w.meaningTh)}\`` : ''
  const posPart = w.pos ? `, pos: \`${esc(w.pos)}\`` : ''
  const sentPart = w.sentence
    ? `, sentence: { zh: \`${esc(w.sentence.zh)}\`, pinyin: \`${esc(w.sentence.pinyin)}\`, th: \`${esc(w.sentence.th)}\` }`
    : ''
  return `  { simplified: \`${esc(w.simplified)}\`, traditional: \`${esc(w.traditional)}\`, pinyin: \`${esc(w.pinyin)}\`, definitionEn: \`${esc(w.definitionEn)}\`, level: ${w.level}, frequencyRank: ${w.frequencyRank}${thaiPart}${posPart}${sentPart} },`
}

function renderTs(words: ParsedWord[], constName: string, level: number, hasThaiCount: number, hasPosCount: number): string {
  const levelLabel = level === 7 ? '7-9' : String(level)
  const thaiNote = hasThaiCount > 0 ? ` | Thai: ${hasThaiCount}/${words.length}` : ' | Thai: pending'
  const posNote = hasPosCount > 0 ? ` | POS: ${hasPosCount}/${words.length}` : ''
  const lines: string[] = [
    `// AUTO-GENERATED by scripts/generate-hsk-data.mts — DO NOT EDIT`,
    `// Source: HSK 3.0 (2021) — Level ${levelLabel}${thaiNote}${posNote}`,
    `// Total words: ${words.length}`,
    ``,
    `import type { HskWord } from './types'`,
    ``,
  ]

  if (words.length <= CHUNK_SIZE) {
    // Small enough — single array
    lines.push(`export const ${constName}: HskWord[] = [`)
    for (const w of words) lines.push(renderWordLine(w))
    lines.push(`]`)
  } else {
    // Split into chunks to avoid TS2590 "union type too complex"
    const chunks: ParsedWord[][] = []
    for (let i = 0; i < words.length; i += CHUNK_SIZE) {
      chunks.push(words.slice(i, i + CHUNK_SIZE))
    }
    for (let ci = 0; ci < chunks.length; ci++) {
      lines.push(`const _${constName}_${ci + 1}: HskWord[] = [`)
      for (const w of chunks[ci]!) lines.push(renderWordLine(w))
      lines.push(`]`)
      lines.push(``)
    }
    const chunkRefs = chunks.map((_, ci) => `..._${constName}_${ci + 1}`).join(', ')
    lines.push(`export const ${constName}: HskWord[] = [${chunkRefs}]`)
  }

  lines.push(``)
  return lines.join('\n')
}

async function downloadAndParse(source: TsvSource): Promise<ParsedWord[]> {
  const url = `${BASE_URL}/${encodeURIComponent(source.file)}`
  const label = source.level === 7 ? '7-9' : String(source.level)
  console.log(`📥 Downloading HSK ${label}...`)

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)

  const text = await res.text()
  const words = parseTsv(text, source.level)

  // Merge Thai meanings
  const thaiCache = await loadThaiCache(source.level)
  const thaiCount = Object.keys(thaiCache).length
  if (thaiCount > 0) {
    for (const w of words) {
      if (thaiCache[w.simplified]) w.meaningTh = thaiCache[w.simplified]
    }
  }

  // Merge POS tags
  const posCache = await loadPosCache(source.level)
  const posCount = Object.keys(posCache).length
  if (posCount > 0) {
    for (const w of words) {
      if (posCache[w.simplified]) w.pos = posCache[w.simplified]
    }
  }

  // Merge example sentences
  const sentCache = await loadSentenceCache(source.level)
  const sentCount = Object.keys(sentCache).length
  if (sentCount > 0) {
    for (const w of words) {
      if (sentCache[w.simplified]) w.sentence = sentCache[w.simplified]
    }
  }

  console.log(
    `   ✅ ${words.length} words | 🇹🇭 ${thaiCount || 'pending'} Thai${posCount > 0 ? ` | 🏷️ ${posCount} POS` : ''}${sentCount > 0 ? ` | 💬 ${sentCount} sentences` : ''}`,
  )
  return words
}

function renderIndex(sources: TsvSource[]): string {
  const imports = sources
    .map((s) => `import { ${s.constName} } from './${s.outputName.replace('.ts', '')}'`)
    .join('\n')

  return `// AUTO-GENERATED by scripts/generate-hsk-data.mts — DO NOT EDIT
// Fast lookup maps for HSK 3.0 (2021) — all levels

import type { HskWord, HskLevel, HskByHanzi, HskByLevel } from './types'
${imports}

export type { HskWord, HskLevel, HskByHanzi, HskByLevel }

/** All HSK words across all levels */
export const allHskWords: HskWord[] = [
  ...hsk1, ...hsk2, ...hsk3, ...hsk4, ...hsk5, ...hsk6, ...hsk79,
]

/**
 * Lookup by simplified hanzi → HskWord[]
 * O(1) — perfect for flashcard display & search
 */
export const hskByHanzi: HskByHanzi = new Map()
for (const word of allHskWords) {
  const existing = hskByHanzi.get(word.simplified) ?? []
  existing.push(word)
  hskByHanzi.set(word.simplified, existing)
}

/**
 * Lookup by HSK level → HskWord[]
 * O(1) — perfect for deck generation
 */
export const hskByLevel: HskByLevel = new Map()
for (const word of allHskWords) {
  const existing = hskByLevel.get(word.level) ?? []
  existing.push(word)
  hskByLevel.set(word.level, existing)
}

/** Get words for a specific level, sorted by frequency (most common first) */
export function getWordsByLevel(level: HskLevel): HskWord[] {
  return hskByLevel.get(level) ?? []
}

/** Find a word by simplified hanzi (returns first match if duplicates) */
export function findWord(simplified: string): HskWord | undefined {
  return hskByHanzi.get(simplified)?.[0]
}

/** Get total word count per level */
export function getWordCount(level: HskLevel): number {
  return hskByLevel.get(level)?.length ?? 0
}

// Re-export individual level arrays
export { hsk1, hsk2, hsk3, hsk4, hsk5, hsk6, hsk79 }
`
}

async function main() {
  console.log('🚀 HSK 3.0 Data Generator')
  console.log('================================')

  await mkdir(OUTPUT_DIR, { recursive: true })

  const allResults: { source: TsvSource; words: ParsedWord[] }[] = []

  // Download all levels in parallel
  const tasks = SOURCES.map(async (source) => {
    const words = await downloadAndParse(source)
    return { source, words }
  })

  const results = await Promise.all(tasks)
  allResults.push(...results)

  // Write individual level files
  console.log('\n📝 Writing TypeScript files...')
  for (const { source, words } of allResults) {
    const hasThaiCount = words.filter((w) => w.meaningTh).length
    const hasPosCount = words.filter((w) => w.pos).length
    const hasSentCount = words.filter((w) => w.sentence).length
    const content = renderTs(words, source.constName, source.level, hasThaiCount, hasPosCount)
    const outputPath = join(OUTPUT_DIR, source.outputName)
    await writeFile(outputPath, content, 'utf-8')
    const thaiNote = hasThaiCount > 0 ? ` | 🇹🇭 ${hasThaiCount}` : ''
    const posNote = hasPosCount > 0 ? ` | 🏷️ ${hasPosCount}` : ''
    const sentNote = hasSentCount > 0 ? ` | 💬 ${hasSentCount}` : ''
    console.log(`   ✅ ${source.outputName} (${words.length} words${thaiNote}${posNote}${sentNote})`)
  }

  // Write index file
  const indexContent = renderIndex(SOURCES)
  await writeFile(join(OUTPUT_DIR, 'index.ts'), indexContent, 'utf-8')
  console.log('   ✅ index.ts')

  // Summary
  const totalWords = allResults.reduce((sum, { words }) => sum + words.length, 0)
  console.log('\n================================')
  console.log(`✅ Done! Total: ${totalWords.toLocaleString()} words`)
  console.log(`📁 Output: packages/db/src/data/hsk/`)
  console.log('\nWord counts by level:')
  for (const { source, words } of allResults) {
    const label = source.level === 7 ? '7-9' : String(source.level)
    console.log(`   HSK ${label}: ${words.length.toLocaleString()} words`)
  }
}

main().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
