# Checkout Panda

High-converting checkout pages for digital products. Built with Next.js 15, Stripe, and Tailwind CSS.

## What It Does

Checkout Panda is a focused checkout platform for selling courses, templates, and digital products. It provides:

- **Static checkout pages** - Fast, SEO-friendly pages generated at build time
- **Multiple pricing tiers** - One-time payments or installment plans
- **Order bumps** - Add-on offers during checkout
- **Stripe integration** - Cards, Apple Pay, Google Pay, Klarna, MobilePay
- **VAT handling** - Automatic EU tax calculation with B2B exemptions
- **Admin UI** - Manage products and sync with Stripe at `/admin`
- **Zapier integration** - Trigger ConvertKit, Circle, etc. on purchase

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Payments:** Stripe (Payment Element)
- **Database:** Neon Postgres + Drizzle ORM
- **Auth:** Clerk (for admin)
- **Styling:** Tailwind CSS 4
- **Deployment:** Vercel

## Project Structure

```
checkout-panda/
├── app/
│   ├── [product]/          # Dynamic checkout routes
│   │   ├── checkout/       # Main checkout page
│   │   ├── thank-you/      # Post-purchase
│   │   ├── upsell-1/       # Upsell flow
│   │   └── downsell/       # Downsell flow
│   ├── admin/              # Product management UI
│   └── api/
│       ├── admin/products/ # Product CRUD + Stripe sync
│       ├── create-payment-intent/
│       ├── charge-upsell/
│       ├── validate-coupon/
│       └── webhooks/stripe/
├── components/
│   ├── admin/              # Admin UI components
│   ├── checkout/           # Checkout form, payment, etc.
│   ├── ui/                 # Base components (shadcn/ui)
│   └── ...
├── config/products/        # Product configurations (fallback)
├── lib/
│   ├── db/                 # Drizzle schema + connection
│   └── stripe/             # Stripe config
├── migrations/             # SQL migrations
└── scripts/                # DB seed script
```

## How It Works

### Checkout Flow

1. Customer visits `/{product-slug}/checkout`
2. Selects pricing tier (one-time or installments)
3. Optionally adds order bump
4. Enters payment details via Stripe Payment Element
5. On success → thank you page (or upsell flow if configured)
6. Webhook sends purchase data to Zapier → ConvertKit/Circle

### Product Management

Products are stored in the database and synced to Stripe:

1. Visit `/admin` (requires Clerk auth)
2. Edit product name, pricing, tiers
3. Save → automatically creates/updates Stripe products and prices
4. Checkout pages use the synced Stripe price IDs

### Pricing Tiers

Each product can have multiple pricing options:

- **One-time payment** - Single charge
- **Installment plan** - Recurring subscription that auto-cancels after N payments

## Setup

### Prerequisites

- Node.js 18+
- pnpm
- Stripe account
- Neon database
- Clerk account
- Vercel account

### Environment Variables

```bash
# Database
DATABASE_URL=postgres://...@neon.tech/neondb?sslmode=require

# Clerk
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...

# Stripe
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Admin (comma-separated emails)
ADMIN_EMAILS=you@example.com

# Integrations (optional)
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/...
```

### Installation

```bash
# Install dependencies
pnpm install

# Run database migration (in Neon SQL Editor)
# Copy contents of migrations/0001_create_products_tables.sql

# Seed database from config files
DATABASE_URL="your-url" npx tsx scripts/migrate-products-to-db.ts

# Start dev server
pnpm dev
```

### Stripe Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## Development

```bash
pnpm dev          # Start dev server
pnpm type-check   # TypeScript check
pnpm build        # Production build
pnpm format       # Format with Prettier
```

## Integrations

### Zapier

On every successful payment, a webhook is sent with:

```json
{
  "event": "purchase",
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "amount": 69900,
  "currency": "DKK",
  "productSlug": "investing-denmark",
  "productName": "The Ultimate Investing Course",
  "purchaseType": "main_purchase",
  "includeOrderBump": true,
  "convertkitTags": ["purchased-course", "customer"],
  "timestamp": "2024-01-15T12:00:00Z"
}
```

Use this to:
- Add tags in ConvertKit
- Grant access in Circle
- Send to your CRM
- Trigger email sequences

See [Zapier Setup Guide](./docs/ZAPIER_INTEGRATION.md) for details.

## Deployment

Push to main → auto-deploys to Vercel.

Ensure all environment variables are set in Vercel dashboard.

## License

MIT
