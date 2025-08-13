CREATE TYPE "public"."offer_context" AS ENUM('standalone', 'order_bump', 'upsell', 'downsell');--> statement-breakpoint
CREATE TABLE "offers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"product_id" uuid NOT NULL,
	"context" "offer_context" NOT NULL,
	"price" integer NOT NULL,
	"compare_at_price" integer,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"coupon_id" uuid,
	"headline" text,
	"badge_text" text,
	"badge_color" text,
	"image_url" text,
	"bump_description" text,
	"redirect_url" text,
	"decline_redirect_url" text,
	"min_quantity" integer DEFAULT 1,
	"max_quantity" integer,
	"available_from" timestamp,
	"available_until" timestamp,
	"max_redemptions" integer,
	"current_redemptions" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"views" integer DEFAULT 0,
	"conversions" integer DEFAULT 0,
	"revenue" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "offers_product_id_idx" ON "offers" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "offers_context_idx" ON "offers" USING btree ("context");--> statement-breakpoint
CREATE INDEX "offers_user_id_idx" ON "offers" USING btree ("user_id");