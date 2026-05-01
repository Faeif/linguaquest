> Operation log — reverse chronological | Tags: #linguaquest #log #decisions

---

# LinguaQuest — Decision Log

---

## 2026-04-26 — Documentation Review + index.md created

**By:** Claude Code (Faeif request)

**สิ่งที่ทำ:**
- อ่านและวิเคราะห์ไฟล์ทั้ง 8 ไฟล์ใน vault
- สร้าง `index.md` (master catalog) + `log.md` (this file)

**ปัญหาที่พบ / สิ่งที่ต้องแก้:**

1. **Schema conflict** — `Developer Overview` และ `Flashcard System` ใช้ DB schema คนละแบบ:
   - Overview บอก: `global_cards` + `user_card_progress`
   - Flashcard doc บอก: `cards` unified table (type enum)
   - **แนะนำ:** ใช้ทั้งสอง: `global_cards` สำหรับ HSK vocab + `user_created_cards` สำหรับ grammar/sentence cards

2. **Naming inconsistency** — ไฟล์ที่อ้างถึงใน docs กับชื่อจริงไม่ตรงกัน:
   - docs บอก `LinguaQuest_UX_Architecture.md` แต่จริงๆ ชื่อ `Linguaquest ux architecture.md`
   - docs บอก `LinguaQuest_DB_Quality.md` แต่จริงๆ ชื่อ `LinguaQuest — Database Architecture + Content Quality.md`
   - **Action:** ใช้ชื่อจริงตามไฟล์ทุกครั้ง อย่าย่อหรือเปลี่ยน format

3. **Missing files referenced:**
   - `LinguaQuest_Brainstorm.md` (referenced ใน 3 ไฟล์ แต่ไม่มีในวault)
   - `linguaquest-spec.md v2.1`
   - `LinguaQuest_Battle_Plan.docx`
   - `/docs/` folder (architecture.md, api-contracts.md, security.md)

4. **`อนาคต.md` เกือบว่างเปล่า** — มีแค่ 2 บรรทัด ต้องเสริมเป็น Phase 2 roadmap

5. **Chatchanok ไม่มี task ใน sprint** — role ระบุแค่ "QA/Testing" แต่ไม่มี specific tasks

6. **`/progress` screen ไม่มี spec** — mentioned in routes ทุกที่แต่ไม่มี wireframe หรือ component spec

7. **`/learn/grammar` Grammar Hub ไม่มี spec** — มีแค่ route

8. **TTS generation workflow ไม่ชัด** — DB spec บอกว่า `audio_url` ใน `global_cards` เป็น pre-generated TTS แต่ไม่มี script หรือ workflow ว่าจะ generate 10,000 คำยังไง

9. **Southern Accent option ใน Session Setup** — UX Architecture มี option "Southern Accent" แต่ Developer Overview ไม่กล่าวถึง — scope creep risk สำหรับ MVP

---

## 2026-04-26 — Sprint 1 Start (Week 1: 20–26 เม.ย.)

**By:** Faeif

**Decisions:**
- ทีม 4 คน: Faeif (AI+Product), Aphichat (Full-Stack), Somnuek (QA), Chatchanok (Support)
- Stack confirmed: Next.js 15 + Supabase + Qwen3 + DeepSeek V3 + SpeechSuper
- Judge sampling: 30% ของ turns (cost optimization)
- Context compression: ส่งแค่ last 3 turns (token optimization ~60-70%)
- Audio: ephemeral-only by default, opt-in consent สำหรับ storage
- Design system: "Minimalist Café" — bg #FAFAF9, primary #8B5E3C, accent #F97316

**OKR confirmed:**
- Beta users ≥ 20 คน (real)
- Day-7 retention ≥ 30%
- Willingness to pay ≥ 40%
- AI natural rate ≥ 85%

---

## 2026-04-26 — AI Stack Change (README ต้องแก้)

**By:** Faeif

**เปลี่ยนจาก:** Gemini 2.0 Flash + Azure Speech  
**เป็น:** Qwen3 + DeepSeek V3 + SpeechSuper

**เหตุผล:** (ไม่ได้บันทึกไว้ — ต้องถาม Faeif)

**Action required:** TASK-F01 — แก้ README.md ก่อนทุกอย่าง (mentor/investor เห็นได้)

---

## Template สำหรับ log entry ใหม่

```
## YYYY-MM-DD — [หัวข้อ]

**By:** [ชื่อ]

**Context:** [ทำไมถึงตัดสินใจ]

**Decision:** [ตัดสินใจอะไร]

**Alternatives considered:** [ทางเลือกอื่นที่ไม่เลือก]

**Outcome / Follow-up:** [ผลลัพธ์ที่ต้องการ]
```

---

_index.md — ดู master catalog_
