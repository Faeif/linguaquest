
> วันที่: 2026-04-26 | Status: Design Supplement Tags: #linguaquest #flashcard #history #ux

---

## 📚 Flashcard System — แยก Type ใช้ SRS เดียว

### 3 Card Types

```
Type 1: VOCAB CARD
─────────────────────────────────
Front:  左
        zuǒ
Back:   ซ้าย
        "往左走" = เดินไปทางซ้าย
        HSK 1 · Tone 3

Review modes:
→ Classic: เห็นคำ → คิดความหมาย → เปิดเฉลย
→ Speaking: เห็นคำ → พูดออกเสียง → SpeechSuper score
→ Listening: ฟัง audio → เขียน/เลือก


Type 2: GRAMMAR CARD
─────────────────────────────────
Front:  [Pattern ที่ต้องจำ]
        "S + 一直走，然后 + direction"

Back:   เดินตรงไป แล้วเลี้ยว___
        ✅ 一直走，然后左转
        ❌ 走一直，然后转左

Review modes:
→ Fill in blank: "一直走，___左转" → [然后/接着/再]
→ Translate: "เดินตรงแล้วเลี้ยวขวา" → พิมพ์/พูด
→ Error correction: เห็นประโยคผิด → แก้ให้ถูก


Type 3: SENTENCE CARD (⭐ จุดเด่นของ LinguaQuest)
─────────────────────────────────
Front:  สถานการณ์: "อยู่ที่สนามบิน ต้องถามทางไปรถไฟ"

Back:   ประโยคที่ต้องพูด:
        1. "请问地铁站怎么走？"
        2. "一直走，然后左转"
        3. "谢谢你！"

Review modes:
→ Speaking drill: พูดทีละประโยค → score each
→ Role play: AI เล่นเป็น airport staff → user ตอบ
```

---

### Card Creation Flow

```
เมื่อ Grammar Pill โชว์:
[💾 บันทึก Flashcard]
→ สร้าง Grammar Card อัตโนมัติ
→ Toast: "บันทึกแล้ว! ทบทวน 3 วันข้างหน้า"

เมื่อ tap Vocab Popup:
[+ เพิ่ม SRS]
→ สร้าง Vocab Card อัตโนมัติ
→ Auto-add ถ้า user เปิด setting "auto-add"

เมื่อ Session End:
[บันทึกประโยคทั้งหมดเป็น Flashcard]
→ สร้าง Sentence Card จาก session
→ 1 session = 1 sentence card set
→ User เลือกได้ว่าจะบันทึกหรือไม่

Manual Add:
/learn/flashcard → [+ เพิ่มคำ]
→ กรอก Chinese + Thai
→ AI ช่วยเติม pinyin + example อัตโนมัติ
```

---

### Flashcard Screen — Design

```
/learn/flashcard

TAB BAR:
[📚 ทั้งหมด] [🔤 Vocab] [📝 Grammar] [💬 Sentence]

─────────────────────────────────────
Due Today: 15 cards
[▶ เริ่มทบทวน]

FILTER:
[ทั้งหมด] [HSK 1] [HSK 2] [HSK 3] [จาก Session]

─────────────────────────────────────

CARD LIST:
┌─────────────────────────────────┐
│ 🔤 VOCAB                       │
│ 左 zuǒ — ซ้าย                  │
│ Due: วันนี้  · Ease: 2.1       │
│ [▶ ฝึก]                        │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 📝 GRAMMAR                     │
│ 一直...然后... pattern          │
│ Due: พรุ่งนี้  · Ease: 1.8     │
│ [▶ ฝึก]                        │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 💬 SENTENCE                    │
│ Session: ถามทางที่สนามบิน      │
│ 3 ประโยค · Due: 3 วัน          │
│ [▶ ฝึก]                        │
└─────────────────────────────────┘
```

---

## 📖 History & Recents — Full Design

### 3 ประเภท History

```
1. SESSION HISTORY
   ทุก session ที่เคยทำ
   → ย้อนดูได้ สรุปครบ
   → เล่น session ซ้ำได้

2. VOCAB RECENTLY SEEN
   คำที่เจอใน session ล่าสุด
   → ยังไม่ได้ add SRS ก็ยังอยู่ที่นี่
   → batch add ได้

3. GRAMMAR RECENTLY LEARNED
   Grammar pills ที่เคยเห็น
   → ค้นหาได้
   → เพิ่ม Flashcard ได้ทีหลัง
```

---

### Session History Screen

```
/progress/history

─────────────────────────────────────
📅 เมษายน 2026

┌─────────────────────────────────┐
│ วันพฤหัส 30 เม.ย.              │
│ ถามทางใน BTS จีน               │
│ 81% Speaking · +60 XP · 15 min │
│ [ดู Summary] [เล่นซ้ำ]         │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ วันพุธ 29 เม.ย.                │
│ สั่งอาหารในร้านก๋วยเตี๋ยว      │
│ 74% Speaking · +55 XP · 12 min │
│ [ดู Summary] [เล่นซ้ำ]         │
└─────────────────────────────────┘
```

**"เล่นซ้ำ" feature:**

```
User กด [เล่นซ้ำ] → session ซ้ำ topic เดิม
แต่ AI generate บทสนทนาใหม่ (ไม่ซ้ำกัน)
→ ฝึก situation เดิมด้วย scenario ต่างกัน
```

---

### Vocab Recently Seen

```
/learn/flashcard → tab [Recently Seen]

─────────────────────────────────────
คำที่เจอล่าสุด (ยังไม่ได้ Add SRS)

[ ] 地铁站 dìtiězhàn — สถานีรถไฟใต้ดิน
[ ] 怎么走 zěnme zǒu — ไปยังไง
[ ] 一直走 yīzhí zǒu — เดินตรงไป
[✓] 左 zuǒ — ซ้าย (Added already)
[ ] 右 yòu — ขวา

[+ Add ที่เลือกไว้ทั้งหมดเข้า SRS]
[+ Add ทั้งหมดเลย]

─────────────────────────────────────
Auto-clear: 7 วัน หลังจาก session
```

---

### Grammar History

```
/learn/grammar → tab [ที่เรียนแล้ว]

─────────────────────────────────────
SEARCH: [ค้นหา grammar...]

เรียงตาม: [ล่าสุด ▼] [HSK Level] [Type]

┌─────────────────────────────────┐
│ 📝 量词 — Measure Words         │
│ เรียนจาก: session สั่งอาหาร    │
│ 30 เม.ย. · ผิดซ้ำ 3 ครั้ง     │
│ [ทบทวน] [+ Flashcard]          │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 📝 然后 vs 接着                 │
│ เรียนจาก: session ถามทาง       │
│ 29 เม.ย.                       │
│ [ทบทวน] [+ Flashcard]          │
└─────────────────────────────────┘
```

---

## ⚠️ สิ่งที่อยากเตือน — Critical Things

### 1. ระวัง Feature Creep ตอนนี้

```
ทุกอย่างที่ design มาดูดีหมด แต่:

MVP ที่ต้อง ship ก่อน:
✅ AI Companion (Learner mode)
✅ Flashcard (Vocab เท่านั้น)
✅ Study Plan (basic 7-day)
✅ Session Summary (grammar + vocab)

ยังไม่ต้องทำ:
⬜ Grammar Card (Phase 2)
⬜ Sentence Card (Phase 2)
⬜ Session replay (Phase 2)
⬜ Vocab Recently Seen UI (Phase 2)
⬜ Grammar History UI (Phase 2)

เหตุผล: Validation ต้องการ proof ว่า
core loop (Companion + SRS) work จริง
ก่อนที่จะสร้าง feature รอบนอก
```

---

### 2. Design Debt ที่ต้องตัดสินใจตอนนี้

```
Database Schema ต้องรองรับ Phase 2 ตั้งแต่แรก:

cards table:
  id, user_id, type (vocab/grammar/sentence),
  front_zh, front_pinyin, front_th,
  back_content (JSON), source_session_id,
  created_at

ถ้า schema ไม่รองรับ card_type ตั้งแต่แรก
→ Migration ทีหลังยากมาก
→ ทำ enum ไว้ก่อน ใช้แค่ 'vocab' ตอนนี้
```

---

### 3. One Thing ที่สำคัญที่สุด ก่อนทุกอย่าง

```
ก่อน ship ทุก feature นี้:

Native speaker ต้อง review prompt ก่อน

เพราะ:
→ Vocab Popup มี example sentence
   → ถ้า example ไม่ natural → user เรียนผิด

→ Grammar Pill มีคำอธิบาย
   → ถ้าอธิบายผิด → user เข้าใจผิด

→ AI Companion พูดจีน
   → ถ้า output ไม่ natural → ใช้ไม่ได้จริง

ลำดับที่ถูก:
1. Fix prompt → native review → pass 85%
2. Ship MVP features
3. ไม่ใช่กลับกัน
```

---

### 4. Metric ที่สำคัญที่สุด — "Aha Moment"

```
Aha Moment ของ LinguaQuest คือ:

"พูดประโยคจีนครั้งแรกแล้วได้ ≥ 80%
 และ AI บอกได้ว่าตัวไหนผิด"

เวลาที่ควรเกิด: ภายใน session แรก turn ที่ 2-3

ถ้า Aha Moment เกิดช้ากว่านั้น:
→ retention จะต่ำ
→ ต้องปรับ onboarding ให้ง่ายกว่านี้

วัดได้จาก:
→ PostHog: time to first score ≥ 80%
→ ถ้า > 5 นาที → onboarding ยากเกินไป
```

---

### 5. ข้อแนะนำเรื่อง Monetization timing

```
อย่าเพิ่ง paywall ใน 1 เดือนแรก

เหตุผล:
→ ต้องการ usage data จริงก่อน
→ ต้องรู้ว่า feature ไหนที่ user
   ใช้บ่อยและยินดีจ่าย

Feature ที่น่าจะ convert ได้ดีที่สุด:
1. Unlimited AI Companion
   (free limit 10 msg/day รู้สึกน้อยไป)
2. Speaking History + Progress graph
   (เห็น improvement = อยากต่อ)
3. HSK Readiness Score
   (คนสอบพร้อมจ่าย เพราะ goal ชัด)

ทดสอบก่อน: ถามตรงๆ ว่า
"ถ้าต้องจ่าย feature ไหนที่คุณยอมจ่าย?"
```

---

### 6. Anti-patterns ที่ต้องหลีกเลี่ยง

```
❌ Dark patterns ที่ทำลาย trust:
→ ซ่อน limit ไว้จนกว่าจะใช้หมด
   (บอกตั้งแต่ต้นดีกว่า)
→ ส่ง push notification มากเกินไป
→ Guilt-trip เมื่อ streak หาย
   "ทำ streak พังแล้ว 😢"
   → เปลี่ยนเป็น "เริ่มใหม่วันนี้ได้เลย 💪"

❌ Learning anti-patterns:
→ ทดสอบยากเกินไปตั้งแต่วันแรก
→ Grammar lecture ก่อนฝึกพูด
→ บังคับ memorize โดยไม่มี context

✅ ที่ควรทำแทน:
→ แจ้ง limit ด้วย progress bar "8/10 messages"
→ Push notification 1 ครั้ง/วัน เท่านั้น
→ "ยังมีอีก 2 วัน streak ก็ถึง 7 วันแล้ว!" 🔥
```

---

### 7. Tech Debt ที่จะเกิดถ้าไม่ระวัง

```
Prompt Version Control:
ถ้าไม่ commit prompts เข้า git ตั้งแต่แรก
→ ไม่รู้ว่า prompt version ไหนที่ทำให้
  native score ดีขึ้น
→ rollback ไม่ได้ถ้า quality แย่ลง

Fix: /prompts/ directory ใน git ทุก change

Context Accumulation:
ถ้าไม่ limit conversation history
→ session ยาวๆ → token พุ่ง → cost สูง

Fix: ส่งแค่ last 3 turns เสมอ
     บวก session_summary (compressed)

Error Silencing:
ถ้า API fail แล้วไม่แจ้ง user ชัดๆ
→ user งง ไม่รู้ว่าเกิดอะไร

Fix: Toast message ที่ชัดเจนทุก error
     Sentry สำหรับ log
```

---

## 🗂️ Final Data Model — รองรับทุก Phase

```sql
-- Cards (Vocab + Grammar + Sentence รวมกัน)
CREATE TABLE cards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type TEXT CHECK (type IN ('vocab','grammar','sentence')),
  
  -- Content
  front_zh TEXT,
  front_pinyin TEXT,
  front_th TEXT,
  back_json JSONB,          -- flexible per type
  
  -- SRS (FSRS)
  stability FLOAT DEFAULT 1,
  difficulty FLOAT DEFAULT 5,
  due_date TIMESTAMPTZ DEFAULT NOW(),
  review_count INT DEFAULT 0,
  
  -- Source tracking
  source_session_id UUID,   -- มาจาก session ไหน
  source_type TEXT,         -- 'companion' | 'manual' | 'grammar_pill'
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session History
CREATE TABLE companion_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  topic TEXT,
  mode TEXT,
  persona_id TEXT,
  
  -- Results
  avg_speaking_score FLOAT,
  turns_completed INT,
  xp_earned INT,
  duration_seconds INT,
  
  -- Data collected
  vocab_encountered TEXT[],    -- คำที่เจอ
  grammar_errors JSONB,        -- errors + counts
  tone_weak_log JSONB,         -- tone scores per char
  
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Plan
CREATE TABLE study_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  goal_tag TEXT,
  start_date DATE,
  plan_data JSONB,             -- full 7-day plan
  progress_pct FLOAT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Plan Progress (lesson level)
CREATE TABLE study_plan_lessons (
  id UUID PRIMARY KEY,
  plan_id UUID REFERENCES study_plans(id),
  day_number INT,
  topic_id TEXT,
  lesson_id TEXT,
  lesson_type TEXT,
  status TEXT DEFAULT 'locked',  -- locked/unlocked/done
  session_id UUID,               -- linked session ถ้า type=companion
  completed_at TIMESTAMPTZ
);
```

---

## 🚀 Summary: Next Steps Priority

```
สัปดาห์นี้ (Critical Path):
1. Native speaker review prompt → pass 85%
2. Schema migration สำหรับ card types
3. Study Plan screen (basic UI + AI generate)

สัปดาห์หน้า:
4. Session Setup → Contract → Chat full flow
5. Tone Heatmap + User Playback
6. Vocab Tap Popup (single element)
7. Grammar Pill trigger

สัปดาห์ที่ 3:
8. Session End Summary (grammar + vocab + sentences)
9. Plan progress update (lesson → Done)
10. Flashcard Vocab type เท่านั้น

Phase 2 (หลัง validation):
11. Grammar Card + Sentence Card
12. Session History + Replay
13. Vocab Recently Seen UI
14. Grammar History Search
```

---

_Last updated: 2026-04-26_ _เชื่อมกับ: LinguaQuest_UX_Architecture.md_ _เชื่อมกับ: LinguaQuest_Brainstorm.md_