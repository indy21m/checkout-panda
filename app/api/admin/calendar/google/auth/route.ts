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
    return NextResponse.json(
      { error: 'Google Calendar is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI.' },
      { status: 500 }
    )
  }

  return NextResponse.redirect(url)
}
