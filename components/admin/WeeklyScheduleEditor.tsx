'use client'

import { Switch } from '@/components/ui/switch'
import { Clock } from 'lucide-react'
import type { WeeklySchedule, DayOfWeek, DaySchedule } from '@/types'
import { cn } from '@/lib/utils'

const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
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

  const selectClassName = cn(
    'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900',
    'transition-all hover:border-gray-300',
    'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20'
  )

  return (
    <div className="space-y-2">
      {DAYS.map(({ key, label, short }) => {
        const day = schedule[key]
        const isWeekend = key === 'saturday' || key === 'sunday'

        return (
          <div
            key={key}
            className={cn(
              'group flex items-center gap-4 rounded-xl border px-4 py-3 transition-all',
              day.enabled
                ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-transparent hover:border-emerald-300'
                : 'border-gray-200 bg-gray-50/50 hover:border-gray-300',
              isWeekend && !day.enabled && 'opacity-75'
            )}
          >
            <Switch
              checked={day.enabled}
              onCheckedChange={(enabled) => updateDay(key, { enabled })}
              className="data-[state=checked]:bg-emerald-500"
            />

            <div className="flex w-24 items-center gap-2">
              <span
                className={cn(
                  'text-sm font-semibold transition-colors',
                  day.enabled ? 'text-gray-900' : 'text-gray-400'
                )}
              >
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{short}</span>
              </span>
            </div>

            {day.enabled ? (
              <div className="flex flex-1 items-center gap-2">
                <Clock
                  className={cn(
                    'hidden h-4 w-4 transition-colors sm:block',
                    day.enabled ? 'text-emerald-500' : 'text-gray-300'
                  )}
                />
                <select
                  value={day.startTime}
                  onChange={(e) => updateDay(key, { startTime: e.target.value })}
                  className={selectClassName}
                  aria-label={`${label} start time`}
                >
                  {TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="text-sm font-medium text-gray-400">to</span>
                <select
                  value={day.endTime}
                  onChange={(e) => updateDay(key, { endTime: e.target.value })}
                  className={selectClassName}
                  aria-label={`${label} end time`}
                >
                  {TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-1 items-center">
                <span className="text-sm font-medium text-gray-400">Unavailable</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
