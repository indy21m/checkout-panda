-- Migration: Unified Product Architecture
-- Description: Add product type column and product_offers junction table
-- This allows upsells, downsells, and bumps to be products themselves

-- Step 1: Add type column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'main';

-- Step 2: Create product_offers junction table
CREATE TABLE IF NOT EXISTS product_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  offer_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'upsell' | 'downsell' | 'bump'
  position INTEGER NOT NULL DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, offer_id, role)
);

-- Step 3: Create indexes for product_offers
CREATE INDEX IF NOT EXISTS idx_product_offers_product ON product_offers(product_id);
CREATE INDEX IF NOT EXISTS idx_product_offers_offer ON product_offers(offer_id);
CREATE INDEX IF NOT EXISTS idx_product_offers_role ON product_offers(role);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);

-- Step 4: Add check constraint for valid types
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_type_check;
ALTER TABLE products ADD CONSTRAINT products_type_check
  CHECK (type IN ('main', 'upsell', 'downsell', 'bump'));

-- Step 5: Add check constraint for valid roles
ALTER TABLE product_offers DROP CONSTRAINT IF EXISTS product_offers_role_check;
ALTER TABLE product_offers ADD CONSTRAINT product_offers_role_check
  CHECK (role IN ('upsell', 'downsell', 'bump'));
