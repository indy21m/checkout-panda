import type { Product, Upsell, Downsell, OrderBump } from '@/types'
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
 * Get a product from the database with assembled linked offers
 *
 * Use this for admin/API routes that need live database data.
 * This function assembles the full product by:
 * 1. Fetching the main product
 * 2. Fetching linked offers from product_offers table
 * 3. Converting offer products to upsells/downsells/bumps format
 * 4. Falling back to legacy nested config if no linked offers exist
 */
export async function getProductFromDb(slug: string): Promise<Product | undefined> {
  try {
    const { db } = await import('@/lib/db')
    const { products, productOffers } = await import('@/lib/db/schema')
    const { eq, and, asc } = await import('drizzle-orm')

    const dbProduct = await db.query.products.findFirst({
      where: and(eq(products.slug, slug), eq(products.isActive, true)),
    })

    if (!dbProduct) {
      return fileProducts[slug]
    }

    // Only assemble linked offers for main products
    if (dbProduct.type === 'main') {
      // Fetch linked offers
      const linkedOffers = await db.query.productOffers.findMany({
        where: eq(productOffers.productId, dbProduct.id),
        orderBy: [asc(productOffers.position)],
        with: {
          offer: true,
        },
      })

      // Convert linked offer products to legacy format for backward compatibility
      const assembledUpsells: Upsell[] = []
      let assembledDownsell: Downsell | undefined
      let assembledOrderBump: OrderBump | undefined

      for (const link of linkedOffers) {
        if (!link.offer || !link.offer.isActive) continue

        const offerProduct = link.offer
        const offerConfig = offerProduct.config

        if (link.role === 'upsell') {
          assembledUpsells.push({
            id: offerProduct.id,
            slug: offerProduct.slug,
            stripe: {
              productId: offerConfig.stripe.productId ?? offerProduct.stripeProductId ?? '',
              priceId: offerConfig.stripe.priceId ?? '',
              priceAmount: offerConfig.stripe.priceAmount,
              currency: offerConfig.stripe.currency,
            },
            title: offerConfig.title ?? offerProduct.name,
            subtitle: offerConfig.subtitle,
            description: offerConfig.description ?? '',
            benefits: offerConfig.benefits ?? [],
            originalPrice: offerConfig.originalPrice,
            image: offerConfig.image,
            urgencyText: offerConfig.urgencyText,
          })
        } else if (link.role === 'downsell') {
          assembledDownsell = {
            enabled: link.enabled && offerConfig.enabled !== false,
            slug: offerProduct.slug,
            stripe: {
              productId: offerConfig.stripe.productId ?? offerProduct.stripeProductId ?? '',
              priceId: offerConfig.stripe.priceId ?? '',
              priceAmount: offerConfig.stripe.priceAmount,
              currency: offerConfig.stripe.currency,
            },
            title: offerConfig.title ?? offerProduct.name,
            subtitle: offerConfig.subtitle,
            description: offerConfig.description ?? '',
            benefits: offerConfig.benefits ?? [],
            originalPrice: offerConfig.originalPrice,
            image: offerConfig.image,
          }
        } else if (link.role === 'bump') {
          assembledOrderBump = {
            enabled: link.enabled && offerConfig.enabled !== false,
            stripe: {
              productId: offerConfig.stripe.productId ?? offerProduct.stripeProductId ?? '',
              priceId: offerConfig.stripe.priceId ?? '',
              priceAmount: offerConfig.stripe.priceAmount,
              currency: offerConfig.stripe.currency,
            },
            title: offerConfig.title ?? offerProduct.name,
            description: offerConfig.description ?? '',
            savingsPercent: offerConfig.savingsPercent,
            image: offerConfig.image,
          }
        }
      }

      // Use assembled offers if we have linked offers, otherwise fall back to legacy nested config
      const hasLinkedOffers = linkedOffers.length > 0
      const upsells = hasLinkedOffers
        ? assembledUpsells.length > 0
          ? assembledUpsells
          : undefined
        : dbProduct.config.upsells
      const downsell = hasLinkedOffers ? assembledDownsell : dbProduct.config.downsell
      const orderBump = hasLinkedOffers ? assembledOrderBump : dbProduct.config.orderBump

      return {
        id: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        stripe: {
          productId: dbProduct.config.stripe.productId ?? dbProduct.stripeProductId ?? '',
          priceId: dbProduct.config.stripe.priceId ?? '',
          priceAmount: dbProduct.config.stripe.priceAmount,
          currency: dbProduct.config.stripe.currency,
          pricingTiers: dbProduct.config.stripe.pricingTiers?.map((tier) => ({
            ...tier,
            priceId: tier.priceId ?? '',
          })),
        },
        checkout: dbProduct.config.checkout!,
        orderBump,
        upsells,
        downsell,
        thankYou: dbProduct.config.thankYou!,
        integrations: dbProduct.config.integrations,
        meta: dbProduct.config.meta,
      }
    }

    // For non-main products, return basic product structure
    return {
      id: dbProduct.id,
      slug: dbProduct.slug,
      name: dbProduct.name,
      stripe: {
        productId: dbProduct.config.stripe.productId ?? dbProduct.stripeProductId ?? '',
        priceId: dbProduct.config.stripe.priceId ?? '',
        priceAmount: dbProduct.config.stripe.priceAmount,
        currency: dbProduct.config.stripe.currency,
      },
      checkout: dbProduct.config.checkout ?? {
        title: dbProduct.name,
        image: '',
        benefits: [],
        guarantee: '',
      },
      thankYou: dbProduct.config.thankYou ?? {
        headline: 'Thank you!',
        steps: [],
      },
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
 * Get all main products from database (with assembled offers)
 */
export async function getAllProductsFromDb(): Promise<Product[]> {
  try {
    const { db } = await import('@/lib/db')
    const { products: productsTable } = await import('@/lib/db/schema')
    const { eq, and } = await import('drizzle-orm')

    // Only get main products for the checkout flow
    const dbProducts = await db.query.products.findMany({
      where: and(eq(productsTable.isActive, true), eq(productsTable.type, 'main')),
    })

    // Use getProductFromDb for each to get assembled offers
    const assembledProducts: Product[] = []
    for (const dbProduct of dbProducts) {
      const assembled = await getProductFromDb(dbProduct.slug)
      if (assembled) {
        assembledProducts.push(assembled)
      }
    }

    return assembledProducts
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
