import { BarChart3, BookOpen, Clock3, FileText, Sparkles, Target } from 'lucide-react'

const examModes = [
  {
    title: 'Quick Mock',
    description: 'ชุดข้อสอบสั้น 10-15 นาที สำหรับ warm up ก่อนเรียนหรือทดสอบความพร้อมรายวัน',
    icon: Clock3,
    accent: 'text-[#C4704B]',
    background: 'bg-[#C4704B]/10',
  },
  {
    title: 'Section Practice',
    description: 'ฝึกเฉพาะพาร์ต เช่น อ่านจับใจความ คำศัพท์ หรือไวยากรณ์ ตามจุดที่ยังอ่อน',
    icon: FileText,
    accent: 'text-[#7D8B6A]',
    background: 'bg-[#7D8B6A]/10',
  },
  {
    title: 'Full Simulation',
    description: 'AI จัดข้อสอบจำลองจากคลังข้อสอบให้ครบรูปแบบ พร้อมเวลาจริงและระดับใกล้เคียง HSK',
    icon: Target,
    accent: 'text-[#9A9179]',
    background: 'bg-[#9A9179]/10',
  },
]

const examSignals = [
  'ดึงคำถามจากฐานข้อมูลข้อสอบที่มีอยู่แล้ว',
  'ปรับความยากตามระดับ HSK และผลล่าสุดของผู้ใช้',
  'สรุปจุดอ่อนหลังสอบเป็นรายทักษะเพื่อส่งต่อไปยัง AI Companion และ Vocab',
]

const examFlow = [
  {
    title: 'เลือกโหมดสอบ',
    description: 'เริ่มจากชุดสั้นหรือจำลองเต็มรูปแบบตามเวลาที่มี',
  },
  {
    title: 'AI จัดข้อสอบให้',
    description: 'ระบบคัดข้อจากคลังเดิมแล้วจัดลำดับใหม่ให้เหมาะกับระดับของคุณ',
  },
  {
    title: 'รับผลวิเคราะห์ต่อยอด',
    description: 'หลังสอบจะเห็นคะแนน ภาพรวมทักษะ และหัวข้อที่ควรกลับไปทบทวน',
  },
]

export default function ExamPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#E8E0D5] bg-[#FFFEFB] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#C4704B]/10 px-3 py-1 text-xs font-semibold text-[#C4704B]">
            <Sparkles size={14} />
            AI-powered exam draft
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F4EEE5] px-3 py-1 text-xs font-medium text-[#7A7067]">
            ใช้คลังข้อสอบเดิม + AI จัดชุดใหม่
          </span>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-[#3D3630] sm:text-4xl">
                Exam Simulator
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[#7A7067] sm:text-base">
                พื้นที่สำหรับจำลองข้อสอบที่ AI จะหยิบจากฐานข้อมูลข้อสอบของเรา แล้วจัดเป็นชุดฝึกที่เหมาะกับระดับ HSK
                และประวัติการทำแบบฝึกหัดของคุณ
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#FAF7F2] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A9179]">
                  Question Bank
                </p>
                <p className="mt-2 text-lg font-semibold text-[#3D3630]">Existing DB</p>
                <p className="mt-1 text-sm text-[#7A7067]">ใช้ข้อสอบจากคลังเดิมเป็นฐาน ไม่เริ่มจากศูนย์</p>
              </div>
              <div className="rounded-2xl bg-[#FAF7F2] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A9179]">
                  Adaptive Layer
                </p>
                <p className="mt-2 text-lg font-semibold text-[#3D3630]">AI Curated</p>
                <p className="mt-1 text-sm text-[#7A7067]">จัดข้อสอบใหม่ให้บาลานซ์ความยากและหัวข้อ</p>
              </div>
              <div className="rounded-2xl bg-[#FAF7F2] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A9179]">
                  After Action
                </p>
                <p className="mt-2 text-lg font-semibold text-[#3D3630]">Skill Report</p>
                <p className="mt-1 text-sm text-[#7A7067]">สรุปผลพร้อมแนะนำสิ่งที่ควรฝึกต่อทันที</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E8E0D5] bg-[#FAF7F2] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9A9179]/10">
                <BookOpen size={24} className="text-[#9A9179]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#3D3630]">แนวคิดของหน้า Exam</p>
                <p className="text-sm text-[#7A7067]">ให้รู้สึกเหมือนสนามซ้อมก่อนลงสอบจริง</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {examSignals.map((signal) => (
                <div
                  key={signal}
                  className="rounded-2xl border border-[#E8E0D5] bg-[#FFFEFB] px-4 py-3 text-sm text-[#5F574F]"
                >
                  {signal}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {examModes.map((mode) => (
          <div
            key={mode.title}
            className="rounded-3xl border border-[#E8E0D5] bg-[#FFFEFB] p-5 shadow-sm"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${mode.background}`}
            >
              <mode.icon size={22} className={mode.accent} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#3D3630]">{mode.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#7A7067]">{mode.description}</p>
            <div className="mt-4 inline-flex rounded-full bg-[#F4EEE5] px-3 py-1 text-xs font-medium text-[#7A7067]">
              UI Draft
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[#E8E0D5] bg-[#FFFEFB] p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#C4704B]/10">
              <BarChart3 size={20} className="text-[#C4704B]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#3D3630]">ผลลัพธ์ที่หน้า Exam ควรสื่อ</h2>
              <p className="text-sm text-[#7A7067]">ไม่ใช่แค่ทำข้อสอบ แต่เป็นจุดเชื่อมไปยังการฝึกต่อ</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {examFlow.map((step, index) => (
              <div key={step.title} className="rounded-2xl bg-[#FAF7F2] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A9179]">
                  Step 0{index + 1}
                </p>
                <p className="mt-2 text-base font-semibold text-[#3D3630]">{step.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#7A7067]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#E8E0D5] bg-[#3D3630] p-6 text-[#FFFEFB] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Next Fit</h2>
              <p className="text-sm text-white/70">สอดคล้องกับ ecosystem เดิมของ LinguaQuest</p>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm leading-6 text-white/80">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              เชื่อมผลสอบไปยังหน้า Vocab เพื่อสร้าง deck จากคำที่พลาดบ่อย
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              ส่งหัวข้อที่อ่อนเข้า AI Companion เพื่อให้ช่วยอธิบายและฝึกซ้ำ
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              ใช้เป็นจุดรวมสำหรับ mock exam, section drill และ progress snapshot
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
