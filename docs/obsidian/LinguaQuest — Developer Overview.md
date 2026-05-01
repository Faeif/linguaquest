
> อ่านไฟล์นี้ก่อนเริ่ม code ทุกอย่าง ใช้เวลาอ่าน: 15-20 นาที

---

## TL;DR — App ทำอะไร?

```
LinguaQuest = AI Companion สอนภาษาจีนสำหรับคนไทย

Core idea:
1. User เลือกสถานการณ์ (สั่งอาหาร, ถามทาง, ฯลฯ)
2. AI เปิดบทสนทนาก่อนเสมอ — ไม่รอให้ user กล้า
3. User พูด — ระบบวัด tone รายตัวอักษร real-time
4. AI บันทึกทุก error → สร้าง learning path ถัดไป
5. ทุก session ต่างกัน — 100 คน ได้ 100 เส้นทาง
```

---

## Tech Stack

```
Framework:  Next.js 15 App Router + TypeScript strict
Styling:    Tailwind CSS v4 + shadcn/ui
Database:   Supabase (PostgreSQL + RLS + Auth)
Cache:      Upstash Redis
Storage:    Cloudflare R2 (audio ephemeral เท่านั้น)
Deploy:     Vercel
Monorepo:   Turborepo + pnpm

AI Stack:
Qwen3 (qwen-max)    → AI Companion + Thai explanations
DeepSeek V3         → Chinese specialist + AI Judge
Qwen3-ASR           → Speech-to-text
SpeechSuper         → Tone scoring (per character)

Design System: "Minimalist Café"
Background: #FAFAF9
Primary:    #8B5E3C
Accent:     #F97316  ← CTA เท่านั้น
No gradients, no heavy shadows
```

---

## Project Structure

```
linguaquest/
├── apps/
│   └── web/                    ← Next.js app (ทำงานที่นี่หลัก)
│       └── src/
│           ├── app/            ← Routes
│           │   ├── (app)/      ← Protected routes
│           │   ├── (auth)/     ← Login/Register
│           │   ├── api/        ← API endpoints
│           │   └── onboarding/ ← Onboarding flow
│           ├── components/     ← Shared UI components
│           ├── features/       ← Feature modules
│           │   └── companion/  ← AI Companion (หลักที่สุด)
│           └── lib/            ← Utilities, clients
│
├── packages/
│   ├── core/                   ← Business logic (shared)
│   │   ├── ai/                 ← Qwen3, DeepSeek clients
│   │   └── src/flashcard/      ← FSRS algorithm
│   └── db/                     ← HSK data + DB types
│       └── src/data/hsk/       ← HSK 1-9 vocabulary files
│
├── prompts/companion/          ← AI prompts (version controlled)
│   ├── layer1_profile_builder.md
│   ├── layer2_orchestrator.md
│   └── layer3_conversation.md
│
└── supabase/migrations/        ← DB schema history
```

---

## Routes ทั้งหมด

```
Public:
/                   Landing page
/login              Login
/register           Register
/onboarding         First-time setup (5 steps)

Protected (ต้อง login):
/home               Daily mission + streak + XP
/study-plan         7-day learning calendar
/speak              Session Setup → AI Companion
/speak/session      Active conversation
/speak/summary      Session End Summary
/learn/flashcard    SRS Vocab review
/learn/grammar      Grammar Hub (browse rules)
/progress           Skill Radar + History
/profile            Settings + Achievements
```

---

## Flow 1: Onboarding (ครั้งแรกที่ใช้)

```
ใช้เวลา ~5 นาที เก็บ "LearningDNA" ของ user

Step 1: Welcome
→ [เริ่มเลย] หรือ [ลองก่อน guest mode]

Step 2: Goal Selection
→ เลือก 1 อย่าง: ท่องเที่ยว / สอบ HSK / ทำงาน / ซีรีส์ / คุยกับเพื่อน
→ เก็บ: goal_tag

Step 3: Level Check
→ Self-report: เพิ่งเริ่ม / รู้บ้าง / พอสื่อสารได้
→ ถ้าไม่ใช่มือใหม่ → Vocab tap test (6 คำ)
→ เก็บ: estimated_hsk_level (1-4)

Step 4: Mindset Reset (3 screens)
→ Screen A: Tone demo — "ma" 4 แบบ 4 ความหมาย
→ Screen B: No-tense — verb ไม่เปลี่ยน แค่ time word
→ Screen C: Permission to be wrong — AI ไม่ judge
→ เก็บ: mindset_completed

Step 5: Mic Test + Baseline
→ User พูด "你好"
→ SpeechSuper score tone
→ เก็บ: baseline_speaking_score, mic_status

Step 6: Daily Goal
→ เลือก: 10 / 20 / 30 นาที/วัน
→ เก็บ: daily_goal_minutes

→ Redirect: /study-plan (AI generate plan ทันที)
```

---

## Flow 2: Study Plan

```
/study-plan

AI generate 7-day plan ตาม:
- goal_tag (travel/hsk/etc.)
- estimated_hsk_level
- daily_goal_minutes

แสดง:
- Weekly calendar (Sun-Sat)
- กด วันไหน → expand ดู topics
- แต่ละ topic มี 1-3 lessons

ตัวอย่าง Day 3 (topic: ถามทาง):
├── Lesson 1: ซ้าย ขวา ตรงไป [Start] [Done]
├── Lesson 2: ถามทางใน Mall [Locked]
└── Vocab: 左右前后 [Locked]

→ Lesson Start กด → ไป /speak (pre-filled topic)
→ Lesson Done → unlock ถัดไป
→ Progress % อัปเดต real-time

DB Tables ที่ใช้:
- study_plans (plan ทั้งหมด)
- study_plan_lessons (progress แต่ละ lesson)
```

---

## Flow 3: AI Companion Session (หัวใจของ app)

```
STEP A: Session Setup (/speak)
─────────────────────────────
User เลือก:
1. สถานการณ์ (จาก plan หรือเลือกเอง)
   10 topics: สั่งอาหาร/ถามทาง/โรงแรม/Taxi/ฯลฯ
2. Coach: หลิง (formal) หรือ เว่ย (casual)
3. Mode: Learner หรือ Real Talk
4. กด [เริ่มเลย]

→ แสดง Session Contract:
   "วันนี้: ถามทางใน BTS จีน"
   ●━━━○━━━○━━━○━━━○  (5 stages)
   ⏱️ 15 นาที | 🔴 Tone 2 โฟกัส | 📚 5 vocab ใหม่

─────────────────────────────
STEP B: Active Chat (/speak/session)
─────────────────────────────
5 Stages ต่อ session:

Stage 1 — Warm-up (2 นาที)
→ ทบทวน 3 คำจาก session เก่าที่ SRS due
→ Flash card → พูด → score → ผ่าน/ลองใหม่

Stage 2 — New Vocab (3 นาที)
→ AI แนะนำ 3-5 คำใหม่ผ่าน context
→ ไม่ใช่ list — เป็นบทสนทนาสั้น
→ Vocab Tap Popup โชว์เมื่อ tap คำ

Stage 3 — Conversation (8 นาที)
→ AI เปิดบทสนทนาก่อนเสมอ
→ Learner: มี hint, สอน step by step
→ Real Talk: native speed, ไม่มี hint
→ Plot twist กลาง session (situation เปลี่ยน)
→ Grammar Pill โชว์เมื่อผิดซ้ำ 3 ครั้ง

Stage 4 — Tone Drill (4 นาที)
→ ดึงคำที่ผิด tone บ่อยที่สุดวันนี้
→ Drill ซ้ำจนผ่าน ≥80%

Stage 5 — Done
→ Summary + XP + ไป /speak/summary

─────────────────────────────
STEP C: Session Summary (/speak/summary)
─────────────────────────────
แสดง:
- Speaking score + delta จากเมื่อวาน
- XP + streak update
- Tone ที่ดีขึ้น (before→after)
- Grammar ที่ต้องจำ
- Vocab ใหม่ (tap → เพิ่ม SRS ได้)
- ประโยคหลัก 3-5 ประโยค
- Preview: พรุ่งนี้ทำอะไร

CTA:
- [ไปต่อ Lesson ถัดไป] → Study Plan update
- [ทบทวน Flashcard]
```

---

## Flow 4: AI Companion — Technical

```
3-Layer Architecture:

Layer 1: Profile Builder (once per session start)
Model: Qwen3
Input: user LearningDNA
Output: SessionConfig JSON
{
  topic, difficulty, focus_vocab,
  tone_to_focus, plot_twist, estimated_min
}
Cache: Redis 2 ชั่วโมง

Layer 2: Session Orchestrator (once per session start)
Model: Qwen3
Input: SessionConfig
Output: Conversation scaffolding plan
Cache: Redis 2 ชั่วโมง

Layer 3: Conversation Engine (every turn)
Model: Qwen3
Input: compressed context (last 3 turns only!)
Output: JSON {
  "type": "SPEECH" | "EXPLAIN" | "HINT" | "VOCAB_TAG",
  "speech": "Chinese text",
  "pinyin": "...",
  "thai_hint": "optional",
  "tone_focus": ["牛", "左"],
  "grammar_error_detected": null | "measure_word",
  "recast": null | "corrected version"
}

Judge (async, 30% sampling):
Model: DeepSeek V3
Check: naturalness ≥7, context_fit ≥7, learning_value ≥7
ถ้า fail → regenerate (max 3 ครั้ง)
```

---

## Flow 5: Speaking Pipeline

```
User กด mic → กดค้าง → พูด → ปล่อย

Technical Flow:
1. MediaRecorder API (browser built-in)
   Format: audio/webm;codecs=opus, 16kHz
2. ส่ง audio → /api/speech/transcribe
3. Server → Qwen3-ASR → text transcript
4. Server → SpeechSuper → tone scores per character
5. ลบ audio ทันที (ephemeral!)
6. Return: {transcript, tone_scores, overall_score}

Tone Scores Response:
{
  chars: [
    {char: "你", pinyin: "nǐ", score: 95, tone: 3},
    {char: "好", pinyin: "hǎo", score: 43, tone: 3},
  ],
  overall: 78
}

User Playback:
- สร้าง Object URL จาก recorded blob (browser only)
- ไม่ upload ไปไหนเลย
- Revoke เมื่อ session จบ

Coach Audio:
- Pre-generated TTS → เก็บใน R2
- Serve จาก CDN (เร็ว ประหยัด cost)
```

---

## Flow 6: Flashcard + SRS

```
3 Card Types:
1. Vocab Card:    Chinese → Thai meaning + audio
2. Grammar Card:  Pattern → fill in blank
3. Sentence Card: Situation → ประโยคทั้งหมด

DB Schema:
global_cards (shared, 10,000+ คำ)
  id, simplified, pinyin, meaning_th,
  hsk_level, pos, frequency_rank,
  example_zh, example_th, audio_url

user_card_progress (per user)
  user_id, card_id,
  stability, difficulty, due_date,
  state (new/learning/review/relearning),
  added_from (companion/popup/manual)

Algorithm: FSRS (ดีกว่า Anki SM-2 ~20%)
Location: packages/core/src/flashcard/fsrs-scheduler.ts

Daily Queue:
- Due cards (overdue ก่อน)
- New cards (เติมเมื่อ due < 5, max 10/วัน)
- Cards จาก session เมื่อวาน

Review Modes:
- Classic: เห็นคำ → คิด → เปิดเฉลย
- Speaking: เห็นคำ → พูด → SpeechSuper score
- Fill blank: เติมคำในประโยค
```

---

## Flow 7: Vocab Tap Popup

```
ทุก AI message:
→ scan Chinese characters
→ คำที่ยังไม่ mastered → แสดง dot ใต้คำ
→ user tap → popup โชว์

Popup content:
- 面馆 miànguǎn
- 🇹🇭 ร้านก๋วยเตี๋ยว
- 📖 HSK 2 | 🔊 ฟัง
- ตัวอย่าง: 面馆很好吃
- [+ เพิ่ม SRS]

Technical: single DOM element + event delegation
ไม่ render popup แยกทุกคำ (สำคัญมาก performance)
Auto-dismiss 4 วิ
```

---

## Flow 8: Grammar System

```
3 Levels (ขึ้นอยู่กับ error count):

Level 1 — Invisible (error 0 ครั้ง)
AI ใช้ grammar ถูกใน response เสมอ
user ได้ยินแบบถูกซ้ำๆ โดยไม่รู้ตัว

Level 2 — Recast (error 1-2 ครั้ง)
User พูดผิด → AI แก้ใน response โดยไม่บอกว่าผิด
"我要面条大" → AI: "好的！一碗大碗面条马上来"
บทสนทนาไหลต่อปกติ

Level 3 — Grammar Pill (error 3+ ครั้ง)
Slide-up modal:
"💡 量词 — Measure Words
 ตัวเลข + [量词] + คำนาม
 ✅ 一碗面条  ❌ 一面条"
[บันทึก Flashcard] [เข้าใจแล้ว]

Grammar Types ที่ track:
- measure_word
- aspect_marker (了/过/着)
- time_placement
- negation
- question_particle

Storage: Redis TTL 24hr per session
```

---

## Database Tables สำคัญ

```sql
-- User profile + LearningDNA
profiles (
  id, user_id, display_name, avatar_url,
  goal_tag, estimated_hsk_level,
  baseline_speaking_score,
  daily_goal_minutes, streak_current,
  xp_total, level
)

-- HSK vocabulary (shared ทุก user)
global_cards (
  id, simplified, pinyin, meaning_th,
  hsk_level, pos, frequency_rank,
  example_zh, example_th, audio_url,
  native_verified, quality_score
)

-- User's SRS progress
user_card_progress (
  id, user_id, card_id,
  stability, difficulty, due_date,
  state, review_count, added_from
)

-- Session history
companion_sessions (
  id, user_id, topic, mode, persona_id,
  avg_speaking_score, turns_completed,
  xp_earned, vocab_encountered,
  grammar_errors, tone_weak_log
)

-- Study plan
study_plans (
  id, user_id, goal_tag, start_date,
  plan_data (JSONB), progress_pct
)

study_plan_lessons (
  id, plan_id, day_number, topic_id,
  lesson_id, lesson_type,
  status (locked/unlocked/done),
  session_id
)
```

---

## API Routes

```
POST /api/session/start
  Input: {topic, mode, persona_id, user_id}
  → Layer 1+2 AI (Qwen3)
  → Return: {session_id, session_config}

POST /api/session/turn
  Input: {session_id, user_message, turn_number}
  → Layer 3 AI (Qwen3) + Judge (DeepSeek, 30%)
  → Return: {speech, pinyin, thai_hint, grammar_error}

POST /api/speech/transcribe
  Input: audio blob
  → Qwen3-ASR
  → Delete audio immediately
  → Return: {transcript}

POST /api/speech/evaluate
  Input: {audio, reference_text}
  → SpeechSuper
  → Delete audio immediately
  → Return: {chars: [{char, score, tone}], overall}

GET  /api/speech/tts?text=你好
  → Return audio URL from R2 cache

GET  /api/flashcard/session
  → Return due cards (≤50) for today

POST /api/flashcard/review
  Input: {card_id, rating}
  → Update FSRS scores
  → Return: {next_due_date}

POST /api/study-plan/generate
  Input: {goal_tag, level, daily_minutes}
  → Qwen3 generate 7-day plan
  → Save to DB
  → Return: plan JSON

PATCH /api/study-plan/lesson/:id
  Input: {status: 'done'}
  → Update lesson status
  → Unlock next lesson
```

---

## Privacy Rules (สำคัญมาก)

```
กฎที่ทุก API ต้องทำ:

1. Hash user_id ก่อนส่งออก external API
   hashUserId(userId) → HMAC-SHA256 16 chars
   ห้ามส่ง real user_id ไป Qwen/DeepSeek

2. Audio ephemeral เท่านั้น
   รับ audio → process → DELETE ทันที
   ไม่เก็บใน R2 หรือ DB

3. User playback = browser memory เท่านั้น
   createObjectURL() ไม่ upload

4. Strip PII ออกจาก conversation
   email/phone patterns → [REDACTED]

5. Context ที่ส่ง AI ต้องไม่มี:
   real user_id, email, display_name
   ส่งแค่: hashed_id, level, goal, weak_tones
```

---

## Gamification

```
XP ได้จาก:
- Session complete: 40-80 XP (ตาม difficulty)
- Speaking ≥90%: +20 XP bonus
- Flashcard review: 2 XP/ใบ
- Streak milestone: 50-1000 XP

Levels: 1-9 (Beginner → Legend)
Level 1: 0 XP
Level 2: 200 XP
Level 3: 500 XP
...

Streak:
- เรียน 1 ครั้ง/วัน = streak +1
- Grace period: ก่อน 02:00 นับวันเดิม
- Streak freeze: ได้ 1 ครั้ง/7 วัน

Badges: 20+ badges (streak/speaking/vocab)
```

---

## Notification

```
Max 1 push notification/วัน

Types:
1. Streak reminder (ถ้าไม่ได้เรียน)
2. Streak recovery (วันหลังจาก streak หาย)
3. Milestone celebration (7/14/30/100 days)
4. Due cards (≥10 ใบ, ไม่ได้ review ≥2 วัน)
5. Weekly summary (วันจันทร์)

Implementation: Web Push API (PWA)
ไม่ส่งถ้า user เรียนแล้ววันนั้น
```

---

## Content Quality System

```
3 Layers:

1. AI Judge (async, 30% sampling)
   DeepSeek ตรวจ Qwen output
   Score: naturalness, context_fit, learning_value (0-10)
   Pass: ทุก score ≥7
   Fail → regenerate max 3 ครั้ง

2. Somnuek (Native Speaker QA)
   Review output ทุกวัน ผ่าน Google Sheet
   Mark: ✅ Natural | ⚠️ Awkward | ❌ Wrong
   Faeif แก้ prompt ตาม feedback

3. User Signal (👍👎)
   เก็บ feedback ทุก AI message
   5+ users rate unnatural → flag for review

Target: Natural rate ≥85% ก่อน beta
```

---

## What EXISTS Already

```
✅ ทำงานได้จริง:
- Auth (login/register/verify email)
- AI Companion chat (basic flow)
- Speaking Coach (record → score)
- SRS Flashcard (SM-2, กำลัง migrate เป็น FSRS)
- HSK Vocab 1-9 (11,042 คำ ใน TypeScript files)
- Onboarding (basic)
- Profile page

⚠️ มี UI แต่ยังไม่ครบ:
- Session flow (ยังไม่มี 5 stages)
- Grammar system (ยังไม่มี)
- Tone heatmap (ยังไม่มี)

❌ ยังไม่มีเลย:
- /home screen
- /study-plan screen
- /speak/summary screen
- /progress screen
- Vocab Tap Popup
- Grammar Pill
- global_cards table (vocab ยังอยู่ใน TS files)
- Study plan DB tables
- AI Judge pipeline
- Privacy anonymizer
- Gamification (XP/levels/badges)
- Push notifications
```

---

## What To Build This Sprint

```
Priority 1 (Week 1):
□ Fix AI prompt quality (Faeif)
□ Privacy anonymizer (Faeif)
□ Seed global_cards table (Aphichat)
□ Update navigation 5 tabs (Aphichat)
□ Deploy production (Aphichat)

Priority 2 (Week 2):
□ /home screen (Aphichat)
□ /study-plan screen + DB (Aphichat)
□ Tone heatmap component (Aphichat)
□ AI Judge pipeline (Faeif)

Priority 3 (Week 3):
□ /speak/summary screen (Aphichat)
□ Vocab Tap Popup (Aphichat)
□ Grammar Pill (Faeif)
□ Session End data collection (Faeif)
```

---

## Git Convention

```
Branches:
feature/[name]-[description]
fix/[name]-[bug]
chore/[description]

Commits:
feat: เพิ่ม Vocab Tap Popup
fix: แก้ tone heatmap iOS
chore: seed HSK vocabulary
prompt: update layer3 natural speech

Rules:
- ห้าม push ตรง main
- PR ต้องมี Faeif review
- WIP limit: 2 tasks/คน
- Code ที่ AI เขียนให้ → อ่านก่อน push เสมอ
```

---

## Environment Variables — .env.example

```bash
# .env.local (copy จากนี้ แล้วใส่ค่าจริง — ขอจาก Faeif)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # ห้าม expose client-side

# AI APIs
QWEN_API_KEY=sk-...                # Qwen3 Companion
DEEPSEEK_API_KEY=sk-...            # DeepSeek V3 Judge

# Speech
SPEECHSUPER_APP_KEY=...
SPEECHSUPER_SECRET_KEY=...

# Cache
UPSTASH_REDIS_URL=https://...
UPSTASH_REDIS_TOKEN=...

# Storage
CLOUDFLARE_R2_ACCOUNT_ID=...
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET_NAME=linguaquest-audio
NEXT_PUBLIC_R2_CDN_URL=https://cdn.linguaquest.app

# Privacy
HMAC_SECRET=...                    # สำหรับ hash user_id ก่อนส่ง AI API

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Error Monitoring (Sentry)
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

---

## Analytics — PostHog Setup

### ทำไมต้อง PostHog?
```
วัด "Aha Moment": time to first score ≥ 80%
→ ถ้า > 5 นาที = onboarding ยากเกินไป → ต้องปรับ

Events ที่ต้องวัดสำหรับ validation:
→ onboarding_completed
→ session_started
→ first_score_above_80          ← Aha Moment
→ session_completed
→ flashcard_reviewed
→ day_7_return                  ← KR2 retention
```

### Setup
```bash
pnpm add posthog-js
```

```typescript
// apps/web/src/lib/analytics/posthog.ts
import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window === 'undefined') return
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageview: false,   // จัดการเอง ใน Next.js router
    persistence: 'localStorage',
  })
}

export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  posthog.capture(event, properties)
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  // ส่งแค่ hashed ID — ไม่ส่ง real user_id
  posthog.identify(hashUserId(userId), traits)
}
```

### Events ที่ต้อง Track (Faeif implement)
```typescript
// Events สำคัญ — ใส่ใน code ที่เกี่ยวข้อง

// 1. onboarding
trackEvent('onboarding_step_completed', { step: 1 })
trackEvent('onboarding_completed', {
  goal_tag, estimated_hsk_level, daily_goal_minutes
})

// 2. session
trackEvent('session_started', { topic, mode, persona })
trackEvent('session_turn_scored', {
  turn_number,
  score,            // ← track เพื่อหา "first score ≥ 80%"
  is_first_time_above_80: score >= 80 && neverAbove80Before
})
trackEvent('session_completed', {
  avg_speaking_score, xp_earned, duration_seconds
})

// 3. retention signals
trackEvent('app_opened')          // วัด DAU
trackEvent('flashcard_reviewed', { card_count })
trackEvent('day_streak_continued', { streak_length })
```

---

## Error Monitoring — Sentry Setup

### Setup
```bash
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,   // 10% — ประหยัด quota
  environment: process.env.NODE_ENV,

  // ห้าม capture PII
  beforeSend(event) {
    // ลบ user email/name ออกจาก error report
    if (event.user) {
      delete event.user.email
      delete event.user.username
    }
    return event
  },
})
```

### สิ่งที่ต้อง wrap ด้วย try/catch + Sentry
```typescript
// ทุก API route ที่เรียก external API
try {
  const result = await qwen.generateTurn(context)
  // ...
} catch (err) {
  Sentry.captureException(err, {
    tags: { api: 'qwen3', route: '/api/session/turn' },
    extra: { session_id, turn_number }
    // ห้ามใส่ user_id จริง หรือ conversation content
  })
  return NextResponse.json({ error: 'AI_ERROR' }, { status: 503 })
}
```

### Alerts ที่ตั้งไว้ใน Sentry
```
Alert 1: Error rate > 5% → Slack #alerts
Alert 2: SpeechSuper timeout > 10% → Slack #alerts
Alert 3: Qwen3 error spike → Slack #alerts

ไม่ต้อง alert ทุก error — เฉพาะ spike เท่านั้น
```

---

## Quick Reference

```
Local dev:
pnpm dev → http://localhost:3000
supabase start → http://localhost:54323

Prompts location:
/prompts/companion/layer3_conversation.md

HSK data:
/packages/db/src/data/hsk/

Analytics: PostHog → app.posthog.com
Errors:    Sentry  → sentry.io

Key environment variables: (ดู .env.example section ด้านบน)
```

---

## คำถามที่ถามบ่อย

**Q: ทำไม Layer 3 ส่งแค่ last 3 turns?** A: ประหยัด token ~60-70% ใน long sessions context เก่าไม่จำเป็น

**Q: ทำไม Judge แค่ 30%?** A: ประหยัด DeepSeek cost ~70% ยังคุม quality ได้พอ

**Q: Audio เก็บที่ไหน?** A: ไม่เก็บ ลบทันทีหลัง STT/scoring เสมอ

**Q: global_cards vs user_card_progress?** A: global_cards = vocab ทุกคน share (10k rows ตลอด) user_card_progress = SRS data ของแต่ละคน (เพิ่มเมื่อเรียน)

**Q: FSRS คืออะไร?** A: Spaced repetition algorithm ที่ดีกว่า SM-2 ของ Anki ใช้ตัวเดิมใน packages/core/src/flashcard/fsrs-scheduler.ts

**Q: Prompt อยู่ที่ไหน แก้ยังไง?** A: /prompts/companion/ แก้แล้ว commit เข้า git เสมอ อย่าแก้แค่ใน chat

---

_อ่านจบแล้วถามได้ใน Discord #dev-aphichat หรือ #dev-faeif_ _Last updated: 2026-04-26_