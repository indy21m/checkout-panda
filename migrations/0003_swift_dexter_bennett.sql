-- Create product status enum
CREATE TYPE "public"."product_status" AS ENUM('active', 'inactive', 'draft');

-- Add new columns (slug as nullable initially)
ALTER TABLE "products" ADD COLUMN "slug" text;
ALTER TABLE "products" ADD COLUMN "featured_description" text;
ALTER TABLE "products" ADD COLUMN "status" "product_status" DEFAULT 'draft';

-- Generate slugs for existing products
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

-- Now make slug NOT NULL and add constraints
ALTER TABLE "products" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "products" ADD CONSTRAINT "products_slug_unique" UNIQUE("slug");

-- Add indexes
CREATE INDEX "products_slug_idx" ON "products" USING btree ("slug");
CREATE INDEX "products_user_id_idx" ON "products" USING btree ("user_id");

-- Update status for existing active products
UPDATE "products" 
SET "status" = 'active'
WHERE "isActive" = true AND "status" = 'draft';