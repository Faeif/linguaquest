'use client'

import { GraduationCap, Settings2, UserRound } from 'lucide-react'
import { PERSONAS } from '../constants/personas'
import type { CompanionId, SessionMode } from '../types'

interface Props {
  selectedPersona: CompanionId
  onSelectPersona: (id: CompanionId) => void
  selectedMode: SessionMode
  onSelectMode: (mode: SessionMode) => void
}

export default function CompanionSetup({
  selectedPersona,
  onSelectPersona,
  selectedMode,
  onSelectMode,
}: Props) {
  return (
    <div className="flex flex-col gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mt-4">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Settings2 className="w-5 h-5 text-gray-400" />
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
          Session Settings
        </h2>
      </div>

      {/* Persona Selection */}
      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-gray-600 pl-1">Companion Partner</span>
        <div className="flex flex-col sm:flex-row gap-3">
          {Object.values(PERSONAS).map((persona) => {
            const isSelected = selectedPersona === persona.id
            return (
              <button
                type="button"
                key={persona.id}
                onClick={() => onSelectPersona(persona.id as CompanionId)}
                className={`flex-1 py-4 px-5 rounded-2xl border-2 text-base font-bold transition-all duration-200 ${
                  isSelected
                    ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                    : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {persona.name_zh}{' '}
                <span className="text-sm font-medium opacity-80">({persona.name_th})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mode Selection */}
      <div className="flex flex-col gap-3 mt-4">
        <span className="text-sm font-semibold text-gray-600 pl-1">Conversation Mode</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSelectMode('learner')}
            className={`flex items-center justify-start gap-4 py-4 px-5 rounded-2xl border-2 transition-all duration-200 ${
              selectedMode === 'learner'
                ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            <div
              className={`p-2 rounded-full ${selectedMode === 'learner' ? 'bg-white/20' : 'bg-gray-200'}`}
            >
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-base">Learner Mode</span>
              <span
                className={`text-xs font-medium mt-0.5 ${selectedMode === 'learner' ? 'text-gray-300' : 'text-gray-400'}`}
              >
                Guided with Native Hints
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectMode('real_talk')}
            className={`flex items-center justify-start gap-4 py-4 px-5 rounded-2xl border-2 transition-all duration-200 ${
              selectedMode === 'real_talk'
                ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            <div
              className={`p-2 rounded-full ${selectedMode === 'real_talk' ? 'bg-white/20' : 'bg-gray-200'}`}
            >
              <UserRound className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-base">Real Talk</span>
              <span
                className={`text-xs font-medium mt-0.5 ${selectedMode === 'real_talk' ? 'text-gray-300' : 'text-gray-400'}`}
              >
                Natural 100% Flow
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
