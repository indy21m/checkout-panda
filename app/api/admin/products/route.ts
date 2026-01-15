import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { products, type ProductConfig } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'

const createProductSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  config: z.object({
    stripe: z.object({
      productId: z.string().nullable(),
      priceId: z.string().nullable(),
      priceAmount: z.number().positive(),
      currency: z.enum(['USD', 'EUR', 'DKK']),
      pricingTiers: z.array(z.object({
        id: z.string(),
        label: z.string(),
        priceId: z.string().nullable(),
        priceAmount: z.number().positive(),
        originalPrice: z.number().optional(),
        isDefault: z.boolean().optional(),
        description: z.string().optional(),
        installments: z.object({
          count: z.number().positive(),
          intervalLabel: z.string(),
          amountPerPayment: z.number().positive(),
        }).optional(),
      })).optional(),
    }),
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
      steps: z.array(z.object({
        title: z.string(),
        description: z.string(),
      })),
      ctaButton: z.object({
        text: z.string(),
        url: z.string(),
      }).optional(),
    }),
    integrations: z.any().optional(),
    meta: z.any().optional(),
  }),
})

export async function GET(): Promise<NextResponse> {
  try {
    const allProducts = await db.query.products.findMany({
      orderBy: [desc(products.createdAt)],
    })

    return NextResponse.json({ products: allProducts })
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const data = createProductSchema.parse(body)

    const newProduct = await db.insert(products).values({
      id: data.id,
      slug: data.slug,
      name: data.name,
      config: data.config as ProductConfig,
      stripeSyncStatus: 'pending',
      isActive: true,
    }).returning()

    return NextResponse.json({ product: newProduct[0] }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Failed to create product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
