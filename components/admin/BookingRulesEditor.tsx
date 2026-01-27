'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

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

export function BookingRulesEditor({ rules, onChange }: BookingRulesEditorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="slotDuration">Slot Duration</Label>
        <select
          id="slotDuration"
          value={rules.slotDurationMinutes}
          onChange={(e) =>
            onChange({ ...rules, slotDurationMinutes: Number(e.target.value) })
          }
          className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        >
          {SLOT_DURATIONS.map((d) => (
            <option key={d} value={d}>
              {d} minutes
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="buffer">Buffer Between Meetings</Label>
        <select
          id="buffer"
          value={rules.bufferMinutes}
          onChange={(e) =>
            onChange({ ...rules, bufferMinutes: Number(e.target.value) })
          }
          className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
        >
          {BUFFER_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b === 0 ? 'No buffer' : `${b} minutes`}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="minNotice">Minimum Notice</Label>
        <div className="mt-1 flex items-center gap-2">
          <Input
            id="minNotice"
            type="number"
            min={0}
            max={168}
            value={rules.minNoticeHours}
            onChange={(e) =>
              onChange({ ...rules, minNoticeHours: Number(e.target.value) })
            }
          />
          <span className="shrink-0 text-sm text-gray-500">hours</span>
        </div>
      </div>

      <div>
        <Label htmlFor="maxAdvance">Max Days in Advance</Label>
        <div className="mt-1 flex items-center gap-2">
          <Input
            id="maxAdvance"
            type="number"
            min={1}
            max={90}
            value={rules.maxDaysInAdvance}
            onChange={(e) =>
              onChange({ ...rules, maxDaysInAdvance: Number(e.target.value) })
            }
          />
          <span className="shrink-0 text-sm text-gray-500">days</span>
        </div>
      </div>
    </div>
  )
}
