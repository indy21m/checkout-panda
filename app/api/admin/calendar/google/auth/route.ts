import { NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/auth'
import { getGoogleAuthUrl } from '@/lib/google-calendar'

export async function GET(): Promise<NextResponse> {
  const auth = await verifyAdminRequest()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: 401 })
  }

  const url = getGoogleAuthUrl()
  if (!url) {
    // Debug: show which env vars are missing
    const missing = []
    if (!process.env.GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID')
    if (!process.env.GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET')
    if (!process.env.GOOGLE_REDIRECT_URI) missing.push('GOOGLE_REDIRECT_URI')

    return NextResponse.json(
      {
        error: `Google Calendar is not configured. Missing: ${missing.join(', ') || 'unknown - check env var values'}`,
      },
      { status: 500 }
    )
  }

  return NextResponse.redirect(url)
}
