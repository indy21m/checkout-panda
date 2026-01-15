/**
 * Migration Script: Seed database from config files
 *
 * This script imports products from TypeScript config files into the database.
 * Run once after setting up the database tables.
 *
 * Usage:
 *   npx tsx scripts/migrate-products-to-db.ts
 *
 * Prerequisites:
 *   - DATABASE_URL environment variable set
 *   - Database tables created (run migrations/0001_create_products_tables.sql)
 */

import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../lib/db/schema'
import { products as configProducts } from '../config/products'
import type { ProductConfig } from '../lib/db/schema'
import type { Product, PricingTier } from '../types'

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  console.log('Connecting to database...')
  const sql = neon(databaseUrl)
  const db = drizzle(sql, { schema })

  console.log(`Found ${Object.keys(configProducts).length} products to migrate\n`)

  for (const [slug, product] of Object.entries(configProducts) as [string, Product][]) {
    console.log(`Migrating: ${product.name} (${slug})`)

    // Transform product to database format
    const config: ProductConfig = {
      stripe: {
        productId: null, // Will be set when synced to Stripe
        priceId: null,
        priceAmount: product.stripe.priceAmount,
        currency: product.stripe.currency,
        pricingTiers: product.stripe.pricingTiers?.map((tier: PricingTier) => ({
          id: tier.id,
          label: tier.label,
          priceId: null, // Will be set when synced to Stripe
          priceAmount: tier.priceAmount,
          originalPrice: tier.originalPrice,
          isDefault: tier.isDefault,
          description: tier.description,
          installments: tier.installments,
        })),
      },
      checkout: product.checkout,
      orderBump: product.orderBump,
      upsells: product.upsells,
      downsell: product.downsell,
      thankYou: product.thankYou,
      integrations: product.integrations,
      meta: product.meta,
    }

    try {
      await db.insert(schema.products).values({
        id: product.id,
        slug: product.slug,
        name: product.name,
        config,
        stripeSyncStatus: 'pending',
        isActive: true,
      }).onConflictDoNothing()

      console.log(`  ✓ Migrated successfully`)
    } catch (error) {
      console.error(`  ✗ Failed to migrate:`, error)
    }
  }

  console.log('\nMigration complete!')
  console.log('Next steps:')
  console.log('  1. Visit /admin to view your products')
  console.log('  2. Click "Sync" on each product to create Stripe products/prices')
}

main().catch(console.error)
