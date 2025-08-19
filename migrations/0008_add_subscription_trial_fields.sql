-- Add subscription and trial fields to offers table
ALTER TABLE offers ADD COLUMN IF NOT EXISTS offer_type TEXT DEFAULT 'one_time';
ALTER TABLE offers ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS billing_cycle TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS billing_interval INTEGER;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS billing_interval_unit TEXT;

-- Add trial configuration fields
ALTER TABLE offers ADD COLUMN IF NOT EXISTS trial_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS trial_type TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS trial_days INTEGER;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS trial_price INTEGER;

-- Add check constraints for valid values
ALTER TABLE offers ADD CONSTRAINT check_offer_type 
  CHECK (offer_type IN ('one_time', 'subscription', 'payment_plan'));

ALTER TABLE offers ADD CONSTRAINT check_billing_cycle 
  CHECK (billing_cycle IS NULL OR billing_cycle IN ('monthly', 'quarterly', 'yearly', 'custom'));

ALTER TABLE offers ADD CONSTRAINT check_billing_interval_unit 
  CHECK (billing_interval_unit IS NULL OR billing_interval_unit IN ('day', 'week', 'month', 'year'));

ALTER TABLE offers ADD CONSTRAINT check_trial_type 
  CHECK (trial_type IS NULL OR trial_type IN ('free', 'paid'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_offers_offer_type ON offers(offer_type);
CREATE INDEX IF NOT EXISTS idx_offers_is_recurring ON offers(is_recurring);
CREATE INDEX IF NOT EXISTS idx_offers_trial_enabled ON offers(trial_enabled);