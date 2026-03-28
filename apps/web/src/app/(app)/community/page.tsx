import { ArrowRight, BookOpen, FileText, MessageSquare, Sparkles, Users } from 'lucide-react'
import Link from 'next/link'

const sectionCardClass = 'rounded-3xl border border-[#E8E0D5] bg-[#FFFEFB] p-6 shadow-sm'

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
    note: 'Community set -> Save -> ใช้ต่อใน Vocab flow',
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
    note: 'Community exam set -> Save -> ใช้ต่อใน Exam flow',
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

const communityPrinciples = [
  'Community ไม่ใช่แค่ที่ดู content แต่เป็นพื้นที่ที่ผู้ใช้ช่วยกันสร้างสิ่งใหม่',
  'สิ่งที่ผู้ใช้บันทึกจากหน้านี้ต้องกลับไปใช้ต่อใน Vocab และ Exam ได้จริง',
  'ทั้งโพสต์ deck และชุดข้อสอบควรต่อยอดเป็นการฝึกในระบบหลักได้ทันที',
]

const relatedFeatures = [
  {
    href: '/flashcard',
    title: 'Open Vocab Feature',
    description: 'ใช้ชุดคำศัพท์ที่บันทึกจาก Community ต่อใน flow การทบทวน',
    icon: BookOpen,
    accent: 'text-[#7D8B6A]',
  },
  {
    href: '/exam',
    title: 'Open Exam Feature',
    description: 'ใช้ชุดข้อสอบที่บันทึกจาก Community ต่อใน flow การฝึกสอบ',
    icon: FileText,
    accent: 'text-[#9A9179]',
  },
]

export default function CommunityPage() {
  return (
    <div className="space-y-8 pb-12">
      <section className={`${sectionCardClass} p-6 sm:p-8`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#C4704B]/10 px-3 py-1 text-xs font-semibold text-[#C4704B]">
            <Users size={14} />
            Community-first learning space
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F4EEE5] px-3 py-1 text-xs font-medium text-[#7A7067]">
            Blog + Shared Vocab + Shared Exam
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[#3D3630] sm:text-4xl">
              Community Hub
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[#7A7067] sm:text-base">
              หน้า Community คือพื้นที่กลางที่ผู้ใช้คุยกัน สร้าง resource ของตัวเอง และแชร์ต่อให้คนอื่นบันทึกกลับไปใช้ใน
              flow หลักของ LinguaQuest ได้
            </p>
          </div>

          <div className="rounded-3xl bg-[#3D3630] p-5 text-[#FFFEFB]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-base font-semibold">What This Page Should Do</h2>
                <p className="text-sm text-white/70">สรุปหน้าที่ของหน้า Community แบบสั้นและตรง</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {communityPrinciples.map((principle) => (
                <div
                  key={principle}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white/80"
                >
                  {principle}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-[#3D3630]">Core Sections</h2>
          <p className="text-sm text-[#7A7067]">แบ่งหน้าออกเป็น 3 ส่วนหลักให้แต่ละบทบาทชัดและไม่แย่งกันเด่น</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {communityPillars.map((pillar) => (
            <div key={pillar.title} className={sectionCardClass}>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${pillar.background}`}
              >
                <pillar.icon size={22} className={pillar.accent} />
              </div>

              <h3 className="mt-4 text-xl font-semibold text-[#3D3630]">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#7A7067]">{pillar.description}</p>

              <div className="mt-5 space-y-2">
                {pillar.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="rounded-2xl bg-[#FAF7F2] px-4 py-3 text-sm leading-6 text-[#5F574F]"
                  >
                    {highlight}
                  </div>
                ))}
              </div>

              <div className="mt-5 inline-flex rounded-full bg-[#F4EEE5] px-3 py-1 text-xs font-medium text-[#7A7067]">
                {pillar.note}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className={`${sectionCardClass} space-y-5`}>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-[#3D3630]">How Content Moves</h2>
            <p className="text-sm text-[#7A7067]">
              อธิบายเส้นทางของ content จาก Community กลับเข้าไปใน feature หลักให้เข้าใจง่าย
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
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

        <div className={sectionCardClass}>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-[#3D3630]">Related Features</h2>
            <p className="text-sm text-[#7A7067]">shared content ควรถูกพาไปใช้งานต่อได้จากหน้านี้โดยตรง</p>
          </div>

          <div className="mt-5 space-y-3">
            {relatedFeatures.map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="flex items-center justify-between rounded-2xl bg-[#FAF7F2] px-4 py-4 text-sm text-[#3D3630] transition-colors hover:bg-[#F4EEE5]"
              >
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <feature.icon size={18} className={feature.accent} />
                    <p className="font-semibold">{feature.title}</p>
                  </div>
                  <p className="mt-1 text-[#7A7067]">{feature.description}</p>
                </div>
                <ArrowRight size={18} className="shrink-0 text-[#9A9179]" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
