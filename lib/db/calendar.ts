import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { calendarSettings, bookings } from '@/lib/db/schema'
import type { WeeklySchedule, MeetingType, BookingStatus } from '@/types'

/**
 * Get calendar settings (creates default row if missing)
 */
export async function getCalendarSettings() {
  const rows = await db.select().from(calendarSettings).where(eq(calendarSettings.id, 'default'))
  if (rows.length > 0) return rows[0]!

  // Insert default row if missing
  const inserted = await db.insert(calendarSettings).values({ id: 'default' }).returning()
  return inserted[0]!
}

/**
 * Update calendar settings
 */
export async function updateCalendarSettings(data: {
  timezone?: string
  weeklySchedule?: WeeklySchedule
  slotDurationMinutes?: number
  minNoticeHours?: number
  maxDaysInAdvance?: number
  bufferMinutes?: number
  meetingTypes?: MeetingType[]
}) {
  const result = await db
    .update(calendarSettings)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(calendarSettings.id, 'default'))
    .returning()
  return result[0]
}

/**
 * Update Google Calendar tokens
 */
export async function updateGoogleTokens(data: {
  googleAccessToken: string
  googleRefreshToken: string
  googleTokenExpiresAt: Date
  googleCalendarConnected: boolean
  googleCalendarId?: string
  googleEmail?: string
  googleName?: string
  googlePicture?: string
}) {
  const result = await db
    .update(calendarSettings)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(calendarSettings.id, 'default'))
    .returning()
  return result[0]
}

/**
 * Disconnect Google Calendar
 */
export async function disconnectGoogleCalendar() {
  const result = await db
    .update(calendarSettings)
    .set({
      googleCalendarConnected: false,
      googleAccessToken: null,
      googleRefreshToken: null,
      googleTokenExpiresAt: null,
      googleEmail: null,
      googleName: null,
      googlePicture: null,
      updatedAt: new Date(),
    })
    .where(eq(calendarSettings.id, 'default'))
    .returning()
  return result[0]
}

/**
 * Update booking page profile settings
 */
export async function updateBookingPageSettings(data: {
  displayName?: string
  profilePicture?: string
  meetingTitle?: string
  introText?: string
}) {
  const result = await db
    .update(calendarSettings)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(calendarSettings.id, 'default'))
    .returning()
  return result[0]
}

/**
 * Get bookings for a date range
 */
export async function getBookings(opts?: {
  status?: BookingStatus
  from?: Date
  to?: Date
}) {
  const conditions = []

  if (opts?.status) {
    conditions.push(eq(bookings.status, opts.status))
  }
  if (opts?.from) {
    conditions.push(gte(bookings.startTime, opts.from))
  }
  if (opts?.to) {
    conditions.push(lte(bookings.startTime, opts.to))
  }

  const query = conditions.length > 0
    ? db.select().from(bookings).where(and(...conditions)).orderBy(bookings.startTime)
    : db.select().from(bookings).orderBy(bookings.startTime)

  return query
}

/**
 * Get upcoming confirmed bookings
 */
export async function getUpcomingBookings() {
  return db
    .select()
    .from(bookings)
    .where(and(eq(bookings.status, 'confirmed'), gte(bookings.startTime, new Date())))
    .orderBy(bookings.startTime)
}

/**
 * Get all bookings for admin (upcoming first, then past)
 */
export async function getAllBookingsForAdmin() {
  return db.select().from(bookings).orderBy(desc(bookings.startTime))
}

/**
 * Get confirmed bookings in a date range (for slot computation)
 */
export async function getConfirmedBookingsInRange(from: Date, to: Date) {
  return db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.status, 'confirmed'),
        gte(bookings.startTime, from),
        lte(bookings.startTime, to)
      )
    )
    .orderBy(bookings.startTime)
}

/**
 * Create a new booking
 */
export async function createBooking(data: {
  startTime: Date
  endTime: Date
  guestName: string
  guestEmail: string
  message?: string
  meetingType: string
  googleMeetLink?: string
  googleCalendarEventId?: string
}) {
  const result = await db.insert(bookings).values(data).returning()
  return result[0]
}

/**
 * Update a booking with Google Meet link
 */
export async function updateBookingWithMeetLink(
  id: string,
  data: { googleMeetLink: string; googleCalendarEventId: string }
) {
  const result = await db
    .update(bookings)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(bookings.id, id))
    .returning()
  return result[0]
}

/**
 * Get a booking by ID
 */
export async function getBookingById(id: string) {
  const rows = await db.select().from(bookings).where(eq(bookings.id, id))
  return rows[0] ?? null
}

/**
 * Cancel a booking
 */
export async function cancelBooking(id: string, reason?: string) {
  const result = await db
    .update(bookings)
    .set({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: reason ?? null,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, id))
    .returning()
  return result[0]
}
