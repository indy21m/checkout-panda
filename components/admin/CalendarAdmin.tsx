'use client'

import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarAvailabilityTab } from '@/components/admin/CalendarAvailabilityTab'
import { CalendarBookingsTab } from '@/components/admin/CalendarBookingsTab'
import { Calendar, Users, ExternalLink } from 'lucide-react'
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
  const upcomingCount = bookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.startTime) > new Date()
  ).length

  return (
    <div className="space-y-6">
      {/* Header with gradient accent */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white shadow-lg shadow-emerald-500/20"
      >
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/10 to-transparent" />
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Calendar & Scheduling</h2>
              <p className="mt-0.5 text-sm text-white/80">
                Manage your availability and view upcoming bookings
              </p>
            </div>
          </div>
          <a
            href="/schedule"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/30"
          >
            View Booking Page
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Tabs defaultValue="availability" className="w-full">
          <TabsList className="mb-6 bg-gray-100/80 p-1" style={{ width: '100%', maxWidth: '28rem' }}>
            <TabsTrigger
              value="availability"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Calendar className="h-4 w-4" />
              Availability
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4" />
              Bookings
              {upcomingCount > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-xs font-semibold text-white">
                  {upcomingCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="availability" className="mt-0">
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

          <TabsContent value="bookings" className="mt-0">
            <CalendarBookingsTab initialBookings={bookings} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
