import { NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/auth'
import { disconnectGoogleCalendar } from '@/lib/db/calendar'

export async function DELETE(): Promise<NextResponse> {
  const auth = await verifyAdminRequest()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    await disconnectGoogleCalendar()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to disconnect Google Calendar:', error)
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}
