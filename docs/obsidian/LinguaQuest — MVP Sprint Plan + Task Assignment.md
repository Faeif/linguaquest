0
> วันที่: 2026-04-26 | Status: Ready to Execute Tags: #linguaquest #sprint #tasks #team

---

## ⚠️ แก้ทันทีก่อนทุกอย่าง

```
README.md ยังบอก AI: "Gemini 2.0 Flash + Azure Speech"
ต้องแก้เป็น: Qwen3 + DeepSeek + SpeechSuper
แก้ก่อน — mentor/investor อาจเปิดดูได้ทุกเมื่อ
```

---

## 👥 Team Role

```
Faeif      → AI Pipeline + Product Owner + Architecture
Aphichat   → Full-Stack (Frontend + DB + Deploy)
Somnuek    → Content Quality Lead + Beta Validation
Chatchanok → QA Lead + Beta User Recruitment + Survey
```

---

## 🎯 Somnuek — Content Quality Lead (ไม่ต้องโค้ด)

นี่คือ role ที่ valuable มากและไม่ต้องโค้ดเลยครับ

### หน้าที่หลัก: Native Speaker QA

```
Somnuek เก่งจีน → ทำสิ่งที่ AI ทำไม่ได้

งาน 1: AI Output Reviewer
────────────────────────────────────
ทุกวัน Faeif ส่ง Google Sheet ให้
มี AI output 20-30 ประโยคจากแต่ละ topic
Somnuek ทำ:
→ Mark แต่ละประโยค: ✅ Natural | ⚠️ Awkward | ❌ Wrong
→ เขียนประโยคที่ถูกต้องแทน
→ อธิบายสั้นๆ ว่าทำไมถึงผิด

ตัวอย่าง Sheet:
| AI Output | Rating | Better Version | Why |
|-----------|--------|----------------|-----|
| 您好，请问您今天想用餐什么？ | ❌ | 你好！今天想吃什么？ | formal เกินไป |
| 我想吃一碗面条 | ✅ | - | natural |

งาน 2: Topic Validator
────────────────────────────────────
ก่อน topic ใหม่ launch → Somnuek เล่น session
แล้วบอกว่า:
→ บทสนทนาไหลเป็นธรรมชาติมั้ย
→ สถานการณ์สมจริงมั้ย
→ คนจีนจะตอบยังไงในชีวิตจริง

งาน 3: Beta User Recruitment — หา real users ≥ 20 คน
────────────────────────────────────
เกณฑ์:
→ เรียนหรืออยากเรียนจีน
→ ไม่ใช่เพื่อนในทีม
→ ยินดีให้ feedback จริงๆ

แหล่งที่หาได้:
→ Facebook Group: "คนรักภาษาจีน", "เรียนภาษาจีน"
→ Pantip: ห้องภาษา
→ TikTok/IG: comment ของ account สอนจีน
→ มหาวิทยาลัย: นักศึกษาสาขาจีน

งาน 4: Willingness-to-Pay Survey — วัด KR3
────────────────────────────────────
สร้าง Google Form ส่งให้ beta users หลังใช้งาน 3 วัน:
→ ฟีเจอร์ไหนที่ยินดีจ่ายเงิน (Unlimited AI / Speaking graph / HSK score)
→ จ่ายได้เดือนละเท่าไหร่ (ไม่จ่าย / ≤100฿ / 100-200฿ / 200-400฿)
→ เทียบกับ Duolingo Plus worth กว่าไหม

เป้า: ≥ 40% บอกว่ายินดีจ่าย | Response ≥ 15 คน

งาน 5: Beta User Interviews
────────────────────────────────────
คุยกับ beta users 20 คน ตาม script
ถามว่า AI พูดจีนดูเป็นธรรมชาติมั้ย
เก็บ feedback → โพสต์ใน #beta-feedback
```

---

### Somnuek Review Process — ทำยังไง

```
Step 1: Faeif/Aphichat รัน test script
  → Companion คุย 20 turns ต่อ topic
  → Export SPEECH blocks ออกมา

Step 2: ส่งให้ Somnuek
  เป็น Google Sheet หรือ Notion table
  ใช้เวลา 30-45 นาทีต่อ topic

Step 3: Somnuek ส่งกลับ
  ที่มี rating + better version

Step 4: Faeif แก้ prompt
  เพิ่ม "ห้ามพูดแบบนี้" examples
  เพิ่ม "ถูกต้องแบบนี้" examples

Step 5: รัน test อีกรอบ
  ส่งให้ Somnuek verify ซ้ำ

Target: Natural rate ≥ 85% ก่อน beta launch
```

---

### Somnuek Scorecard Sheet Template

```
Sheet ชื่อ: "LinguaQuest Content Review - [Date]"

Columns:
A: Topic (สั่งอาหาร / ถามทาง / etc.)
B: Turn #
C: AI Output (Chinese)
D: Rating (✅ / ⚠️ / ❌)
E: Better Version (ถ้า ⚠️ หรือ ❌)
F: Issue Type (formal/unnatural/wrong_grammar/too_long)
G: Notes

Summary tab:
- Natural rate % ต่อ topic
- Most common issues
- Words/patterns ที่ต้องแก้
```

---

---

## 🎯 Chatchanok — QA + Junior Dev (โค้ดได้ แต่งาน non-critical)

งาน coding ของ Chatchanok คือ **งานที่ไม่ touch AI pipeline หรือ DB schema** — เน้น static page, UI component ง่าย, และ test scripts

### หน้าที่หลัก

**1. Coding — Landing Page + E2E Tests**
```
ส่วนที่โค้ดได้โดยไม่ต้องรู้ deep system:
→ Landing page (/) — static marketing, ใช้ design system เดิม
→ E2E test scripts (Playwright) — เขียน test ตาม flow ที่รู้อยู่แล้ว
→ Bug fixes เล็กๆ ที่เจอระหว่าง QA (UI alignment, text, color)
```

**2. QA Testing — ทดสอบทุก feature ที่ Aphichat ส่ง PR**
```
ทุกครั้งที่ Aphichat โพสต์ใน #deployment ว่า deploy แล้ว
→ Chatchanok เปิด URL ทดสอบตาม checklist
→ รายงานผลใน #bugs ภายใน 2 ชั่วโมง

Device ที่ต้องเทสทุกครั้ง:
→ iPhone (Safari) ← ผู้ใช้ส่วนใหญ่อยู่ที่นี่
→ Android (Chrome)
→ Desktop Chrome (Mac/Windows)
```

---

### TASK-C01 [Chatchanok] Landing Page `/`

```
Title: feat: create landing page

Files:
- apps/web/src/app/(marketing)/page.tsx (สร้างใหม่)
- apps/web/src/app/(marketing)/layout.tsx (สร้างใหม่)
- apps/web/src/components/marketing/ (สร้างใหม่)

Design: ใช้ design system เดิม
  bg: #FAFAF9  primary: #8B5E3C  accent: #F97316
  Font: ไม่ใช้ gradient ไม่ใช้ shadow หนัก — Minimalist Café

เวลา: 2 วัน
Branch: feature/chatchanok-landing
```

#### Copywriting + Content Spec (ละเอียด)

---

**SECTION 1 — Hero (above the fold)**
```
HEADLINE (ใหญ่ที่สุด):
"พูดภาษาจีนได้จริง
 ไม่ใช่แค่ท่องศัพท์"

SUBHEADLINE:
"LinguaQuest คือ AI คู่สนทนาที่เปิดบทสนทนาก่อนเสมอ
 วัด tone รายตัวอักษร และสร้าง learning path เฉพาะคุณ"

CTA PRIMARY:
[เริ่มเลย — ฟรี] → /login

MICROCOPY ใต้ปุ่ม:
"ใช้ Google สมัครได้เลย • ไม่ต้องใส่บัตรเครดิต"

VISUAL:
→ mockup โทรศัพท์แสดง tone heatmap (สีเขียว/เหลือง/แดง)
→ หรือ animated: AI bubble โผล่ขึ้นมา "你好！今天想去哪里？"
```

---

**SECTION 2 — Pain Point (ปัญหาที่ user รู้จัก)**
```
HEADLINE:
"เรียนมา 2 ปี ยังพูดกับคนจีนไม่ได้?"

BODY:
แอปส่วนใหญ่สอนให้คุณ 'รู้คำศัพท์'
แต่ไม่ได้สอนให้คุณ 'กล้าพูด'

ปัญหาจริงของการเรียนจีน:
😰  ไม่รู้ว่า tone ผิดตรงไหน
🦜  จำศัพท์ได้แต่ประกอบประโยคไม่ได้
😶  กลัวพูดผิดต่อหน้าคนจีนจริงๆ
📚  เรียน grammar แต่ไม่เคยได้ใช้จริง

[VISUAL: Duolingo streak vs ความสามารถพูดจริง — กราฟตลก]
```

---

**SECTION 3 — Solution / How It Works**
```
HEADLINE:
"LinguaQuest ต่างออกไป"

3 steps แบบ visual card:

STEP 1:
🗺️  "เลือกสถานการณ์จริง"
"สั่งอาหาร ถามทาง จองโรงแรม —
 เรียนผ่านบทสนทนาที่คุณจะใช้จริง
 ไม่ใช่ประโยคตัวอย่างในตำรา"

STEP 2:
🤖  "AI เปิดบทสนทนาก่อนเสมอ"
"ไม่ต้องรอให้ตัวเองกล้า
 หลิง (AI ของเรา) จะเริ่มพูดก่อน
 คุณแค่ตอบ — ผิดก็ไม่เป็นไร"

STEP 3:
🎯  "รู้ทันทีว่า tone ไหนผิด"
"ไม่ใช่แค่ 'ผิด' หรือ 'ถูก'
 แต่บอกได้ว่า '左' ของคุณ tone 3
 ออกมาที่ 43% — ต้องฝึกแบบไหน"
```

---

**SECTION 4 — Science Backing ("ทำไมวิธีนี้ถึงได้ผล")**
```
HEADLINE:
"ไม่ใช่แค่ความรู้สึก — มีงานวิจัยรองรับ"

CARD 1 — Recast Method:
🔬 "เรียนโดยไม่รู้สึกว่ากำลังเรียน"
"งานวิจัย SLA (Second Language Acquisition) พบว่า
 การแก้ไขแบบ 'Recast' — ที่ AI พูดประโยคถูกใน response
 โดยไม่บอกว่า 'คุณผิด' — ได้ผลดีกว่าการแก้ตรงๆ
 เพราะไม่สร้าง anxiety และ output hypothesis ยังคงทำงาน"
[Krashen, 1985 · Lyster & Ranta, 1997]

CARD 2 — Spaced Repetition:
📊 "จำได้นานขึ้น 200% ด้วย FSRS"
"LinguaQuest ใช้ FSRS algorithm
 ซึ่งดีกว่า Anki SM-2 เฉลี่ย 20% ในการ retain คำศัพท์
 ระบบคำนวณว่าคุณควรทบทวนคำไหน วันไหน
 เพื่อให้จำได้นานที่สุดด้วยเวลาน้อยที่สุด"
[Wozniak, 1990 · Ye et al., 2022]

CARD 3 — Comprehensible Input:
🗣️ "เรียนในบริบท ไม่ใช่จำแบบแยกส่วน"
"Krashen's Input Hypothesis บอกว่า
 เราเรียนภาษาได้ดีที่สุดเมื่อ input ยากกว่าระดับเราเล็กน้อย
 LinguaQuest ปรับระดับบทสนทนาตาม learning DNA ของคุณ
 ทุก session จึงอยู่ใน 'sweet spot' ของการเรียนรู้"
[Krashen, 1982]
```

---

**SECTION 5 — Social Proof (placeholder สำหรับ beta)**
```
HEADLINE:
"Beta users พูดว่าอะไร"

QUOTE 1 (placeholder — ใส่จริงหลัง beta):
"ครั้งแรกที่คนจีนตอบว่า 'ฟังออก!' รู้สึก..."
— [ชื่อ], เรียนจีน 6 เดือน

STAT BAR:
[🗣️ 20+ beta users]  [📈 81% avg speaking score]  [⭐ 85%+ natural rate]

NOTE: ใส่ placeholder ไว้ก่อน อัปเดตได้ง่ายเมื่อมีข้อมูลจริง
```

---

**SECTION 6 — Feature Grid**
```
HEADLINE:
"ทุกอย่างที่คุณต้องการ อยู่ในที่เดียว"

6 feature cards (2×3 grid บน desktop, 1 col บน mobile):

🎙️  Speaking Coach
"วัด tone รายตัวอักษร
 รู้ชัดว่าตรงไหนต้องแก้"

📚  Smart Flashcard
"FSRS algorithm จาก Anki
 ทบทวนแค่คำที่กำลังจะลืม"

🗺️  Study Plan
"AI สร้างแผน 7 วันจาก goal ของคุณ
 ปรับได้ตลอด ไม่ fixed"

💡  Grammar Pill
"เรียน grammar เฉพาะที่คุณผิด
 ไม่ต้องนั่งเรียน lecture"

🏆  Gamification
"XP + Streak + Badge
 ทำให้การเรียนติดเป็นนิสัย"

🔒  Privacy First
"เสียงของคุณลบทันทีหลังประเมิน
 ไม่มีการเก็บ audio"
```

---

**SECTION 7 — Final CTA**
```
HEADLINE:
"เริ่มพูดจีนได้วันนี้"

SUBHEADLINE:
"ไม่ต้องรอให้พร้อม ไม่ต้องรู้อะไรก่อน
 AI จะเริ่มบทสนทนาแรกให้คุณเอง"

CTA:
[เริ่มเลย — ฟรี] → /login

MICROCOPY:
"สมัครด้วย Google ใน 10 วินาที"

FOOTER LINKS:
Privacy Policy · Terms of Service · Contact
```

---

```
Acceptance Criteria:
- [ ] Mobile responsive (375px+)
- [ ] [เริ่มเลย] → /login (ไม่ใช่ /onboarding โดยตรง)
- [ ] ไม่มี hardcoded colors นอก design system
- [ ] Lighthouse performance ≥ 90
- [ ] Section ครบทั้ง 7 section
- [ ] Placeholder quote และ stat ใส่ได้ง่ายทีหลัง (component แยก)
- [ ] Science citations แสดงในขนาดเล็ก ไม่ดูหนักเกินไป
```

---

### TASK-C02 [Chatchanok] E2E Tests (Playwright)

```
Title: test: add E2E tests สำหรับ critical flows

Files:
- apps/web/tests/e2e/onboarding.spec.ts (สร้างใหม่)
- apps/web/tests/e2e/flashcard.spec.ts (สร้างใหม่)
- apps/web/tests/e2e/navigation.spec.ts (สร้างใหม่)

Setup (ถ้ายังไม่มี):
pnpm add -D @playwright/test
ใน package.json: "test:e2e": "playwright test"

Test cases ที่ต้องเขียน:

onboarding.spec.ts:
□ เปิด / → redirect ไป /onboarding (ถ้า guest)
□ ผ่าน onboarding 6 steps ครบ
□ กด [ข้ามไปก่อน] ที่ mic step → ยังไปต่อได้

flashcard.spec.ts:
□ เปิด /learn/flashcard → มี card list
□ กด [เริ่มทบทวน] → review mode เปิด
□ กด [รู้แล้ว] / [ยังไม่รู้] → card ถัดไป

navigation.spec.ts:
□ กด tab Home → /home
□ กด tab Speak → /speak
□ กด tab Learn → /learn/flashcard
□ กด tab Progress → /progress
□ กด tab Profile → /profile

Acceptance Criteria:
- [ ] pnpm test:e2e รันผ่านทั้งหมด
- [ ] ไม่มี flaky tests (รัน 3 รอบ ผ่านทุกครั้ง)
- [ ] test ทำงานบน headless Chrome

เวลา: 2 วัน (ทำหลัง A06 deploy แล้ว)
Branch: feature/chatchanok-e2e-tests
```

---

### TASK-C03 [Chatchanok] Cross-Device QA Testing

```
Title: QA ทุก deploy บน 3 devices (ongoing)

ทำทุกครั้งที่มี deploy ใหม่:

iPhone Safari:
□ Mic permission prompt ขึ้นถูกต้อง
□ Keyboard ไม่บัง input field
□ Bottom nav safe area ไม่ถูก home indicator บัง
□ Audio playback ได้ยิน
□ PWA: Add to Home Screen ได้

Android Chrome:
□ ทุกข้อด้านบน
□ กด Record → waveform ขยับ

Desktop Chrome:
□ Layout ไม่แตกที่ 375px / 768px / 1280px
□ ไม่มี horizontal scroll

รายงานผลใน #bugs ภายใน 2 ชั่วโมงหลัง deploy
Format: ใช้ Bug Report template ใน #bugs
```

---

### TASK-C04 [Chatchanok] Bug Fix Queue

```
Title: fix: UI bugs จาก QA testing

งานนี้เป็น ongoing — แก้ bug เล็กๆ ที่เจอเองระหว่างเทส
ประเภทที่ทำได้:
→ Text ผิด / typo
→ Color ไม่ตรง design system
→ Spacing / padding บน mobile
→ Missing loading state
→ Toast message ไม่ขึ้น

ประเภทที่ส่งต่อ Aphichat:
→ Logic bug (ข้อมูลผิด)
→ API error
→ Database ไม่ update

Branch per fix: fix/chatchanok-[description]
```

---

### Chatchanok Sprint Overview

```
WEEK 1 (วันนี้ – 26 เม.ย.):
→ C03: QA existing screens (onboarding, companion, flashcard)
→ C01: เริ่ม landing page
→ Setup Playwright ถ้ายังไม่มี

WEEK 2 (27 เม.ย. – 3 พ.ค.):
→ C01: Landing page เสร็จ → PR
→ C03: QA /home + /study-plan ทันทีที่ Aphichat deploy
→ C04: Bug fixes จาก QA

WEEK 3 (4–10 พ.ค.):
→ C02: E2E tests (เริ่มได้เมื่อ screens ส่วนใหญ่ ready)
→ C03: QA /speak/summary + Vocab popup
→ C04: Bug fixes ongoing

WEEK 4 (11–17 พ.ค.):
→ C02: E2E tests เสร็จ → รันใน CI
→ C03: Final QA ก่อน beta launch
→ ช่วยเตรียม demo สำหรับ pitch
```

---

## 📦 Pages ที่ต้องสร้าง (ยังไม่มีเลย)

```
ตอนนี้มี:
✅ /onboarding
✅ /companion
✅ /flashcard
✅ /speaking
✅ /profile

ยังไม่มี (ต้องสร้าง):
❌ /home          → Daily mission + streak
❌ /study-plan    → 7-day plan + calendar
❌ /speak/summary → Session end summary
❌ /progress      → Skill radar + history
❌ /learn/grammar → Grammar hub
```

---

## 🗓️ Sprint 1 — สัปดาห์ที่ 1 (20-26 เม.ย.)

**เป้าหมาย: Fix content quality + Deploy production**

---

### TASK-F01 [Faeif] Fix README

```
Title: chore: update README — correct AI stack

Files:
- README.md

Changes:
- AI: Gemini 2.0 Flash + Azure Speech
+ AI: Qwen3 (Companion) + DeepSeek V3 (Judge) + SpeechSuper (Tone)

เวลา: 15 นาที
ทำก่อนทุกอย่าง
```

---

### TASK-F02 [Faeif] AI Prompt Quality

```
Title: prompt: fix Layer 3 — natural speech rules

Files:
- prompts/companion/layer3_conversation.md (แก้)
- packages/core/ai/judge.ts (สร้างใหม่)

What:
เพิ่ม natural speech rules + few-shot examples
Setup DeepSeek judge pipeline (30% sampling)

Acceptance Criteria:
- [ ] Layer 3 prompt มี NATURAL SPEECH RULES section
- [ ] มีตัวอย่าง ✅ และ ❌ อย่างน้อย 5 คู่ต่อ topic
- [ ] judge.ts: DeepSeek check naturalness/context_fit/learning_value
- [ ] judge sampling: 30% ของ turns
- [ ] ถ้า naturalness < 5 → regenerate (max 3 ครั้ง)
- [ ] log judge failures ลง DB สำหรับ review

เวลา: 3 วัน
Branch: feature/faeif-prompt-quality
```

---

### TASK-F03 [Faeif] Privacy Anonymizer

```
Title: feat: add privacy anonymization layer

Files:
- apps/web/src/lib/privacy/anonymizer.ts (สร้างใหม่)
- apps/web/src/app/api/session/turn/route.ts (แก้)
- apps/web/src/app/api/session/start/route.ts (แก้)

Acceptance Criteria:
- [ ] hashUserId() → HMAC-SHA256, 16 chars
- [ ] buildAIContext() → no real user_id, email, phone
- [ ] sanitizeConversation() → strip PII patterns
- [ ] ทุก /api/session/* route ใช้ anonymizer
- [ ] test: grep logs → ไม่พบ real user_id

เวลา: 1 วัน
Branch: feature/faeif-privacy
```

---

### TASK-F04 [Faeif] Export Test Script

```
Title: chore: add AI output test script for Somnuek review

Files:
- scripts/export-companion-outputs.mts (สร้างใหม่)

What:
Script ที่รัน Companion 20 turns ต่อ topic
แล้ว export SPEECH blocks ออกเป็น CSV/JSON
ส่งให้ Somnuek review

Acceptance Criteria:
- [ ] รัน: pnpm tsx scripts/export-companion-outputs.mts
- [ ] Output: outputs/companion_review_[date].csv
- [ ] มี columns: topic, turn, speech_zh, pinyin, context
- [ ] รองรับ 10 topics ที่กำหนดไว้

เวลา: 1 วัน
Branch: feature/faeif-test-script
```

---

### TASK-A01 [Aphichat] Seed global_cards

```
Title: feat: seed HSK vocabulary to global_cards

Files:
- supabase/migrations/[timestamp]_global_cards.sql (สร้างใหม่)
- scripts/seed-global-cards.ts (สร้างใหม่)

Migration SQL:
CREATE TABLE global_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simplified TEXT NOT NULL,
  traditional TEXT,
  pinyin TEXT NOT NULL,
  meaning_th TEXT NOT NULL,
  meaning_en TEXT,
  hsk_level INT NOT NULL,
  pos TEXT,
  frequency_rank INT,
  example_zh TEXT,
  example_th TEXT,
  example_pinyin TEXT,
  audio_url TEXT,
  native_verified BOOLEAN DEFAULT FALSE,
  quality_score FLOAT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(simplified, hsk_level)
);
CREATE INDEX idx_global_cards_hsk ON global_cards(hsk_level);
CREATE INDEX idx_global_cards_pos ON global_cards(pos);

Seed Script:
- Import จาก packages/db/src/data/hsk/*
- Batch upsert 500 rows ต่อครั้ง
- Log progress per level

Acceptance Criteria:
- [ ] Migration รันได้ไม่ error
- [ ] HSK 1: 497 rows ✓
- [ ] HSK 2: 764 rows ✓
- [ ] HSK 3-9: ครบตาม count
- [ ] ไม่มี duplicate
- [ ] Index ทำงานถูกต้อง

เวลา: 1 วัน
Branch: feature/aphichat-seed-vocab
```

---

### TASK-A02 [Aphichat] Home Screen

```
Title: feat: create /home — daily mission + streak

Files:
- apps/web/src/app/(app)/home/page.tsx (สร้างใหม่)
- apps/web/src/components/home/DailyMissionCard.tsx (สร้างใหม่)
- apps/web/src/components/home/StreakWidget.tsx (สร้างใหม่)
- apps/web/src/components/home/DueCardsWidget.tsx (สร้างใหม่)

UI Sections:
1. Header: "สวัสดี [ชื่อ]! 🐒"
2. Streak widget: "🔥 4 วัน" + progress to next milestone
3. Daily Mission card:
   - Topic ของวันนี้
   - Mode + เวลา
   - [เริ่มเลย →] button
4. Due cards badge: "📚 15 ใบรอทบทวน"
5. Quick actions: Flashcard, Grammar

Acceptance Criteria:
- [ ] Daily mission card แสดง topic ที่ถูกต้อง
- [ ] กด [เริ่มเลย] → /speak (pre-filled topic)
- [ ] Streak แสดงตัวเลขถูกต้องจาก DB
- [ ] Due cards count ถูกต้อง
- [ ] Design: #FAFAF9 bg, #F97316 accent
- [ ] Mobile responsive (375px+)

เวลา: 2 วัน
Branch: feature/aphichat-home
```

---

### TASK-A03 [Aphichat] Study Plan Screen

```
Title: feat: create /study-plan — 7-day calendar + lessons

Files:
- apps/web/src/app/(app)/study-plan/page.tsx (สร้างใหม่)
- apps/web/src/app/api/study-plan/generate/route.ts (สร้างใหม่)
- apps/web/src/app/api/study-plan/progress/route.ts (สร้างใหม่)
- apps/web/src/components/study-plan/WeekCalendar.tsx (สร้างใหม่)
- apps/web/src/components/study-plan/DayView.tsx (สร้างใหม่)
- apps/web/src/components/study-plan/LessonCard.tsx (สร้างใหม่)
- supabase/migrations/[timestamp]_study_plans.sql (สร้างใหม่)

DB Schema ที่ต้องสร้าง:
CREATE TABLE study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  goal_tag TEXT NOT NULL,
  start_date DATE NOT NULL,
  plan_data JSONB NOT NULL,
  progress_pct FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE study_plan_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES study_plans(id),
  day_number INT NOT NULL,
  topic_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  lesson_type TEXT NOT NULL,
  status TEXT DEFAULT 'locked',
  session_id UUID,
  completed_at TIMESTAMPTZ
);

AI Generate Plan:
- POST /api/study-plan/generate
- Input: {goal_tag, level, daily_minutes}
- Use Qwen3 to generate 7-day JSON plan
- Save to study_plans table

UI:
- Weekly calendar header (Sun-Sat)
- กด วันนี้ → expand day view
- Day view: topics + lessons
- LessonCard: title + type + duration + [Start] [Done]
- Progress bar: X% complete

Acceptance Criteria:
- [ ] หลัง onboarding → auto-generate plan
- [ ] Calendar แสดง 7 วัน ถูกต้อง
- [ ] Day view expand เมื่อ tap
- [ ] Lesson [Start] → เชื่อมไป /speak (topic pre-filled)
- [ ] Mark Done → update status ใน DB
- [ ] Progress % อัปเดต real-time
- [ ] Unlock lesson ถัดไปเมื่อ Done
- [ ] Re-generate button ทำงานได้

เวลา: 3 วัน
Branch: feature/aphichat-study-plan
```

---

### TASK-A04 [Aphichat] Session Summary Screen

```
Title: feat: create /speak/summary — session end

Files:
- apps/web/src/app/(app)/speak/summary/page.tsx (สร้างใหม่)
- apps/web/src/components/companion/SessionSummaryCard.tsx (สร้างใหม่)

Data to display:
- Overall speaking score + delta จากเมื่อวาน
- XP earned + streak update
- Tone improvements (before → after)
- Grammar ที่ต้องจำ (จาก grammar pills ที่โชว์)
- Vocab ใหม่ที่เจอ (clickable → SRS)
- ประโยคหลักที่ฝึก (3-5 ประโยค)
- Preview: mission พรุ่งนี้
- CTA: [ไปต่อ Lesson ถัดไป] [กลับ Study Plan]

Acceptance Criteria:
- [ ] แสดงข้อมูลครบจาก session ที่เพิ่งจบ
- [ ] กด vocab word → เพิ่ม SRS ได้
- [ ] [บันทึกประโยคทั้งหมด] → สร้าง sentence cards
- [ ] [ไปต่อ] → Study Plan อัปเดต lesson เป็น Done
- [ ] แอนิเมชัน XP + streak เล็กน้อย

เวลา: 1.5 วัน
Branch: feature/aphichat-session-summary
```

---

### TASK-A05 [Aphichat] Navigation Update

```
Title: feat: update bottom navigation — 5 tabs

Files:
- apps/web/src/components/layout/sidebar.tsx (แก้)
- apps/web/src/components/layout/app-shell.tsx (แก้)

Current tabs → New tabs:
[Speak] [Vocab] [Exam] [Community] [Profile]
↓
[Home] [Speak] [Learn] [Progress] [Profile]

Tab mapping:
🏠 Home → /home
🗣️ Speak → /speak
📚 Learn → /learn/flashcard (default)
         sub: /learn/grammar, /learn/flashcard
📊 Progress → /progress
👤 Profile → /profile

Acceptance Criteria:
- [ ] 5 tabs แสดงถูกต้อง
- [ ] Active tab highlight ด้วย #F97316
- [ ] Due cards badge บน Learn tab
- [ ] Mobile bottom nav (iOS safe area)

เวลา: 0.5 วัน
Branch: feature/aphichat-navigation
```

---

### TASK-A06 [Aphichat] Deploy Production

```
Title: chore: production deployment + env setup

What:
- Verify Vercel deployment ทำงานครบ
- Set production env variables
- ทดสอบ end-to-end flow

Acceptance Criteria:
- [ ] https://linguaquest-web.vercel.app ใช้งานได้
- [ ] Register → Onboarding → Companion flow ทำงาน
- [ ] ไม่มี console errors ใน production
- [ ] Supabase production (ไม่ใช่ local) connected
- [ ] ส่ง URL ให้ Somnuek test ก่อน beta launch

เวลา: 0.5 วัน
Branch: ทำบน main หลัง features merge แล้ว
```

---

## 📊 Sprint Overview — 3 สัปดาห์

```
WEEK 1 (20-26 เม.ย.) — Fix + Foundation
─────────────────────────────────────
Faeif:
  F01: Fix README (15 นาที)
  F02: Prompt quality (3 วัน)
  F03: Privacy layer (1 วัน)
  F04: Export test script (1 วัน)

Aphichat:
  A01: Seed global_cards (1 วัน) ← ทำก่อน
  A05: Navigation update (0.5 วัน)
  A06: Deploy production (0.5 วัน)

Somnuek:
  Review AI outputs ทุกวัน (30-45 นาที)
  สร้าง beta recruitment list + invite 10 คนแรก
  สร้าง willingness-to-pay Google Form

Chatchanok:
  C01: เริ่ม landing page
  C03: QA existing screens (onboarding, companion, flashcard)
  Setup Playwright

─────────────────────────────────────
WEEK 2 (27 เม.ย. - 3 พ.ค.) — Core Screens
─────────────────────────────────────
Faeif:
  ปรับ prompt ตาม Somnuek feedback
  Setup gamification XP/streak backend
  Grammar tracker (error counter)

Aphichat:
  A02: Home Screen (2 วัน)
  A03: Study Plan Screen (3 วัน)

Somnuek:
  Review 5 topics ครบ
  เริ่ม beta user interviews
  Track API cost per user

Chatchanok:
  C01: Landing page เสร็จ → PR
  C03: QA test /home + /study-plan ทันทีที่ Aphichat deploy
  C04: Bug fixes จาก QA

─────────────────────────────────────
WEEK 3 (4-10 พ.ค.) — Complete + Polish
─────────────────────────────────────
Faeif:
  Grammar Pill trigger + display
  Vocab Tap Popup (AI side)
  Session End data collection

Aphichat:
  A04: Session Summary (1.5 วัน)
  Vocab Tap Popup UI
  Flashcard tabs: Session + Grammar

Somnuek:
  Beta users 20 คน ครบ
  Compile feedback report
  Willingness-to-pay survey

Chatchanok:
  C02: E2E tests (Playwright) — onboarding + flashcard + navigation
  C03: QA test /speak/summary + Vocab Popup + Grammar Pill
  C04: Bug fixes ongoing

─────────────────────────────────────
WEEK 4 (11-17 พ.ค.) — Measure + Pitch Prep
─────────────────────────────────────
ทีม:
  วัด KPIs: retention, completion, NPS
  Update traction slide
  ซักซ้อม pitch 2 ครั้ง
```

---

## 📋 GitHub Projects Setup

### Board Columns

```
📥 Backlog    → tasks ที่ยังไม่ start
🔍 Ready      → spec ครบ พร้อม start
🔨 In Progress → WIP limit: 2 per person
👀 In Review  → PR open รอ review
✅ Done       → merged + deployed
```

### Labels ที่ต้องสร้าง

```
🟠 ai-pipeline     → งาน AI/prompt
🔵 frontend        → งาน UI
🟢 backend         → งาน API/DB
🟡 infra           → deployment/config
🔴 bug             → bug fix
⚪ content         → Somnuek's domain
🟣 research        → ศึกษาก่อนทำ
```

### Task Template สำหรับ GitHub

```
## 🎯 What
[อธิบาย 1-2 ประโยค]

## 📁 Files
- path/to/file.tsx (สร้างใหม่)
- path/to/other.ts (แก้)

## ✅ Acceptance Criteria
- [ ] criteria 1
- [ ] criteria 2
- [ ] criteria 3

## 🚫 Out of Scope
- สิ่งที่ยังไม่ต้องทำ

## 🔗 Reference
- [ชื่อ doc](link)

## 🌿 Branch
feature/[name]-[description]

## ⏱️ Estimate
X วัน
```

---

## 💬 Discord Format

### Daily Standup #standup (ทุกเช้า ก่อน 10:00)

```
ชื่อ — DD/MM
✅ เมื่อวาน: [task + result]
🎯 วันนี้: [task + branch]
🚧 Blocker: [ถ้ามี / ไม่มี]
```

**ตัวอย่าง Faeif:**

```
Faeif — 26/04
✅ เมื่อวาน: แก้ README + เริ่ม prompt quality
🎯 วันนี้: feature/faeif-prompt-quality
          เพิ่ม few-shot examples สำหรับ 5 topics
🚧 Blocker: รอ Somnuek review output batch แรก
```

**ตัวอย่าง Somnuek:**

```
Somnuek — 26/04
✅ เมื่อวาน: Review 20 outputs topic "สั่งอาหาร"
          Natural rate: 60% (ต้องปรับอีก)
          Issues: formal เกินไป 8 ประโยค
🎯 วันนี้: Review topic "ถามทาง" 20 outputs
          ต่อติดต่อ beta users กลุ่มที่ 1 (5 คน)
🚧 Blocker: ไม่มี
```

---

### Bug Report #bugs (โพสต์ทันทีที่เจอ)

```
🐛 [ชื่อสั้นๆ]
Branch: feature/xxx
Steps: [ทำอะไร]
Expected: [ควรเป็นยังไง]
Actual: [เป็นยังไง]
[screenshot]
```

---

### Deploy Announce #deployment

```
🚀 DEPLOYED: [feature]
PR: #[number]
Changes: [bullet]
URL: https://linguaquest-web.vercel.app
@[ชื่อ] ช่วย smoke test ด้วย 🙏
```

---

### Content Review #beta-feedback

```
Somnuek โพสต์ทุกวันหลังทำ review:

📊 Content Review — [Date]
Topic: [topic]
Reviewed: [X] outputs
✅ Natural: [X] ([%])
⚠️ Awkward: [X]
❌ Wrong: [X]

Top issues:
1. [issue type]: [ตัวอย่าง]
2. [issue type]: [ตัวอย่าง]

Sheet: [Google Sheet link]
@Faeif แก้ prompt ได้เลยครับ
```

---

## 🔑 Team Rules

```
1. Code Ownership
   อธิบายโค้ดที่ push ได้ใน 2 นาที
   ถ้าไม่ได้ = ยังไม่พร้อม push

2. Prompt as Code
   แก้ prompt → commit เข้า /prompts/
   "prompt: fix layer3 — natural speech"

3. WIP Limit = 2
   เกิน 2 task → ขอความช่วยเหลือก่อน

4. Disagree and Commit
   พูดความเห็น 1 ครั้ง → ถ้าทีม decide แล้ว commit

5. No Broken Main
   ทุก merge ผ่าน PR + Faeif review
```

---

## 📈 KPIs ที่วัดทุกวัน (จาก Week 2)

```
Product:
□ Session completion rate (เป้า ≥70%)
□ Day-3 retention (เป้า ≥50%)
□ Day-7 retention (เป้า ≥30%)

Content:
□ AI natural rate (เป้า ≥85%)
□ Judge pass rate (เป้า ≥85%)

Business:
□ Beta users count (เป้า 20 คน)
□ Willingness to pay (เป้า ≥40%)
□ Cost per user/day (เป้า ≤฿5)
```

---

_Last updated: 2026-04-26_ _Owner: Faeif_ _แชร์ให้ทีมได้เลย_