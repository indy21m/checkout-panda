import { BookingPage } from '@/components/schedule/BookingPage'
import { getCalendarSettings } from '@/lib/db/calendar'

export const metadata = {
  title: 'Book a Meeting',
  description: 'Schedule a meeting at a time that works for you.',
}

export const dynamic = 'force-dynamic'

export default async function SchedulePage() {
  const settings = await getCalendarSettings()
  const enabledMeetingTypes = settings.meetingTypes.filter((t) => t.enabled)

  // Use custom display name/picture if set, otherwise fall back to Google profile
  const profile = {
    name: settings.displayName || settings.googleName || null,
    picture: settings.profilePicture || settings.googlePicture || null,
    meetingTitle: settings.meetingTitle || 'Intro Call',
    introText: settings.introText || null,
    duration: settings.slotDurationMinutes,
    timezone: settings.timezone,
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <BookingPage meetingTypes={enabledMeetingTypes} profile={profile} />
    </div>
  )
}
