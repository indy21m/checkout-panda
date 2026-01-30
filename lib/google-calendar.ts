import 'server-only'
import { db } from '@/lib/db'
import { calendarSettings } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'
const GOOGLE_FREEBUSY_URL = 'https://www.googleapis.com/calendar/v3/freeBusy'
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars'

// Read Google OAuth credentials at runtime (not build time) to support
// environment variables added after deployment on Vercel
function getGoogleCredentials(): {
  clientId: string | undefined
  clientSecret: string | undefined
  redirectUri: string | undefined
} {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  }
}

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
  const { clientId, redirectUri } = getGoogleCredentials()

  if (!clientId || !redirectUri) return null

  // Request freebusy, events, email, and profile scopes
  const scopes = [
    'https://www.googleapis.com/auth/calendar.freebusy',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ].join(' ')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes,
    access_type: 'offline',
    prompt: 'consent',
  })

  return `${GOOGLE_AUTH_URL}?${params.toString()}`
}

/**
 * Exchange an authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const { clientId, clientSecret, redirectUri } = getGoogleCredentials()

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Google Calendar credentials not configured')
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code: ${error}`)
  }

  return response.json()
}

export interface GoogleUserProfile {
  email: string | null
  name: string | null
  picture: string | null
}

/**
 * Get user profile from Google userinfo API
 */
export async function getUserProfile(accessToken: string): Promise<GoogleUserProfile> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    console.error('Failed to get user profile from Google:', await response.text())
    return { email: null, name: null, picture: null }
  }

  const data = await response.json()
  return {
    email: data.email ?? null,
    name: data.name ?? null,
    picture: data.picture ?? null,
  }
}

/**
 * Get user email from Google userinfo API (deprecated, use getUserProfile)
 */
export async function getUserEmail(accessToken: string): Promise<string | null> {
  const profile = await getUserProfile(accessToken)
  return profile.email
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const { clientId, clientSecret } = getGoogleCredentials()

  if (!clientId || !clientSecret) {
    throw new Error('Google Calendar credentials not configured')
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
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

interface CalendarEvent {
  id: string
  htmlLink: string
  hangoutLink?: string
}

interface CreateEventParams {
  accessToken: string
  calendarId: string
  summary: string
  description?: string
  startTime: Date
  endTime: Date
  attendeeEmail: string
  attendeeName: string
  createMeetLink: boolean
}

/**
 * Create a calendar event with optional Google Meet link
 */
export async function createCalendarEvent({
  accessToken,
  calendarId,
  summary,
  description,
  startTime,
  endTime,
  attendeeEmail,
  attendeeName,
  createMeetLink,
}: CreateEventParams): Promise<CalendarEvent> {
  const event: Record<string, unknown> = {
    summary,
    description,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: 'UTC',
    },
    attendees: [{ email: attendeeEmail, displayName: attendeeName }],
  }

  // Add conference data request for Google Meet
  if (createMeetLink) {
    event.conferenceData = {
      createRequest: {
        requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    }
  }

  const url = `${GOOGLE_CALENDAR_API}/${encodeURIComponent(calendarId)}/events${createMeetLink ? '?conferenceDataVersion=1' : ''}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create calendar event: ${error}`)
  }

  const data = await response.json()
  return {
    id: data.id,
    htmlLink: data.htmlLink,
    hangoutLink: data.hangoutLink,
  }
}
