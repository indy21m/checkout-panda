import { and, asc, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { productOffers, products, type ProductRecord, type ProductType } from '@/lib/db/schema'

export interface ProductUsage {
  productId: string
  productName: string
  role: string
}

export interface LinkedOfferSummary {
  offerId: string
  offerName: string
  offerIsActive: boolean
  role: string
  position: number
  enabled: boolean
}

export interface ProductWithOffers extends ProductRecord {
  usedIn?: ProductUsage[]
  linkedOffers?: LinkedOfferSummary[]
}

export interface ProductQueryOptions {
  type?: ProductType | null
  includeInactive?: boolean
}

export async function getProductsWithOffers(
  options: ProductQueryOptions = {}
): Promise<ProductWithOffers[]> {
  const includeInactive = options.includeInactive ?? false
  const typeFilter = options.type ?? null

  let whereClause = includeInactive ? undefined : eq(products.isActive, true)

  if (typeFilter) {
    whereClause = includeInactive
      ? eq(products.type, typeFilter)
      : and(eq(products.isActive, true), eq(products.type, typeFilter))
  }

  const allProducts = await db.query.products.findMany({
    where: whereClause,
    orderBy: [desc(products.createdAt)],
  })

  return Promise.all(
    allProducts.map(async (product) => {
      if (product.type !== 'main') {
        const linkedTo = await db.query.productOffers.findMany({
          where: eq(productOffers.offerId, product.id),
          with: {
            product: true,
          },
        })

        return {
          ...product,
          usedIn: linkedTo.map((link) => ({
            productId: link.productId,
            productName: link.product?.name ?? 'Unknown',
            role: link.role,
          })),
        }
      }

      const offerLinks = await db.query.productOffers.findMany({
        where: eq(productOffers.productId, product.id),
        orderBy: [asc(productOffers.position)],
      })

      const linkedOffers = await Promise.all(
        offerLinks.map(async (link) => {
          const offerProduct = await db.query.products.findFirst({
            where: eq(products.id, link.offerId),
          })

          const offerIsActive = offerProduct ? offerProduct.isActive ?? true : false

          return {
            offerId: link.offerId,
            offerName: offerProduct?.name ?? 'Deleted offer',
            offerIsActive,
            role: link.role,
            position: link.position,
            enabled: link.enabled,
          }
        })
      )

      return {
        ...product,
        linkedOffers,
      }
    })
  )
}
