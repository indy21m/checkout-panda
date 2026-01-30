'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { ArrowLeft, Clock, Globe } from 'lucide-react'
import Image from 'next/image'
import { DatePicker } from '@/components/schedule/DatePicker'
import { TimeSlotPicker } from '@/components/schedule/TimeSlotPicker'
import { BookingForm } from '@/components/schedule/BookingForm'
import { BookingConfirmation } from '@/components/schedule/BookingConfirmation'
import type { MeetingType, TimeSlot } from '@/types'

type Step = 'date' | 'time' | 'form' | 'confirmation'

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
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      const time = timeFormatter.format(now)
      return `${tz.replace(/_/g, ' ')} (${time}) ${tzPart?.value || ''}`
    } catch {
      return tz.replace(/_/g, ' ')
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
                  {format(new Date(selectedSlot.start), 'EEEE, MMMM d, yyyy')}
                </p>
                <p>
                  {format(new Date(selectedSlot.start), 'h:mm a')} –{' '}
                  {format(new Date(selectedSlot.end), 'h:mm a')}
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
            />
          )}

          {step === 'form' && selectedSlot && (
            <BookingForm
              meetingTypes={meetingTypes}
              onSubmit={handleSubmitBooking}
              submitting={submitting}
            />
          )}

          {/* Timezone display */}
          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
            <Globe className="h-4 w-4" />
            <span>{formatTimezone(profile.timezone)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
