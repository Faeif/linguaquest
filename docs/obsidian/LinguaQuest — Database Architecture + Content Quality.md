
> วันที่: 2026-04-26 | Status: Design + Implementation Plan Tags: #linguaquest #database #content-quality #architecture

---

## ⚠️ Schema Decision (2026-04-26)

```
ไฟล์ Flashcard System มี cards unified table (vocab/grammar/sentence)
ไฟล์นี้มี global_cards + user_card_progress แยกกัน

Decision: ใช้ทั้งสองแบบ แต่แยก use case ชัดเจน

global_cards          → HSK vocab shared (10k rows, seed ครั้งเดียว)
user_card_progress    → SRS progress ต่อ user ต่อ HSK card
user_created_cards    → Cards ที่ user สร้างเอง (grammar pill / session end)
                        type: 'grammar' | 'sentence'
                        ไม่ได้มาจาก global_cards

MVP ทำแค่: global_cards + user_card_progress
Phase 2 เพิ่ม: user_created_cards
```

---

## 📦 Part 1: HSK Vocabulary Database

### Decision: 2 Tables แยกกัน

```
global_cards          → HSK vocab ทั้งหมด (shared)
user_card_progress    → progress ของแต่ละ user (per user)
```

### ทำไมต้องแยก

```
❌ ถ้ารวมกัน:
10,000 คำ × 1,000 users = 10M rows
duplicate ข้อมูลคำเดิมทุก user
query ช้าลงเรื่อยๆ

✅ ถ้าแยก:
global_cards = 10,000 rows เสมอ ไม่ขยาย
user_card_progress เพิ่มเฉพาะคำที่ user เรียนแล้ว
```

---

### Schema

```sql
-- Table 1: Global HSK Vocabulary
-- seed ครั้งเดียว ไม่เปลี่ยน
CREATE TABLE global_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  simplified   TEXT NOT NULL,
  traditional  TEXT,
  pinyin       TEXT NOT NULL,
  pinyin_numeric TEXT,

  -- Meaning
  meaning_th   TEXT NOT NULL,
  meaning_en   TEXT,

  -- Classification
  hsk_level    INT NOT NULL,        -- 1-9
  pos          TEXT,                -- verb/noun/adj/etc
  frequency_rank INT,               -- 1 = พบบ่อยสุด

  -- Learning aids
  example_zh   TEXT,
  example_th   TEXT,
  example_pinyin TEXT,

  -- Quality flags
  native_verified  BOOLEAN DEFAULT FALSE,
  quality_score    FLOAT,           -- 0-1 จาก AI Judge
  last_reviewed_at TIMESTAMPTZ,

  -- Assets
  audio_url    TEXT,                -- R2 pre-generated
  stroke_order JSONB,

  tags         TEXT[],
  created_at   TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(simplified, hsk_level)
);

-- Indexes
CREATE INDEX idx_global_cards_hsk  ON global_cards(hsk_level);
CREATE INDEX idx_global_cards_pos  ON global_cards(pos);
CREATE INDEX idx_global_cards_freq ON global_cards(frequency_rank);
CREATE INDEX idx_global_cards_verified ON global_cards(native_verified);

-- Table 2: User Progress
CREATE TABLE user_card_progress (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id  UUID NOT NULL REFERENCES global_cards(id),

  -- FSRS
  stability    FLOAT DEFAULT 1.0,
  difficulty   FLOAT DEFAULT 5.0,
  due_date     TIMESTAMPTZ DEFAULT NOW(),
  review_count INT DEFAULT 0,
  last_review  TIMESTAMPTZ,
  state        TEXT DEFAULT 'new',
  -- 'new' | 'learning' | 'review' | 'relearning'

  -- Source
  added_from       TEXT,
  -- 'hsk_deck' | 'companion' | 'manual' | 'vocab_popup'
  source_session_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, card_id)
);

-- Critical index สำหรับ daily queue
CREATE INDEX idx_progress_due
  ON user_card_progress(user_id, due_date)
  WHERE state != 'new';
```

---

### Seed Script (TypeScript → Supabase)

```typescript
// scripts/seed-global-cards.ts
// รันครั้งเดียว: pnpm tsx scripts/seed-global-cards.ts

import { hsk1 } from '../packages/db/src/data/hsk/hsk-1'
import { hsk1Th } from '../packages/db/src/data/hsk/th/hsk-1-th'

async function seedHSK() {
  const allLevels = [
    { data: hsk1, th: hsk1Th, level: 1 },
    // ... hsk2 through hsk9
  ]

  for (const { data, th, level } of allLevels) {
    const cards = data.map((word, i) => ({
      simplified: word.simplified,
      pinyin: word.pinyin,
      meaning_th: th[i]?.meaning ?? '',
      hsk_level: level,
      frequency_rank: i + 1,
      native_verified: false,  // จะ verify ทีหลัง
    }))

    // Batch insert 500 rows ต่อครั้ง
    for (let i = 0; i < cards.length; i += 500) {
      await supabase
        .from('global_cards')
        .upsert(cards.slice(i, i + 500),
          { onConflict: 'simplified,hsk_level' })
    }
    console.log(`✅ Seeded HSK ${level}: ${cards.length} words`)
  }
}
```

---

### Caching Strategy

```
global_cards → cache นาน (ข้อมูลไม่เปลี่ยน)
Redis key: "vocab:{simplified}" → TTL 24hr
Redis key: "hsk:level:{1-9}" → TTL 7 วัน

user_card_progress → ไม่ cache
เปลี่ยนทุกครั้งที่ review → query ตรงเสมอ
```

---

## 🎯 Part 2: Content Quality System

### ปัญหาที่ต้องแก้

```
ตอนนี้ AI Companion อาจ output:
❌ "您好，请问您今天想用餐吗？"
   (formal เกินไป ไม่มีใครพูดแบบนี้)

ต้องการ:
✅ "你好！今天想吃什么？"
   (natural, casual, คนจีนพูดจริงๆ)
```

---

### 3-Layer Quality System

```
Layer 1: AI Self-Check (ทุก output)
  → DeepSeek V3 ตรวจก่อนส่ง user

Layer 2: Native Speaker Review (batch)
  → คนจีนจริง verify sample ทุกสัปดาห์

Layer 3: User Signal (continuous)
  → 👍👎 feedback จาก user สะสม
```

---

### Layer 1: AI Judge — DeepSeek ตรวจ Qwen

```typescript
// packages/core/ai/judge.ts

const JUDGE_PROMPT = `
คุณคือ native speaker ภาษาจีนกลาง อายุ 25-35 ปี
เติบโตในปักกิ่ง/เซี่ยงไฮ้

ประเมิน output นี้ใน 3 มิติ (0-10):

1. NATURALNESS: คนจีนพูดแบบนี้จริงๆ มั้ย?
   10 = พูดทุกวัน / 0 = ไม่มีใครพูดแน่นอน

2. CONTEXT_FIT: เหมาะกับ situation/relationship มั้ย?
   (casual/formal, stranger/friend)

3. LEARNING_VALUE: ถ้า user ไปพูดกับคนจีนจริง จะได้ผลมั้ย?

ตอบเป็น JSON เท่านั้น:
{
  "naturalness": 8,
  "context_fit": 7,
  "learning_value": 9,
  "pass": true,
  "issues": ["ใช้ 您 formal เกินไป"],
  "suggested_fix": "เปลี่ยนเป็น 你"
}

เกณฑ์ pass: ทุก score ≥ 7
`

export async function judgeOutput(
  speech: string,
  situation: string,
  formality: 'casual' | 'formal'
): Promise<JudgeResult> {
  // ใช้ sampling: judge แค่ 30% ของ turns
  // เพื่อประหยัด cost
  if (Math.random() > 0.3) {
    return { pass: true, skipped: true }
  }

  const response = await deepseek.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: JUDGE_PROMPT },
      { role: 'user', content: `
        Situation: ${situation}
        Formality: ${formality}
        Output to evaluate: "${speech}"
      `}
    ],
    response_format: { type: 'json_object' }
  })

  return JSON.parse(response.choices[0].message.content)
}
```

### Judge Integration ใน Session Flow

```typescript
// app/api/session/turn/route.ts

const companionOutput = await qwen.generateTurn(context)
const parsed = parseCompanionOutput(companionOutput)

// Judge แบบ async (ไม่บล็อก response)
if (shouldJudge(session)) {
  judgeOutput(parsed.speech, session.topic, 'casual')
    .then(result => {
      if (!result.pass) {
        // Log สำหรับ prompt improvement
        logJudgeFailure({
          output: parsed.speech,
          issues: result.issues,
          fix: result.suggested_fix,
          session_id: session.id
        })
        // ถ้า naturalness < 5 → regenerate
        if (result.naturalness < 5) {
          return regenerateWithFix(context, result.suggested_fix)
        }
      }
    })
}

return parsed  // ส่ง user ไปก่อน ไม่รอ judge
```

---

### Layer 2: Native Speaker Review Process

```
ทุกสัปดาห์ (Somnuek ประสานงาน):

Step 1: Export samples
  → query judge_failures จาก DB
  → export เป็น Google Sheet
  → คำที่ fail บ่อยสุดขึ้นก่อน

Step 2: Native speaker review
  → ส่ง sheet ให้คนจีนเจ้าของภาษา
  → ให้ mark: Natural / Unnatural / ห้ามพูด
  → ให้เขียนประโยคที่ถูกต้องแทน

Step 3: Update prompt
  → เพิ่ม "ห้ามพูดแบบนี้" examples
  → เพิ่ม "ถูกต้องแบบนี้" examples
  → commit prompt ใน /prompts/ ด้วย message:
    "prompt: fix naturalness - 量词 context"

Step 4: A/B test
  → รัน 2 prompts พร้อมกัน 50/50
  → วัด judge pass rate
  → เลือก prompt ที่ดีกว่า

Target: natural rate ≥ 85% ก่อน beta launch
```

---

### Layer 3: User Signal Collection

```typescript
// ทุก AI message มีปุ่ม feedback

interface MessageFeedback {
  session_id: string
  turn_number: number
  ai_output: string
  rating: 'natural' | 'unnatural' | null
  user_comment?: string  // optional text
}

// เก็บลง DB สำหรับ prompt analysis
// ถ้า 5+ users rate 'unnatural' ประโยคเดิม
// → flag สำหรับ native review
```

---

### Few-shot Examples ใน Prompt (สำคัญมาก)

```markdown
# ใน /prompts/companion/layer3_conversation.md

## NATURAL SPEECH RULES

### สั่งอาหาร — ตัวอย่างที่ถูก
✅ "今天想吃什么？"         (casual, สั้น)
✅ "要来一碗面条吗？"       (เสนอตรงๆ)
✅ "好吃！下次再来哦"       (ลงท้ายด้วย 哦/啊)

### สั่งอาหาร — ห้ามพูดแบบนี้
❌ "您今天想用餐什么菜肴？" (formal เกินไป)
❌ "请问您需要点什么食物？" (ยาวเกินไป weird)
❌ "我为您推荐今日特餐"     (ไม่มีใครพูดแบบนี้)

### กฎที่ต้องทำเสมอ
- ความยาวประโยค: 5-15 characters
- ใส่ filler: 那个 就是 嗯 เพื่อความเป็นธรรมชาติ
- ลงท้ายด้วย particle: 吗 呢 啊 哦 吧
- ห้ามใช้ 您 ใน casual context กับ stranger
```

---

### Quality Metrics ที่วัดได้

```
Judge Pass Rate:
→ เป้า ≥ 85% ก่อน beta
→ วัดทุกวัน ดู trend

Native Verified Rate:
→ % ของ global_cards ที่ verified = true
→ เป้า: HSK 1-2 ครบ 100% ก่อน launch

User Naturalness Rating:
→ % 👍 / (👍 + 👎) ต่อ session
→ เป้า ≥ 80%

Regeneration Rate:
→ % ที่ต้อง regenerate เพราะ judge fail
→ ถ้า > 20% → prompt ต้องปรับด่วน
```

---

### Sentence Example Quality — สำหรับ Vocab Popup

```
ปัญหาเฉพาะของ example sentence:
ถ้า AI generate → อาจไม่ natural

วิธีแก้: Pre-generate + verify

Step 1: DeepSeek generate 3 examples ต่อคำ
Step 2: Native speaker เลือก best 1
Step 3: เก็บใน global_cards.example_zh
Step 4: ไม่ต้อง generate อีกเลย

สำหรับ HSK 1-2 (2,000 คำ):
→ ทำได้ใน 1 สัปดาห์ด้วย batch script
→ native spot-check 20% ก็พอ
```

---

## 📋 Part 3: Recent & History UX

### ตอบคำถาม "Recent อยู่ที่ไหน?"

```
ไม่ใช่ side tab แยก

Recent = ส่วนหนึ่งของ Flashcard screen
แสดงเป็น section ใน tab [ทั้งหมด]
```

---

### Flashcard Screen Layout

```
/learn/flashcard

┌─────────────────────────────────────┐
│ 📚 Flashcard                        │
│                                     │
│ [ทั้งหมด] [HSK] [Session] [Grammar] │
│    ←─── TAB BAR ───────────────→   │
└─────────────────────────────────────┘

TAB: ทั้งหมด
┌─────────────────────────────────────┐
│ 🔴 Due Today: 15 cards             │
│ [▶ เริ่มทบทวนทันที]                │
│                                     │
│ ─── Recently Added ─────────────── │
│ เพิ่มใน 24 ชั่วโมงที่ผ่านมา       │
│                                     │
│ 左 zuǒ  · ซ้าย · จาก: session      │
│ 右 yòu  · ขวา · จาก: popup         │
│ 然后    · แล้วก็ · จาก: grammar     │
│ [ดูทั้งหมด]                         │
│                                     │
│ ─── All Cards ──────────────────── │
│ [เรียงตาม: Due date ▼]             │
│ [กรอง: HSK 1 ▼] [Vocab ▼]         │
│                                     │
│ ทุกคำที่เพิ่มแล้ว...               │
└─────────────────────────────────────┘

TAB: Session
┌─────────────────────────────────────┐
│ คำที่เจอใน Session (ยังไม่ได้ Add) │
│                                     │
│ Session: ถามทาง · 30 เม.ย.         │
│ ──────────────────────────────────  │
│ [ ] 地铁站  สถานีรถไฟใต้ดิน       │
│ [ ] 怎么走  ไปยังไง                │
│ [✓] 左      ซ้าย (Added)           │
│ [ ] 右      ขวา                    │
│ [ ] 一直走  เดินตรงไป              │
│                                     │
│ [+ Add ที่เลือก]  [+ Add ทั้งหมด]  │
│                                     │
│ Session: สั่งอาหาร · 29 เม.ย.      │
│ ─── (collapsed) ───                │
│ [펼치기 ดูคำ]                       │
└─────────────────────────────────────┘

TAB: Grammar
┌─────────────────────────────────────┐
│ Grammar ที่เรียนแล้ว               │
│ [ค้นหา...]                          │
│                                     │
│ ล่าสุด ↓                           │
│                                     │
│ 然后 vs 接着        30 เม.ย.       │
│ จาก: session ถามทาง                │
│ [ทบทวน] [+ Card]                   │
│                                     │
│ 量词 — Measure Words  29 เม.ย.    │
│ จาก: session สั่งอาหาร             │
│ [ทบทวน] [+ Card]                   │
│                                     │
│ 了 aspect marker      28 เม.ย.    │
│ จาก: session Day 1                 │
│ [ทบทวน] [+ Card]                   │
└─────────────────────────────────────┘
```

---

### Session History — อยู่ที่ไหน?

```
ไม่ใช่ใน Flashcard
อยู่ใน /progress → tab [Sessions]

/progress

TAB BAR:
[Skill Radar] [Sessions] [Speaking]

TAB: Sessions
┌─────────────────────────────────────┐
│ 📅 Session History                  │
│                                     │
│ เมษายน 2026                        │
│ ─────────────────────────────────── │
│ วันพฤหัส 30                        │
│ 🗺️ ถามทาง · 81% · +60 XP          │
│ [ดู Summary] [เล่นซ้ำ]             │
│                                     │
│ วันพุธ 29                          │
│ 🍜 สั่งอาหาร · 74% · +55 XP       │
│ [ดู Summary] [เล่นซ้ำ]             │
│                                     │
│ วันอังคาร 28                       │
│ 🙋 ทักทาย · 68% · +50 XP          │
│ [ดู Summary] [เล่นซ้ำ]             │
└─────────────────────────────────────┘
```

---

### Summary: ข้อมูลอยู่ที่ไหน

```
📍 Home Screen:
→ Today's mission
→ Streak + XP
→ Due cards count (badge)

📍 /speak → /speak/session → /speak/summary:
→ Active session flow
→ Summary หลังจบ session

📍 /study-plan:
→ 7-day calendar
→ Lesson progress per day

📍 /learn/flashcard:
→ Due cards
→ Recently Added (24hr)
→ Tab: ทั้งหมด / Session vocab / Grammar

📍 /progress:
→ Skill Radar
→ Session History
→ Speaking score trend
→ HSK Readiness (Pro)
```

---

---

## 🔊 Part 4: TTS Generation Workflow (audio_url ใน global_cards)

### ปัญหา
```
global_cards มี field: audio_url TEXT  (pre-generated TTS)
แต่ไม่มีระบุว่าจะ generate ยังไงสำหรับ 10,000+ คำ
```

### วิธีแก้: Batch TTS Script

```typescript
// scripts/generate-tts-audio.mts
// รันครั้งเดียวต่อ HSK level: pnpm tsx scripts/generate-tts-audio.mts --level=1

import { createClient } from '@supabase/supabase-js'
// ใช้ Qwen3-TTS หรือ Edge TTS (ถูกกว่า)

async function generateTTSBatch(hskLevel: number) {
  const cards = await supabase
    .from('global_cards')
    .select('id, simplified, pinyin')
    .eq('hsk_level', hskLevel)
    .is('audio_url', null)  // เฉพาะที่ยังไม่มี audio

  for (const card of cards) {
    // Generate TTS
    const audioBuffer = await tts.generate(card.simplified, {
      lang: 'zh-CN',
      speed: 0.85,  // ช้ากว่าปกตินิดหน่อย เหมาะกับ learner
    })

    // Upload to R2
    const r2Key = `audio/vocab/${card.id}.webm`
    await r2.put(r2Key, audioBuffer)

    // Update DB
    await supabase
      .from('global_cards')
      .update({ audio_url: `${CDN_BASE}/${r2Key}` })
      .eq('id', card.id)
  }
  console.log(`✅ TTS generated for HSK ${hskLevel}`)
}
```

### Priority & Timeline
```
สัปดาห์ 1 (ก่อน beta):
→ HSK 1 (497 คำ) — ใช้เวลา ~1 ชั่วโมง
→ HSK 2 (764 คำ) — ใช้เวลา ~2 ชั่วโมง
  ทั้งหมด: 1,261 คำ → ครอบคลุม 90% ของ session

สัปดาห์ 2-3:
→ HSK 3-4 (~2,000 คำ) — สำหรับ intermediate user

Phase 2:
→ HSK 5-9 (~7,000 คำ) — ทำเมื่อ user base เติบโต

ประมาณ cost (Edge TTS ฟรี / Qwen3-TTS):
→ ถ้าใช้ Azure Edge TTS: ฟรี 500k chars/เดือน → ครอบคลุม HSK 1-3 ทั้งหมด
→ เก็บไว้ใน R2 ตลอด (ไม่ต้อง generate ซ้ำ)
```

---

## 🗓️ Implementation Timeline

```
สัปดาห์ 1 (ทำก่อนทุกอย่าง):
□ รัน seed script → global_cards ใน Supabase
□ สร้าง user_card_progress schema
□ ตั้ง quality_score + native_verified columns
□ รัน DeepSeek batch generate examples
   สำหรับ HSK 1-2 ทั้งหมด

สัปดาห์ 1-2:
□ Setup AI Judge (30% sampling)
□ Log judge failures → DB
□ Native speaker review first 200 words

สัปดาห์ 2:
□ Flashcard screen + 4 tabs
□ "Recently Added" section
□ Session vocab tab (batch add)

สัปดาห์ 3:
□ Grammar history tab
□ Session history screen (/progress)
□ A/B test prompt versions
```

---

## ✅ Quality Checklist ก่อน Beta

```
global_cards:
□ HSK 1: 100% native_verified
□ HSK 2: 100% native_verified
□ HSK 3-6: AI Judge verified ≥ 85%
□ ทุกคำมี example_zh + example_th
□ audio_url ครบ HSK 1-3

AI Companion:
□ Judge pass rate ≥ 85%
□ Native speaker review: 50 turns × 5 topics
□ Regeneration rate < 20%
□ Prompt committed ใน /prompts/ git

User Experience:
□ Vocab popup แสดง example ที่ verified
□ Grammar pill อธิบายถูกต้อง
□ Session summary sentences เป็น natural
```

---

_Last updated: 2026-04-26_ _Links: LinguaQuest_UX_Architecture.md · LinguaQuest_Brainstorm.md_