import 'server-only'
import { db } from '@/lib/db'
import { calendarSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { env } from '@/env'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_FREEBUSY_URL = 'https://www.googleapis.com/calendar/v3/freeBusy'

interface GoogleTokens {
  access_token: string
  refresh_token?: string
  expires_in: number
}

interface BusyPeriod {
  start: Date
  end: Date
}

/**
 * Generate the Google OAuth consent URL
 */
export function getGoogleAuthUrl(): string | null {
  const clientId = env.GOOGLE_CLIENT_ID
  const redirectUri = env.GOOGLE_REDIRECT_URI

  if (!clientId || !redirectUri) return null

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar.freebusy',
    access_type: 'offline',
    prompt: 'consent',
  })

  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

/**
 * Exchange an authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID!,
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: env.GOOGLE_REDIRECT_URI!,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code: ${error}`)
  }

  return response.json()
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: env.GOOGLE_CLIENT_ID!,
      client_secret: env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  return response.json()
}

/**
 * Ensure we have a valid access token, refreshing if needed.
 * Updates the DB if the token was refreshed.
 */
export async function ensureValidAccessToken(settings: {
  googleAccessToken: string | null
  googleRefreshToken: string | null
  googleTokenExpiresAt: Date | null
}): Promise<string | null> {
  if (!settings.googleAccessToken || !settings.googleRefreshToken) return null

  // Check if token is still valid (with 5 min buffer)
  const now = new Date()
  const expiresAt = settings.googleTokenExpiresAt
  if (expiresAt && expiresAt.getTime() > now.getTime() + 5 * 60 * 1000) {
    return settings.googleAccessToken
  }

  // Refresh the token
  const tokens = await refreshAccessToken(settings.googleRefreshToken)

  // Update DB with new token
  const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000)
  await db
    .update(calendarSettings)
    .set({
      googleAccessToken: tokens.access_token,
      googleTokenExpiresAt: newExpiresAt,
      ...(tokens.refresh_token ? { googleRefreshToken: tokens.refresh_token } : {}),
    })
    .where(eq(calendarSettings.id, 'default'))

  return tokens.access_token
}

/**
 * Get busy periods from Google Calendar FreeBusy API
 */
export async function getFreeBusyPeriods(
  accessToken: string,
  timeMin: Date,
  timeMax: Date,
  calendarId: string
): Promise<BusyPeriod[]> {
  const response = await fetch(GOOGLE_FREEBUSY_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: calendarId }],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Google FreeBusy API error: ${error}`)
  }

  const data = await response.json()
  const busy = data.calendars?.[calendarId]?.busy ?? []

  return busy.map((period: { start: string; end: string }) => ({
    start: new Date(period.start),
    end: new Date(period.end),
  }))
}
