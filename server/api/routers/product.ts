import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { products, productPlans, productAssets } from '@/server/db/schema'
import { eq, and, desc, asc } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { SUPPORTED_CURRENCIES } from '@/lib/currency'

export const productRouter = createTRPCRouter({
  // Get all products for current user with enhanced data
  list: protectedProcedure
    .input(
      z.object({
        includeArchived: z.boolean().optional().default(false),
        includeAnalytics: z.boolean().optional().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(products.userId, ctx.userId)]

      if (!input.includeArchived) {
        conditions.push(eq(products.isArchived, false))
      }

      const userProducts = await ctx.db.query.products.findMany({
        where: and(...conditions),
        with: {
          plans: {
            where: eq(productPlans.isActive, true),
            orderBy: [asc(productPlans.sortOrder)],
          },
          assets: {
            orderBy: [asc(productAssets.sortOrder)],
          },
        },
        orderBy: [desc(products.createdAt)],
      })

      return userProducts
    }),

  // Get single product by ID with full details
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.query.products.findFirst({
        where: and(eq(products.id, input.id), eq(products.userId, ctx.userId)),
        with: {
          plans: {
            where: eq(productPlans.isActive, true),
            orderBy: [asc(productPlans.sortOrder)],
          },
          assets: {
            orderBy: [asc(productAssets.sortOrder)],
          },
        },
      })

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        })
      }

      return product
    }),

  // Create new product with optional plans
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Product name is required'),
        slug: z.string().optional(), // Will be auto-generated if not provided
        description: z.string().optional(),
        featured_description: z.string().optional(),
        type: z.enum(['digital', 'service', 'membership', 'bundle']).default('digital'),
        status: z.enum(['active', 'inactive', 'draft']).optional().default('active'),
        thumbnail: z.string().optional(),
        color: z.string().optional(),
        features: z.array(z.string()).optional().default([]),

        // Legacy pricing (for backward compatibility)
        price: z.number().positive('Price must be positive').int('Price must be in cents'),
        currency: z.enum(SUPPORTED_CURRENCIES).default('USD'),
        isRecurring: z.boolean().default(false),
        interval: z.enum(['month', 'year', 'week', 'day']).optional(),
        intervalCount: z.number().int().positive().default(1).optional(),

        // New pricing plans
        plans: z
          .array(
            z.object({
              name: z.string(),
              description: z.string().optional(),
              tier: z.enum(['basic', 'pro', 'enterprise', 'custom']).default('basic'),
              price: z.number().positive().int(),
              currency: z.enum(SUPPORTED_CURRENCIES).default('USD'),
              compareAtPrice: z.number().positive().int().optional(),
              features: z.array(z.string()).default([]),
              badge: z.string().optional(),
              isHighlighted: z.boolean().default(false),
              sortOrder: z.number().default(0),
            })
          )
          .optional()
          .default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate recurring product settings
      if (input.isRecurring && !input.interval) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Interval is required for recurring products',
        })
      }

      const { plans: planData, ...productData } = input

      // Generate slug if not provided
      const slug =
        input.slug ||
        input.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')

      // Create product
      const insertResult = await ctx.db
        .insert(products)
        .values({
          userId: ctx.userId,
          ...productData,
          slug,
          interval: input.isRecurring ? input.interval : null,
          intervalCount: input.isRecurring ? input.intervalCount : null,
        })
        .returning()

      const newProduct = insertResult[0]
      if (!newProduct) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create product',
        })
      }

      // Create plans if provided
      if (planData.length > 0) {
        await ctx.db.insert(productPlans).values(
          planData.map((plan) => ({
            ...plan,
            productId: newProduct.id,
          }))
        )
      }

      // Fetch complete product with plans
      const completeProduct = await ctx.db.query.products.findFirst({
        where: eq(products.id, newProduct.id),
        with: {
          plans: {
            orderBy: [asc(productPlans.sortOrder)],
          },
        },
      })

      return completeProduct!
    }),

  // Update product with enhanced features
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        slug: z.string().optional(),
        description: z.string().optional(),
        featured_description: z.string().optional(),
        type: z.enum(['digital', 'service', 'membership', 'bundle']).optional(),
        status: z.enum(['active', 'inactive', 'draft']).optional(),
        thumbnail: z.string().optional(),
        color: z.string().optional(),
        features: z.array(z.string()).optional(),
        price: z.number().positive().int().optional(),
        currency: z.enum(SUPPORTED_CURRENCIES).optional(),
        isRecurring: z.boolean().optional(),
        interval: z.enum(['month', 'year', 'week', 'day']).optional(),
        intervalCount: z.number().int().positive().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Check if product exists and belongs to user
      const existingProduct = await ctx.db.query.products.findFirst({
        where: and(eq(products.id, id), eq(products.userId, ctx.userId)),
      })

      if (!existingProduct) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        })
      }

      // Validate recurring settings if updating
      if (updateData.isRecurring === true && !updateData.interval && !existingProduct.interval) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Interval is required for recurring products',
        })
      }

      const [updatedProduct] = await ctx.db
        .update(products)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(eq(products.id, id), eq(products.userId, ctx.userId)))
        .returning()

      return updatedProduct
    }),

  // Delete product
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check if product exists and belongs to user
      const existingProduct = await ctx.db.query.products.findFirst({
        where: and(eq(products.id, input.id), eq(products.userId, ctx.userId)),
      })

      if (!existingProduct) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        })
      }

      // TODO: Check if product is used in any active checkouts before deleting

      await ctx.db
        .delete(products)
        .where(and(eq(products.id, input.id), eq(products.userId, ctx.userId)))

      return { success: true }
    }),

  // Archive product (soft delete)
  archive: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existingProduct = await ctx.db.query.products.findFirst({
        where: and(eq(products.id, input.id), eq(products.userId, ctx.userId)),
      })

      if (!existingProduct) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        })
      }

      await ctx.db
        .update(products)
        .set({ isArchived: true, isActive: false, updatedAt: new Date() })
        .where(and(eq(products.id, input.id), eq(products.userId, ctx.userId)))

      return { success: true }
    }),

  // Duplicate product
  duplicate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existingProduct = await ctx.db.query.products.findFirst({
        where: and(eq(products.id, input.id), eq(products.userId, ctx.userId)),
        with: {
          plans: true,
          assets: true,
        },
      })

      if (!existingProduct) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        })
      }

      // Create new product with unique slug
      const duplicatedName = `${existingProduct.name} (Copy)`
      const duplicatedSlug = duplicatedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const insertResult = await ctx.db
        .insert(products)
        .values({
          ...existingProduct,
          id: undefined,
          name: duplicatedName,
          slug: duplicatedSlug,
          totalRevenue: 0,
          totalSales: 0,
          conversionRate: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      const newProduct = insertResult[0]
      if (!newProduct) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to duplicate product',
        })
      }

      // Duplicate plans
      if (existingProduct.plans.length > 0) {
        await ctx.db.insert(productPlans).values(
          existingProduct.plans.map((plan) => ({
            ...plan,
            id: undefined,
            productId: newProduct.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          }))
        )
      }

      return newProduct
    }),

  // Plan management
  plans: {
    // Create plan
    create: protectedProcedure
      .input(
        z.object({
          productId: z.string().uuid(),
          name: z.string(),
          description: z.string().optional(),
          tier: z.enum(['basic', 'pro', 'enterprise', 'custom']).default('basic'),
          price: z.number().min(0).int(), // Allow 0 for initial setup
          currency: z.enum(SUPPORTED_CURRENCIES).default('USD'),
          compareAtPrice: z.number().positive().int().optional(),
          isRecurring: z.boolean().default(false),
          billingInterval: z.enum(['month', 'year']).optional(),
          trialDays: z.number().int().min(0).default(0),
          features: z.array(z.string()).default([]),
          limits: z.record(z.string(), z.number()).default({}),
          badge: z.string().optional(),
          badgeColor: z.string().optional(),
          isHighlighted: z.boolean().default(false),
          sortOrder: z.number().default(0),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Verify product ownership
        const product = await ctx.db.query.products.findFirst({
          where: and(eq(products.id, input.productId), eq(products.userId, ctx.userId)),
        })

        if (!product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          })
        }

        const insertResult = await ctx.db.insert(productPlans).values(input).returning()

        return insertResult[0]!
      }),

    // Update plan
    update: protectedProcedure
      .input(
        z.object({
          id: z.string().uuid(),
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.number().positive().int().optional(),
          currency: z.enum(SUPPORTED_CURRENCIES).optional(),
          compareAtPrice: z.number().positive().int().optional(),
          features: z.array(z.string()).optional(),
          limits: z.record(z.string(), z.number()).optional(),
          badge: z.string().optional(),
          badgeColor: z.string().optional(),
          isHighlighted: z.boolean().optional(),
          sortOrder: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...updateData } = input

        // Verify plan ownership through product
        const plan = await ctx.db.query.productPlans.findFirst({
          where: eq(productPlans.id, id),
          with: {
            product: true,
          },
        })

        if (!plan || plan.product.userId !== ctx.userId) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Plan not found',
          })
        }

        const updateResult = await ctx.db
          .update(productPlans)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(eq(productPlans.id, id))
          .returning()

        return updateResult[0]!
      }),

    // Delete plan
    delete: protectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        // Verify plan ownership through product
        const plan = await ctx.db.query.productPlans.findFirst({
          where: eq(productPlans.id, input.id),
          with: {
            product: true,
          },
        })

        if (!plan || plan.product.userId !== ctx.userId) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Plan not found',
          })
        }

        await ctx.db.delete(productPlans).where(eq(productPlans.id, input.id))

        return { success: true }
      }),
  },

  // Update analytics
  updateAnalytics: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        totalRevenue: z.number().int().optional(),
        totalSales: z.number().int().optional(),
        conversionRate: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...analytics } = input

      await ctx.db
        .update(products)
        .set(analytics)
        .where(and(eq(products.id, id), eq(products.userId, ctx.userId)))

      return { success: true }
    }),
})
