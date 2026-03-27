import { ShoppingBag } from 'lucide-react'

export default function MarketplacePage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-[#9A9179]/10 flex items-center justify-center">
        <ShoppingBag size={32} className="text-[#9A9179]" />
      </div>
      <h1 className="text-2xl font-semibold text-[#3D3630]">Community Market</h1>
      <p className="text-[#7A7067] text-center max-w-md">
        แลกเปลี่ยน Deck คำศัพท์และเครื่องมือเรียนภาษาจากเพื่อนๆ ใน Community (Coming Soon)
      </p>
    </div>
  )
}
