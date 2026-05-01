> Last updated: 2026-04-26 | Maintained by: Faeif | Tags: #linguaquest #index #master

---

# LinguaQuest — Master Index

**LinguaQuest** = AI Companion สอนภาษาจีนสำหรับคนไทย  
Core loop: เลือกสถานการณ์ → AI เปิดบทสนทนา → User พูด → ระบบวัด tone → AI สร้าง learning path

> **สถานะปัจจุบัน:** Validation Phase — Sprint 1 (สิ้นสุด 26 เม.ย.)  
> **เป้า beta:** 20 real users, Day-7 retention ≥ 30%, natural rate ≥ 85%

---

## 👋 อ่านไฟล์ไหนก่อน? (แบ่งตามคน)

> เปิด index.md นี้ก่อน แล้วกดลิงก์ตาม role ของตัวเอง

### Aphichat (Full-Stack Dev)
```
1. Developer Overview          ← อ่านก่อน เข้าใจ system ทั้งหมด (~20 นาที)
2. UX Architecture             ← wireframe + component tree ทุก screen
3. Database Architecture       ← schema ที่ต้อง migrate
4. MVP Sprint Plan             ← task ของตัวเอง (A01–A06)
5. Monetization Strategy       ← ทำความเข้าใจ login flow + beta policy
```

### Faeif (Lead Dev + Product)
```
อ่านทุกไฟล์ — เป็น author หลัก
เน้น: MVP Sprint Plan (task F01–F04) + Monetization Strategy (decisions)
```

### Somnuek (Content QA)
```
1. MVP Sprint Plan             ← section Somnuek โดยเฉพาะ + sprint overview
2. Database Architecture       ← Part 2: Content Quality System (Layer 1-3)
3. Monetization Strategy       ← ทำความเข้าใจ beta policy + survey ที่ต้องทำ
4. Developer Overview          ← แค่ section "Content Quality System"
```

### Chatchanok (QA + Junior Dev)
```
1. MVP Sprint Plan             ← section Chatchanok (TASK-C01–C04) ← สำคัญที่สุด
2. Monetization Strategy       ← login flow ที่ต้องใส่ใน landing page
3. Developer Overview          ← แค่ section .env.example + Quick Reference
```

---

## 📚 Document Index

### Product & Strategy
| ไฟล์ | ว่าด้วยเรื่อง | สถานะ |
|------|--------------|-------|
| [สรุป meeting 25.04.69](สรุป%20meeting%2025.04.69.md) | OKR, เกณฑ์ validation, รายชื่อ mentor 17 คน | ✅ Done |
| [อนาคต](อนาคต.md) | Phase 2+ features: Tutor Chat, Community | ⚠️ Stub — ต้องเสริม |

### Technical Reference
| ไฟล์ | ว่าด้วยเรื่อง | สถานะ |
|------|--------------|-------|
| [Developer Overview](LinguaQuest%20—%20Developer%20Overview.md) | Tech stack, project structure, ทุก flow, API routes, privacy rules | ✅ Ready |
| [UX Architecture](Linguaquest%20ux%20architecture.md) | Routes, AI sub-agent, Study Plan UX, session flow state machine, component tree | ✅ Ready |
| [Database Architecture + Content Quality](LinguaQuest%20—%20Database%20Architecture%20+%20Content%20Quality.md) | DB schema, 3-layer quality system, AI Judge, native review process | ✅ Ready |
| [Flashcard System + History](LinguaQuest%20—%20Flashcard%20System%20+%20History%20+%20Additional%20Notes.md) | Card types (Vocab/Grammar/Sentence), history UX, anti-patterns, data model | ✅ Ready |
| [Missing Pieces Complete Spec](LinguaQuest%20—%20Missing%20Pieces%20Complete%20Spec.md) | Onboarding detail, notifications, error handling, gamification, PWA/offline | ✅ Ready |

### Execution
| ไฟล์ | ว่าด้วยเรื่อง | สถานะ |
|------|--------------|-------|
| [MVP Sprint Plan + Task Assignment](LinguaQuest%20—%20MVP%20Sprint%20Plan%20+%20Task%20Assignment.md) | Task list (F01–F04, A01–A06, C01–C04), 4-week sprint, GitHub board, Discord format | ✅ Active Sprint |
| [Monetization + Beta Strategy](LinguaQuest%20—%20Monetization%20+%20Beta%20Strategy.md) | Beta = ฟรีทั้งหมด, login required, ไม่มี payment, freemium plan post-beta | ✅ Decision Ready |

---

## 🗂️ Quick Reference

### Tech Stack
```
Framework:  Next.js 15 App Router + TypeScript strict
Database:   Supabase (PostgreSQL + RLS)
Cache:      Upstash Redis
Storage:    Cloudflare R2 (audio ephemeral only)
Deploy:     Vercel | Monorepo: Turborepo + pnpm

AI:
  Qwen3 (qwen-max)    → Companion + Thai explanations
  DeepSeek V3         → AI Judge (30% sampling)
  Qwen3-ASR           → Speech-to-text
  SpeechSuper         → Tone scoring per character
```

### Team
| คน | Role | งานหลัก |
|----|------|---------|
| **Faeif** | Lead Dev + Product Owner | AI pipeline, prompt quality, privacy, architecture |
| **Aphichat** | Full-Stack | Frontend screens, DB migrations, deploy |
| **Somnuek** | Content Quality Lead | Native speaker QA, beta validation |
| **Chatchanok** | QA / Testing | Support, bug reporting |

### Routes ที่มี / ยังไม่มี
```
✅ มีแล้ว:
/onboarding  /companion  /flashcard  /speaking  /profile

❌ ต้องสร้าง (Sprint 1-2):
/home         /study-plan   /speak/summary
/progress     /learn/grammar
```

### OKR (Validation Phase)
```
O: พิสูจน์ว่า LinguaQuest แก้ปัญหาได้จริงและ user อยากใช้ต่อ
KR1: Beta users ≥ 20 คน (real users ไม่ใช่เพื่อน)
KR2: Day-7 retention ≥ 30%
KR3: ≥ 40% ยินดีจ่ายเงิน
KR4: AI natural rate ≥ 85% (verified by native speaker)
```

---

## 🔗 Cross-Document Map

```
onboarding flow     → Developer Overview (Flow 1) + Missing Pieces (Section 1)
study plan          → Developer Overview (Flow 2) + UX Architecture (Study Plan section)
AI companion        → Developer Overview (Flow 3-4) + UX Architecture (Session Flow) + DB+Quality (AI Judge)
speaking pipeline   → Developer Overview (Flow 5) + UX Architecture (Audio Architecture)
flashcard/SRS       → Developer Overview (Flow 6) + Flashcard System doc
vocab tap popup     → Developer Overview (Flow 7) + UX Architecture (Vocab Tap spec)
grammar system      → Developer Overview (Flow 8) + Flashcard System doc
gamification        → Missing Pieces (Section 4)
notifications       → Missing Pieces (Section 2)
offline/PWA         → Missing Pieces (Section 5)
DB schema           → DB Architecture doc + Developer Overview (DB Tables)
sprint tasks        → MVP Sprint Plan doc
content QA process  → DB Architecture (Layer 2) + Sprint Plan (Somnuek section)
```

---

## ⚠️ Known Issues & Decisions Pending

### ✅ แก้แล้ว (2026-04-26)
- **Schema conflict** → ตัดสินใจแล้ว: `global_cards` + `user_card_progress` + `user_created_cards` (Phase 2) — ดู DB Architecture
- **`/progress` spec** → เพิ่ม wireframe + components ใน UX Architecture แล้ว
- **Chatchanok tasks** → เพิ่ม C01–C04 ใน Sprint Plan แล้ว (QA, beta recruitment, survey)
- **`อนาคต.md`** → ขยายเป็น Phase 2–4 roadmap ครบแล้ว
- **TTS workflow** → เพิ่ม batch script spec ใน DB Architecture แล้ว

### ✅ แก้เพิ่ม (2026-04-26 รอบ 2)
- **`/learn/grammar` Grammar Hub** → เพิ่ม spec + wireframe ใน UX Architecture แล้ว (MVP = tab "ที่เรียนแล้ว" เท่านั้น)
- **Landing page copywriting** → เพิ่มใน TASK-C01 ครบ 7 section + science backing
- **Monetization strategy** → สร้างไฟล์ใหม่ Monetization + Beta Strategy
- **PostHog setup** → เพิ่มใน Developer Overview แล้ว
- **Sentry setup** → เพิ่มใน Developer Overview แล้ว
- **.env.example** → เพิ่มใน Developer Overview แล้ว
- **Login policy** → beta ต้อง login (Google OAuth), ไม่มี guest mode

### ยังต้องทำ
- ไฟล์ที่ referenced แต่ไม่มีใน vault (ดูด้านล่าง)

---

## 📋 Sprint Status (อัปเดตทุกวัน)

### Week 1: 26-3 เม.ย./ พ.ค. (สิ้นสุดวันนี้)
| Task                    | ผู้รับผิดชอบ | สถานะ |
| ----------------------- | ------------ | ----- |
| F01: Fix README         | Faeif        | ⬜     |
| F02: Prompt quality     | Faeif        | ⬜     |
| F03: Privacy anonymizer | Faeif        | ⬜     |
| F04: Export test script | Faeif        | ⬜     |
| A01: Seed global_cards  | Aphichat     | ⬜     |
| A05: Navigation update  | Aphichat     | ⬜     |
| A06: Deploy production  | Aphichat     | ⬜     |

### Week 2: 4 – 10 พ.ค.
| Task                               | ผู้รับผิดชอบ | สถานะ     |
| ---------------------------------- | ------------ | --------- |
| A02: Home Screen                   | Aphichat     | 🔒 Locked |
| A03: Study Plan Screen             | Aphichat     | 🔒 Locked |
| Prompt revision (Somnuek feedback) | Faeif        | 🔒 Locked |
| XP/Streak backend                  | Faeif        | 🔒 Locked |

### Week 3: 11–17 พ.ค.

| Task | ผู้รับผิดชอบ | สถานะ |
|------|------------|-------|
| A04: Session Summary | Aphichat | 🔒 Locked |
| Vocab Tap Popup UI | Aphichat | 🔒 Locked |
| Grammar Pill + Session data | Faeif | 🔒 Locked |

### Week 4: 18-26 พ.ค.
- วัด KPIs, update pitch deck, ซักซ้อม pitch

---

## 💡 Aha Moment Definition

> "user พูดประโยคจีนครั้งแรกแล้วได้ ≥ 80% และ AI บอกได้ว่าตัวไหนผิด"  
> เกิดใน session แรก turn 2-3  
> วัดผ่าน PostHog: time to first score ≥ 80% — ถ้า > 5 นาที → onboarding ยากเกินไป

---

## 📁 Missing Files (Referenced แต่ไม่มีใน vault)
- `LinguaQuest_Brainstorm.md` — referenced ใน 3 ไฟล์
- `linguaquest-spec.md (v2.1)` — referenced ใน Missing Pieces
- `LinguaQuest_Battle_Plan.docx` — referenced ใน Missing Pieces
- `/docs/` folder — referenced ใน Developer Overview (architecture.md, api-contracts.md, security.md)

---

_log.md — ดูประวัติการตัดสินใจ_
