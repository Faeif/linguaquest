
> วันที่: 2026-04-26 | Status: Design Phase Tags: #linguaquest #ux #architecture #system-design

---

## 🗺️ App Routes Overview

```
/                     → Landing / Onboarding
/home                 → Daily mission + Streak + XP
/study-plan           → 7-day plan + Progress calendar
/speak                → Session Setup → AI Companion Chat
/speak/session        → Active session
/speak/summary        → Session End Summary
/learn/flashcard      → SRS Vocab review
/learn/grammar        → Grammar Hub
/progress             → Skill Radar + History
/profile              → Settings + Achievements
```

---

## 🧠 Sub-Agent Architecture — 2 Agents

### Agent 1: Plan Agent (ทำงานครั้งเดียวหรือเมื่อ trigger)

```
Input:
→ goal_tag (travel / hsk / business)
→ estimated_level (HSK 1-4)
→ daily_goal_minutes (10 / 20 / 30)
→ exam_date (optional, สำหรับ HSK)
→ weak_areas (จาก onboarding + history)

Output: StudyPlan JSON
{
  "plan_id": "uuid",
  "duration_days": 7,
  "days": [
    {
      "day": 1,
      "date": "2026-04-27",
      "topics": [
        {
          "topic_id": "greeting_intro",
          "title": "ทักทายและแนะนำตัว",
          "estimated_min": 15,
          "lessons": [
            {
              "lesson_id": "L01",
              "title": "สวัสดีครั้งแรก",
              "type": "companion_session",
              "status": "unlocked"
            },
            {
              "lesson_id": "L02",
              "title": "แนะนำชื่อและที่มา",
              "type": "companion_session",
              "status": "locked"
            }
          ]
        },
        {
          "topic_id": "vocab_basic",
          "title": "Vocab: คำพื้นฐาน 10 คำ",
          "estimated_min": 10,
          "lessons": [...]
        }
      ]
    }
  ]
}

Model: Qwen3 (qwen-max)
Trigger: 
→ หลัง onboarding ครั้งแรก
→ ทุก 7 วัน (auto-regenerate)
→ User กด "Re-generate Plan"
Cache: Redis TTL 7 วัน
```

---

### Agent 2: Session Agent (ทำงานทุก turn)

```
Layer 1 — Profile Builder (once per session start):
  Input: user LearningDNA + plan context
  Output: SessionConfig (cached Redis 2hr)
  Model: Qwen3

Layer 2 — Orchestrator (once per session start):
  Input: SessionConfig + topic + mode
  Output: Conversation scaffolding plan
  Model: Qwen3

Layer 3 — Conversation Engine (every turn):
  Input: compressed context (last 3 turns only)
  Output: SPEECH | EXPLAIN | HINT | VOCAB_TAG
  Model: Qwen3
  Judge: DeepSeek V3 (30% sampling)
```

---

## 📅 Study Plan — Full UX Design

### Study Plan Screen

```
/study-plan

┌─────────────────────────────────────┐
│ 📅 Study Plan ของคุณ               │
│ เป้าหมาย: พูดจีนได้ก่อนไปเที่ยว   │
│                                     │
│ ████████████░░░░  Progress 65%     │
│ Week 1 of 4 · Day 5/7              │
│                                     │
│ ◄  26 เม.ย. – 2 พ.ค. 2026  ►     │
│                                     │
│ อา  จ   อ   พ   พฤ  ศ   ส         │
│ 26  27  28  29  30   1   2         │
│ ✅  ✅  ✅  ✅    ●   ○   ○          │
│                                     │
│ [+ เพิ่มเป้าหมาย]  [Re-generate]   │
└─────────────────────────────────────┘

กด วันที่ 30 (วันนี้):
→ expand ด้านล่าง แสดง topics
```

---

### Day View — Topics + Lessons

```
วันพฤหัสบดีที่ 30 เมษายน
─────────────────────────────────────

📌 Topic 1: ถามทาง (15 นาที)
   ┌─────────────────────────────┐
   │ Lesson 1: ซ้าย ขวา ตรงไป  │
   │ AI Companion · ~8 min      │
   │ ✅ Done                    │
   └─────────────────────────────┘
   ┌─────────────────────────────┐
   │ Lesson 2: ถามในห้างสรรพสินค้า│
   │ AI Companion · ~8 min      │
   │ [▶ Start]                  │
   └─────────────────────────────┘

📌 Topic 2: Vocab ทิศทาง (10 นาที)
   ┌─────────────────────────────┐
   │ Vocab Drill: 左右前后      │
   │ Flashcard · ~10 min        │
   │ [▶ Start]                  │
   └─────────────────────────────┘

📌 Topic 3: Grammar: 在哪里 (10 นาที)
   ┌─────────────────────────────┐
   │ Grammar Drill               │
   │ ~10 min · AI Generated     │
   │ [▶ Start]                  │
   └─────────────────────────────┘

Today's total: 35 min · 2/5 tasks done
─────────────────────────────────────
```

---

### Lesson Types ที่มีได้

```
Type 1: companion_session
→ เชื่อมไป /speak โดยตรง
→ situation pre-selected ตาม lesson
→ ไม่ต้องเลือก setup เองถ้า start จาก plan

Type 2: vocab_drill
→ เชื่อมไป /learn/flashcard
→ filter เฉพาะ vocab ที่ plan กำหนด

Type 3: grammar_drill
→ DeepSeek generate คำถาม HSK-style
→ อธิบายภาษาไทย

Type 4: speaking_challenge  (Phase 2)
→ Timed speaking: พูดเรื่อง topic ใน 60 วิ
→ Score ครบ 4 แกน

Type 5: listening_comprehension  (Phase 2)
→ ฟัง AI พูด ตอบคำถาม
```

---

### User-Designed Study Plan

```
นอกจาก AI generate แล้ว ให้ User สร้างเองได้:

[+ เพิ่มเป้าหมาย]
┌─────────────────────────────────────┐
│ สร้าง Topic ใหม่                   │
│                                     │
│ หัวข้อ: [_________________]        │
│ เช่น "สั่งกาแฟ", "คุยเรื่องงาน"   │
│                                     │
│ ประเภท:                            │
│ ● AI Companion ○ Vocab ○ Grammar   │
│                                     │
│ วันที่: [เลือกวัน]                 │
│                                     │
│ AI จะสร้าง lessons อัตโนมัติ       │
│                                     │
│ [สร้าง]                            │
└─────────────────────────────────────┘
```

---

## 🗣️ AI Companion — Full Session Flow

### Step 1: Session Setup

```
/speak (กด Start จาก Study Plan หรือเลือกเอง)

┌─────────────────────────────────────┐
│ 🗣️ เริ่ม Session                   │
│                           ๆ          │
│ สถานการณ์:                         │
│ [จาก Plan: ถามทาง ✓]               │
│ หรือ เลือกเอง ↓                    │
│                                     │
│ 🍜 สั่งอาหาร  🗺️ ถามทาง           │
│ 🏨 โรงแรม    🛒 ซื้อของ           │
│ 🚕 Taxi      ✈️ สนามบิน           │
│                                     │
│ ─────────────────────────────────── │
│ AI Coach:                          │
│ [👩 หลิง玲]  [👨 เว่ย伟]          │
│  Kind·Formal   Casual·Fun          │
│                                     │
│ โทนเสียง (สไตล์การพูด):           │
│ ● Standard Beijing                  │
│ ○ Taiwan Mandarin                   │
│ ○ Southern Accent                   │
│                                     │
│ Mode:                              │
│ ● Learner (มี hint, สอน step)      │
│ ○ Real Talk (native speed, ไม่ช่วย)│
│                                     │
│ [✨ เริ่มเลย →]                    │
└─────────────────────────────────────┘
```

---

### Step 2: Session Contract

```
┌─────────────────────────────────────┐
│ 🎯 วันนี้: ถามทางใน BTS จีน        │
│                                     │
│ ●━━━○━━━○━━━○━━━○                  │
│ Warm Vocab Talk Tone Done           │
│                                     │
│ ⏱️ ประมาณ 15 นาที                  │
│ 🔴 Tone 2 — จุดอ่อนที่จะโฟกัส     │
│ 📚 Vocab ใหม่: 左 右 前 直走 怎么走│
│                                     │
│ [เริ่มเลย →]                       │
└─────────────────────────────────────┘
```

---

### Step 3: Active Chat — Anatomy

```
HEADER:
← | 👩 หลิง(玲) · ถามทาง | [⚙️]
Learner  ━━●━━━━━━━━━  Turn 3/8

─────────────────────────────────────

[AI MESSAGE BUBBLE]
┌───────────────────────────────┐
│ 玲 🔊                        │
│                               │
│ 你好！请问地铁站怎么走？       │
│ nǐ hǎo! qǐngwèn dìtiězhàn   │
│ zěnme zǒu?                   │
│                               │
│ [Learner mode only:]          │
│ 💡 สวัสดี ขอถามทางไปสถานี    │
│    รถไฟใต้ดินได้ยังไงคะ      │
└───────────────────────────────┘

[Vocab dots บนคำ 地铁站 怎么走]

─────────────────────────────────────

[YOUR TURN CARD]
┌───────────────────────────────┐
│ 🎯 YOUR TURN                 │
│                               │
│   一直走，然后左转。           │
│   yīzhí zǒu rán hòu zuǒ zhuǎn│
│                               │
│ 💡 เดินตรงไป แล้วเลี้ยวซ้าย  │
│                               │
│ [🔊 ฟังโค้ช]  [👁️ ซ่อน hint] │
└───────────────────────────────┘

─────────────────────────────────────

[MIC INPUT ZONE]
[🎙️ กดค้างเพื่อพูด]  [⌨️ พิมพ์]
```

---

### Step 4: Post-Speaking Score Screen

```
┌─────────────────────────────────────┐
│ 🔥 78%                             │
│                                     │
│ [▶ คุณ  ──●───────]  0:03         │
│ [▶ โค้ช ────●─────]  0:03         │
│ ← กด เพื่อเปรียบเทียบ             │
│                                     │
│ 一  直  走  然  后  左  转         │
│ 🟢  🟢  🟢  🟡  🟢  🔴  🟢        │
│ 91% 88% 92% 71% 85% 43% 87%       │
│                                     │
│ ⚠️ 左 (zuǒ) — Tone 3              │
│ "ลงแล้วขึ้น ↘↗"                   │
│ [🔊 ฟังอีกครั้ง]                   │
│                                     │
│ [🔄 ลองใหม่]  [✓ ผ่านแล้ว →]     │
└─────────────────────────────────────┘
```

---

### Step 5: Grammar Pill (when triggered)

```
[Slide up animation]

┌─────────────────────────────────────┐
│ 💡 Grammar Tip              [✕]    │
│─────────────────────────────────────│
│ 然后 vs 接着 — แล้วก็ / ต่อมา     │
│                                     │
│ 然后 = แล้วก็ (ทั่วไป)             │
│ 接着 = ต่อมาทันที (ทำติดกัน)       │
│                                     │
│ ✅ 一直走，然后左转               │
│    เดินตรงไป แล้วเลี้ยวซ้าย       │
│                                     │
│ ✅ 吃完饭，接着去散步              │
│    กินข้าวเสร็จ แล้วก็เดินเล่นทันที│
│─────────────────────────────────────│
│ [💾 บันทึก Flashcard]              │
│ [เข้าใจแล้ว ไปต่อ]                │
└─────────────────────────────────────┘
```

---

### Step 6: Session End Summary

```
/speak/summary

┌─────────────────────────────────────┐
│ 🎉 Session เสร็จแล้ว!             │
│ ถามทางใน BTS จีน                   │
│                                     │
│ +60 XP  🔥 Streak 5 วัน           │
│ ████████████░░  Level 4            │
│                                     │
│ ─── Speaking ──────────────────    │
│ Overall: 81% ↑14% จากเมื่อวาน     │
│                                     │
│ Tone ที่ดีขึ้น:                    │
│ 左 zuǒ: 43% → 78% 🎉              │
│ 右 yòu: 65% → 82% ✨              │
│                                     │
│ ─── Grammar ที่ต้องจำ ────────    │
│ • 然后 = แล้วก็ (sequential)       │
│ • 怎么走 = ไปยังไง (direction Q)   │
│ • Direction + 走 pattern           │
│                                     │
│ ─── Vocab ใหม่ 5 คำ ───────────   │
│ 左(zuǒ)左 右(yòu)右               │
│ 前(qián)前 直走 怎么走             │
│ [ทบทวน Flashcard ตอนนี้ →]        │
│                                     │
│ ─── ประโยคหลักที่ฝึกวันนี้ ───   │
│ "一直走，然后左转"                 │
│ "地铁站在哪里？"                   │
│ "往前走大概五分钟"                 │
│ [บันทึกทั้งหมดเป็น Flashcard]     │
│                                     │
│ ─── Study Plan ─────────────────  │
│ ✅ Lesson 2/3 เสร็จแล้ว           │
│ 🔜 Lesson 3: Vocab Drill           │
│ ⏱️ 10 นาที                        │
│                                     │
│ [ไปต่อ Lesson ถัดไป →]            │
│ [กลับ Study Plan]                  │
└─────────────────────────────────────┘
```

---

## 📦 Vocab Tap Popup — Technical Spec

### Trigger Logic

```typescript
// ทุก AI message → scan Chinese characters
// แสดง dot ใต้คำที่:
// 1. ยังไม่อยู่ใน user's mastered vocab
// 2. HSK level ≤ user's level + 2

function shouldShowDot(word: string, user: User): boolean {
  const masteryLevel = user.vocab[word]?.ease ?? 0
  const hskLevel = HSK_DATA[word]?.level ?? 99
  return masteryLevel < 0.8 && hskLevel <= user.hskLevel + 2
}
```

### Popup Content

```typescript
interface VocabPopup {
  word: string           // "左"
  pinyin: string         // "zuǒ"
  tone: number           // 3
  meaning_th: string     // "ซ้าย"
  hsk_level: number      // 1
  example_zh: string     // "往左走"
  example_th: string     // "เดินไปทางซ้าย"
  audio_url: string      // R2 URL (cached)
}
```

### Performance Optimization

```
ปัญหา: ถ้า popup ทุกคำ → DOM หนัก

วิธีแก้:
1. Render popup เป็น single fixed element
   ไม่ใช่ render แยกทุกคำ
2. ใช้ event delegation: tap bubble up
3. Preload audio ของ vocab ที่จะมาถัดไป
4. Lazy load popup content (fetch เมื่อ tap)

โค้ดแนวคิด:
<div id="vocab-popup-container" /> // single element

document.getElementById('chat-area').addEventListener('click', (e) => {
  const vocabEl = e.target.closest('[data-vocab]')
  if (vocabEl) {
    const word = vocabEl.dataset.vocab
    showVocabPopup(word, vocabEl.getBoundingClientRect())
  }
})
```

---

## 🎙️ Audio Architecture — Light & Smooth

### ปัญหาที่ต้องแก้

```
1. Recording + Upload + Score = latency สูง
2. Audio file size หนัก
3. Store audio = privacy risk
```

### วิธีแก้ทั้งหมด

#### 1. WebAudio API — Record ใน browser โดยตรง

```typescript
// ไม่ต้อง third-party library
// ใช้ MediaRecorder API (built-in)

const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus', // เล็กที่สุด
  audioBitsPerSecond: 16000           // พอสำหรับ speech
})

// Chunk ส่งแบบ streaming (ไม่รอ record เสร็จ)
mediaRecorder.ondataavailable = (e) => {
  chunks.push(e.data)
}
```

#### 2. Streaming Upload — ส่งทันทีไม่รอ

```typescript
// ส่ง audio chunks ระหว่าง record
// ไม่ต้องรอ stop recording แล้วค่อยส่ง

async function streamToSTT(chunks: Blob[]) {
  const formData = new FormData()
  const audioBlob = new Blob(chunks, { type: 'audio/webm' })
  formData.append('audio', audioBlob)
  
  // ส่งไป /api/speech/transcribe
  // server ส่งต่อไป Qwen3-ASR
}
```

#### 3. Audio Storage — Ephemeral เท่านั้น

```
Timeline:
User กด record → audio อยู่ใน browser memory
User หยุด record → ส่งไป server
Server รับ → ส่งต่อ Qwen3-ASR + SpeechSuper
ได้ transcript + score กลับมา
→ ลบ audio ทันที (ไม่ save ที่ server)
→ เก็บแค่: transcript text + tone scores

ถ้า user consent "บันทึกเสียง":
→ encrypt ด้วย AES-256
→ เก็บใน R2 เฉพาะ bucket
→ anonymous ID เท่านั้น (ไม่มีชื่อ)
→ TTL 30 วัน แล้วลบ auto
```

#### 4. User Playback — Browser Memory เท่านั้น

```typescript
// เก็บ audio URL ใน component state
// ไม่ upload ไปไหนเลย สำหรับ playback

const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null)

mediaRecorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'audio/webm' })
  const url = URL.createObjectURL(blob) // local browser URL
  setUserAudioUrl(url)
  
  // Upload สำหรับ scoring (ไม่ใช่ store)
  uploadForScoring(blob)
  
  // Revoke URL เมื่อ component unmount
  return () => URL.revokeObjectURL(url)
}
```

#### 5. Coach Audio — Pre-generated + Cached

```
ทุก sentence ใน Companion:
→ Generate TTS ล่วงหน้า
→ Store ใน Cloudflare R2
→ Cache ที่ CDN edge

เมื่อ AI ส่ง SPEECH block:
→ Return audio_url จาก R2
→ Browser load จาก CDN (เร็วมาก)
→ ไม่ต้อง generate TTS real-time

ประหยัด: ลด TTS API calls ~80%
```

#### 6. Waveform Visualization — Canvas API

```typescript
// ใช้ Canvas ไม่ใช่ library ภายนอก
// เบากว่ามาก

function drawWaveform(analyser: AnalyserNode, canvas: HTMLCanvasElement) {
  const bufferLength = analyser.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  
  function draw() {
    requestAnimationFrame(draw)
    analyser.getByteTimeDomainData(dataArray)
    
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw waveform bars
    // lightweight, 60fps smooth
  }
  draw()
}
```

---

## 🔄 Full Session Flow — State Machine

```
IDLE
  ↓ user เลือก session (หรือ Plan auto-select)
SESSION_SETUP
  ↓ กด Start
SESSION_CONTRACT (แสดง 5 stages)
  ↓ กด Start
STAGE_1_WARMUP
  ↓ complete
STAGE_2_VOCAB
  ↓ complete
STAGE_3_CONVERSATION
  ├── [each turn]
  │   ├── AI_SPEAKING (แสดง bubble + animate)
  │   ├── USER_READY (แสดง YOUR TURN card)
  │   ├── USER_RECORDING (mic active, waveform)
  │   ├── PROCESSING (loading...)
  │   ├── SCORE_DISPLAY (heatmap + playback)
  │   ├── [grammar error count ≥ 3?]
  │   │   ├── YES → GRAMMAR_PILL_SHOW
  │   │   └── NO → next turn
  │   └── [turn ≥ max?]
  │       ├── YES → STAGE_4
  │       └── NO → AI_SPEAKING (next turn)
STAGE_4_TONE_DRILL
  ↓ complete
STAGE_5_SUMMARY (/speak/summary)
  ↓ user กด "ไปต่อ"
STUDY_PLAN (update lesson status → Done)
  └── unlock lesson ถัดไป
```

---

## 📊 Data Flow — What Gets Stored

```
Per Turn:
speech_score: number          // 0-100
tone_scores: {char: score}[]  // per character
transcript: string            // text only
grammar_errors: ErrorType[]   // types detected
vocab_encountered: string[]   // words seen

Per Session:
session_id: uuid
topic: string
mode: 'learner' | 'realtalk'
turns_completed: number
avg_speaking_score: number
new_vocab_added: string[]
grammar_pills_shown: string[]
xp_earned: number
duration_seconds: number

NOT stored:
❌ audio files (deleted after scoring)
❌ real user_id (hashed before API)
❌ PII in conversation
```

---

## 🏗️ Tech Stack Decision

```
Audio:
→ MediaRecorder API (browser built-in)
→ WebAudio API for waveform
→ Opus codec (best compression for speech)
→ NO external audio library needed

Waveform:
→ Canvas API (built-in)
→ NO wavesurfer.js (too heavy)

Vocab Popup:
→ Single DOM element + event delegation
→ Popover API (modern browsers)
→ NO tooltip library needed

Animation:
→ CSS transitions (slide-up for Grammar Pill)
→ Framer Motion สำหรับ complex (ถ้าจำเป็น)

State Management:
→ Zustand (เบากว่า Redux มาก)
→ Session state: local component state
→ Global: user profile + streak only

Real-time:
→ Supabase Realtime สำหรับ
  streak sync + leaderboard
→ ไม่ใช้ WebSocket เองเลย
```

---

## 📐 Component Architecture

```
features/companion/
├── components/
│   ├── SessionSetup.tsx        // Step 1
│   ├── SessionContract.tsx     // Step 2
│   ├── ChatInterface.tsx       // Step 3 (main)
│   │   ├── AIBubble.tsx
│   │   ├── YourTurnCard.tsx
│   │   ├── MicButton.tsx       // MegaMicButton
│   │   ├── WaveformCanvas.tsx
│   │   ├── ToneHeatmap.tsx
│   │   ├── VocabTapPopup.tsx   // single instance
│   │   ├── GrammarPill.tsx     // slide-up
│   │   └── ScoreDisplay.tsx
│   └── SessionSummary.tsx      // Step 5
│
├── hooks/
│   ├── useAudioRecorder.ts     // MediaRecorder logic
│   ├── useCompanionChat.ts     // API calls + state
│   ├── useGrammarTracker.ts    // error counting
│   └── useVocabDetector.ts     // popup trigger logic
│
├── constants/
│   ├── prompts.ts → /prompts/  // ย้ายไป .md files
│   ├── personas.ts
│   └── modes.ts
│
└── utils/
    ├── audioEncoder.ts
    ├── toneParser.ts           // parse SpeechSuper response
    └── contextBuilder.ts       // compress context for API

features/study-plan/
├── components/
│   ├── StudyPlanCalendar.tsx
│   ├── DayView.tsx
│   ├── TopicCard.tsx
│   ├── LessonCard.tsx
│   └── ProgressBar.tsx
│
└── hooks/
    ├── useStudyPlan.ts         // fetch + update plan
    └── useLessonProgress.ts    // mark done / unlock next
```

---

## 🎯 Study Plan — 7-Day Structure

```
Day 1: Foundation
  Topic 1: ทักทาย + แนะนำตัว (Companion)
  Topic 2: Vocab: 你好 谢谢 对不起 (Flashcard)

Day 2: Food & Drink
  Topic 1: สั่งกาแฟ (Companion Lesson 1)
  Topic 2: สั่งอาหาร (Companion Lesson 2)
  Topic 3: Vocab: 咖啡 水 好吃 多少钱 (Flashcard)

Day 3: Directions
  Topic 1: ถามทาง Lesson 1 (Companion)
  Topic 2: ถามทาง Lesson 2 - ใน Mall (Companion)
  Topic 3: Grammar: 怎么走 + directions (Drill)

Day 4: Shopping
  Topic 1: ต่อรองราคา (Companion)
  Topic 2: ขอดูสินค้า (Companion)
  Topic 3: Vocab: Shopping words (Flashcard)

Day 5: Transport
  Topic 1: ขึ้น Taxi (Companion)
  Topic 2: รถไฟใต้ดิน (Companion)
  Topic 3: Grammar: 去+place (Drill)

Day 6: Hotel
  Topic 1: Check-in (Companion)
  Topic 2: ขอของใน room (Companion)
  Topic 3: Review: Weak vocab (SRS auto-select)

Day 7: Review + Challenge
  Topic 1: Weak tone drill (auto from history)
  Topic 2: Real Talk: สั่งอาหาร (no hint)
  Topic 3: Week summary + Next week unlock
```

---

---

## 📖 /learn/grammar — Grammar Hub Spec

### Layout

```
/learn/grammar

TAB BAR:
[📖 ทั้งหมด] [✅ ที่เรียนแล้ว] [🔍 ค้นหา]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAB: ทั้งหมด (browse mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────┐
│ 📖 Grammar Hub                      │
│ เรียนรู้ grammar ผ่านตัวอย่างจริง  │
│                                     │
│ FILTER: [HSK 1] [HSK 2] [HSK 3]    │
│         [Particles] [Measure] [Time]│
│                                     │
│ ─── HSK 1 ──────────────────────── │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 吗 — Yes/No Question Particle   │ │
│ │ HSK 1 · Particle                │ │
│ │ 你好吗？ (คุณเป็นยังไงบ้าง?)   │ │
│ │ [ดูรายละเอียด]    ✅ เรียนแล้ว │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 了 — Aspect Marker              │ │
│ │ HSK 2 · Aspect                  │ │
│ │ 我吃了。(ฉันกินแล้ว)           │ │
│ │ [ดูรายละเอียด]    🔒 ยังไม่เรียน│ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAB: ที่เรียนแล้ว (from sessions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────┐
│ เรียงตาม: [ล่าสุด ▼]               │
│ [ค้นหา grammar...]                  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📝 量词 — Measure Words         │ │
│ │ เรียนจาก: session สั่งอาหาร    │ │
│ │ 30 เม.ย. · ผิดซ้ำ 3 ครั้ง     │ │
│ │ [ทบทวน] [+ Flashcard]          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📝 然后 vs 接着                 │ │
│ │ เรียนจาก: session ถามทาง       │ │
│ │ 29 เม.ย.                       │ │
│ │ [ทบทวน] [+ Flashcard]          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Grammar Detail Page
```
/learn/grammar/[grammar-id]

┌─────────────────────────────────────┐
│ ← Grammar Hub                      │
│                                     │
│ 量词 — Measure Words                │
│ HSK 2 · Measure Word               │
│                                     │
│ ─── คืออะไร ──────────────────    │
│ ภาษาจีนต้องมี 量词 (measure word)  │
│ ระหว่างตัวเลขและคำนาม              │
│                                     │
│ โครงสร้าง:                         │
│ ตัวเลข + [量词] + คำนาม            │
│                                     │
│ ─── ตัวอย่าง ──────────────────── │
│ ✅ 一碗面条   (หนึ่ง + ชาม + บะหมี่)│
│ ✅ 两杯咖啡   (สอง + แก้ว + กาแฟ)  │
│ ✅ 三本书     (สาม + เล่ม + หนังสือ)│
│                                     │
│ ─── ห้ามพูดแบบนี้ ──────────────── │
│ ❌ 一面条     (ข้าม 量词)           │
│ ❌ 一个面条   (ใช้ผิด 量词)         │
│                                     │
│ ─── 量词 ที่ใช้บ่อย ─────────────  │
│ 个 gè   — คน, สิ่งของทั่วไป       │
│ 碗 wǎn  — ชาม                      │
│ 杯 bēi  — แก้ว                     │
│ 本 běn  — เล่ม (หนังสือ)           │
│ 张 zhāng — แผ่น (กระดาษ, โต๊ะ)    │
│                                     │
│ [🎙️ ฝึกพูด]  [+ บันทึก Flashcard] │
└─────────────────────────────────────┘
```

### Data Source
```
Grammar rules อยู่ที่ไหน:
→ สร้างไฟล์ JSON: packages/db/src/data/grammar/grammar-rules.json
→ Schema:
{
  "id": "measure_word",
  "title_zh": "量词",
  "title_th": "Measure Words",
  "hsk_level": 2,
  "type": "measure_word",
  "explanation_th": "...",
  "pattern": "ตัวเลข + [量词] + คำนาม",
  "examples": [
    { "zh": "一碗面条", "th": "หนึ่งชามบะหมี่", "pinyin": "yī wǎn miàntiáo" }
  ],
  "wrong_examples": [
    { "zh": "一面条", "th": "ผิด: ข้าม measure word" }
  ],
  "common_measure_words": ["个", "碗", "杯", "本", "张"]
}

→ seed ครั้งแรกด้วย Faeif/DeepSeek generate
→ Somnuek review ทุก rule ก่อน publish
```

### MVP Scope
```
MVP: แสดง grammar ที่เจอใน session เท่านั้น (tab "ที่เรียนแล้ว")
Phase 2: Grammar Hub full browse (tab "ทั้งหมด") + detail page
เหตุผล: content ต้องผ่าน Somnuek review ก่อน ทำทีละน้อยดีกว่า
```

---

## 📊 /progress Screen — Full Spec

### Layout

```
/progress

TAB BAR:
[🎯 Skill Radar] [📅 Sessions] [🎙️ Speaking]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAB: Skill Radar
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────┐
│ 🎯 ทักษะของคุณ                     │
│                                     │
│         Speaking                    │
│            81%                      │
│         ╱      ╲                   │
│   Vocab ─────── Tone               │
│    74%            68%               │
│         ╲      ╱                   │
│          Grammar                    │
│            55%                      │
│                                     │
│ (Spider/Radar chart — 4 แกน)       │
│                                     │
│ ─── จุดอ่อนที่ต้องโฟกัส ─────    │
│ 🔴 Tone 2 (声调 2) — 52% avg      │
│ 🟡 Grammar: 量词 — ผิดบ่อยสุด     │
│                                     │
│ [ฝึก Tone 2] [ทบทวน 量词]         │
│                                     │
│ ─── HSK Readiness ─────────── 🔒  │
│ HSK 1: ██████████░  89%            │
│ "คาดว่าผ่านถ้าสอบตอนนี้"           │
│ [ดู detail → Pro]                  │
└─────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAB: Sessions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────┐
│ 📅 Session History                  │
│                                     │
│ เมษายน 2026                        │
│ ─────────────────────────────────── │
│ วันพฤหัส 30                        │
│ 🗺️ ถามทาง · 81% · +60 XP · 15 min │
│ [ดู Summary] [เล่นซ้ำ]             │
│                                     │
│ วันพุธ 29                          │
│ 🍜 สั่งอาหาร · 74% · +55 XP       │
│ [ดู Summary] [เล่นซ้ำ]             │
│                                     │
│ วันอังคาร 28                       │
│ 🙋 ทักทาย · 68% · +50 XP          │
│ [ดู Summary] [เล่นซ้ำ]             │
│                                     │
│ ── มีนาคม 2026 ──────────────────  │
│ [แสดงเพิ่ม ▼]                      │
└─────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TAB: Speaking
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────┐
│ 🎙️ Speaking Progress                │
│                                     │
│ 7 วันที่ผ่านมา                     │
│                                     │
│  100%│              ●               │
│   80%│        ●  ●     ●            │
│   60%│  ●  ●                 ●      │
│   40%│                             │
│      └──────────────────────────── │
│       จ  อ  พ  พฤ  ศ   ส  อา      │
│                                     │
│ avg: 74%  peak: 81%  trend: ↑      │
│                                     │
│ ─── Tone Breakdown ─────────────── │
│ Tone 1 (─): 85% ███████████░       │
│ Tone 2 (╱): 52% ██████░░░░░        │
│ Tone 3 (∨): 78% ██████████░        │
│ Tone 4 (╲): 81% ███████████░       │
│                                     │
│ Tone 2 ต้องฝึกเพิ่ม               │
│ [เริ่ม Tone 2 Drill →]             │
└─────────────────────────────────────┘
```

### Data Sources
```
Skill Radar:
→ Speaking: avg of last 10 sessions speaking score
→ Vocab:    % of due cards reviewed on time (30 days)
→ Tone:     avg tone score (all tones, all sessions)
→ Grammar:  100% - (grammar error rate ใน sessions)

Session History:
→ companion_sessions table (ทุก session)
→ แสดง: topic, avg_speaking_score, xp_earned, duration

Speaking Trend:
→ companion_sessions.avg_speaking_score ต่อวัน
→ 7 days / 30 days toggle
→ tone_weak_log JSONB → breakdown per tone

HSK Readiness (Pro):
→ คำนวณจาก: vocab retention % × tone accuracy % ใน HSK vocab
→ เปรียบเทียบกับ HSK passing criteria
```

### Component Files
```
features/progress/
├── components/
│   ├── SkillRadarChart.tsx      // spider chart — ใช้ recharts หรือ canvas
│   ├── SessionHistoryList.tsx
│   ├── SessionCard.tsx
│   ├── SpeakingTrendChart.tsx   // line chart
│   ├── ToneBreakdown.tsx        // bar per tone
│   └── HSKReadinessCard.tsx     // Pro gate
└── hooks/
    ├── useProgressData.ts       // fetch all stats
    └── useSessionHistory.ts     // paginated sessions
```

---

## ✅ Must-Have vs Phase 2

```
MVP (6 สัปดาห์นี้):
✅ Study Plan (AI-generated, 7 days)
✅ Session Setup (situation + mode + persona)
✅ AI Companion Chat (Learner mode)
✅ Tone Heatmap (per character)
✅ User Playback (browser memory only)
✅ Vocab Tap Popup (single element)
✅ Grammar Pill (slide-up)
✅ Session End Summary (grammar + vocab + sentences)
✅ Plan progress update (lesson → Done)
✅ Unlock next lesson

Phase 2:
⬜ Real Talk mode (full)
⬜ Tutor Chat
⬜ User-designed plan
⬜ Multiple plan goals
⬜ Listening comprehension lessons
⬜ Speaking challenge (timed)
⬜ Shadowing mode
⬜ Audio store (opt-in consent)
```

---

## 🔐 Privacy — Audio Specifically

```
Default (no consent needed):
→ Audio recorded → sent to STT → DELETED
→ Only transcript + score stored
→ 100% ephemeral

With user consent (opt-in):
→ Audio encrypted AES-256
→ Stored in R2 private bucket
→ Anonymous ID only
→ TTL: 30 วัน

User playback:
→ createObjectURL() in browser
→ NEVER uploaded for playback
→ Revoked when session ends
```

---

_Last updated: 2026-04-26_ _Owner: Faeif (Lead Dev + Product)_ _Status: Ready for Dev breakdown_