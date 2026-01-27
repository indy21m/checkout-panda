'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { WeeklyScheduleEditor } from '@/components/admin/WeeklyScheduleEditor'
import { BookingRulesEditor } from '@/components/admin/BookingRulesEditor'
import { GoogleCalendarConnect } from '@/components/admin/GoogleCalendarConnect'
import { toast } from 'sonner'
import type { WeeklySchedule, MeetingType } from '@/types'

interface CalendarAvailabilityTabProps {
  initialSettings: {
    timezone: string
    weeklySchedule: WeeklySchedule
    slotDurationMinutes: number
    minNoticeHours: number
    maxDaysInAdvance: number
    bufferMinutes: number
    meetingTypes: MeetingType[]
    googleCalendarConnected: boolean
  }
}

const COMMON_TIMEZONES = [
  'Europe/Copenhagen',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland',
]

export function CalendarAvailabilityTab({ initialSettings }: CalendarAvailabilityTabProps) {
  const [timezone, setTimezone] = useState(initialSettings.timezone)
  const [schedule, setSchedule] = useState(initialSettings.weeklySchedule)
  const [rules, setRules] = useState({
    slotDurationMinutes: initialSettings.slotDurationMinutes,
    minNoticeHours: initialSettings.minNoticeHours,
    maxDaysInAdvance: initialSettings.maxDaysInAdvance,
    bufferMinutes: initialSettings.bufferMinutes,
  })
  const [meetingTypes, setMeetingTypes] = useState(initialSettings.meetingTypes)
  const [googleConnected, setGoogleConnected] = useState(
    initialSettings.googleCalendarConnected
  )
  const [saving, setSaving] = useState(false)
  const [newTypeLabel, setNewTypeLabel] = useState('')

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/calendar/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timezone,
          weeklySchedule: schedule,
          ...rules,
          meetingTypes,
        }),
      })

      if (res.ok) {
        toast.success('Settings saved')
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Failed to save settings')
      }
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const toggleMeetingType = (id: string) => {
    setMeetingTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    )
  }

  const addMeetingType = () => {
    if (!newTypeLabel.trim()) return
    const id = newTypeLabel.toLowerCase().replace(/\s+/g, '-')
    if (meetingTypes.some((t) => t.id === id)) {
      toast.error('Meeting type already exists')
      return
    }
    setMeetingTypes((prev) => [...prev, { id, label: newTypeLabel.trim(), enabled: true }])
    setNewTypeLabel('')
  }

  const removeMeetingType = (id: string) => {
    setMeetingTypes((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-8">
      {/* Timezone */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Timezone</h3>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm"
        >
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </section>

      {/* Weekly Schedule */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Weekly Availability</h3>
        <WeeklyScheduleEditor schedule={schedule} onChange={setSchedule} />
      </section>

      {/* Booking Rules */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Booking Rules</h3>
        <BookingRulesEditor rules={rules} onChange={setRules} />
      </section>

      {/* Meeting Types */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Meeting Types</h3>
        <div className="space-y-2">
          {meetingTypes.map((type) => (
            <div
              key={type.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2.5"
            >
              <div className="flex items-center gap-3">
                <Switch
                  checked={type.enabled}
                  onCheckedChange={() => toggleMeetingType(type.id)}
                />
                <span className="text-sm font-medium text-gray-900">{type.label}</span>
              </div>
              {/* Don't allow removing built-in types */}
              {!['google-meet', 'phone'].includes(type.id) && (
                <button
                  type="button"
                  onClick={() => removeMeetingType(type.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <Input
              value={newTypeLabel}
              onChange={(e) => setNewTypeLabel(e.target.value)}
              placeholder="Add meeting type..."
              className="max-w-xs"
              onKeyDown={(e) => e.key === 'Enter' && addMeetingType()}
            />
            <Button variant="outline" size="sm" onClick={addMeetingType}>
              Add
            </Button>
          </div>
        </div>
      </section>

      {/* Google Calendar */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Integrations</h3>
        <GoogleCalendarConnect
          connected={googleConnected}
          onDisconnect={() => setGoogleConnected(false)}
        />
      </section>

      {/* Save Button */}
      <div className="border-t border-gray-200 pt-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
