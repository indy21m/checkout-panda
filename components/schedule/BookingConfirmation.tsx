'use client'

import { format } from 'date-fns'
import { CheckCircle } from 'lucide-react'

interface BookingConfirmationProps {
  guestName: string
  startTime: string
  endTime: string
  meetingType: string
}

export function BookingConfirmation({
  guestName,
  startTime,
  endTime,
  meetingType,
}: BookingConfirmationProps) {
  const start = new Date(startTime)
  const end = new Date(endTime)

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">Booking Confirmed</h2>
      <p className="mb-6 text-gray-600">
        Thanks, {guestName}! Your meeting has been scheduled.
      </p>
      <div className="mx-auto max-w-sm rounded-xl border border-gray-200 bg-gray-50 p-6 text-left">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Date</p>
            <p className="text-sm font-semibold text-gray-900">
              {format(start, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Time</p>
            <p className="text-sm font-semibold text-gray-900">
              {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">Type</p>
            <p className="text-sm font-semibold text-gray-900">{meetingType}</p>
          </div>
        </div>
      </div>
      <p className="mt-6 text-sm text-gray-500">
        A confirmation email has been sent. You can close this page.
      </p>
    </div>
  )
}
