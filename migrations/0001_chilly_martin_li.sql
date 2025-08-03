CREATE TYPE "public"."asset_type" AS ENUM('download', 'video', 'document', 'resource');--> statement-breakpoint
CREATE TYPE "public"."plan_tier" AS ENUM('basic', 'pro', 'enterprise', 'custom');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('digital', 'service', 'membership', 'bundle');--> statement-breakpoint
CREATE TABLE "product_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"plan_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"type" "asset_type" DEFAULT 'download',
	"file_url" text NOT NULL,
	"file_name" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"requires_purchase" boolean DEFAULT true,
	"max_downloads" integer,
	"expires_in_days" integer,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"tier" "plan_tier" DEFAULT 'basic',
	"price" integer NOT NULL,
	"compare_at_price" integer,
	"is_recurring" boolean DEFAULT false,
	"billing_interval" text,
	"billing_interval_count" integer DEFAULT 1,
	"trial_days" integer DEFAULT 0,
	"features" jsonb DEFAULT '[]'::jsonb,
	"limits" jsonb DEFAULT '{}'::jsonb,
	"stripe_price_id" text,
	"badge" text,
	"badge_color" text,
	"is_highlighted" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "type" "product_type" DEFAULT 'digital';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "thumbnail" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "features" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "total_revenue" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "total_sales" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "conversion_rate" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_archived" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "product_assets" ADD CONSTRAINT "product_assets_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_assets" ADD CONSTRAINT "product_assets_plan_id_product_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."product_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_plans" ADD CONSTRAINT "product_plans_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;