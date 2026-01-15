import type { Product } from '@/types'
import { exampleCourse } from './example-course'
import { investingDenmarkCourse } from './investing-denmark-course'

/**
 * File-based products (fallback when database is unavailable)
 */
const fileProducts: Record<string, Product> = {
  'example-course': exampleCourse,
  'investing-denmark': investingDenmarkCourse,
}

/**
 * Get a product by its slug
 *
 * Tries database first, falls back to file-based config if DB unavailable.
 * This is a sync function for backward compatibility with static generation.
 * For database access, use getProductFromDb() directly.
 */
export function getProduct(slug: string): Product | undefined {
  return fileProducts[slug]
}

/**
 * Get a product from the database
 *
 * Use this for admin/API routes that need live database data.
 */
export async function getProductFromDb(slug: string): Promise<Product | undefined> {
  try {
    const { db } = await import('@/lib/db')
    const { products } = await import('@/lib/db/schema')
    const { eq } = await import('drizzle-orm')

    const dbProduct = await db.query.products.findFirst({
      where: eq(products.slug, slug),
    })

    if (dbProduct && dbProduct.isActive) {
      // Reconstruct Product from DB format
      return {
        id: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        stripe: {
          productId: dbProduct.config.stripe.productId ?? dbProduct.stripeProductId ?? '',
          priceId: dbProduct.config.stripe.priceId ?? '',
          priceAmount: dbProduct.config.stripe.priceAmount,
          currency: dbProduct.config.stripe.currency,
          pricingTiers: dbProduct.config.stripe.pricingTiers?.map(tier => ({
            ...tier,
            priceId: tier.priceId ?? '',
          })),
        },
        checkout: dbProduct.config.checkout,
        orderBump: dbProduct.config.orderBump,
        upsells: dbProduct.config.upsells,
        downsell: dbProduct.config.downsell,
        thankYou: dbProduct.config.thankYou,
        integrations: dbProduct.config.integrations,
        meta: dbProduct.config.meta,
      }
    }
  } catch (error) {
    console.error('Database lookup failed, falling back to file config:', error)
  }

  // Fallback to file-based config
  return fileProducts[slug]
}

/**
 * Get all products as an array (from file config)
 */
export function getAllProducts(): Product[] {
  return Object.values(fileProducts)
}

/**
 * Get all products from database
 */
export async function getAllProductsFromDb(): Promise<Product[]> {
  try {
    const { db } = await import('@/lib/db')
    const { products: productsTable } = await import('@/lib/db/schema')
    const { eq } = await import('drizzle-orm')

    const dbProducts = await db.query.products.findMany({
      where: eq(productsTable.isActive, true),
    })

    return dbProducts.map(dbProduct => ({
      id: dbProduct.id,
      slug: dbProduct.slug,
      name: dbProduct.name,
      stripe: {
        productId: dbProduct.config.stripe.productId ?? dbProduct.stripeProductId ?? '',
        priceId: dbProduct.config.stripe.priceId ?? '',
        priceAmount: dbProduct.config.stripe.priceAmount,
        currency: dbProduct.config.stripe.currency,
        pricingTiers: dbProduct.config.stripe.pricingTiers?.map(tier => ({
          ...tier,
          priceId: tier.priceId ?? '',
        })),
      },
      checkout: dbProduct.config.checkout,
      orderBump: dbProduct.config.orderBump,
      upsells: dbProduct.config.upsells,
      downsell: dbProduct.config.downsell,
      thankYou: dbProduct.config.thankYou,
      integrations: dbProduct.config.integrations,
      meta: dbProduct.config.meta,
    }))
  } catch (error) {
    console.error('Database lookup failed, falling back to file config:', error)
    return getAllProducts()
  }
}

/**
 * Get all product slugs (for static generation)
 */
export function getProductSlugs(): string[] {
  return Object.keys(fileProducts)
}

/**
 * Check if a product exists (in file config)
 */
export function productExists(slug: string): boolean {
  return slug in fileProducts
}

// Re-export individual products for direct imports if needed
export { exampleCourse, investingDenmarkCourse }

// Export products registry for migration script
export { fileProducts as products }
