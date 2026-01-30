'use client'

import { useState, useCallback, useMemo } from 'react'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { ArrowLeft, Clock, Globe, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { DatePicker } from '@/components/schedule/DatePicker'
import { TimeSlotPicker } from '@/components/schedule/TimeSlotPicker'
import { BookingForm } from '@/components/schedule/BookingForm'
import { BookingConfirmation } from '@/components/schedule/BookingConfirmation'
import type { MeetingType, TimeSlot } from '@/types'

type Step = 'date' | 'time' | 'form' | 'confirmation'

const COMMON_TIMEZONES = [
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Australia/Sydney', label: 'Sydney' },
  { value: 'Pacific/Auckland', label: 'Auckland' },
]

function getTimezoneLabel(tz: string): string {
  const found = COMMON_TIMEZONES.find((t) => t.value === tz)
  if (found) return found.label
  return tz.replace(/_/g, ' ').replace(/^.*\//, '')
}

function detectUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'America/New_York'
  }
}

interface Profile {
  name: string | null
  picture: string | null
  meetingTitle: string
  introText: string | null
  duration: number
  timezone: string
}

interface BookingPageProps {
  meetingTypes: MeetingType[]
  profile: Profile
}

interface ConfirmationData {
  guestName: string
  startTime: string
  endTime: string
  meetingType: string
}

export function BookingPage({ meetingTypes, profile }: BookingPageProps) {
  const [step, setStep] = useState<Step>('date')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimezone, setSelectedTimezone] = useState(() => detectUserTimezone())
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false)

  // Build timezone options ensuring selected and host timezones are included
  const timezoneOptions = useMemo(() => {
    const values = new Set(COMMON_TIMEZONES.map((t) => t.value))
    const result = [...COMMON_TIMEZONES]

    // Add selected timezone if not in list
    if (selectedTimezone && !values.has(selectedTimezone)) {
      result.unshift({ value: selectedTimezone, label: getTimezoneLabel(selectedTimezone) })
    }
    // Add host timezone if not in list
    if (profile.timezone && !values.has(profile.timezone) && profile.timezone !== selectedTimezone) {
      result.push({ value: profile.timezone, label: getTimezoneLabel(profile.timezone) + ' (Host)' })
    }
    return result
  }, [selectedTimezone, profile.timezone])

  const handleMonthChange = useCallback(async (year: number, month: number) => {
    try {
      const res = await fetch(`/api/schedule/slots?month=${year}-${String(month).padStart(2, '0')}`)
      const data = await res.json()
      if (data.dates) setAvailableDates(data.dates)
    } catch {
      console.error('Failed to load available dates')
    }
  }, [])

  const handleSelectDate = async (date: string) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    setStep('time')
    setSlotsLoading(true)
    try {
      const res = await fetch(`/api/schedule/slots?date=${date}`)
      const data = await res.json()
      setSlots(data.slots ?? [])
    } catch {
      setSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setStep('form')
  }

  const handleSubmitBooking = async (formData: {
    guestName: string
    guestEmail: string
    message?: string
    meetingType: string
  }) => {
    if (!selectedSlot) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/schedule/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          ...formData,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to create booking')
        return
      }

      const meetingType = meetingTypes.find((t) => t.id === formData.meetingType)
      setConfirmation({
        guestName: formData.guestName,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        meetingType: meetingType?.label ?? formData.meetingType,
      })
      setStep('confirmation')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const goBack = () => {
    if (step === 'time') {
      setStep('date')
      setSelectedSlot(null)
    } else if (step === 'form') {
      setStep('time')
    }
  }

  // Format timezone for display
  const formatTimezone = (tz: string) => {
    try {
      const now = new Date()
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'short',
      })
      const parts = formatter.formatToParts(now)
      const tzPart = parts.find((p) => p.type === 'timeZoneName')
      return `${getTimezoneLabel(tz)} ${tzPart?.value || ''}`
    } catch {
      return getTimezoneLabel(tz)
    }
  }

  // Format time in selected timezone
  const formatTimeInZone = (isoTime: string) => {
    try {
      return formatInTimeZone(new Date(isoTime), selectedTimezone, 'h:mm a')
    } catch {
      return format(new Date(isoTime), 'h:mm a')
    }
  }

  if (step === 'confirmation' && confirmation) {
    return (
      <div className="mx-auto" style={{ width: '100%', maxWidth: '28rem' }}>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <BookingConfirmation {...confirmation} />
        </div>
      </div>
    )
  }

  return (
    <div
      className="mx-auto overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      style={{ width: '100%', maxWidth: '52rem' }}
    >
      <div className="flex flex-col md:flex-row">
        {/* Left side - Profile info */}
        <div className="border-b border-gray-200 p-6 md:w-72 md:border-b-0 md:border-r">
          {profile.picture && (
            <div className="mb-4">
              <Image
                src={profile.picture}
                alt={profile.name || 'Profile'}
                width={64}
                height={64}
                className="rounded-full"
                unoptimized
              />
            </div>
          )}
          {profile.name && (
            <p className="text-sm font-medium text-gray-600">{profile.name}</p>
          )}
          <h1 className="mt-1 text-xl font-bold text-gray-900">{profile.meetingTitle}</h1>

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{profile.duration} min</span>
          </div>

          {profile.introText && (
            <p className="mt-4 text-sm text-gray-600 whitespace-pre-wrap">
              {profile.introText}
            </p>
          )}
        </div>

        {/* Right side - Calendar/Time/Form */}
        <div className="flex-1 p-6">
          {/* Back button */}
          {(step === 'time' || step === 'form') && (
            <button
              type="button"
              onClick={goBack}
              className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
          )}

          {/* Header */}
          {step === 'date' && (
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Select a Date & Time</h2>
          )}

          {step === 'time' && selectedDate && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Select a Time</h2>
              <p className="mt-1 text-sm text-gray-600">
                {format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          )}

          {step === 'form' && selectedSlot && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Enter Details</h2>
              <div className="mt-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <p className="font-medium">
                  {formatInTimeZone(new Date(selectedSlot.start), selectedTimezone, 'EEEE, MMMM d, yyyy')}
                </p>
                <p>
                  {formatTimeInZone(selectedSlot.start)} – {formatTimeInZone(selectedSlot.end)}
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Steps */}
          {step === 'date' && (
            <DatePicker
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
              availableDates={availableDates}
              onMonthChange={handleMonthChange}
            />
          )}

          {step === 'time' && (
            <TimeSlotPicker
              slots={slots}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
              loading={slotsLoading}
              timezone={selectedTimezone}
            />
          )}

          {step === 'form' && selectedSlot && (
            <BookingForm
              meetingTypes={meetingTypes}
              onSubmit={handleSubmitBooking}
              submitting={submitting}
            />
          )}

          {/* Timezone selector */}
          <div className="relative mt-6">
            <button
              type="button"
              onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              <Globe className="h-4 w-4" />
              <span>{formatTimezone(selectedTimezone)}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showTimezoneDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showTimezoneDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowTimezoneDropdown(false)}
                />
                <div className="absolute bottom-full left-0 z-20 mb-1 max-h-64 w-64 overflow-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  {timezoneOptions.map((tz) => (
                    <button
                      key={tz.value}
                      type="button"
                      onClick={() => {
                        setSelectedTimezone(tz.value)
                        setShowTimezoneDropdown(false)
                      }}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50 ${
                        selectedTimezone === tz.value
                          ? 'bg-emerald-50 text-emerald-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {tz.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
