import 'server-only'
import {
  addMinutes,
  startOfDay,
  addDays,
  isBefore,
  isAfter,
  format,
  parse,
  setHours,
  setMinutes,
} from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import type { DayOfWeek, TimeSlot } from '@/types'
import { getCalendarSettings, getConfirmedBookingsInRange } from '@/lib/db/calendar'
import { getFreeBusyPeriods, ensureValidAccessToken } from '@/lib/google-calendar'

interface BusyPeriod {
  start: Date
  end: Date
}

const DAY_NAMES: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

/**
 * Parse "HH:mm" string into hours and minutes
 */
function parseTime(time: string): { hours: number; minutes: number } {
  const parts = time.split(':').map(Number)
  return { hours: parts[0] ?? 0, minutes: parts[1] ?? 0 }
}

/**
 * Create a Date at a specific time in a specific timezone for a given day
 */
function createDateInTimezone(
  date: Date,
  time: string,
  timezone: string
): Date {
  const { hours, minutes } = parseTime(time)
  const zonedDay = toZonedTime(date, timezone)
  const dayStart = startOfDay(zonedDay)
  const zonedTime = setMinutes(setHours(dayStart, hours), minutes)
  return fromZonedTime(zonedTime, timezone)
}

/**
 * Check if a slot overlaps with any busy period
 */
function isSlotBusy(slotStart: Date, slotEnd: Date, busyPeriods: BusyPeriod[]): boolean {
  return busyPeriods.some(
    (busy) => isBefore(slotStart, busy.end) && isAfter(slotEnd, busy.start)
  )
}

/**
 * Get available time slots for a specific date.
 * Combines: weekly schedule + existing bookings + Google Calendar busy times + booking rules.
 */
export async function getAvailableSlots(dateStr: string): Promise<TimeSlot[]> {
  const settings = await getCalendarSettings()
  const {
    timezone,
    weeklySchedule,
    slotDurationMinutes,
    minNoticeHours,
    maxDaysInAdvance,
    bufferMinutes,
  } = settings

  // Parse the requested date in the admin's timezone
  const requestedDate = parse(dateStr, 'yyyy-MM-dd', new Date())
  const now = new Date()

  // Enforce max days in advance
  const maxDate = addDays(now, maxDaysInAdvance)
  if (isAfter(requestedDate, maxDate)) {
    return []
  }

  // Get day of week
  const zonedDate = toZonedTime(requestedDate, timezone)
  const dayIndex = zonedDate.getDay()
  const dayName = DAY_NAMES[dayIndex]!
  const daySchedule = weeklySchedule[dayName]

  // Day not enabled
  if (!daySchedule.enabled) {
    return []
  }

  // Build the window start/end in UTC
  const windowStart = createDateInTimezone(requestedDate, daySchedule.startTime, timezone)
  const windowEnd = createDateInTimezone(requestedDate, daySchedule.endTime, timezone)

  // Get existing confirmed bookings for this day
  const dayStart = createDateInTimezone(requestedDate, '00:00', timezone)
  const dayEnd = createDateInTimezone(requestedDate, '23:59', timezone)
  const existingBookings = await getConfirmedBookingsInRange(dayStart, dayEnd)

  // Build busy periods from existing bookings (with buffer)
  const busyPeriods: BusyPeriod[] = existingBookings.map((b) => ({
    start: addMinutes(b.startTime, -bufferMinutes),
    end: addMinutes(b.endTime, bufferMinutes),
  }))

  // Get Google Calendar busy times if connected
  if (settings.googleCalendarConnected && settings.googleRefreshToken) {
    try {
      const accessToken = await ensureValidAccessToken(settings)
      if (accessToken) {
        const googleBusy = await getFreeBusyPeriods(
          accessToken,
          windowStart,
          windowEnd,
          settings.googleCalendarId ?? 'primary'
        )
        busyPeriods.push(...googleBusy)
      }
    } catch (error) {
      console.error('Failed to fetch Google Calendar busy times:', error)
      // Continue without Google Calendar data
    }
  }

  // Minimum notice time
  const earliestSlot = addMinutes(now, minNoticeHours * 60)

  // Generate slots
  const slots: TimeSlot[] = []
  let slotStart = windowStart

  while (isBefore(slotStart, windowEnd)) {
    const slotEnd = addMinutes(slotStart, slotDurationMinutes)

    // Slot must end before window end
    if (isAfter(slotEnd, windowEnd)) break

    // Slot must be after minimum notice time
    if (isAfter(slotStart, earliestSlot) || slotStart.getTime() === earliestSlot.getTime()) {
      // Check not busy
      if (!isSlotBusy(slotStart, slotEnd, busyPeriods)) {
        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
        })
      }
    }

    slotStart = addMinutes(slotStart, slotDurationMinutes)
  }

  return slots
}

/**
 * Get available dates for a month (dates that have at least one slot).
 * Returns array of date strings "YYYY-MM-DD".
 */
export async function getAvailableDates(year: number, month: number): Promise<string[]> {
  const settings = await getCalendarSettings()
  const { timezone, weeklySchedule, maxDaysInAdvance } = settings

  const now = new Date()
  const maxDate = addDays(now, maxDaysInAdvance)
  const dates: string[] = []

  // Start from the 1st of the month or today, whichever is later
  const monthStart = new Date(year, month - 1, 1)
  const start = isAfter(now, monthStart) ? now : monthStart
  const monthEnd = new Date(year, month, 0) // Last day of the month

  let current = startOfDay(start)
  while (isBefore(current, addDays(monthEnd, 1)) && isBefore(current, maxDate)) {
    const zonedDate = toZonedTime(current, timezone)
    const dayIndex = zonedDate.getDay()
    const dayName = DAY_NAMES[dayIndex]!
    const daySchedule = weeklySchedule[dayName]

    if (daySchedule.enabled) {
      dates.push(format(current, 'yyyy-MM-dd'))
    }

    current = addDays(current, 1)
  }

  return dates
}

/**
 * Check if a specific slot is still available (for double-booking prevention)
 */
export async function isSlotAvailable(startTime: Date, endTime: Date): Promise<boolean> {
  const settings = await getCalendarSettings()
  const { bufferMinutes } = settings

  const bookings = await getConfirmedBookingsInRange(
    addMinutes(startTime, -bufferMinutes),
    addMinutes(endTime, bufferMinutes)
  )

  if (bookings.length > 0) return false

  // Also check Google Calendar
  if (settings.googleCalendarConnected && settings.googleRefreshToken) {
    try {
      const accessToken = await ensureValidAccessToken(settings)
      if (accessToken) {
        const googleBusy = await getFreeBusyPeriods(
          accessToken,
          startTime,
          endTime,
          settings.googleCalendarId ?? 'primary'
        )
        if (googleBusy.length > 0) return false
      }
    } catch {
      // Continue without Google Calendar check
    }
  }

  return true
}
