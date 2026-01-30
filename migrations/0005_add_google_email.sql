-- Migration: Add Google email to calendar settings
-- Description: Store the Google account email for admin notifications

ALTER TABLE calendar_settings ADD COLUMN IF NOT EXISTS google_email TEXT;
