import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdminRequest } from '@/lib/auth'
import { getBookingById } from '@/lib/db/calendar'
import { sendEmail } from '@/lib/email'
import { adminMessageEmail } from '@/lib/email-templates'

const messageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
})

export async function POST(
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
    const data = messageSchema.parse(body)

    const booking = await getBookingById(id)
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const emailData = adminMessageEmail({
      guestName: booking.guestName,
      message: data.message,
    })

    const sent = await sendEmail({
      to: booking.guestEmail,
      subject: emailData.subject,
      html: emailData.html,
    })

    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send email. Check RESEND_API_KEY configuration.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
    }
    console.error('Failed to send message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
