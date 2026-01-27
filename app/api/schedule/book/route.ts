import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createBooking, getCalendarSettings } from '@/lib/db/calendar'
import { isSlotAvailable } from '@/lib/schedule'
import { sendEmail } from '@/lib/email'
import { bookingConfirmationEmail } from '@/lib/email-templates'

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

    // Create the booking
    const booking = await createBooking({
      startTime,
      endTime,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      message: data.message,
      meetingType: data.meetingType,
    })

    // Send confirmation email (non-blocking)
    const emailData = bookingConfirmationEmail({
      guestName: data.guestName,
      startTime,
      endTime,
      meetingType: meetingType.label,
    })
    sendEmail({
      to: data.guestEmail,
      subject: emailData.subject,
      html: emailData.html,
    }).catch((err) => console.error('Failed to send confirmation email:', err))

    return NextResponse.json({ booking }, { status: 201 })
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
