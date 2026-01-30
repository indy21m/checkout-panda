import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createBooking, getCalendarSettings, updateBookingWithMeetLink } from '@/lib/db/calendar'
import { isSlotAvailable } from '@/lib/schedule'
import { sendEmail } from '@/lib/email'
import { bookingConfirmationEmail, newBookingNotificationEmail } from '@/lib/email-templates'
import { createCalendarEvent, ensureValidAccessToken } from '@/lib/google-calendar'

const bookingSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  guestName: z.string().min(1, 'Name is required'),
  guestEmail: z.string().email('Valid email is required'),
  message: z.string().optional(),
  meetingType: z.string().min(1, 'Meeting type is required'),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const data = bookingSchema.parse(body)

    const startTime = new Date(data.startTime)
    const endTime = new Date(data.endTime)

    // Verify the meeting type is enabled
    const settings = await getCalendarSettings()
    const meetingType = settings.meetingTypes.find(
      (t) => t.id === data.meetingType && t.enabled
    )
    if (!meetingType) {
      return NextResponse.json({ error: 'Invalid meeting type' }, { status: 400 })
    }

    // Double-check slot availability (prevents race conditions)
    const available = await isSlotAvailable(startTime, endTime)
    if (!available) {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please choose another time.' },
        { status: 409 }
      )
    }

    // Create the booking first
    const booking = await createBooking({
      startTime,
      endTime,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      message: data.message,
      meetingType: data.meetingType,
    })

    let googleMeetLink: string | undefined

    // If Google Calendar is connected and meeting type is Google Meet, create a calendar event
    const isGoogleMeet = data.meetingType === 'google-meet'
    if (settings.googleCalendarConnected && isGoogleMeet) {
      try {
        const accessToken = await ensureValidAccessToken({
          googleAccessToken: settings.googleAccessToken,
          googleRefreshToken: settings.googleRefreshToken,
          googleTokenExpiresAt: settings.googleTokenExpiresAt,
        })

        if (accessToken) {
          const calendarEvent = await createCalendarEvent({
            accessToken,
            calendarId: settings.googleCalendarId ?? 'primary',
            summary: `Meeting with ${data.guestName}`,
            description: data.message || `Booking via Checkout Panda`,
            startTime,
            endTime,
            attendeeEmail: data.guestEmail,
            attendeeName: data.guestName,
            createMeetLink: true,
          })

          googleMeetLink = calendarEvent.hangoutLink

          // Update booking with Meet link
          if (googleMeetLink && booking) {
            await updateBookingWithMeetLink(booking.id, {
              googleMeetLink,
              googleCalendarEventId: calendarEvent.id,
            })
          }
        }
      } catch (err) {
        // Log but don't fail the booking if calendar event creation fails
        console.error('Failed to create calendar event:', err)
      }
    }

    // Send confirmation email to guest (non-blocking)
    const guestEmailData = bookingConfirmationEmail({
      guestName: data.guestName,
      startTime,
      endTime,
      meetingType: meetingType.label,
      googleMeetLink,
    })
    sendEmail({
      to: data.guestEmail,
      subject: guestEmailData.subject,
      html: guestEmailData.html,
    }).catch((err) => console.error('Failed to send confirmation email:', err))

    // Send notification email to admin if Google email is configured (non-blocking)
    if (settings.googleEmail) {
      const adminEmailData = newBookingNotificationEmail({
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        startTime,
        endTime,
        meetingType: meetingType.label,
        message: data.message,
        googleMeetLink,
      })
      sendEmail({
        to: settings.googleEmail,
        subject: adminEmailData.subject,
        html: adminEmailData.html,
      }).catch((err) => console.error('Failed to send admin notification email:', err))
    }

    return NextResponse.json({ booking: { ...booking, googleMeetLink } }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Failed to create booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
