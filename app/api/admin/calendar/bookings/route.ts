import { NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/auth'
import { getAllBookingsForAdmin } from '@/lib/db/calendar'

export async function GET(): Promise<NextResponse> {
  const auth = await verifyAdminRequest()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const bookings = await getAllBookingsForAdmin()
    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Failed to fetch bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
