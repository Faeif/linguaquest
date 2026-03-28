'use client'

import { Briefcase, Coffee, MessageSquare, Plane } from 'lucide-react'

interface MissionPillsProps {
  selectedTopic: string | null
  onSelectTopic: (topic: string) => void
}

const MISSIONS = [
  { id: 'greetings', label: 'Introductions', icon: MessageSquare },
  { id: 'coffee_order', label: 'Ordering Coffee', icon: Coffee },
  { id: 'airport', label: 'At the Airport', icon: Plane },
  { id: 'interview', label: 'Job Interview', icon: Briefcase },
]

export default function MissionPills({ selectedTopic, onSelectTopic }: MissionPillsProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
        Suggested Missions
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {MISSIONS.map((mission) => {
          const Icon = mission.icon
          const isSelected = selectedTopic === mission.id

          return (
            <button
              type="button"
              key={mission.id}
              onClick={() => onSelectTopic(mission.id)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 shadow-sm shadow-orange-100'
                  : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/40'
              }`}
            >
              <div
                className={`p-2 rounded-xl flex-shrink-0 ${isSelected ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-sm font-semibold leading-tight ${isSelected ? 'text-orange-900' : 'text-gray-700'}`}
              >
                {mission.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
