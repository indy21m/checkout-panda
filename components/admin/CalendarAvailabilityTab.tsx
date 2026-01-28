'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { WeeklyScheduleEditor } from '@/components/admin/WeeklyScheduleEditor'
import { BookingRulesEditor } from '@/components/admin/BookingRulesEditor'
import { GoogleCalendarConnect } from '@/components/admin/GoogleCalendarConnect'
import { toast } from 'sonner'
import {
  Globe,
  CalendarDays,
  Settings2,
  Video,
  Plug,
  Plus,
  X,
  Save,
} from 'lucide-react'
import type { WeeklySchedule, MeetingType } from '@/types'
import { cn } from '@/lib/utils'

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

interface SectionCardProps {
  icon: React.ReactNode
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  delay?: number
}

function SectionCard({
  icon,
  title,
  description,
  children,
  className,
  delay = 0,
}: SectionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        'rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md',
        className
      )}
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="mt-0.5 text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
      {children}
    </motion.section>
  )
}

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
        toast.success('Settings saved successfully')
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
    toast.success('Meeting type added')
  }

  const removeMeetingType = (id: string) => {
    setMeetingTypes((prev) => prev.filter((t) => t.id !== id))
    toast.success('Meeting type removed')
  }

  return (
    <div className="space-y-6">
      {/* Timezone */}
      <SectionCard
        icon={<Globe className="h-5 w-5" />}
        title="Timezone"
        description="All times will be displayed in this timezone"
        delay={0}
      >
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:border-gray-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {COMMON_TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </SectionCard>

      {/* Weekly Schedule */}
      <SectionCard
        icon={<CalendarDays className="h-5 w-5" />}
        title="Weekly Availability"
        description="Set your available hours for each day of the week"
        delay={0.05}
      >
        <WeeklyScheduleEditor schedule={schedule} onChange={setSchedule} />
      </SectionCard>

      {/* Booking Rules */}
      <SectionCard
        icon={<Settings2 className="h-5 w-5" />}
        title="Booking Rules"
        description="Configure how bookings work for your calendar"
        delay={0.1}
      >
        <BookingRulesEditor rules={rules} onChange={setRules} />
      </SectionCard>

      {/* Meeting Types */}
      <SectionCard
        icon={<Video className="h-5 w-5" />}
        title="Meeting Types"
        description="Choose which meeting formats guests can select"
        delay={0.15}
      >
        <div className="space-y-3">
          {meetingTypes.map((type) => (
            <div
              key={type.id}
              className={cn(
                'flex items-center justify-between rounded-lg border px-4 py-3 transition-all',
                type.enabled
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-gray-200 bg-gray-50/50'
              )}
            >
              <div className="flex items-center gap-3">
                <Switch
                  checked={type.enabled}
                  onCheckedChange={() => toggleMeetingType(type.id)}
                  className="data-[state=checked]:bg-emerald-500"
                />
                <span
                  className={cn(
                    'text-sm font-medium transition-colors',
                    type.enabled ? 'text-gray-900' : 'text-gray-400'
                  )}
                >
                  {type.label}
                </span>
              </div>
              {/* Don't allow removing built-in types */}
              {!['google-meet', 'phone'].includes(type.id) && (
                <button
                  type="button"
                  onClick={() => removeMeetingType(type.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remove ${type.label}`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}

          {/* Add new meeting type */}
          <div className="flex items-center gap-2 pt-2">
            <div className="relative flex-1 max-w-xs">
              <Input
                value={newTypeLabel}
                onChange={(e) => setNewTypeLabel(e.target.value)}
                placeholder="Add a meeting type..."
                className="pr-10"
                onKeyDown={(e) => e.key === 'Enter' && addMeetingType()}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={addMeetingType}
              disabled={!newTypeLabel.trim()}
              className="gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* Integrations */}
      <SectionCard
        icon={<Plug className="h-5 w-5" />}
        title="Integrations"
        description="Connect external calendars to sync your availability"
        delay={0.2}
      >
        <GoogleCalendarConnect
          connected={googleConnected}
          onDisconnect={() => setGoogleConnected(false)}
        />
      </SectionCard>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="flex items-center justify-between rounded-xl border border-gray-200/80 bg-gradient-to-r from-gray-50 to-white p-4"
      >
        <p className="text-sm text-gray-500">
          Remember to save your changes before leaving this page.
        </p>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 transition-all hover:shadow-lg hover:shadow-emerald-500/30"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </motion.div>
    </div>
  )
}
