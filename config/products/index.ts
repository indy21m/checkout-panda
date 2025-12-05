import type { Product } from '@/types'
import { exampleCourse } from './example-course'

/**
 * All products registry
 *
 * To add a new product:
 * 1. Create a new file: your-product-slug.ts
 * 2. Import it here
 * 3. Add it to the products object below
 *
 * The key should match the product's slug
 */
export const products: Record<string, Product> = {
  'example-course': exampleCourse,
  // Add more products here:
  // 'another-product': anotherProduct,
}

/**
 * Get a product by its slug
 */
export function getProduct(slug: string): Product | undefined {
  return products[slug]
}

/**
 * Get all products as an array
 */
export function getAllProducts(): Product[] {
  return Object.values(products)
}

/**
 * Get all product slugs (for static generation)
 */
export function getProductSlugs(): string[] {
  return Object.keys(products)
}

/**
 * Check if a product exists
 */
export function productExists(slug: string): boolean {
  return slug in products
}

// Re-export individual products for direct imports if needed
export { exampleCourse }
