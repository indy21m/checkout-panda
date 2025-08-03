CREATE TYPE "public"."currency" AS ENUM('USD', 'EUR', 'DKK');--> statement-breakpoint
ALTER TABLE "checkout_sessions" ADD COLUMN "currency" "currency" DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "checkouts" ADD COLUMN "currency" "currency" DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "product_plans" ADD COLUMN "currency" "currency" DEFAULT 'USD' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "currency" "currency" DEFAULT 'USD' NOT NULL;