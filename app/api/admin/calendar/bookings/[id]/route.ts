import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdminRequest } from '@/lib/auth'
import { getBookingById, cancelBooking } from '@/lib/db/calendar'
import { sendEmail } from '@/lib/email'
import { bookingCancellationEmail } from '@/lib/email-templates'

const cancelSchema = z.object({
  reason: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const auth = await verifyAdminRequest()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const data = cancelSchema.parse(body)

    const existing = await getBookingById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (existing.status === 'cancelled') {
      return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 })
    }

    const cancelled = await cancelBooking(id, data.reason)

    // Send cancellation email (non-blocking)
    const emailData = bookingCancellationEmail({
      guestName: existing.guestName,
      startTime: existing.startTime,
      reason: data.reason,
    })
    sendEmail({
      to: existing.guestEmail,
      subject: emailData.subject,
      html: emailData.html,
    }).catch((err) => console.error('Failed to send cancellation email:', err))

    return NextResponse.json({ booking: cancelled })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    console.error('Failed to cancel booking:', error)
    return NextResponse.json({ error: 'Failed to cancel booking' }, { status: 500 })
  }
}
