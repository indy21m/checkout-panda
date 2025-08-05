-- Add new columns only if they don't exist
DO $$ 
BEGIN
    -- Add slug column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'slug') THEN
        ALTER TABLE "products" ADD COLUMN "slug" text;
    END IF;
    
    -- Add featured_description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'featured_description') THEN
        ALTER TABLE "products" ADD COLUMN "featured_description" text;
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status') THEN
        ALTER TABLE "products" ADD COLUMN "status" "product_status" DEFAULT 'draft';
    END IF;
END $$;

-- Generate slugs for existing products where slug is NULL
UPDATE "products" 
SET "slug" = LOWER(REPLACE(REPLACE(name, ' ', '-'), '/', '-'))
WHERE "slug" IS NULL;

-- Make slug unique by appending product id if needed
UPDATE "products" p1
SET "slug" = p1."slug" || '-' || LEFT(p1."id"::text, 8)
WHERE EXISTS (
  SELECT 1 FROM "products" p2 
  WHERE p2."slug" = p1."slug" 
  AND p2."id" < p1."id"
);

-- Make slug NOT NULL if it's still nullable
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'slug' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE "products" ALTER COLUMN "slug" SET NOT NULL;
    END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'products_slug_unique' 
        AND table_name = 'products'
    ) THEN
        ALTER TABLE "products" ADD CONSTRAINT "products_slug_unique" UNIQUE("slug");
    END IF;
END $$;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS "products_slug_idx" ON "products" USING btree ("slug");
CREATE INDEX IF NOT EXISTS "products_user_id_idx" ON "products" USING btree ("user_id");

-- Update status for existing active products
UPDATE "products" 
SET "status" = 'active'
WHERE "is_active" = true AND "status" = 'draft';