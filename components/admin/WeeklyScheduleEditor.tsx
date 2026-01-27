'use client'

import { Switch } from '@/components/ui/switch'
import type { WeeklySchedule, DayOfWeek, DaySchedule } from '@/types'

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]

const TIME_OPTIONS = Array.from({ length: 24 * 2 }, (_, i) => {
  const hours = Math.floor(i / 2)
  const minutes = (i % 2) * 30
  const value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  const label = new Date(2000, 0, 1, hours, minutes).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return { value, label }
})

interface WeeklyScheduleEditorProps {
  schedule: WeeklySchedule
  onChange: (schedule: WeeklySchedule) => void
}

export function WeeklyScheduleEditor({ schedule, onChange }: WeeklyScheduleEditorProps) {
  const updateDay = (day: DayOfWeek, update: Partial<DaySchedule>) => {
    onChange({
      ...schedule,
      [day]: { ...schedule[day], ...update },
    })
  }

  return (
    <div className="space-y-3">
      {DAYS.map(({ key, label }) => {
        const day = schedule[key]
        return (
          <div
            key={key}
            className={`flex items-center gap-4 rounded-lg border px-4 py-3 ${
              day.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
            }`}
          >
            <Switch
              checked={day.enabled}
              onCheckedChange={(enabled) => updateDay(key, { enabled })}
            />
            <span className={`w-24 text-sm font-medium ${day.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
              {label}
            </span>
            {day.enabled ? (
              <div className="flex items-center gap-2">
                <select
                  value={day.startTime}
                  onChange={(e) => updateDay(key, { startTime: e.target.value })}
                  className="rounded-md border border-gray-200 px-2 py-1.5 text-sm"
                >
                  {TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-400">to</span>
                <select
                  value={day.endTime}
                  onChange={(e) => updateDay(key, { endTime: e.target.value })}
                  className="rounded-md border border-gray-200 px-2 py-1.5 text-sm"
                >
                  {TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="text-sm text-gray-400">Unavailable</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
