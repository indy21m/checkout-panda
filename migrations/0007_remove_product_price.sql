-- Migration: Remove price fields and add subtitle to products table
-- Date: 2025-08-17
-- Description: Simplify products table by removing direct pricing (now handled by offers) and adding subtitle field

-- Add subtitle column
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "subtitle" text;

-- Drop price and currency columns
ALTER TABLE "products" DROP COLUMN IF EXISTS "price";
ALTER TABLE "products" DROP COLUMN IF EXISTS "currency";

-- Add comment for documentation
COMMENT ON COLUMN "products"."subtitle" IS 'Short tagline displayed below product name';