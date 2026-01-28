-- Migration: Calendar Scheduling Feature
-- Description: Add calendar settings and bookings tables for scheduling

-- Calendar settings (single-row admin config)
CREATE TABLE IF NOT EXISTS calendar_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  timezone TEXT NOT NULL DEFAULT 'Europe/Copenhagen',
  weekly_schedule JSONB NOT NULL DEFAULT '{
    "monday":    {"enabled": true,  "startTime": "09:00", "endTime": "17:00"},
    "tuesday":   {"enabled": true,  "startTime": "09:00", "endTime": "17:00"},
    "wednesday": {"enabled": true,  "startTime": "09:00", "endTime": "17:00"},
    "thursday":  {"enabled": true,  "startTime": "09:00", "endTime": "17:00"},
    "friday":    {"enabled": true,  "startTime": "09:00", "endTime": "17:00"},
    "saturday":  {"enabled": false, "startTime": "09:00", "endTime": "17:00"},
    "sunday":    {"enabled": false, "startTime": "09:00", "endTime": "17:00"}
  }'::jsonb,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
  min_notice_hours INTEGER NOT NULL DEFAULT 24,
  max_days_in_advance INTEGER NOT NULL DEFAULT 30,
  buffer_minutes INTEGER NOT NULL DEFAULT 15,
  meeting_types JSONB NOT NULL DEFAULT '[
    {"id": "google-meet", "label": "Google Meet", "enabled": true},
    {"id": "phone", "label": "Phone Call", "enabled": true}
  ]'::jsonb,
  google_calendar_connected BOOLEAN DEFAULT false,
  google_access_token TEXT,
  google_refresh_token TEXT,
  google_token_expires_at TIMESTAMPTZ,
  google_calendar_id TEXT DEFAULT 'primary',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO calendar_settings (id) VALUES ('default') ON CONFLICT DO NOTHING;

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  message TEXT,
  meeting_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON bookings(guest_email);
CREATE INDEX IF NOT EXISTS idx_bookings_upcoming ON bookings(start_time)
  WHERE status = 'confirmed';

-- Constraints
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('confirmed', 'cancelled'));
ALTER TABLE bookings ADD CONSTRAINT bookings_time_check
  CHECK (end_time > start_time);
