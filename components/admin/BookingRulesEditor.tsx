'use client'

import { Label } from '@/components/ui/label'
import { Clock, CalendarRange, Timer, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BookingRules {
  slotDurationMinutes: number
  minNoticeHours: number
  maxDaysInAdvance: number
  bufferMinutes: number
}

interface BookingRulesEditorProps {
  rules: BookingRules
  onChange: (rules: BookingRules) => void
}

const SLOT_DURATIONS = [15, 20, 30, 45, 60, 90, 120]
const BUFFER_OPTIONS = [0, 5, 10, 15, 30, 45, 60]

interface RuleFieldProps {
  icon: React.ReactNode
  label: string
  htmlFor: string
  children: React.ReactNode
}

function RuleField({ icon, label, htmlFor, children }: RuleFieldProps) {
  return (
    <div className="group rounded-lg border border-gray-200 bg-gray-50/30 p-4 transition-all hover:border-gray-300 hover:bg-white">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-gray-400 transition-colors group-hover:text-emerald-500">
          {icon}
        </span>
        <Label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
          {label}
        </Label>
      </div>
      {children}
    </div>
  )
}

export function BookingRulesEditor({ rules, onChange }: BookingRulesEditorProps) {
  const selectClassName = cn(
    'mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900',
    'transition-all hover:border-gray-300',
    'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20'
  )

  const inputClassName = cn(
    'w-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900',
    'transition-all hover:border-gray-300',
    'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20',
    '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
  )

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <RuleField
        icon={<Clock className="h-4 w-4" />}
        label="Slot Duration"
        htmlFor="slotDuration"
      >
        <select
          id="slotDuration"
          value={rules.slotDurationMinutes}
          onChange={(e) =>
            onChange({ ...rules, slotDurationMinutes: Number(e.target.value) })
          }
          className={selectClassName}
        >
          {SLOT_DURATIONS.map((d) => (
            <option key={d} value={d}>
              {d} minutes
            </option>
          ))}
        </select>
      </RuleField>

      <RuleField
        icon={<Pause className="h-4 w-4" />}
        label="Buffer Between Meetings"
        htmlFor="buffer"
      >
        <select
          id="buffer"
          value={rules.bufferMinutes}
          onChange={(e) =>
            onChange({ ...rules, bufferMinutes: Number(e.target.value) })
          }
          className={selectClassName}
        >
          {BUFFER_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b === 0 ? 'No buffer' : `${b} minutes`}
            </option>
          ))}
        </select>
      </RuleField>

      <RuleField
        icon={<Timer className="h-4 w-4" />}
        label="Minimum Notice"
        htmlFor="minNotice"
      >
        <div className="mt-1 flex items-center gap-2">
          <input
            id="minNotice"
            type="number"
            min={0}
            max={168}
            value={rules.minNoticeHours}
            onChange={(e) =>
              onChange({ ...rules, minNoticeHours: Number(e.target.value) })
            }
            className={inputClassName}
          />
          <span className="text-sm font-medium text-gray-500">hours</span>
        </div>
      </RuleField>

      <RuleField
        icon={<CalendarRange className="h-4 w-4" />}
        label="Max Days in Advance"
        htmlFor="maxAdvance"
      >
        <div className="mt-1 flex items-center gap-2">
          <input
            id="maxAdvance"
            type="number"
            min={1}
            max={90}
            value={rules.maxDaysInAdvance}
            onChange={(e) =>
              onChange({ ...rules, maxDaysInAdvance: Number(e.target.value) })
            }
            className={inputClassName}
          />
          <span className="text-sm font-medium text-gray-500">days</span>
        </div>
      </RuleField>
    </div>
  )
}
