// Instant skeleton shown while profile data loads — prevents blank screen during TTFB
export default function ProfileLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 lg:pb-0 animate-pulse">
      {/* User Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="w-[72px] h-[72px] rounded-full bg-[#E8E0D5]" />
        <div className="space-y-2">
          <div className="h-7 w-36 bg-[#E8E0D5] rounded-lg" />
          <div className="h-6 w-24 bg-[#E8E0D5]/60 rounded-full" />
        </div>
      </div>

      {/* Stats Row skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white border border-[#E8E0D5] rounded-xl p-4 flex flex-col items-center">
            <div className="w-5 h-5 rounded bg-[#E8E0D5] mb-2" />
            <div className="h-7 w-12 bg-[#E8E0D5] rounded mb-1" />
            <div className="h-3 w-16 bg-[#E8E0D5]/60 rounded" />
          </div>
        ))}
      </div>

      {/* Progress bar skeleton */}
      <div className="bg-white border border-[#E8E0D5] rounded-xl p-5 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-5 w-40 bg-[#E8E0D5] rounded" />
          <div className="h-4 w-20 bg-[#E8E0D5]/60 rounded" />
        </div>
        <div className="h-2.5 w-full bg-[#E8E0D5] rounded-full" />
        <div className="h-3 w-56 bg-[#E8E0D5]/60 rounded" />
      </div>

      {/* Heatmap skeleton */}
      <div className="bg-white border border-[#E8E0D5] rounded-xl p-5 space-y-4">
        <div className="h-5 w-48 bg-[#E8E0D5] rounded" />
        <div className="flex gap-2 justify-between">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <div className="w-full aspect-square rounded-lg bg-[#E8E0D5]" />
              <div className="h-2.5 w-5 bg-[#E8E0D5]/60 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Settings skeleton */}
      <div className="bg-white border border-[#E8E0D5] rounded-xl overflow-hidden">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 border-b border-[#E8E0D5] last:border-b-0">
            <div className="w-8 h-8 rounded-lg bg-[#E8E0D5]" />
            <div className="h-4 w-40 bg-[#E8E0D5] rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
