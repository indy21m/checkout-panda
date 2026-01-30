-- Migration: Add profile fields to calendar settings
-- Description: Store profile info for booking page (name, picture, intro text)

ALTER TABLE calendar_settings ADD COLUMN IF NOT EXISTS google_name TEXT;
ALTER TABLE calendar_settings ADD COLUMN IF NOT EXISTS google_picture TEXT;
ALTER TABLE calendar_settings ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE calendar_settings ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE calendar_settings ADD COLUMN IF NOT EXISTS meeting_title TEXT DEFAULT 'Intro Call';
ALTER TABLE calendar_settings ADD COLUMN IF NOT EXISTS intro_text TEXT;
