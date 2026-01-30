'use client'

import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  const period = hours < 12 ? 'AM' : 'PM'
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  const label = `${displayHour}:${String(minutes).padStart(2, '0')} ${period}`
  return { value, label, period }
})

interface WeeklyScheduleEditorProps {
  schedule: WeeklySchedule
  onChange: (schedule: WeeklySchedule) => void
}

function TimeSelect({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (value: string) => void
  label: string
}) {
  const selectedOption = TIME_OPTIONS.find((opt) => opt.value === value)

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={label}
        className="h-9 border-gray-200 bg-white px-3 text-sm font-medium hover:border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20"
        style={{ width: '8.5rem' }}
      >
        <SelectValue>
          {selectedOption && (
            <span className="flex items-center gap-1.5">
              <span>{selectedOption.label.split(' ')[0]}</span>
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                {selectedOption.period}
              </span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-60 bg-white/95 backdrop-blur-xl">
        {TIME_OPTIONS.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="hover:bg-emerald-50 focus:bg-emerald-50 data-[state=checked]:bg-emerald-100"
          >
            <span className="flex items-center gap-2">
              <span className="font-medium">{opt.label.split(' ')[0]}</span>
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                  opt.period === 'AM'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-orange-100 text-orange-700'
                )}
              >
                {opt.period}
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function WeeklyScheduleEditor({ schedule, onChange }: WeeklyScheduleEditorProps) {
  const updateDay = (day: DayOfWeek, update: Partial<DaySchedule>) => {
    onChange({
      ...schedule,
      [day]: { ...schedule[day], ...update },
    })
  }

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
                <TimeSelect
                  value={day.startTime}
                  onChange={(startTime) => updateDay(key, { startTime })}
                  label={`${label} start time`}
                />
                <span className="text-sm font-medium text-gray-400">to</span>
                <TimeSelect
                  value={day.endTime}
                  onChange={(endTime) => updateDay(key, { endTime })}
                  label={`${label} end time`}
                />
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
