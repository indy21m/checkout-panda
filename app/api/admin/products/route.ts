import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { products, type ProductConfig, type ProductType } from '@/lib/db/schema'
import { getProductsWithOffers } from '@/lib/db/products'

// Schema for stripe config (shared between all product types)
const stripeConfigSchema = z.object({
  productId: z.string().nullable(),
  priceId: z.string().nullable(),
  priceAmount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'DKK']),
  pricingTiers: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        priceId: z.string().nullable(),
        priceAmount: z.number().positive(),
        originalPrice: z.number().optional(),
        isDefault: z.boolean().optional(),
        description: z.string().optional(),
        installments: z
          .object({
            count: z.number().positive(),
            intervalLabel: z.string(),
            amountPerPayment: z.number().positive(),
          })
          .optional(),
      })
    )
    .optional(),
})

// Schema for main product config
const mainProductConfigSchema = z.object({
  stripe: stripeConfigSchema,
  checkout: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    image: z.string(),
    benefits: z.array(z.string()),
    testimonial: z.any().optional(),
    testimonials: z.array(z.any()).optional(),
    guarantee: z.string(),
    guaranteeDays: z.number().optional(),
    faq: z.array(z.any()).optional(),
  }),
  orderBump: z.any().optional(),
  upsells: z.array(z.any()).optional(),
  downsell: z.any().optional(),
  thankYou: z.object({
    headline: z.string(),
    subheadline: z.string().optional(),
    steps: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    ),
    ctaButton: z
      .object({
        text: z.string(),
        url: z.string(),
      })
      .optional(),
  }),
  integrations: z.any().optional(),
  meta: z.any().optional(),
})

// Schema for offer product config (upsell/downsell)
const offerProductConfigSchema = z.object({
  stripe: stripeConfigSchema,
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string(),
  benefits: z.array(z.string()),
  originalPrice: z.number().optional(),
  image: z.string().optional(),
  urgencyText: z.string().optional(),
  enabled: z.boolean().optional(),
})

// Schema for bump product config
const bumpProductConfigSchema = z.object({
  stripe: stripeConfigSchema,
  title: z.string(),
  description: z.string(),
  savingsPercent: z.number().optional(),
  image: z.string().optional(),
  enabled: z.boolean().optional(),
})

// Create product schema with type discrimination
const createProductSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['main', 'upsell', 'downsell', 'bump']).default('main'),
  config: z.union([mainProductConfigSchema, offerProductConfigSchema, bumpProductConfigSchema]),
})

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const typeFilter = searchParams.get('type') as ProductType | null
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const productsWithUsage = await getProductsWithOffers({
      type: typeFilter,
      includeInactive,
    })

    return NextResponse.json({ products: productsWithUsage })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const data = createProductSchema.parse(body)

    const newProduct = await db
      .insert(products)
      .values({
        id: data.id,
        slug: data.slug,
        name: data.name,
        type: data.type,
        config: data.config as ProductConfig,
        stripeSyncStatus: 'pending',
        isActive: true,
      })
      .returning()

    return NextResponse.json({ product: newProduct[0] }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Failed to create product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
