'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
import { DatePicker } from '@/components/schedule/DatePicker'
import { TimeSlotPicker } from '@/components/schedule/TimeSlotPicker'
import { BookingForm } from '@/components/schedule/BookingForm'
import { BookingConfirmation } from '@/components/schedule/BookingConfirmation'
import type { MeetingType, TimeSlot } from '@/types'

type Step = 'date' | 'time' | 'form' | 'confirmation'

interface BookingPageProps {
  meetingTypes: MeetingType[]
}

interface ConfirmationData {
  guestName: string
  startTime: string
  endTime: string
  meetingType: string
}

export function BookingPage({ meetingTypes }: BookingPageProps) {
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

  return (
    <div className="mx-auto" style={{ width: '100%', maxWidth: '28rem' }}>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-100 bg-gray-50 px-6 py-5">
          <h1 className="text-xl font-bold text-gray-900">Book a Meeting</h1>
          <p className="mt-1 text-sm text-gray-500">
            Select a date and time that works for you.
          </p>
        </div>

        {/* Progress indicator */}
        {step !== 'confirmation' && (
          <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-3">
            <StepIndicator icon={Calendar} label="Date" active={step === 'date'} done={step !== 'date'} />
            <StepIndicator icon={Clock} label="Time" active={step === 'time'} done={step === 'form'} />
            <StepIndicator icon={User} label="Details" active={step === 'form'} done={false} />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
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

          {/* Selected date/time summary */}
          {step === 'time' && selectedDate && (
            <p className="mb-4 text-sm font-medium text-gray-700">
              {format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
            </p>
          )}

          {step === 'form' && selectedSlot && (
            <div className="mb-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <p className="font-medium">
                {format(new Date(selectedSlot.start), 'EEEE, MMMM d, yyyy')}
              </p>
              <p>
                {format(new Date(selectedSlot.start), 'h:mm a')} –{' '}
                {format(new Date(selectedSlot.end), 'h:mm a')}
              </p>
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

          {step === 'confirmation' && confirmation && (
            <BookingConfirmation {...confirmation} />
          )}
        </div>
      </div>
    </div>
  )
}

function StepIndicator({
  icon: Icon,
  label,
  active,
  done,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active: boolean
  done: boolean
}) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  )
}
