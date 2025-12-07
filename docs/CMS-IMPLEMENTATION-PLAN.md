# Checkout Panda CMS - Implementation Plan

> **Status**: Not implemented yet. Save for future reference.
> **Created**: December 2025
> **Estimated effort**: 6-8 hours

## Overview

Add a simple admin CMS to manage products, pricing, upsells, and content without touching code. Uses Neon PostgreSQL with a JSONB approach for maximum simplicity.

## Current State

Products are currently defined in TypeScript files:
- `config/products/investing-denmark-course.ts`
- `config/products/example-course.ts`
- `config/products/index.ts` (registry)

To change any copy, pricing, or testimonials, you must edit code and redeploy.

## Goal

A simple admin UI at `/admin` where you can:
- Edit product titles, descriptions, benefits
- Manage testimonials and FAQs
- Configure order bumps
- Set up upsell/downsell flows
- Change Stripe price IDs
- Toggle products active/inactive

---

## Technical Approach: Single Table with JSONB

Instead of creating 8+ normalized database tables (products, testimonials, faqs, upsells, etc.), we store the entire `Product` configuration as a single JSONB column.

### Database Schema

```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,              -- e.g., 'investing-denmark'
  slug TEXT UNIQUE NOT NULL,        -- URL slug for checkout page
  name TEXT NOT NULL,               -- Display name
  config JSONB NOT NULL,            -- Full Product object (see types/index.ts)
  is_active BOOLEAN DEFAULT true,   -- Soft enable/disable
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
```

### Why JSONB over Normalized Tables

| Aspect | JSONB (Recommended) | Normalized (8+ tables) |
|--------|---------------------|------------------------|
| Complexity | Simple - 1 table | Complex - many joins |
| Schema changes | Just update TypeScript type | Requires migrations |
| Matches existing code | Yes - same Product type | Would need mapping layer |
| Query performance | Fast with GIN indexes | Fast but more complexity |
| Backup/restore | Easy - one table | Multiple tables to sync |
| Risk of bugs | Lower | Higher |

### Product Type Reference

The JSONB `config` column stores the full `Product` type from `types/index.ts`:

```typescript
Product {
  id: string
  slug: string
  name: string

  stripe: {
    productId: string      // prod_xxx
    priceId: string        // price_xxx
    priceAmount: number    // cents
    currency: 'USD' | 'EUR' | 'DKK'
    pricingTiers?: [{
      id: string
      label: string
      priceId: string
      priceAmount: number
      installments?: { count, amountPerPayment }
    }]
  }

  checkout: {
    title: string
    subtitle?: string
    image: string
    benefits: string[]
    testimonials?: [{ quote, author, role?, avatar? }]
    guarantee: string
    faq?: [{ question, answer }]
  }

  orderBump?: {
    enabled: boolean
    stripe: StripeConfig
    title: string
    description: string
    savingsPercent?: number
  }

  upsells?: [{
    id, slug, stripe, title, description, benefits[], urgencyText?
  }]

  downsell?: {
    enabled, slug, stripe, title, description, benefits[]
  }

  thankYou: {
    headline: string
    steps: [{ title, description }]
    ctaButton?: { text, url }
  }

  integrations?: {
    convertkitTags?: string[]
    circleSpaceId?: string
    zapierWebhookUrl?: string
  }
}
```

---

## Implementation Phases

### Phase 1: Database Setup (~1 hour)

**Install dependencies:**
```bash
pnpm add @neondatabase/serverless drizzle-orm
pnpm add -D drizzle-kit
```

**Add to `.env.local`:**
```
DATABASE_URL=postgres://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

**Create files:**
```
src/server/db/
  index.ts        -- Neon serverless connection
  schema.ts       -- Drizzle schema definition
```

**Run migration in Neon console:**
```sql
-- See schema above
```

### Phase 2: Product Repository (~1 hour)

**Create:** `src/server/db/repositories/products.ts`

```typescript
// Pseudocode
export async function getProductBySlug(slug: string): Promise<Product | null>
export async function getAllProducts(): Promise<Product[]>
export async function createProduct(product: Product): Promise<void>
export async function updateProduct(id: string, product: Partial<Product>): Promise<void>
export async function deleteProduct(id: string): Promise<void> // soft delete
```

**Update:** `config/products/index.ts`
- Modify `getProduct()` to check DB first, fall back to file config

### Phase 3: Admin API Routes (~1 hour)

```
app/api/admin/products/
  route.ts              -- GET (list), POST (create)
  [id]/
    route.ts            -- GET, PUT, DELETE
```

Each route:
1. Checks admin auth (email whitelist)
2. Validates input with Zod
3. Calls repository functions

### Phase 4: Admin UI (~3-4 hours)

**Routes:**
```
app/admin/
  layout.tsx            -- Auth check, navigation sidebar
  page.tsx              -- Redirect to /admin/products
  products/
    page.tsx            -- Product list table
    new/
      page.tsx          -- Create new product
    [id]/
      page.tsx          -- Edit product (tabbed form)
```

**Components:**
```
components/admin/
  ProductList.tsx       -- Table with edit/delete/preview actions
  ProductForm.tsx       -- Tabbed form with all sections
  tabs/
    BasicInfoTab.tsx    -- ID, slug, name, active toggle
    PricingTab.tsx      -- Stripe IDs, pricing tiers
    CheckoutTab.tsx     -- Title, benefits, testimonials, FAQ
    OrderBumpTab.tsx    -- Enable, title, description, price
    UpsellFlowTab.tsx   -- Visual flow editor
    ThankYouTab.tsx     -- Headline, steps, CTA
    IntegrationsTab.tsx -- ConvertKit, Circle, Zapier
```

### Phase 5: Security (~30 min)

**Simple email whitelist approach:**

```typescript
// lib/admin-auth.ts
const ADMIN_EMAILS = [
  'mario@yourdomain.com',
  // Add more as needed
]

export function isAdmin(email: string | null): boolean {
  return email ? ADMIN_EMAILS.includes(email.toLowerCase()) : false
}
```

**In middleware.ts:**
```typescript
if (pathname.startsWith('/admin')) {
  const { sessionClaims } = await auth()
  if (!isAdmin(sessionClaims?.email)) {
    return NextResponse.redirect('/sign-in')
  }
}
```

### Phase 6: Data Migration (~30 min)

**Migration script:** `scripts/migrate-products-to-db.ts`

```typescript
import { products } from '@/config/products'
import { db } from '@/server/db'

async function migrate() {
  for (const product of Object.values(products)) {
    await db.insert(productsTable).values({
      id: product.id,
      slug: product.slug,
      name: product.name,
      config: product,
      isActive: true,
    })
  }
  console.log('Migration complete!')
}
```

Run once, then switch `getProduct()` to DB-only mode.

---

## File Structure After Implementation

```
checkout-panda/
├── app/
│   ├── admin/
│   │   ├── layout.tsx              # Admin shell with nav
│   │   ├── page.tsx                # Dashboard/redirect
│   │   └── products/
│   │       ├── page.tsx            # Product list
│   │       ├── new/page.tsx        # Create product
│   │       └── [id]/page.tsx       # Edit product
│   └── api/
│       └── admin/
│           └── products/
│               ├── route.ts        # List/Create
│               └── [id]/route.ts   # Get/Update/Delete
├── components/
│   └── admin/
│       ├── ProductForm.tsx
│       ├── ProductList.tsx
│       └── tabs/...
├── src/server/db/
│   ├── index.ts                    # DB connection
│   ├── schema.ts                   # Drizzle schema
│   └── repositories/
│       └── products.ts             # CRUD operations
├── lib/
│   └── admin-auth.ts               # Email whitelist
└── scripts/
    └── migrate-products-to-db.ts   # One-time migration
```

---

## Risk Mitigation

1. **Keep file configs as fallback** - During transition, `getProduct()` checks DB first, falls back to file
2. **Soft deletes only** - Never hard delete, just set `is_active = false`
3. **Zod validation** - All API inputs validated against Product schema
4. **Preview before publish** - Add preview button to see changes before saving
5. **Audit log** (optional) - Track who changed what when

---

## Prerequisites Before Starting

1. **Neon database** - Create at neon.tech, get connection string
2. **Admin email** - Decide which email(s) get admin access
3. **Test data** - Have a test product ready to verify flow

---

## Not Included (Future Enhancements)

- Multi-user with roles (just email whitelist for now)
- Version history / rollback
- Scheduled publishing
- A/B testing variants
- Asset uploads (use external URLs for images)

---

## Questions to Answer Before Implementation

1. What email(s) should have admin access?
2. Do you have a Neon project/database ready?
3. Any specific UI preferences for the admin panel?
