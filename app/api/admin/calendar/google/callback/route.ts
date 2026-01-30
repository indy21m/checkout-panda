import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/auth'
import { exchangeCodeForTokens, getUserProfile } from '@/lib/google-calendar'
import { updateGoogleTokens } from '@/lib/db/calendar'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await verifyAdminRequest()
  if (auth.error) {
    return NextResponse.redirect(new URL('/sign-in?redirect_url=/admin/calendar', request.url))
  }

  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')

  if (errorParam) {
    console.error('Google OAuth error:', errorParam)
    return NextResponse.redirect(
      new URL('/admin/calendar?google=error', request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/admin/calendar?google=error', request.url)
    )
  }

  try {
    const tokens = await exchangeCodeForTokens(code)
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    // Fetch user profile from Google
    const profile = await getUserProfile(tokens.access_token)

    await updateGoogleTokens({
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token ?? '',
      googleTokenExpiresAt: expiresAt,
      googleCalendarConnected: true,
      googleEmail: profile.email ?? undefined,
      googleName: profile.name ?? undefined,
      googlePicture: profile.picture ?? undefined,
    })

    return NextResponse.redirect(
      new URL('/admin/calendar?google=connected', request.url)
    )
  } catch (error) {
    console.error('Failed to exchange Google OAuth code:', error)
    return NextResponse.redirect(
      new URL('/admin/calendar?google=error', request.url)
    )
  }
}
