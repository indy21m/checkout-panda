import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots, getAvailableDates } from '@/lib/schedule'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const month = searchParams.get('month') // format: YYYY-MM

    // Get available slots for a specific date
    if (date) {
      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 })
      }
      const slots = await getAvailableSlots(date)
      return NextResponse.json({ slots })
    }

    // Get available dates for a month
    if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return NextResponse.json({ error: 'Invalid month format. Use YYYY-MM.' }, { status: 400 })
      }
      const parts = month.split('-').map(Number)
      const dates = await getAvailableDates(parts[0]!, parts[1]!)
      return NextResponse.json({ dates })
    }

    return NextResponse.json(
      { error: 'Provide either ?date=YYYY-MM-DD or ?month=YYYY-MM' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Failed to fetch slots:', error)
    return NextResponse.json({ error: 'Failed to fetch available slots' }, { status: 500 })
  }
}
