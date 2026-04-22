'use client'

import { Mic } from 'lucide-react'

interface MegaMicProps {
  isRecording: boolean
  isProcessing: boolean
  onStart: () => void
  onStop: () => void
}

// Sound wave blobs matching app's EARTHY theme
// Accent is Terracotta (#C4704B)
const BLOBS = [
  { color: 'var(--accent)', delay: '0ms', height: 36 },
  { color: 'var(--foreground)', delay: '120ms', height: 52 },
  { color: 'var(--accent)', delay: '240ms', height: 44 },
  { color: 'var(--text-secondary)', delay: '360ms', height: 32 },
]

export default function MegaMicButton({
  isRecording,
  isProcessing,
  onStart,
  onStop,
}: MegaMicProps) {
  return (
    <div className="flex flex-col items-center gap-5 w-full select-none">
      {/* Sound Wave Visualizer */}
      <div className="flex items-center justify-center gap-3 h-20" aria-hidden="true">
        {BLOBS.map((blob) => (
          <div
            key={blob.delay}
            className="w-8 rounded-[16px] transition-all duration-300"
            style={{
              backgroundColor: blob.color,
              height: isRecording ? `${blob.height}px` : '16px',
              animationDelay: blob.delay,
              animation:
                isRecording && !isProcessing
                  ? `blobPulse 0.9s ease-in-out ${blob.delay} infinite alternate`
                  : 'none',
              opacity: isProcessing ? 0.4 : 1,
            }}
          />
        ))}
      </div>

      {/* Primary Interaction Button */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault()
          if (!isProcessing) onStart()
        }}
        onPointerUp={(e) => {
          e.preventDefault()
          if (isRecording) onStop()
        }}
        onPointerLeave={(e) => {
          e.preventDefault()
          if (isRecording) onStop()
        }}
        disabled={isProcessing}
        className={`
          relative flex items-center justify-center gap-3 px-12 py-5 rounded-full
          font-bold text-lg tracking-wide transition-all duration-300 shadow-sm
          select-none cursor-pointer touch-none
          ${
            isRecording
              ? 'bg-accent text-surface shadow-xl scale-105 opacity-100'
              : 'bg-foreground text-surface hover:opacity-90 scale-100'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          active:scale-95
        `}
        aria-label="Hold to speak"
        style={{ WebkitTouchCallout: 'none' }}
      >
        <Mic className={`w-5 h-5 transition-all ${isRecording ? 'animate-pulse' : ''}`} />
        <span>
          {isProcessing ? 'Processing...' : isRecording ? 'Listening...' : 'Hold to Speak'}
        </span>

        {/* Pulse Ring when listening */}
        {isRecording && !isProcessing && (
          <span
            className="absolute inset-0 rounded-full bg-accent animate-ping pointer-events-none"
            style={{ animationDuration: '1.5s', opacity: 0.2 }}
          />
        )}
      </button>

      {/* Inline Keyframe for blob animation */}
      <style>{`
        @keyframes blobPulse {
          from { transform: scaleY(1); }
          to   { transform: scaleY(1.6); }
        }
      `}</style>
    </div>
  )
}
