import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { offers, products, coupons } from '@/server/db/schema'
import { eq, and, desc, asc, or, sql } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { SUPPORTED_CURRENCIES } from '@/lib/currency'

export const offerRouter = createTRPCRouter({
  // Get all offers for current user
  list: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid().optional(),
        context: z.enum(['standalone', 'order_bump', 'upsell', 'downsell']).optional(),
        includeInactive: z.boolean().optional().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(offers.userId, ctx.userId)]

      if (input.productId) {
        conditions.push(eq(offers.productId, input.productId))
      }

      if (input.context) {
        conditions.push(eq(offers.context, input.context))
      }

      if (!input.includeInactive) {
        conditions.push(eq(offers.isActive, true))
      }

      const userOffers = await ctx.db.query.offers.findMany({
        where: and(...conditions),
        with: {
          product: true,
          coupon: true,
        },
        orderBy: [desc(offers.createdAt)],
      })

      return userOffers
    }),

  // Get single offer by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const offer = await ctx.db.query.offers.findFirst({
        where: and(eq(offers.id, input.id), eq(offers.userId, ctx.userId)),
        with: {
          product: true,
          coupon: true,
        },
      })

      if (!offer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Offer not found',
        })
      }

      return offer
    }),

  // Create new offer
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Offer name is required'),
        description: z.string().optional(),
        productId: z.string().uuid(),
        context: z.enum(['standalone', 'order_bump', 'upsell', 'downsell']),
        price: z.number().positive('Price must be positive').int('Price must be in cents'),
        compareAtPrice: z.number().positive().int().optional(),
        currency: z.enum(SUPPORTED_CURRENCIES).default('USD'),
        couponId: z.string().uuid().optional(),
        
        // Display settings
        headline: z.string().optional(),
        badgeText: z.string().optional(),
        badgeColor: z.string().optional(),
        imageUrl: z.string().url().optional(),
        
        // Order bump specific
        bumpDescription: z.string().optional(),
        
        // Upsell/Downsell specific
        redirectUrl: z.string().url().optional(),
        declineRedirectUrl: z.string().url().optional(),
        
        // Conditions
        minQuantity: z.number().int().positive().default(1),
        maxQuantity: z.number().int().positive().optional(),
        
        // Availability
        availableFrom: z.date().optional(),
        availableUntil: z.date().optional(),
        maxRedemptions: z.number().int().positive().optional(),
        
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify product exists and belongs to user
      const product = await ctx.db.query.products.findFirst({
        where: and(eq(products.id, input.productId), eq(products.userId, ctx.userId)),
      })

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        })
      }

      // Verify coupon exists and belongs to user if provided
      if (input.couponId) {
        const coupon = await ctx.db.query.coupons.findFirst({
          where: and(eq(coupons.id, input.couponId), eq(coupons.userId, ctx.userId)),
        })

        if (!coupon) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Coupon not found',
          })
        }
      }

      const [newOffer] = await ctx.db
        .insert(offers)
        .values({
          ...input,
          userId: ctx.userId,
          currentRedemptions: 0,
          views: 0,
          conversions: 0,
          revenue: 0,
        })
        .returning()

      if (!newOffer) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create offer',
        })
      }

      // Fetch complete offer with relations
      const completeOffer = await ctx.db.query.offers.findFirst({
        where: eq(offers.id, newOffer.id),
        with: {
          product: true,
          coupon: true,
        },
      })

      return completeOffer!
    }),

  // Update offer
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        context: z.enum(['standalone', 'order_bump', 'upsell', 'downsell']).optional(),
        price: z.number().positive().int().optional(),
        compareAtPrice: z.number().positive().int().optional(),
        currency: z.enum(SUPPORTED_CURRENCIES).optional(),
        couponId: z.string().uuid().nullable().optional(),
        
        // Display settings
        headline: z.string().optional(),
        badgeText: z.string().optional(),
        badgeColor: z.string().optional(),
        imageUrl: z.string().url().optional(),
        
        // Order bump specific
        bumpDescription: z.string().optional(),
        
        // Upsell/Downsell specific
        redirectUrl: z.string().url().optional(),
        declineRedirectUrl: z.string().url().optional(),
        
        // Conditions
        minQuantity: z.number().int().positive().optional(),
        maxQuantity: z.number().int().positive().optional(),
        
        // Availability
        availableFrom: z.date().optional(),
        availableUntil: z.date().optional(),
        maxRedemptions: z.number().int().positive().optional(),
        
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Check if offer exists and belongs to user
      const existingOffer = await ctx.db.query.offers.findFirst({
        where: and(eq(offers.id, id), eq(offers.userId, ctx.userId)),
      })

      if (!existingOffer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Offer not found',
        })
      }

      // Verify coupon exists and belongs to user if updating
      if (updateData.couponId !== undefined && updateData.couponId !== null) {
        const coupon = await ctx.db.query.coupons.findFirst({
          where: and(eq(coupons.id, updateData.couponId), eq(coupons.userId, ctx.userId)),
        })

        if (!coupon) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Coupon not found',
          })
        }
      }

      const [updatedOffer] = await ctx.db
        .update(offers)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(eq(offers.id, id), eq(offers.userId, ctx.userId)))
        .returning()

      // Fetch complete offer with relations
      const completeOffer = await ctx.db.query.offers.findFirst({
        where: eq(offers.id, updatedOffer!.id),
        with: {
          product: true,
          coupon: true,
        },
      })

      return completeOffer!
    }),

  // Delete offer
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check if offer exists and belongs to user
      const existingOffer = await ctx.db.query.offers.findFirst({
        where: and(eq(offers.id, input.id), eq(offers.userId, ctx.userId)),
      })

      if (!existingOffer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Offer not found',
        })
      }

      await ctx.db
        .delete(offers)
        .where(and(eq(offers.id, input.id), eq(offers.userId, ctx.userId)))

      return { success: true }
    }),

  // Duplicate offer
  duplicate: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Fetch existing offer
      const existingOffer = await ctx.db.query.offers.findFirst({
        where: and(eq(offers.id, input.id), eq(offers.userId, ctx.userId)),
      })

      if (!existingOffer) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Offer not found',
        })
      }

      // Create duplicate with modified name
      const [duplicatedOffer] = await ctx.db
        .insert(offers)
        .values({
          ...existingOffer,
          id: undefined as any, // Let database generate new ID
          name: `${existingOffer.name} (Copy)`,
          currentRedemptions: 0,
          views: 0,
          conversions: 0,
          revenue: 0,
          isActive: false, // Start as inactive
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()

      // Fetch complete offer with relations
      const completeOffer = await ctx.db.query.offers.findFirst({
        where: eq(offers.id, duplicatedOffer!.id),
        with: {
          product: true,
          coupon: true,
        },
      })

      return completeOffer!
    }),

  // Get offers by product ID for checkout
  getByProductForCheckout: protectedProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        context: z.enum(['standalone', 'order_bump', 'upsell', 'downsell']),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date()

      // Find active offers for this product and context
      const activeOffers = await ctx.db.query.offers.findMany({
        where: and(
          eq(offers.productId, input.productId),
          eq(offers.context, input.context),
          eq(offers.isActive, true),
          or(
            eq(offers.availableFrom, null),
            // @ts-ignore - date comparison
            offers.availableFrom <= now
          ),
          or(
            eq(offers.availableUntil, null),
            // @ts-ignore - date comparison
            offers.availableUntil >= now
          )
        ),
        with: {
          product: true,
          coupon: true,
        },
        orderBy: [asc(offers.price)], // Show cheapest first
      })

      // Filter by redemption limits
      const availableOffers = activeOffers.filter((offer) => {
        if (!offer.maxRedemptions) return true
        return offer.currentRedemptions < offer.maxRedemptions
      })

      return availableOffers
    }),

  // Track offer view
  trackView: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(offers)
        .set({
          views: sql`${offers.views} + 1`,
        })
        .where(eq(offers.id, input.id))

      return { success: true }
    }),

  // Track offer conversion
  trackConversion: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        revenue: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(offers)
        .set({
          conversions: sql`${offers.conversions} + 1`,
          currentRedemptions: sql`${offers.currentRedemptions} + 1`,
          revenue: sql`${offers.revenue} + ${input.revenue}`,
        })
        .where(eq(offers.id, input.id))

      return { success: true }
    }),
})