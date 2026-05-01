
> วันที่: 2026-04-26 | Status: Implementation Ready Tags: #linguaquest #onboarding #notification #gamification #pwa #error

---

## 📋 สารบัญ

1. Onboarding Flow (จุดที่ user ตัดสินใจอยู่หรือไป)
2. Notification & Retention System
3. Error Handling & Edge Cases
4. Gamification Detail (XP, Levels, Badges)
5. Offline & PWA Strategy

---

# 1. 🚀 Onboarding Flow

## หลักการ: 5 นาที ได้ LearningDNA ครบ

```
เป้าหมาย:
→ User รู้สึก "แอปนี้รู้จักฉัน" ตั้งแต่วันแรก
→ เก็บ data ครบเพื่อสร้าง personalized path
→ ไม่น่าเบื่อ ไม่ยาว ไม่ถามซ้ำ

Anti-pattern ที่ต้องหลีกเลี่ยง:
❌ ถามมากกว่า 5 คำถาม
❌ บังคับ create account ก่อนเห็น product
❌ Onboarding ที่ไม่เชื่อมกับ session แรก
```

---

## Step 1 — Welcome (10 วิ)

```
┌─────────────────────────────────────┐
│                                     │
│   🐒 LinguaQuest                   │
│   Talk More, Worry Less.            │
│                                     │
│   AI คู่สนทนาภาษาจีน               │
│   ที่รู้จักคุณมากขึ้นทุกวัน        │
│                                     │
│   [เริ่มเลย — ฟรี]                 │
│   ไม่ต้องสมัครก่อนก็ได้            │
│                                     │
└─────────────────────────────────────┘

Note: ให้ลอง app ก่อน สมัครทีหลังได้
→ Guest mode (save locally)
→ Register เมื่อจะ sync ข้ามอุปกรณ์
```

---

## Step 2 — Goal (45 วิ)

```
┌─────────────────────────────────────┐
│ คุณอยากเรียนจีนเพื่ออะไร?          │
│                                     │
│ ✈️  ท่องเที่ยวจีน/ไต้หวัน          │
│     "อยากสั่งอาหาร ถามทางได้"      │
│                                     │
│ 📝  สอบ HSK                        │
│     "มีเป้าหมายสอบชัดเจน"          │
│                                     │
│ 💼  ทำงานกับลูกค้าจีน              │
│     "ต้องใช้ในที่ทำงาน"            │
│                                     │
│ 🎬  ดูซีรีส์โดยไม่ดูซับ            │
│     "อยากเข้าใจบทสนทนาจริงๆ"      │
│                                     │
│ 🗣️  คุยกับเพื่อน/แฟนคนจีน         │
│                                     │
└─────────────────────────────────────┘

Data เก็บ: goal_tag
```

---

## Step 3 — Level Check (1 นาที)

```
┌─────────────────────────────────────┐
│ ตอนนี้ภาษาจีนอยู่ระดับไหน?        │
│                                     │
│ 🌱 เพิ่งเริ่ม ไม่รู้เลย            │
│ 🌿 รู้บ้าง พูดได้นิดหน่อย          │
│ 🌳 สื่อสารได้ในบางสถานการณ์        │
│ 🎋 ค่อนข้างคล่อง อยากฝึกเพิ่ม     │
└─────────────────────────────────────┘

ถ้าเลือก 🌿 หรือสูงกว่า → Quick Check:
┌─────────────────────────────────────┐
│ รู้จักคำเหล่านี้มั้ย? (tap ที่รู้) │
│                                     │
│ [你好] [谢谢] [多少钱]             │
│ [我想要] [在哪里] [没关系]         │
│                                     │
│ ใช้เวลา 20 วิ ไม่ต้องพูด          │
└─────────────────────────────────────┘

Data เก็บ:
→ self_reported_level
→ vocab_check_results
→ estimated_hsk_level (1-4)
```

---

## Step 4 — Mindset Reset (1.5 นาที)

```
นี่คือส่วนที่ LinguaQuest ต่างจากทุกแอป
ไม่ใช่ text อ่าน แต่เป็น interactive demo

─────────────────────────────────────
Screen 4a: Tone Demo
┌─────────────────────────────────────┐
│ ก่อนเริ่ม — เรื่องสำคัญมาก 🔑     │
│                                     │
│ คำว่า "ma" มี 4 ความหมาย          │
│ ขึ้นอยู่กับเสียงที่ออก:            │
│                                     │
│ [▶] mā = 妈 แม่                    │
│ [▶] má = 麻 งา/ชา                 │
│ [▶] mǎ = 马 ม้า                   │
│ [▶] mà = 骂 ด่า                   │
│                                     │
│ Tone ≠ สำเนียง                     │
│ Tone = ความหมาย                    │
│                                     │
│ [ฟังแล้ว เข้าใจแล้ว →]            │
└─────────────────────────────────────┘

─────────────────────────────────────
Screen 4b: No-tense Demo
┌─────────────────────────────────────┐
│ ภาษาจีนไม่มี Tense! 🎉            │
│                                     │
│ 我吃饭 = กินข้าว                   │
│ 我昨天吃饭 = กินข้าวเมื่อวาน       │
│ 我明天吃饭 = จะกินข้าวพรุ่งนี้     │
│                                     │
│ Verb ไม่เปลี่ยนเลย!                │
│ แค่เปลี่ยน time word               │
│                                     │
│ [โอ้วว เข้าใจแล้ว →]              │
└─────────────────────────────────────┘

─────────────────────────────────────
Screen 4c: Permission to be wrong
┌─────────────────────────────────────┐
│ สุดท้าย — และสำคัญที่สุด           │
│                                     │
│ ผมจะไม่บอกว่าคุณ "ผิด" ตรงๆ       │
│                                     │
│ ถ้าคุณพูดผิด ผมจะพูดให้ถูก        │
│ ใน response แทน                    │
│                                     │
│ คุณแค่ฟังและรู้สึกว่า "อ๋อ..."    │
│ นั่นแหละคือการเรียนที่ดีที่สุด    │
│                                     │
│ พูดผิดได้ครับ ผมไม่ judge 😊      │
│                                     │
│ [พร้อมแล้ว!]                       │
└─────────────────────────────────────┘

Data เก็บ:
→ mindset_screens_completed (0-3)
→ tone_demo_listened (boolean)
```

---

## Step 5 — Mic + Baseline Test (1 นาที)

```
ทำ 2 อย่างพร้อมกัน:
1. ทดสอบ mic ว่าใช้งานได้
2. เก็บ baseline speaking score

┌─────────────────────────────────────┐
│ ทดสอบไมค์กัน 🎙️                   │
│                                     │
│ กดค้างแล้วพูดว่า:                  │
│                                     │
│     你 好                           │
│   nǐ  hǎo                          │
│                                     │
│ ════════════════  ← waveform        │
│                                     │
│ [🎙️ กดค้างเพื่อพูด]               │
└─────────────────────────────────────┘

หลังพูด → แสดงผลทันที:
┌─────────────────────────────────────┐
│ ✅ ไมค์ทำงานได้!                   │
│                                     │
│ nǐ (你) — Tone 3  🟡 พอใช้         │
│ hǎo (好) — Tone 3  🟢 ดีมาก       │
│                                     │
│ Overall: 72/100                     │
│                                     │
│ ไม่ต้องกังวลนะครับ                 │
│ จะดีขึ้นเรื่อยๆ เอง 😊            │
│                                     │
│ [เริ่มเรียนเลย!]                    │
└─────────────────────────────────────┘

ถ้า mic fail:
┌─────────────────────────────────────┐
│ ⚠️ ไม่ได้ยินเสียง                  │
│                                     │
│ • กด Allow ใน browser              │
│ • เช็คว่า mic ไม่ได้ mute          │
│                                     │
│ [ลองอีกครั้ง]  [ข้ามไปก่อน]       │
│                                     │
│ (ข้ามได้ แต่ Speaking Coach       │
│  ใช้ไม่ได้จนกว่าจะ setup mic)     │
└─────────────────────────────────────┘

Data เก็บ:
→ mic_permission_granted
→ mic_setup_completed
→ baseline_speaking_score (0-100)
→ baseline_tone_scores {ni3, hao3}
```

---

## Step 6 — Daily Goal (30 วิ)

```
┌─────────────────────────────────────┐
│ วันละเท่าไหร่?                      │
│                                     │
│ ⚡ 10 นาที — เรียนแบบ casual        │
│ 🎯 20 นาที — แนะนำ (ได้ผลดีสุด)   │
│ 💪 30 นาที — จริงจัง               │
│                                     │
│ เปลี่ยนได้ตลอดใน Settings          │
└─────────────────────────────────────┘

หลังเลือก → ไป session แรกทันที:
┌─────────────────────────────────────┐
│ 🎉 พร้อมแล้ว!                      │
│                                     │
│ AI สร้าง Study Plan ให้คุณแล้ว    │
│                                     │
│ Session แรกของคุณ:                 │
│ 🙋 ทักทายและแนะนำตัว               │
│ กับ หลิง · Learner · 15 นาที       │
│                                     │
│ [เริ่ม Session แรก →]              │
└─────────────────────────────────────┘

Data เก็บ:
→ daily_goal_minutes (10/20/30)
→ onboarding_completed = true
→ onboarding_duration_seconds
```

---

## LearningDNA ที่ได้จาก Onboarding

```typescript
interface LearningDNA {
  // จาก Onboarding
  goal_tag: 'travel' | 'hsk' | 'business' | 'media' | 'social'
  self_reported_level: 'beginner' | 'elementary' | 'intermediate'
  estimated_hsk_level: 1 | 2 | 3 | 4
  daily_goal_minutes: 10 | 20 | 30
  baseline_speaking_score: number
  baseline_tone_scores: Record<string, number>

  // สะสมระหว่างใช้งาน
  weak_tones: ToneWeakLog[]
  weak_grammar: GrammarErrorLog[]
  vocab_retention_avg: number
  speaking_trend: 'improving' | 'stable' | 'declining'
  preferred_session_time: 'morning' | 'evening' | 'varied'
  streak_current: number
  total_sessions: number
}
```

---

# 2. 🔔 Notification & Retention System

## หลักการ

```
กฎที่ต้องยึดถือ:
→ Max 1 notification/วัน
→ ไม่ส่งถ้า user เรียนแล้ววันนั้น
→ ปรับ timing ตาม usage pattern
→ ข้อความต้องรู้สึก helpful ไม่ใช่ spam
```

---

## Notification Types

### Type 1: Streak Reminder (สำคัญที่สุด)

```
Trigger: user ยังไม่ได้เรียนวันนี้
Timing: ดูจาก usage pattern ของ user
         ถ้า user เรียนตอนเย็นทุกวัน → ส่ง 18:00
         ถ้าไม่มี pattern → ส่ง 19:00

Message variants (rotate):
"🔥 Streak 4 วัน! อีก 3 วันถึง Week badge"
"🐒 หลิงรอคุณอยู่นะ — session แค่ 10 นาที"
"⚡ Due cards 15 ใบรอทบทวน"
"📈 Speaking score เมื่อวาน 81% — ต่อยอดวันนี้?"

ห้ามส่ง:
❌ "streak ของคุณจะหายแล้วนะ!" (guilt-trip)
❌ "คุณกำลังจะแพ้ competition" (pressure)
```

### Type 2: Streak Recovery (streak เพิ่งหาย)

```
Trigger: streak ขาด → วันถัดมา
Timing: 09:00

Message:
"💪 เริ่มใหม่วันนี้ได้เลย
 streak เก่าไปแล้ว แต่ความรู้ยังอยู่ 😊
 สร้าง streak ใหม่เริ่มจากวันนี้"

ไม่ส่งวันที่ 2 ถ้า user ยังไม่กลับมา
→ รอ 3 วัน แล้วส่ง re-engagement แทน
```

### Type 3: Milestone Celebration

```
Trigger: streak ครบ 7/14/30/100 วัน

Message:
"🏆 Streak 7 วัน! คุณเป็น 1 ใน 15%
 ของ user ที่ทำได้ถึงตรงนี้
 [รับ badge เลย →]"
```

### Type 4: Due Cards Alert

```
Trigger: มี due cards ≥ 10 ใบ
         และ user ไม่ได้ review ≥ 2 วัน
Timing: 09:00

Message:
"📚 15 คำรอทบทวน
 ใช้เวลา ~5 นาที ก่อนลืม"

ไม่ส่งซ้ำถ้า user เพิ่งทำ session แล้ว
```

### Type 5: Weekly Summary (ทุกวันจันทร์)

```
Timing: วันจันทร์ 10:00

Message:
"📊 สัปดาห์ที่ผ่านมา:
 5 sessions · Speaking 76% avg
 15 คำใหม่ · Tone 2 ดีขึ้น 18%
 [ดู progress →]"
```

---

## Push Notification Implementation

```typescript
// lib/notifications/push.ts

// Web Push API (PWA)
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Subscribe to push
export async function subscribeToPush(userId: string) {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  })

  // Save subscription to Supabase
  await supabase.from('push_subscriptions').upsert({
    user_id: userId,
    subscription: JSON.stringify(subscription),
    device_type: getMobileOS()
  })
}

// Server-side: send notification
// app/api/notifications/send/route.ts
export async function sendStreakReminder(userId: string) {
  const user = await getUserWithStreak(userId)

  // ไม่ส่งถ้าเรียนแล้ววันนี้
  if (user.last_session_date === today()) return

  // ปรับ message ตาม streak
  const message = selectMessage(user.streak_current)

  await webpush.sendNotification(user.push_subscription, JSON.stringify({
    title: 'LinguaQuest',
    body: message,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: { url: '/speak' }  // deep link
  }))
}
```

---

## In-App Nudge (ไม่ต้องขอ permission)

```
นอกจาก push notification ยังมี in-app nudge:

Home screen banner (ถ้าไม่ได้เรียน > 1 วัน):
┌─────────────────────────────────────┐
│ 🔥 Streak 4 วัน — อย่าให้หายนะ   │
│ session วันนี้ยังไม่ได้เริ่ม      │
│ [เริ่มเลย 10 นาที]                 │
└─────────────────────────────────────┘

Due cards badge บน nav bar:
[📚 Vocab] ← แสดง badge "15" ถ้า due ≥ 5
```

---

## Notification Timing Logic

```typescript
// คำนวณ optimal time สำหรับแต่ละ user
function getOptimalNotificationTime(userId: string): string {
  const sessions = getUserSessions(userId, 14)  // 14 วันล่าสุด

  // หา most common hour
  const hourCounts = sessions.reduce((acc, s) => {
    const hour = new Date(s.completed_at).getHours()
    acc[hour] = (acc[hour] || 0) + 1
    return acc
  }, {})

  const peakHour = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0]

  // ส่ง 1 ชั่วโมงก่อน peak time
  if (peakHour) return `${parseInt(peakHour) - 1}:00`

  return '19:00'  // default
}
```

---

# 3. ⚠️ Error Handling & Edge Cases

## Network Errors

```typescript
// lib/errors/handler.ts

// ทุก API call ต้องมี timeout + retry
const API_CONFIG = {
  timeout_ms: 10000,     // 10 วิ
  max_retries: 2,
  retry_delay_ms: 1000
}

async function callWithRetry<T>(
  fn: () => Promise<T>,
  retries = API_CONFIG.max_retries
): Promise<T> {
  try {
    return await Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')),
          API_CONFIG.timeout_ms)
      )
    ])
  } catch (err) {
    if (retries > 0 && isRetryable(err)) {
      await sleep(API_CONFIG.retry_delay_ms)
      return callWithRetry(fn, retries - 1)
    }
    throw err
  }
}
```

## Error Messages ที่ User เห็น

```
API Timeout (AI ช้า):
┌─────────────────────────────────────┐
│ ⏳ หลิงกำลังคิดอยู่...             │
│ ใช้เวลานานกว่าปกตินิดหน่อย        │
│ [รอต่อ] [ลองใหม่]                  │
└─────────────────────────────────────┘

Network Offline:
┌─────────────────────────────────────┐
│ 📶 ไม่มีอินเทอร์เน็ต               │
│ ระหว่างนี้ทบทวน Flashcard ได้เลย  │
│ [ไป Flashcard]                     │
└─────────────────────────────────────┘

Mic Permission Denied:
┌─────────────────────────────────────┐
│ 🎙️ ต้องการสิทธิ์ไมค์               │
│ Settings → ใน browser              │
│ อนุญาต microphone สำหรับ LinguaQuest│
│ [ดูวิธี] [พิมพ์แทนได้]             │
└─────────────────────────────────────┘

SpeechSuper Score Error:
→ แสดง transcript text ปกติ
→ ซ่อน tone heatmap
→ "ไม่สามารถวัด tone ได้ครั้งนี้"
→ ไม่ interrupt บทสนทนา

AI Judge Fail (output ไม่ผ่าน):
→ Regenerate เงียบๆ (user ไม่รู้)
→ ถ้า regenerate 3 ครั้งแล้วยังไม่ผ่าน
   → ใช้ output ดีที่สุดจาก 3 ครั้ง
   → Log สำหรับ prompt improvement
```

## Edge Cases สำคัญ

```
1. User พูดภาษาไทยในช่อง Chinese input:
   → AI ตอบ: "พูดเป็นภาษาจีนได้เลยครับ 😊
              ลองพูดว่า [คำที่เหมาะสม] ดูนะ"
   → ไม่ error ไม่ตัดสิน

2. User พูดเสียงเงียบเกินไป:
   → waveform ตรวจจับ amplitude ต่ำ
   → แจ้ง: "ไม่ได้ยินชัดเจน ลองพูดดังขึ้นนิดนึง"
   → ไม่ submit ไป API ถ้า audio blank

3. Session หมด token (context ยาวมาก):
   → Auto compress: เก็บแค่ last 3 turns
   → ไม่ขาดตอน user ไม่รู้สึก

4. User กดออกกลาง session:
   → Save progress อัตโนมัติ
   → เมื่อกลับมา: "ต่อจากตรงที่ค้างไว้มั้ย?"
   → [ต่อเลย] [เริ่มใหม่]

5. Streak break เพราะ timezone:
   → ใช้ user's local timezone เสมอ
   → Grace period: เรียนก่อน 02:00 ยังนับวันเดิม

6. App update ระหว่างใช้งาน:
   → Service worker update quietly
   → แจ้ง user แค่ครั้งเดียวด้วย banner
   → ไม่บังคับ refresh กลางบทสนทนา
```

---

# 4. 🎮 Gamification Detail

## XP System

```typescript
// XP ที่ได้จากแต่ละ action
const XP_REWARDS = {
  // Session completion
  session_complete_easy:   40,
  session_complete_medium: 60,
  session_complete_hard:   80,
  session_perfect_score:   20,   // bonus ถ้า avg ≥ 90%

  // Flashcard
  flashcard_review:        2,    // per card
  flashcard_streak_5:      10,   // ทำ 5 ใบติดกัน
  flashcard_all_correct:   15,   // ทำถูกหมดใน session

  // Speaking
  speaking_score_70:       5,
  speaking_score_80:       10,
  speaking_score_90:       20,
  speaking_improvement:    10,   // ดีขึ้นจากเมื่อวาน

  // Streak
  streak_7days:            50,
  streak_14days:           100,
  streak_30days:           300,
  streak_100days:          1000,

  // First time
  first_session:           100,
  first_real_talk:         50,
  first_vocab_100:         50,
}
```

---

## Level System

```
Level = สะสม XP รวม

Level 1:  0 XP       🌱 Beginner
Level 2:  200 XP     🌿 Learner
Level 3:  500 XP     🌳 Explorer
Level 4:  1,000 XP   ⭐ Communicator
Level 5:  2,000 XP   🔥 Speaker
Level 6:  4,000 XP   💎 Fluent
Level 7:  8,000 XP   🏆 Master
Level 8:  15,000 XP  👑 Champion
Level 9:  30,000 XP  🌟 Legend

Level up animation:
→ Full screen celebration 2 วิ
→ แสดง badge ใหม่
→ Shareable card ออก social ได้
```

---

## Badge System

```
STREAK BADGES:
🔥 7-Day Warrior    — streak 7 วัน
⚡ 14-Day Thunder   — streak 14 วัน
💎 30-Day Diamond   — streak 30 วัน
👑 100-Day Legend   — streak 100 วัน

SPEAKING BADGES:
🗣️ First Words      — จบ session แรก
🎯 Tone Master      — tone score ≥ 90% ครั้งแรก
🏆 Perfect Speaker  — speaking 90%+ ครั้งแรก
📈 Improving Fast   — เพิ่มขึ้น 20% ใน 7 วัน

VOCAB BADGES:
📚 Word Collector   — มี 100 cards ใน SRS
📖 Bookworm         — มี 500 cards ใน SRS
🎓 HSK Scholar      — mastered HSK 1 ทั้งหมด

SPECIAL BADGES:
🌟 Early Adopter    — สมัครในช่วง beta
🐒 Founding Monkey  — 100 users แรก
🏅 Challenge King   — ทำ Real Talk ครั้งแรก
```

---

## Streak System Detail

```typescript
// Streak logic ที่ fair
interface StreakState {
  current: number
  longest: number
  freeze_available: number   // "streak shield"
  last_activity_date: string
}

// Streak Freeze (ป้องกัน streak หายเพราะวันป่วย)
// ได้ 1 freeze ทุกๆ 7 วัน streak
// ใช้ได้ auto หรือ manual

// Grace Period
const GRACE_PERIOD_HOURS = 2  // ก่อน 02:00 ยังนับวันเดิม

function calculateStreak(
  lastActivity: Date,
  now: Date,
  freeze: number
): StreakResult {
  const daysDiff = getDaysDiff(lastActivity, now)

  if (daysDiff === 0) return { maintained: true }
  if (daysDiff === 1) return { maintained: true, increment: true }
  if (daysDiff === 2 && freeze > 0) {
    return { maintained: true, usedFreeze: true }
  }
  return { maintained: false, reset: true }
}
```

---

## Leaderboard

```
Weekly XP Leaderboard:
→ Reset ทุกวันจันทร์ 00:00
→ แสดงแค่ Friends + Top 10 global
→ ไม่ gamify แบบ toxic

┌─────────────────────────────────────┐
│ 🏆 สัปดาห์นี้ · รีเซ็ต จ. นี้      │
│                                     │
│ 1. คุณ         ████████  820 XP    │
│ 2. Friend A    ███████   740 XP    │
│ 3. Friend B    ██████    680 XP    │
│ ─────────────────────────────────── │
│ 47. นาย X      ██        240 XP    │
└─────────────────────────────────────┘

ไม่แสดง: "คุณกำลังแพ้ Friend B อยู่"
แสดง: "อีก 80 XP ขึ้น #2 ได้!"
```

---

# 5. 📱 Offline & PWA Strategy

## สิ่งที่ทำได้ Offline

```
✅ ทบทวน Flashcard (SRS)
   → cards cache ใน IndexedDB
   → sync เมื่อ online

✅ ดู Grammar Hub
   → cache ใน service worker

✅ ดู Session History
   → cache ล่าสุด 10 sessions

✅ ดู Study Plan
   → cache plan ปัจจุบัน

❌ ทำไม่ได้ Offline:
→ AI Companion (ต้องการ Qwen3 API)
→ Speaking Coach (ต้องการ SpeechSuper)
→ New content generation
```

---

## PWA Setup

```typescript
// apps/web/src/app/manifest.ts
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LinguaQuest',
    short_name: 'LinguaQuest',
    description: 'Talk More, Worry Less.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAF9',
    theme_color: '#F97316',
    icons: [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    // Deep link support
    shortcuts: [
      {
        name: 'เริ่ม Session',
        url: '/speak',
        icons: [{ src: '/icons/speak.png', sizes: '96x96' }]
      },
      {
        name: 'ทบทวน Flashcard',
        url: '/learn/flashcard',
        icons: [{ src: '/icons/flashcard.png', sizes: '96x96' }]
      }
    ]
  }
}
```

---

## Service Worker Cache Strategy

```typescript
// apps/web/src/app/sw.ts

// Cache strategies ต่างกันตาม content type

// Static assets → Cache First
// (icons, fonts, CSS, JS)
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'static-assets',
    plugins: [new workbox.expiration.ExpirationPlugin({
      maxAgeSeconds: 30 * 24 * 60 * 60  // 30 วัน
    })]
  })
)

// HSK Vocab data → Stale While Revalidate
// (ข้อมูลไม่เปลี่ยน cache นาน)
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/api/vocab'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'vocab-data',
    plugins: [new workbox.expiration.ExpirationPlugin({
      maxAgeSeconds: 7 * 24 * 60 * 60   // 7 วัน
    })]
  })
)

// AI API → Network Only (ต้องการ real-time)
workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/api/session'),
  new workbox.strategies.NetworkOnly()
)

// Pages → Network First, fallback to cache
workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 5,
  })
)
```

---

## Offline Screen

```
เมื่อ user พยายาม start AI session ขณะ offline:

┌─────────────────────────────────────┐
│ 📶 ต้องการอินเทอร์เน็ต             │
│                                     │
│ AI Companion ต้องการ connection    │
│                                     │
│ ระหว่างนี้ทำสิ่งเหล่านี้ได้:      │
│                                     │
│ [📚 ทบทวน 15 Flashcards]           │
│ [📖 Grammar Hub]                   │
│ [📊 ดู Progress]                   │
│                                     │
└─────────────────────────────────────┘
```

---

## Install Prompt (PWA Add to Home Screen)

```typescript
// แสดงหลังจาก user ใช้งาน 3 sessions
// ไม่ popup ทันที

let deferredPrompt: BeforeInstallPromptEvent | null = null

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
})

// แสดงหลัง session ที่ 3
function showInstallBanner() {
  if (!deferredPrompt) return
  if (sessionCount < 3) return

  // Banner ด้านล่าง
  showBanner({
    message: "📱 เพิ่มลงหน้าจอ เปิดได้เร็วขึ้น",
    action: "เพิ่มเลย",
    onAction: () => deferredPrompt?.prompt()
  })
}
```

---

## IndexedDB Schema (Offline Storage)

```typescript
// Flashcards สำหรับ offline review
interface OfflineDB {
  flashcards: {
    id: string
    front_zh: string
    pinyin: string
    meaning_th: string
    audio_url: string
    due_date: string
    stability: number
  }[]

  grammar_rules: {
    id: string
    title: string
    content: string
    cached_at: string
  }[]

  recent_sessions: {
    id: string
    summary: SessionSummary
    completed_at: string
  }[]  // max 10
}

// Sync queue สำหรับ offline actions
interface SyncQueue {
  pending: {
    type: 'flashcard_review' | 'xp_update'
    data: any
    created_at: string
  }[]
}
```

---

# 📋 Implementation Priority Matrix

```
CRITICAL — ทำก่อน beta launch:
□ Onboarding Steps 1-6 ครบ
□ Push notification permission flow
□ Streak reminder (1 notification/day)
□ Network error handling (timeout + retry)
□ Mic permission denied UX
□ XP + Level system basic
□ Streak system (with grace period)
□ PWA manifest + icons
□ Offline flashcard (IndexedDB basic)

IMPORTANT — ทำใน 1 เดือน:
□ Due card notification
□ Weekly summary notification
□ Badge system (8 badges พื้นฐาน)
□ Leaderboard (friends only)
□ Service worker caching
□ Install prompt (after 3 sessions)
□ Session auto-save + resume

NICE TO HAVE — Phase 2:
□ Optimal notification timing ML
□ Streak freeze purchase
□ Full badge collection (50+)
□ Global leaderboard
□ Offline mode full
□ Deep link shortcuts
```

---

# 🔗 Document Links

```
ไฟล์ที่เชื่อมกัน:
→ LinguaQuest_UX_Architecture.md
→ LinguaQuest_DB_Quality.md
→ LinguaQuest_Brainstorm.md
→ LinguaQuest_Flashcard_History.md
→ linguaquest-spec.md (v2.1)
→ LinguaQuest_Battle_Plan.docx
```

---

_Last updated: 2026-04-26_ _Owner: Faeif (Lead Dev + Product)_ _Status: Ready for Sprint Planning_