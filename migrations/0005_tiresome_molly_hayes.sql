CREATE TYPE "public"."order_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled');--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"checkout_id" uuid,
	"quote_id" text,
	"customer_id" text,
	"product_id" uuid,
	"plan_id" uuid,
	"stripe_payment_intent_id" text,
	"stripe_setup_intent_id" text,
	"stripe_subscription_id" text,
	"stripe_invoice_id" text,
	"customer_email" text NOT NULL,
	"customer_name" text,
	"customer_phone" text,
	"billing_address" jsonb DEFAULT '{}'::jsonb,
	"currency" "currency" NOT NULL,
	"subtotal" integer NOT NULL,
	"discount" integer DEFAULT 0,
	"tax" integer DEFAULT 0,
	"total" integer NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"order_items" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"failed_at" timestamp,
	"refunded_at" timestamp,
	CONSTRAINT "orders_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" text PRIMARY KEY NOT NULL,
	"checkout_id" uuid NOT NULL,
	"cart_hash" text NOT NULL,
	"customer_email" text,
	"customer_country" text NOT NULL,
	"vat_number" text,
	"product_id" uuid,
	"plan_id" uuid,
	"currency" "currency" NOT NULL,
	"subtotal" integer NOT NULL,
	"discount" integer DEFAULT 0,
	"tax" integer DEFAULT 0,
	"total" integer NOT NULL,
	"line_items" jsonb DEFAULT '[]'::jsonb,
	"meta" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "limit_per_customer" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "min_subtotal" integer;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "start_at" timestamp;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "applies_to" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_checkout_id_checkouts_id_fk" FOREIGN KEY ("checkout_id") REFERENCES "public"."checkouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_plan_id_product_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."product_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_checkout_id_checkouts_id_fk" FOREIGN KEY ("checkout_id") REFERENCES "public"."checkouts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_plan_id_product_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."product_plans"("id") ON DELETE no action ON UPDATE no action;