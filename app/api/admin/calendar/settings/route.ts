import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAdminRequest } from '@/lib/auth'
import { getCalendarSettings, updateCalendarSettings } from '@/lib/db/calendar'

const dayScheduleSchema = z.object({
  enabled: z.boolean(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
})

const updateSettingsSchema = z.object({
  timezone: z.string().optional(),
  weeklySchedule: z
    .object({
      monday: dayScheduleSchema,
      tuesday: dayScheduleSchema,
      wednesday: dayScheduleSchema,
      thursday: dayScheduleSchema,
      friday: dayScheduleSchema,
      saturday: dayScheduleSchema,
      sunday: dayScheduleSchema,
    })
    .optional(),
  slotDurationMinutes: z.number().int().min(10).max(120).optional(),
  minNoticeHours: z.number().int().min(0).max(168).optional(),
  maxDaysInAdvance: z.number().int().min(1).max(90).optional(),
  bufferMinutes: z.number().int().min(0).max(60).optional(),
  meetingTypes: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        enabled: z.boolean(),
      })
    )
    .optional(),
  meetingTitle: z.string().min(1).max(100).optional(),
  introText: z.string().max(500).nullable().optional(),
})

export async function GET(): Promise<NextResponse> {
  const auth = await verifyAdminRequest()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const settings = await getCalendarSettings()
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Failed to fetch calendar settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const auth = await verifyAdminRequest()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = updateSettingsSchema.parse(body)
    const updated = await updateCalendarSettings(data)
    return NextResponse.json({ settings: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid settings data', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Failed to update calendar settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
