> วันที่: 2026-04-26 | Status: Decision Ready | Tags: #linguaquest #monetization #beta #pricing

---

# LinguaQuest — Monetization Strategy + Beta Policy

---

## 🎯 Beta Phase Policy (ตอนนี้ — พ.ค. 2026)

### TL;DR
```
Beta = ฟรีทุก feature ทุก session ไม่จำกัด
ไม่มี payment integration
ไม่มี credit limit
ต้อง login (ไม่มี guest mode ใน beta)
```

### ทำไมต้อง Login (ไม่ใช่ guest)?
```
เราต้องวัด KRs จริงๆ:
KR2: Day-7 retention ≥ 30%
→ วัดไม่ได้ถ้าไม่รู้ว่า user คนเดิมกลับมา

KR1: Beta users ≥ 20 คน
→ นับ guest ไม่ได้ เพราะ reset ทุกครั้ง

KR3: Willingness to pay
→ ต้องรู้ว่าใครคือ user จริง

ดังนั้น: ต้อง sign up ก่อนใช้งาน
วิธีที่ friction น้อยที่สุด: Google OAuth (1 คลิก)
```

### สิ่งที่ไม่ต้องทำใน Beta
```
❌ Payment integration (Stripe, Omise, PromptPay)
❌ Credit/limit system
❌ Paywall หรือ feature gate
❌ Subscription logic
❌ Invoice/receipt generation

ทั้งหมดนี้ทำหลัง validation pass
เหตุผล: ทำเร็วเกินไป = เสียเวลา dev กับสิ่งที่ model อาจเปลี่ยน
```

### Auth สำหรับ Beta
```
Provider: Supabase Auth (มีอยู่แล้ว)
Methods:
✅ Google OAuth ← ใช้หลัก (friction ต่ำสุด)
✅ Email + Password ← backup

ไม่ต้องทำ:
❌ Apple Sign In (Phase 2 เมื่อมี native app)
❌ Phone OTP (ซับซ้อนเกินไปสำหรับ beta)
```

---

## 💰 Post-Beta Monetization Plan (มิ.ย. 2026+)

> ทำหลัง validation pass เท่านั้น อย่า build ก่อน

### Model: Freemium + Pro

```
FREE PLAN (ไม่ต้องใส่บัตร):
✅ 1 AI Session / วัน (~15 นาที)
✅ Flashcard (vocab) ไม่จำกัด
✅ Study Plan (7 วัน, auto-regenerate)
✅ 5 topics พื้นฐาน
✅ Speaking Coach
✅ Grammar Pill (in-session)
✅ Session Summary

PRO PLAN (฿149/เดือน):
✅ Unlimited AI Sessions
✅ Speaking History + Progress Graph (Skill Radar)
✅ HSK Readiness Score
✅ All topics (30+)
✅ Grammar Card + Sentence Card
✅ Tutor Chat (HSK mode)
✅ Offline Flashcard
✅ Priority support
```

### ทำไม ฿149?
```
Benchmark:
Duolingo Plus = ฿179/เดือน (Thai pricing)
Babbel        = ฿189/เดือน
HelloChinese  = ฿139/เดือน

LinguaQuest ฿149 = ถูกกว่า Duolingo เล็กน้อย
แต่เน้น: "Duolingo สอน vocab, เราสอนพูดจริง"

จุดที่ต้อง validate ก่อน:
→ WTP survey: คนยินดีจ่ายเท่าไหร่จริง
→ ถ้า ≥ 40% บอก ≥ ฿100 → ฿149 ผ่าน
→ ถ้าส่วนใหญ่บอก ≤ ฿100 → ปรับเป็น ฿99
```

### Credit System (Alternative ถ้าไม่ทำ subscription)
```
อีก option ที่ไม่ต้อง subscription:

Credit Model:
→ สมัครได้ 50 credits ฟรี
→ 1 AI session = 10 credits
→ 1 flashcard review session = 1 credit
→ ซื้อ credits: 100 credits = ฿49

ข้อดี:
→ ไม่ต้องผูกกับ recurring billing
→ user รู้สึก "ฉันจ่ายเมื่อใช้"
→ ดี ถ้า user ใช้ไม่สม่ำเสมอ

ข้อเสีย:
→ Revenue ไม่ predictable
→ User กังวลเรื่อง "จะหมดมั้ย" → ลด engagement

แนะนำ: ทดสอบ subscription ก่อน (simpler)
         credit ถ้า churn สูง
```

### Feature Gate Implementation (เมื่อถึงเวลา)
```typescript
// lib/features/gate.ts

const PRO_FEATURES = [
  'unlimited_sessions',
  'speaking_history',
  'hsk_readiness',
  'all_topics',
  'grammar_cards',
  'tutor_chat',
] as const

export function isProFeature(feature: typeof PRO_FEATURES[number]): boolean {
  return PRO_FEATURES.includes(feature)
}

export function canAccess(
  feature: typeof PRO_FEATURES[number],
  user: { isPro: boolean; dailySessionCount: number }
): boolean {
  if (!isProFeature(feature)) return true
  if (user.isPro) return true

  // Free limits
  if (feature === 'unlimited_sessions') {
    return user.dailySessionCount < 1  // 1 session/day free
  }

  return false
}

// Usage:
// if (!canAccess('unlimited_sessions', user)) {
//   → showUpgradePrompt()
// }
```

### Upgrade Prompt UX (เมื่อ user ชน limit)
```
ห้ามทำ dark patterns:
❌ "session ของคุณจะหายถ้าไม่ upgrade"
❌ Lock mid-session (จบก่อนค่อย prompt)
❌ Countdown timer กดดัน

ทำแบบนี้แทน:
✅ แจ้งตอนจบ session: "วันนี้ใช้ครบ 1 session แล้ว"
✅ "พรุ่งนี้ session ใหม่พร้อมแล้ว 🌟"
✅ "อยากไม่จำกัด? Pro เพิ่มอีก ฿149/เดือน"
✅ ปุ่ม [ดูต่อได้เลย] ชัดกว่า [Upgrade Now]
```

---

## 📊 Revenue Timeline

```
เม.ย.–พ.ค. 2026 (ตอนนี้):
→ $0 revenue — beta ฟรีทั้งหมด
→ วัด retention + willingness to pay

มิ.ย. 2026:
→ เปิด Pro plan ฿149/เดือน
→ Early adopter: 3 เดือนแรก ฿99 (ถ้า WTP survey บอกว่าจำเป็น)

เป้า Month 1 post-launch:
→ 5% of 20 beta users convert = 1 user = ฿149 MRR
→ จริงๆ ต้องการ 50 users → 5% = 2-3 users MRR

Break-even estimate:
→ Supabase: ฿900/เดือน
→ Vercel: ฟรี (hobby tier ตอนนี้)
→ AI APIs: ~฿5/user/day → 50 users = ฿7,500/เดือน
→ Total: ~฿8,400/เดือน
→ ต้องการ Pro users: ฿8,400 ÷ ฿149 = ~57 Pro users break-even
```

---

## 🔐 Login Flow Spec (สำหรับ Aphichat)

```
Landing page (/) → [เริ่มเลย]
  ↓
/login
┌─────────────────────────────────────┐
│ เข้าสู่ LinguaQuest                │
│                                     │
│ [G] Continue with Google  ← หลัก   │
│                                     │
│ ────────── หรือ ──────────          │
│                                     │
│ Email: [_______________]            │
│ Password: [_______________]         │
│ [เข้าสู่ระบบ]                      │
│                                     │
│ ยังไม่มีบัญชี? [สมัครสมาชิก]       │
└─────────────────────────────────────┘

หลัง login สำเร็จ:
→ ถ้า onboarding_completed = false → /onboarding
→ ถ้า onboarding_completed = true  → /home

Beta note: ไม่มี guest mode
ถ้า user พยายามเข้า /home โดยไม่ login → redirect /login
```

---

_Last updated: 2026-04-26_
_Decision: Beta = ฟรีทั้งหมด, login required, ไม่มี payment_
_ทบทวน: หลัง beta results (17 พ.ค. 2026)_
