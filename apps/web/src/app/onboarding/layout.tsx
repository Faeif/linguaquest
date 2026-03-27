import type { ReactNode } from 'react'

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col items-center justify-center p-4">
      {/* Super minimalist header, just a logo mark */}
      <header className="absolute top-0 left-0 w-full p-6 flex justify-center">
        <h1 className="text-xl font-bold tracking-tighter text-[#8B5E3C]">
          Lingua<span className="text-stone-800">Quest</span>
        </h1>
      </header>

      <main className="w-full max-w-md">{children}</main>
    </div>
  )
}
