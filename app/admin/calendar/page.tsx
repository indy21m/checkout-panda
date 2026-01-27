import { CalendarAdmin } from '@/components/admin/CalendarAdmin'
import { getCalendarSettings, getAllBookingsForAdmin } from '@/lib/db/calendar'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const [settings, bookings] = await Promise.all([
    getCalendarSettings(),
    getAllBookingsForAdmin(),
  ])

  // Serialize dates to strings for client component
  const serializedBookings = bookings.map((b) => ({
    id: b.id,
    startTime: b.startTime.toISOString(),
    endTime: b.endTime.toISOString(),
    guestName: b.guestName,
    guestEmail: b.guestEmail,
    message: b.message,
    meetingType: b.meetingType,
    status: b.status as 'confirmed' | 'cancelled',
    cancelledAt: b.cancelledAt?.toISOString() ?? null,
    cancellationReason: b.cancellationReason,
    createdAt: b.createdAt!.toISOString(),
  }))

  return (
    <CalendarAdmin
      settings={{
        timezone: settings.timezone,
        weeklySchedule: settings.weeklySchedule,
        slotDurationMinutes: settings.slotDurationMinutes,
        minNoticeHours: settings.minNoticeHours,
        maxDaysInAdvance: settings.maxDaysInAdvance,
        bufferMinutes: settings.bufferMinutes,
        meetingTypes: settings.meetingTypes,
        googleCalendarConnected: settings.googleCalendarConnected ?? false,
      }}
      bookings={serializedBookings}
    />
  )
}
