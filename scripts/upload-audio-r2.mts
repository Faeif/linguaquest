/**
 * upload-audio-r2.mts
 *
 * Downloads HSK audio files from GitHub and uploads to Cloudflare R2.
 * Audio URL after upload: https://[R2_PUBLIC_URL]/audio/cmn-{simplified}.mp3
 *
 * Run: node --experimental-strip-types scripts/upload-audio-r2.mts
 *
 * Requires env vars (in .env.local or exported):
 *   CLOUDFLARE_R2_ENDPOINT   = https://xxx.r2.cloudflarestorage.com
 *   CLOUDFLARE_R2_ACCESS_KEY = ...
 *   CLOUDFLARE_R2_SECRET_KEY = ...
 *   CLOUDFLARE_R2_BUCKET     = linguaquest-media
 *
 * Files are uploaded to: audio/cmn-{word}.mp3
 * Resume-safe: skips already-uploaded files (checks by listing bucket).
 */

import { createHmac, createHash } from 'node:crypto'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PROGRESS_FILE = join(ROOT, 'scripts/.audio-upload-progress.json')

const R2_ENDPOINT = process.env.CLOUDFLARE_R2_ENDPOINT!
const R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY!
const R2_SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_KEY!
const R2_BUCKET = process.env.CLOUDFLARE_R2_BUCKET ?? 'linguaquest-media'
const R2_REGION = 'auto'

const GITHUB_AUDIO_BASE =
  'https://raw.githubusercontent.com/krmanik/HSK-3.0/c37aa00eafe0be2540e07d6ee2a191783cf046dd/New%20HSK%20(2025)/Audio'

const CONCURRENT = 5   // parallel uploads
const DELAY_MS   = 100 // between batches

// ─── AWS Sig V4 for R2 ────────────────────────────────────────────────────────

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data).digest()
}

function sha256(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex')
}

function getSignatureKey(key: string, dateStamp: string, region: string, service: string): Buffer {
  const kDate    = hmac('AWS4' + key, dateStamp)
  const kRegion  = hmac(kDate, region)
  const kService = hmac(kRegion, service)
  return hmac(kService, 'aws4_request')
}

async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<void> {
  const now = new Date()
  const amzDate   = now.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z'
  const dateStamp = amzDate.slice(0, 8)

  const url = new URL(`${R2_ENDPOINT}/${R2_BUCKET}/${key}`)
  const host = url.host
  const payloadHash = sha256(body)

  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`

  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date'

  const canonicalRequest = [
    'PUT',
    url.pathname,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  const credentialScope = `${dateStamp}/${R2_REGION}/s3/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n')

  const signingKey = getSignatureKey(R2_SECRET_KEY, dateStamp, R2_REGION, 's3')
  const signature  = createHmac('sha256', signingKey).update(stringToSign).digest('hex')

  const authHeader =
    `AWS4-HMAC-SHA256 Credential=${R2_ACCESS_KEY}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`

  const res = await fetch(url.toString(), {
    method: 'PUT',
    headers: {
      'Content-Type':          contentType,
      'Host':                  host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date':           amzDate,
      'Authorization':        authHeader,
    },
    body,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`R2 upload failed (${res.status}): ${err.slice(0, 200)}`)
  }
}

// ─── Get word list from HSK static data ──────────────────────────────────────

async function getAllSimplifiedWords(): Promise<string[]> {
  const words = new Set<string>()
  const hskDir = join(ROOT, 'packages/db/src/data/hsk')

  for (const level of [1, 2, 3, 4, 5, 6]) {
    const file = join(hskDir, `hsk-${level}.ts`)
    if (!existsSync(file)) continue
    const content = await readFile(file, 'utf-8')
    const matches = content.matchAll(/simplified: `([^`]+)`/g)
    for (const m of matches) words.add(m[1]!)
  }

  // HSK 7-9
  const file79 = join(hskDir, 'hsk-7-9.ts')
  if (existsSync(file79)) {
    const content = await readFile(file79, 'utf-8')
    const matches = content.matchAll(/simplified: `([^`]+)`/g)
    for (const m of matches) words.add(m[1]!)
  }

  return [...words]
}

// ─── Progress tracking ────────────────────────────────────────────────────────

async function loadProgress(): Promise<Set<string>> {
  if (!existsSync(PROGRESS_FILE)) return new Set()
  const raw = await readFile(PROGRESS_FILE, 'utf-8')
  return new Set(JSON.parse(raw) as string[])
}

async function saveProgress(uploaded: Set<string>): Promise<void> {
  await writeFile(PROGRESS_FILE, JSON.stringify([...uploaded], null, 0), 'utf-8')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function processWord(
  simplified: string,
  uploaded: Set<string>,
): Promise<'uploaded' | 'skipped' | 'no_audio'> {
  const r2Key = `audio/cmn-${simplified}.mp3`

  if (uploaded.has(r2Key)) return 'skipped'

  const ghUrl = `${GITHUB_AUDIO_BASE}/cmn-${encodeURIComponent(simplified)}.mp3`
  const res = await fetch(ghUrl)

  if (res.status === 404) return 'no_audio'
  if (!res.ok) throw new Error(`GitHub fetch failed ${res.status} for ${simplified}`)

  const buffer = Buffer.from(await res.arrayBuffer())
  await uploadToR2(r2Key, buffer, 'audio/mpeg')

  uploaded.add(r2Key)
  return 'uploaded'
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function main() {
  if (!R2_ENDPOINT || !R2_ACCESS_KEY || !R2_SECRET_KEY) {
    console.error('❌ Missing R2 credentials. Set:')
    console.error('   CLOUDFLARE_R2_ENDPOINT, CLOUDFLARE_R2_ACCESS_KEY, CLOUDFLARE_R2_SECRET_KEY')
    process.exit(1)
  }

  console.log('🎵 HSK Audio Uploader → Cloudflare R2')
  console.log(`   Bucket:  ${R2_BUCKET}`)
  console.log(`   Concurr: ${CONCURRENT} parallel uploads`)
  console.log('══════════════════════════════════════')

  const allWords = await getAllSimplifiedWords()
  console.log(`   Total words: ${allWords.length.toLocaleString()}`)

  const uploaded = await loadProgress()
  const todo = allWords.filter((w) => !uploaded.has(`audio/cmn-${w}.mp3`))
  console.log(`   Already uploaded: ${uploaded.size}`)
  console.log(`   Remaining:        ${todo.length}`)
  console.log()

  let uploadedCount = 0
  let noAudioCount  = 0
  let errorCount    = 0

  for (let i = 0; i < todo.length; i += CONCURRENT) {
    const batch = todo.slice(i, i + CONCURRENT)

    const results = await Promise.allSettled(
      batch.map((w) => processWord(w, uploaded))
    )

    for (let j = 0; j < results.length; j++) {
      const r = results[j]!
      if (r.status === 'fulfilled') {
        if (r.value === 'uploaded')  uploadedCount++
        if (r.value === 'no_audio')  noAudioCount++
      } else {
        errorCount++
        console.error(`   ❌ ${batch[j]}: ${r.reason}`)
      }
    }

    // Progress report every 100 words
    const done = i + batch.length
    if (done % 100 === 0 || done >= todo.length) {
      const pct = Math.round((done / todo.length) * 100)
      process.stdout.write(`\r   [${pct}%] ${done}/${todo.length} — ↑${uploadedCount} ∅${noAudioCount} ✗${errorCount}  `)
      await saveProgress(uploaded)
    }

    if (i + CONCURRENT < todo.length) await sleep(DELAY_MS)
  }

  await saveProgress(uploaded)

  console.log('\n\n══════════════════════════════════════')
  console.log(`✅ Done!`)
  console.log(`   Uploaded:  ${uploadedCount}`)
  console.log(`   No audio:  ${noAudioCount} (words not in HSK audio pack)`)
  console.log(`   Errors:    ${errorCount}`)
  console.log(`\n   R2 key pattern: audio/cmn-{simplified}.mp3`)
}

main().catch((err) => {
  console.error('\n❌ Fatal:', err)
  process.exit(1)
})
