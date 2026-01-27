'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarAvailabilityTab } from '@/components/admin/CalendarAvailabilityTab'
import { CalendarBookingsTab } from '@/components/admin/CalendarBookingsTab'
import type { WeeklySchedule, MeetingType } from '@/types'

interface CalendarSettings {
  timezone: string
  weeklySchedule: WeeklySchedule
  slotDurationMinutes: number
  minNoticeHours: number
  maxDaysInAdvance: number
  bufferMinutes: number
  meetingTypes: MeetingType[]
  googleCalendarConnected: boolean
}

interface Booking {
  id: string
  startTime: string
  endTime: string
  guestName: string
  guestEmail: string
  message: string | null
  meetingType: string
  status: 'confirmed' | 'cancelled'
  cancelledAt: string | null
  cancellationReason: string | null
  createdAt: string
}

interface CalendarAdminProps {
  settings: CalendarSettings
  bookings: Booking[]
}

export function CalendarAdmin({ settings, bookings }: CalendarAdminProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Calendar & Scheduling</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your availability and view bookings.
        </p>
      </div>

      <Tabs defaultValue="availability">
        <TabsList>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="bookings">
            Bookings
            {bookings.filter((b) => b.status === 'confirmed' && new Date(b.startTime) > new Date()).length > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-xs font-medium text-blue-700">
                {bookings.filter((b) => b.status === 'confirmed' && new Date(b.startTime) > new Date()).length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="availability" className="mt-6">
          <CalendarAvailabilityTab
            initialSettings={{
              timezone: settings.timezone,
              weeklySchedule: settings.weeklySchedule,
              slotDurationMinutes: settings.slotDurationMinutes,
              minNoticeHours: settings.minNoticeHours,
              maxDaysInAdvance: settings.maxDaysInAdvance,
              bufferMinutes: settings.bufferMinutes,
              meetingTypes: settings.meetingTypes,
              googleCalendarConnected: settings.googleCalendarConnected,
            }}
          />
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <CalendarBookingsTab initialBookings={bookings} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
