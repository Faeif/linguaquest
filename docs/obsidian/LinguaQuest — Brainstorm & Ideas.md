

> วันที่: 2026-04-26 | Status: Active Brainstorm Tags: #linguaquest #product #ai #learning-science

---

## 📌 MVP Scope (6 Weeks)

```
Week 1: Ship MVP → AI Companion + Flashcard
Week 2–5: Validation → POC ว่า product แก้ปัญหาได้จริง
Week 6: Pitch preparation + Final presentation
```

**MVP Core = AI Companion + Flashcard (SRS)** ทุกอย่างอื่นคือ Phase 2+

---

## 🧠 วิทยาศาสตร์การเรียนภาษา — Research-backed

### 1. Spaced Repetition (SRS)

- **งานวิจัย:** Ebbinghaus Forgetting Curve (1885) → ยังใช้อยู่ถึงทุกวันนี้
- **หลักการ:** ทบทวนก่อนที่สมองจะลืม → ขยาย interval ออกไปเรื่อยๆ
- **LinguaQuest ใช้:** FSRS algorithm (ดีกว่า SM-2 ~20% retention rate)
- **ต่างจาก Anki:** Auto-add จาก Companion, Speaking mode, Thai context

### 2. Comprehensible Input (Krashen's Input Hypothesis)

- **งานวิจัย:** Stephen Krashen, 1982 — "i+1 theory"
- **หลักการ:** เรียนรู้ได้ดีที่สุดเมื่อ input ยากกว่าระดับปัจจุบันนิดเดียว ไม่ยากเกินไป
- **LinguaQuest ใช้:**
    - AI ปรับ difficulty อัตโนมัติตาม speaking score
    - ถ้า score < 60% → ลด difficulty session ถัดไป
    - ถ้า score > 85% → เพิ่ม difficulty + plot twist

### 3. Output Hypothesis (Swain, 1985)

- **หลักการ:** การพูด/เขียนออกมาเองทำให้สังเกต gap ในความรู้ตัวเอง
- **LinguaQuest ใช้:** บังคับให้ user พูดทุก turn ไม่ใช่แค่ฟัง
- **ไม่เหมือน Duolingo:** Duolingo ให้ฟังและแปล, LinguaQuest ให้พูดในสถานการณ์จริง

### 4. Noticing Hypothesis (Schmidt, 1990)

- **หลักการ:** การเรียนรู้เกิดเมื่อ learner "notice" ความแตกต่าง
- **LinguaQuest ใช้:** Tone Heatmap → ทำให้ user เห็นว่า 牛 ของตัวเองผิดยังไง
- **ผลลัพธ์:** จาก "รู้สึกว่าผิด" → "รู้ชัดว่าผิดตรงไหน"

### 5. Interactional Feedback (Long, 1996)

- **หลักการ:** Negotiation of meaning ระหว่างการสนทนาทำให้เรียนรู้เร็วขึ้น
- **LinguaQuest ใช้:** AI Recast (แก้โดยไม่บอก) + Grammar Pill (บอกเมื่อจำเป็น)

### 6. Implicit vs Explicit Learning

- **งานวิจัย:** Ellis, 1994
- **Implicit:** ซึมซับโดยไม่รู้ตัว → Recast, Invisible Grammar
- **Explicit:** รู้ตัวชัดเจน → Grammar Pill เมื่อผิดซ้ำ 3 ครั้ง
- **LinguaQuest:** ใช้ทั้งสองแบบในสัดส่วนที่ถูกต้อง (80% implicit, 20% explicit)

### 7. Tone Perception Research (Mandarin-specific)

- **งานวิจัย:** Wang et al., 2003 — Thai speakers และ Mandarin tones
- **ปัญหา:** คนไทยมีวรรณยุกต์อยู่แล้ว แต่ระบบต่างกัน → เกิด interference
- **Thai tone vs Mandarin tone:**
    
    ```
    ไทย: สามัญ เอก โท ตรี จัตวา (5 tones)จีน: Tone 1, 2, 3, 4, neutral (5 tones)แต่ระบบ mapping ไม่ตรงกัน → confused
    ```
    
- **LinguaQuest approach:** สอนผ่าน visual curve ไม่ใช่ text description

---

## 💡 ไอเดียนอกกรอบ — ที่ยังไม่มีใครทำ

### 🔥 Idea 1: "Mistake Museum"

**Concept:** แทนที่จะซ่อนความผิดพลาด → แสดงให้ user ภูมิใจ

```
"Museum ของความผิดพลาดของฉัน"
→ เก็บทุก error ที่เคยทำไว้
→ แสดงว่า "ฉันเคยพูด 牛 ผิด 47 ครั้ง"
→ ตอนนี้ score 91% แล้ว
→ Shareable card: "จาก 43% → 91% ใน 14 วัน"
```

**ทำไมดี:** Error = proof of effort, gamify improvement journey

---

### 🔥 Idea 2: "Survival Mode"

**Concept:** Simulate สถานการณ์ฉุกเฉินจริงๆ

```
Timer 60 วินาที:
"คุณหลงทางในเซี่ยงไฮ้ มี battery เหลือ 10%
 ต้องบอก taxi driver ว่าจะไปไหน — เริ่ม!"
→ Real pressure = real learning
→ Adrenaline ช่วย memory consolidation (งานวิจัย Cahill, 1994)
```

**ทำไมดี:** Stress inoculation training ที่ใช้ใน military language training

---

### 🔥 Idea 3: "Tone Training Wheels" → Progressive Removal

**Concept:** ค่อยๆ เอา scaffold ออกตาม progress

```
Week 1: แสดง pinyin + tone marks ทุกคำ
Week 2: ซ่อน tone marks บางคำ
Week 3: ซ่อน pinyin บางคำ
Week 4: เห็นแค่ Chinese characters
→ Brain บังคับให้ internalize tones
```

**Research:** Scaffolding theory (Vygotsky) + Desirable Difficulty (Bjork, 2011)

---

### 🔥 Idea 4: "Shadowing Mode"

**Concept:** User ฟัง AI พูด แล้วพูดตามทันที ทับกัน

```
AI พูด: "我想喝一杯咖啡"
User พูดตาม: overlapping audio
System วัด: timing accuracy + tone accuracy
```

**Research:** Alexander Arguelles Shadowing Method — ใช้กันในวงการ polyglot **ทำไมดี:** Builds muscle memory สำหรับ prosody และ rhythm

---

### 🔥 Idea 5: "Cultural Context Cards"

**Concept:** แต่ละ vocab มี cultural note ที่คนไทยต้องรู้

```
คำว่า 吃了吗？(กินข้าวหรือยัง?)
→ Cultural note: "คนจีนพูดทักทาย ไม่ได้ถามจริงๆ
   เหมือนที่คนไทยพูดว่า 'ไปไหนมา?'"
```

**ทำไมดี:** Cultural competence = ใช้ภาษาได้จริง ไม่ใช่แค่ถูก grammar

---

### 🔥 Idea 6: "Spaced Conversation" (Long-term Retention)

**Concept:** ทบทวน conversation เก่าด้วย SRS เหมือน flashcard

```
14 วันที่แล้ว คุณฝึก "สั่งอาหาร"
วันนี้: "ลองทำ situation นั้นอีกครั้ง
        โดยไม่มี hint เลย"
→ วัดว่า retention ยังอยู่มั้ย
```

**Research:** Testing Effect (Roediger & Karpicke, 2006) — การทดสอบตัวเองช่วยจำได้มากกว่าการอ่านซ้ำ

---

### 🔥 Idea 7: "Minimal Pair Drilling"

**Concept:** ฝึก tone คู่ที่สับสนบ่อยที่สุดสำหรับคนไทย

```
Research พบว่าคนไทยสับสน:
mā/mǎ (妈/马) — แม่/ม้า
shì/shí (是/十) — เป็น/สิบ
màn/máng (慢/忙) — ช้า/ยุ่ง

Drill format:
AI พูด 1 ใน 2 คำ → user กดว่าได้ยินคำไหน
→ Train perception ก่อน production
```

**Research:** Perception before production (Flege, 1995)

---

### 🔥 Idea 8: "Daily Chinese Moment"

**Concept:** Micro-learning 2 นาที push notification

```
เวลา 08:00:
"☀️ คำวันนี้: 早上好 (zǎoshang hǎo)
 ลองพูดเพื่อรับ +5 XP"
→ tap → เปิดแอป → micro session 2 นาที
→ เพิ่ม DAU โดยไม่ต้องเพิ่ม session ยาว
```

**Research:** Habit Loop (Duhigg) — cue → routine → reward

---

## ⚡ AI Output Optimization — ประหยัด Token

### ปัญหา

```
ทุก conversation turn → ส่ง full context ไป API
→ Token สะสมมากขึ้นทุก turn
→ Cost สูงขึ้นเรื่อยๆ ใน session ยาว
```

### เทคนิคที่ 1: Context Window Compression

```typescript
// แทนที่จะส่ง full history
// ส่งแค่ compressed summary + last N turns

function buildCompressedContext(session: Session) {
  return {
    // Summary ของ session (ไม่ใช่ full transcript)
    session_summary: `
      Topic: ${session.topic}
      Turn: ${session.turnNumber}/8
      User level: HSK${session.level}
      Errors so far: ${session.errorSummary}
    `,
    // แค่ 3 turns ล่าสุด (ไม่ใช่ทั้งหมด)
    recent_turns: session.messages.slice(-3),
    // Companion persona (cache ได้)
    persona: COMPANION_PERSONAS[session.companionId],
  }
}
```

**ประหยัด:** ~60-70% token ใน long sessions

---

### เทคนิคที่ 2: Prompt Caching (Anthropic Feature)

```typescript
// System prompt เหมือนกันทุก request
// ใช้ cache_control เพื่อไม่ต้อง re-process

const systemPrompt = {
  type: "text",
  text: LAYER3_CONVERSATION_PROMPT,
  cache_control: { type: "ephemeral" } // cache 5 นาที
}
// ประหยัด: system prompt ไม่ถูก charge ซ้ำ
// ถ้า request ถี่กว่า 5 นาที
```

**ประหยัด:** ~40-50% ถ้า session ยาวและ system prompt ใหญ่

---

### เทคนิคที่ 3: Structured Output แทน Free Text

```typescript
// แทนที่ให้ AI เขียน response อิสระ
// บังคับ output format → parse ได้ง่าย ไม่ต้องส่งซ้ำ

// ❌ แบบที่ waste token
prompt: "สนทนาภาษาจีน และถ้า user ผิด tone
         ให้อธิบาย และถ้าผิด grammar ให้อธิบาย..."

// ✅ แบบที่ดี → structured
prompt: `Respond in this EXACT JSON format:
{
  "speech": "Chinese text here",
  "pinyin": "pinyin here",
  "thai_hint": "optional Thai hint",
  "tone_focus": ["word1", "word2"],
  "grammar_error_detected": null | "error_type",
  "recast": null | "corrected version"
}`
```

**ประหยัด:** ลด parsing errors + ไม่ต้อง follow-up request

---

### เทคนิคที่ 4: AI Judge แบบ Lightweight

```typescript
// แทนที่ Judge ทุก output (แพง)
// Judge แบบ sampling เท่านั้น

async function shouldJudge(session: Session): boolean {
  // Judge แค่ 30% ของ turns
  if (Math.random() > 0.3) return false
  
  // Judge เสมอถ้า error rate สูง
  if (session.errorRate > 0.4) return true
  
  // Judge เสมอใน first 3 turns ของ session ใหม่
  if (session.turnNumber <= 3) return true
  
  return false
}
```

**ประหยัด:** ~70% ของ DeepSeek Judge calls

---

### เทคนิคที่ 5: Redis Caching สำหรับ Static Content

```typescript
// Vocab data, HSK data, Persona prompts
// ไม่ต้อง query DB ทุกครั้ง

const CACHE_TTL = {
  vocab_card: 60 * 60 * 24,     // 24 ชั่วโมง
  persona_config: 60 * 60 * 2,  // 2 ชั่วโมง
  session_config: 60 * 60 * 2,  // 2 ชั่วโมง (Layer 2 output)
  hsk_data: 60 * 60 * 24 * 7,   // 1 สัปดาห์
}

// Session Orchestrator (Layer 2) output แพงมาก
// Cache ไว้ใช้ทั้ง session ไม่ต้อง re-generate
```

**ประหยัด:** Layer 2 call หายไป ~90% ของ turns

---

### เทคนิคที่ 6: Token Budget per Feature

```typescript
const TOKEN_BUDGET = {
  companion_turn: 800,      // max per turn
  grammar_pill: 300,        // สั้นๆ เข้าใจได้
  session_summary: 500,     // สรุปท้าย session
  vocab_popup: 150,         // minimal
  daily_mission_gen: 400,   // generate mission
}

// ถ้า response เกิน budget → truncate และ log
// ช่วยให้รู้ว่า prompt ไหนที่ verbose เกินไป
```

---

### ต้นทุนโดยประมาณหลัง Optimization

```
ก่อน optimize:
Session 15 นาที (8 turns):
→ ~8,000 tokens × $0.0003/1k = $0.0024/session
→ 100 users × 1 session/day = $0.24/วัน = ~฿8.64/วัน

หลัง optimize (เทคนิค 1-6):
→ ~2,500 tokens × $0.0001/1k = $0.00025/session
→ 100 users = $0.025/วัน = ~฿0.90/วัน

ประหยัด: ~90% 🎉
Cost per user: < ฿0.01/วัน (ต่ำกว่า KPI ฿5 มาก)
```

---

## 🗺️ Learning Path — Full Design

### Traveler Path (Week 1-4)

```
Foundation Week:
Day 1  → ทักทาย + แนะนำตัว (สวัสดี / 你好)
Day 2  → สั่งเครื่องดื่ม (กาแฟ/น้ำ)
Day 3  → ขอเข้าห้องน้ำ
Day 4  → ถามราคา (多少钱？)
Day 5  → จ่ายเงิน / ขอใบเสร็จ
Day 6  → ถามทาง (ซ้าย/ขวา/ตรงไป)
Day 7  → Review + Streak bonus 🔥

Practical Week:
Day 8  → สั่งอาหารจากเมนูจีน
Day 9  → Check-in โรงแรม
Day 10 → ขึ้น Taxi / บอก destination
Day 11 → ซื้อของ ต่อรองราคา
Day 12 → บอกว่าแพ้อาหาร
Day 13 → ขอความช่วยเหลือฉุกเฉิน
Day 14 → Review + Level up badge 🏆

Confidence Week:
Day 15 → คุยกับคนในร้านอาหาร (small talk)
Day 16 → ถามเรื่องรถไฟ/ขนส่ง
Day 17 → เจ็บป่วย ไปหาหมอ
Day 18 → โทรศัพท์เป็นภาษาจีน
Day 19 → Survival Mode (timer pressure)
Day 20 → Real Talk unlock 🎯
```

### Path Selection Logic

```
if goal == 'travel':
    → Traveler path
    → Prioritize: speaking > vocab > grammar
    
elif goal == 'hsk':
    → HSK path (grammar-heavy)
    → Prioritize: vocab HSK list > grammar > speaking
    
elif goal == 'business':
    → Business path (formal register)
    → Prioritize: formal vocab > HSK > speaking
```

---

## 🎨 Vocab Tap Popup — Full Spec

### Trigger Conditions

```
ทุก AI message → detect Chinese characters
คำที่ dot ใต้ = คำที่ user ยังไม่ mastered ใน SRS
คำที่ขีดเส้นใต้จาง = คำที่อาจ add ได้
```

### Popup Content

```
Level 1 (always show):
→ Chinese word + pinyin + Thai meaning
→ HSK level badge
→ TTS button 🔊
→ [+ SRS] button

Level 2 (if user taps "more"):
→ 2 ตัวอย่างประโยค
→ Related words
→ Stroke order GIF (Phase 2)
→ Mnemonic ภาษาไทย (Phase 2)

Behavior:
→ Auto-dismiss 4 วิ
→ กด [+ SRS] → เพิ่มทันที + haptic feedback
→ ไม่ interrupt บทสนทนา
```

---

## 🔧 AI Feedback System — Full Spec

### Grammar Tracker State Machine

```
Error Type    | Count 0     | Count 1-2   | Count 3+
--------------|-------------|-------------|------------------
measure_word  | invisible   | recast      | Grammar Pill
aspect_marker | invisible   | recast      | Grammar Pill  
time_placement| invisible   | recast      | Grammar Pill
negation      | invisible   | recast      | Grammar Pill
tone_error    | heatmap     | heatmap     | Tone Drill
```

### Grammar Pill Content (per type)

```markdown
## measure_word
**量词 — Measure Words**
ตัวเลข + [量词] + คำนาม
✅ 一碗面条 ✅ 两杯水
❌ 一面条

## aspect_marker  
**了/过/着 — Aspect Markers**
了= เสร็จแล้ว | 过= เคย | 着= กำลัง
✅ 我吃了 = กินแล้ว
✅ 我去过 = เคยไป

## time_placement
**Time อยู่หน้า Verb เสมอ**
✅ 我昨天去 (เมื่อวานไป)
❌ 我去昨天 (ผิด)
```

---

## 📋 Session End Summary — Data Points

```typescript
interface SessionSummary {
  // Performance
  speaking_score: number          // overall %
  speaking_delta: number          // เพิ่ม/ลด จากเมื่อวาน
  turns_completed: number
  
  // Tone
  tone_scores: {
    word: string
    score: number
    improved: boolean
  }[]
  
  // Grammar  
  grammar_errors: {
    type: GrammarErrorType
    count: number
    pill_shown: boolean
  }[]
  
  // Vocab
  new_words_encountered: string[]
  words_added_to_srs: string[]
  
  // Gamification
  xp_earned: number
  streak_day: number
  level_up: boolean
  
  // Next session preview
  next_topic: string
  next_tone_focus: string[]
}
```

---

## 🏗️ Tech Implementation Notes

### Context Compression ใน Code

```typescript
// packages/core/ai/context-builder.ts
export function buildSessionContext(
  session: CompanionSession,
  user: LearningDNA
): MinimalContext {
  return {
    // Compressed user profile
    profile: {
      level: user.estimatedHsk,
      goal: user.goalTag,
      weak_tones: user.weakTones.slice(0, 3), // top 3 เท่านั้น
    },
    // Topic context
    topic: session.topic,
    turn: session.turnNumber,
    // Last 3 turns only
    history: session.messages
      .slice(-3)
      .map(m => ({ role: m.role, content: m.content })),
    // Error state
    errors: session.grammarErrors,
  }
}
```

### Prompt File Structure

```
/prompts
├── companion/
│   ├── layer1_profile_builder.md
│   ├── layer2_orchestrator.md
│   ├── layer3_conversation.md    ← แก้บ่อยที่สุด
│   ├── judge_evaluation.md
│   └── grammar_pill_generator.md
├── flashcard/
│   ├── card_generator.md
│   └── example_sentence.md
└── system/
    └── privacy_rules.md          ← inject ทุก request
```

---

## 📊 OKR — 6 Weeks

### Company OKR

```
O: พิสูจน์ว่า LinguaQuest แก้ปัญหาได้จริง
   ก่อน pitch รอบ final

KR1: Beta users ≥ 20 คน (real users)
KR2: Day-7 retention ≥ 30%
KR3: Session completion ≥ 70%
KR4: Willingness to pay ≥ 40%
KR5: AI natural rate ≥ 85% (native verified)
```

### Team OKR

**Faeif (AI)**

```
O: AI output เป็นธรรมชาติจนคนจีนอ่านแล้ว "ใช่เลย"
KR1: Native speaker rate ≥ 85% natural
KR2: AI Judge pass rate ≥ 85%
KR3: Token cost ≤ ฿0.01/user/day
```

**Dev 2 (Frontend)**

```
O: User เปิดแอปแล้วเริ่ม session ได้ใน < 3 นาที
KR1: Onboarding completion ≥ 80%
KR2: Zero P0 bugs in production
KR3: Tone Heatmap renders < 500ms
```

**Dev 3 (AI Integration)**

```
O: Speaking pipeline ทำงาน end-to-end อย่างน่าเชื่อถือ
KR1: STT accuracy ≥ 90% (Thai-accented Chinese)
KR2: Tone score latency < 2 วินาที
KR3: FSRS scheduler running correctly
```

**Somnuek (Business)**

```
O: มีข้อมูลจาก customer จริงที่พูดได้บน stage
KR1: Interview ≥ 20 คน (persona จริง)
KR2: Survey response rate ≥ 70%
KR3: Cost tracking: API cost per user/day
```

---

## ✅ Must Ship Before Beta

```
AI Companion:
- [ ] 10 topics (Traveler path)
- [ ] 5 stage session structure
- [ ] Tone Heatmap (per character)
- [ ] Grammar Pill (trigger + display)
- [ ] Vocab Tap Popup
- [ ] Session End summary
- [ ] Privacy layer (anonymize before API)

Flashcard:
- [ ] FSRS scheduler working
- [ ] Auto-add from Companion
- [ ] Speaking Review mode (basic)
- [ ] Daily queue display

Platform:
- [ ] Production deployment (Vercel)
- [ ] PostHog analytics
- [ ] Consent screen (PDPA)
- [ ] Error monitoring (Sentry)
```

---

## 🚀 Ideas Parking Lot (Phase 2+)

```
- Mistake Museum (shareable error-to-victory cards)
- Survival Mode (timer pressure situations)
- Tone Training Wheels (progressive removal)
- Shadowing Mode (overlap speaking)
- Cultural Context Cards
- Spaced Conversation Review
- Minimal Pair Drilling
- Daily Chinese Moment (2-min micro session)
- Battle Zone (1v1 speaking competition)
- Tutor Marketplace
- Creator Economy (sell decks/courses)
```

---

_Last updated: 2026-04-26_ _Next review: ทุกวันศุกร์ 16:00_