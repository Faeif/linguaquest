import { BookOpen } from 'lucide-react'

export default function FlashcardPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-[#7D8B6A]/10 flex items-center justify-center">
        <BookOpen size={32} className="text-[#7D8B6A]" />
      </div>
      <h1 className="text-2xl font-semibold text-[#3D3630]">Flashcards (SRS)</h1>
      <p className="text-[#7A7067] text-center max-w-md">
        ทบทวนคำศัพท์ตามระดับ HSK ด้วยระบบ Spaced Repetition Algorithm (Coming Soon)
      </p>
    </div>
  )
}
