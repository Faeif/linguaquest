import { ArrowRight, BookOpen, FileText, MessageSquare, Sparkles, Users } from 'lucide-react'
import Link from 'next/link'

const communityPillars = [
  {
    title: 'Blog',
    icon: MessageSquare,
    accent: 'text-[#C4704B]',
    background: 'bg-[#C4704B]/10',
    description: 'พื้นที่สำหรับสร้างโพสต์ พูดคุย ถามตอบ และแชร์ประสบการณ์การเรียนจีนของแต่ละคน',
    highlights: [
      'ตั้งกระทู้ถาม grammar, writing, speaking หรือแชร์เทคนิคสอบ',
      'เปิดพื้นที่คอมเมนต์และ discussion รอบโพสต์ของผู้ใช้',
      'ใช้เป็น social layer ของการเรียน ไม่ใช่แค่คลัง resource',
    ],
    note: 'เน้นบทสนทนาและการแลกเปลี่ยนระหว่างผู้เรียน',
  },
  {
    title: 'Shared Vocab',
    icon: BookOpen,
    accent: 'text-[#7D8B6A]',
    background: 'bg-[#7D8B6A]/10',
    description: 'ชุดคำศัพท์ที่ผู้ใช้สร้างเองแล้วนำมาแชร์กัน ไม่ใช่ vocabulary set ตั้งต้นของระบบ',
    highlights: [
      'ผู้ใช้สร้าง deck ตามหัวข้อ เช่น HSK, ธุรกิจ, ท่องเที่ยว หรือจากบทเรียนจริง',
      'คนอื่นสามารถบันทึกชุดคำศัพท์เข้า library ของตัวเองได้',
      'ชุดที่บันทึกแล้วควรถูกนำไปใช้ร่วมกับ feature Vocab ใน sidebar ต่อได้',
    ],
    note: 'Community set -> Save -> ใช้ต่อใน Vocab flow หลัก',
  },
  {
    title: 'Shared Exam',
    icon: FileText,
    accent: 'text-[#9A9179]',
    background: 'bg-[#9A9179]/10',
    description: 'ใช้แนวคิดเดียวกับ Shared Vocab แต่เปลี่ยนจาก deck คำศัพท์เป็นชุดข้อสอบหรือชุดฝึกสอบ',
    highlights: [
      'ผู้ใช้แชร์ mock set, section drill หรือชุดข้อสอบเฉพาะหัวข้อได้',
      'คนอื่นบันทึกชุดสอบที่สนใจเก็บไว้ใน account ของตัวเอง',
      'ชุดที่บันทึกแล้วควรเชื่อมกลับไปใช้กับ feature Exam ใน sidebar ได้โดยตรง',
    ],
    note: 'Community exam set -> Save -> ใช้ต่อใน Exam flow หลัก',
  },
]

const connectionFlow = [
  {
    title: 'Discover',
    description: 'ค้นหาโพสต์ deck และ exam set จาก community ตามเป้าหมายการเรียนของตัวเอง',
  },
  {
    title: 'Save',
    description: 'บันทึกชุดคำศัพท์หรือชุดข้อสอบจากผู้ใช้อื่นเข้า library ส่วนตัวของตัวเอง',
  },
  {
    title: 'Practice',
    description: 'กลับไปฝึกต่อใน feature Vocab และ Exam จาก sidebar โดยใช้ content ที่บันทึกไว้',
  },
]

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#E8E0D5] bg-[#FFFEFB] p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#C4704B]/10 px-3 py-1 text-xs font-semibold text-[#C4704B]">
            <Users size={14} />
            Community-first learning space
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F4EEE5] px-3 py-1 text-xs font-medium text-[#7A7067]">
            Blog + Shared Vocab + Shared Exam
          </span>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-[#3D3630] sm:text-4xl">
                Community Hub
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[#7A7067] sm:text-base">
                หน้า Community จะเป็นพื้นที่กลางของผู้ใช้ในการคุยกัน สร้าง resource ของตัวเอง และแชร์ต่อให้คนอื่นนำไป
                บันทึกและใช้งานต่อในระบบหลักของ LinguaQuest
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#FAF7F2] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A9179]">
                  Social Layer
                </p>
                <p className="mt-2 text-lg font-semibold text-[#3D3630]">Blog</p>
                <p className="mt-1 text-sm text-[#7A7067]">ให้ผู้ใช้ตั้งโพสต์และเปิด discussion กันได้จริง</p>
              </div>
              <div className="rounded-2xl bg-[#FAF7F2] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A9179]">
                  Shared Assets
                </p>
                <p className="mt-2 text-lg font-semibold text-[#3D3630]">Vocab</p>
                <p className="mt-1 text-sm text-[#7A7067]">ชุดคำศัพท์จากผู้ใช้ที่สามารถบันทึกไปใช้ต่อได้</p>
              </div>
              <div className="rounded-2xl bg-[#FAF7F2] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A9179]">
                  Shared Assets
                </p>
                <p className="mt-2 text-lg font-semibold text-[#3D3630]">Exam</p>
                <p className="mt-1 text-sm text-[#7A7067]">
                  ชุดข้อสอบจากผู้ใช้ในแนวคิดเดียวกับ shared vocab
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#E8E0D5] bg-[#3D3630] p-5 text-[#FFFEFB]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold">แนวคิดหลักของ Community</p>
                <p className="text-sm text-white/70">
                  ไม่ใช่ market อย่างเดียว แต่เป็น user-generated learning layer
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm leading-6 text-white/80">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                ผู้ใช้สร้าง content ของตัวเองได้ทั้งโพสต์ deck คำศัพท์ และชุดข้อสอบ
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                content ที่ชอบไม่ควรจบอยู่ใน Community แต่ควรถูก save กลับไปใช้ใน product flow หลักได้
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                ทำให้ Community เป็นทั้งพื้นที่สนทนาและแหล่ง resource ที่เติบโตจากผู้ใช้จริง
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {communityPillars.map((pillar) => (
          <div
            key={pillar.title}
            className="rounded-3xl border border-[#E8E0D5] bg-[#FFFEFB] p-5 shadow-sm"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${pillar.background}`}
            >
              <pillar.icon size={22} className={pillar.accent} />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-[#3D3630]">{pillar.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#7A7067]">{pillar.description}</p>

            <div className="mt-4 space-y-2">
              {pillar.highlights.map((highlight) => (
                <div
                  key={highlight}
                  className="rounded-2xl border border-[#E8E0D5] bg-[#FAF7F2] px-4 py-3 text-sm text-[#5F574F]"
                >
                  {highlight}
                </div>
              ))}
            </div>

            <div className="mt-4 inline-flex rounded-full bg-[#F4EEE5] px-3 py-1 text-xs font-medium text-[#7A7067]">
              {pillar.note}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[#E8E0D5] bg-[#FFFEFB] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#3D3630]">How Community Connects Back</h2>
          <p className="mt-1 text-sm text-[#7A7067]">
            สิ่งที่เกิดใน Community ควรถูกพาออกไปใช้งานต่อใน feature หลักได้อย่างเป็นธรรมชาติ
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {connectionFlow.map((step, index) => (
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

        <div className="rounded-3xl border border-[#E8E0D5] bg-[#FFFEFB] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#3D3630]">Related Features</h2>
          <p className="mt-1 text-sm text-[#7A7067]">
            shared content ที่ถูกบันทึกจาก Community ควรไปต่อได้กับหน้าหลักที่ผู้ใช้ใช้งานจริงทุกวัน
          </p>

          <div className="mt-5 space-y-3">
            <Link
              href="/flashcard"
              className="flex items-center justify-between rounded-2xl border border-[#E8E0D5] bg-[#FAF7F2] px-4 py-4 text-sm text-[#3D3630] transition-colors hover:bg-[#F4EEE5]"
            >
              <div>
                <p className="font-semibold">Open Vocab Feature</p>
                <p className="mt-1 text-[#7A7067]">
                  ใช้ชุดคำศัพท์ที่บันทึกจาก Community ต่อใน flow การทบทวน
                </p>
              </div>
              <ArrowRight size={18} className="shrink-0 text-[#9A9179]" />
            </Link>

            <Link
              href="/reading"
              className="flex items-center justify-between rounded-2xl border border-[#E8E0D5] bg-[#FAF7F2] px-4 py-4 text-sm text-[#3D3630] transition-colors hover:bg-[#F4EEE5]"
            >
              <div>
                <p className="font-semibold">Open Exam Feature</p>
                <p className="mt-1 text-[#7A7067]">
                  ใช้ชุดข้อสอบที่บันทึกจาก Community ต่อใน flow การฝึกสอบ
                </p>
              </div>
              <ArrowRight size={18} className="shrink-0 text-[#9A9179]" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
