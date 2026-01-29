-- Migration: Add Google Meet fields to bookings
-- Description: Store Google Meet link and calendar event ID for bookings

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS google_meet_link TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT;
