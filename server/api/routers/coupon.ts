import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { db } from '@/server/db'
import { eq, and, or, sql, desc, asc } from 'drizzle-orm'
import {
  coupons,
  couponProducts,
  couponRedemptions,
  productPlans,
} from '@/server/db/schema'
import { TRPCError } from '@trpc/server'

export const couponRouter = createTRPCRouter({
  // Create a new coupon
  create: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1).max(20).toUpperCase(),
        name: z.string().min(1),
        description: z.string().optional(),
        discountType: z.enum(['percentage', 'fixed']),
        discountValue: z.number().positive(),
        currency: z.enum(['USD', 'EUR', 'DKK']).default('USD'),
        duration: z.enum(['forever', 'once', 'repeating']).default('once'),
        durationInMonths: z.number().optional(),
        maxRedemptions: z.number().optional(),
        maxRedemptionsPerCustomer: z.number().default(1),
        redeemableFrom: z.date().optional(),
        expiresAt: z.date().optional(),
        productScope: z.enum(['all', 'specific']).default('all'),
        productIds: z.array(z.string().uuid()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validate percentage is between 0-100
      if (input.discountType === 'percentage' && input.discountValue > 100) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Percentage discount cannot exceed 100%',
        })
      }

      // Check if coupon code already exists
      const existing = await db.query.coupons.findFirst({
        where: eq(coupons.code, input.code),
      })

      if (existing) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Coupon code already exists',
        })
      }

      // Create coupon
      const [coupon] = await db
        .insert(coupons)
        .values({
          userId: ctx.userId,
          code: input.code,
          name: input.name,
          description: input.description,
          discountType: input.discountType,
          discountValue: input.discountValue,
          currency: input.currency,
          duration: input.duration,
          durationInMonths: input.durationInMonths,
          maxRedemptions: input.maxRedemptions,
          maxRedemptionsPerCustomer: input.maxRedemptionsPerCustomer,
          redeemableFrom: input.redeemableFrom,
          expiresAt: input.expiresAt,
          productScope: input.productScope,
        })
        .returning()

      // Link products if specific scope
      if (input.productScope === 'specific' && input.productIds?.length && coupon) {
        await db.insert(couponProducts).values(
          input.productIds.map((productId) => ({
            couponId: coupon.id,
            productId,
          }))
        )
      }

      return coupon
    }),

  // Update an existing coupon
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        code: z.string().min(1).max(20).toUpperCase().optional(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        discountType: z.enum(['percentage', 'fixed']).optional(),
        discountValue: z.number().positive().optional(),
        currency: z.enum(['USD', 'EUR', 'DKK']).optional(),
        duration: z.enum(['forever', 'once', 'repeating']).optional(),
        durationInMonths: z.number().optional(),
        maxRedemptions: z.number().optional(),
        maxRedemptionsPerCustomer: z.number().optional(),
        redeemableFrom: z.date().optional(),
        expiresAt: z.date().nullable().optional(),
        productScope: z.enum(['all', 'specific']).optional(),
        productIds: z.array(z.string().uuid()).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check ownership
      const existing = await db.query.coupons.findFirst({
        where: and(eq(coupons.id, input.id), eq(coupons.userId, ctx.userId)),
      })

      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Coupon not found',
        })
      }

      // Check for code conflicts if changing code
      if (input.code && input.code !== existing.code) {
        const codeExists = await db.query.coupons.findFirst({
          where: eq(coupons.code, input.code),
        })

        if (codeExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Coupon code already exists',
          })
        }
      }

      // Update coupon
      const [updated] = await db
        .update(coupons)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(coupons.id, input.id))
        .returning()

      // Update product links if needed
      if (input.productScope !== undefined) {
        // Remove existing links
        await db.delete(couponProducts).where(eq(couponProducts.couponId, input.id))

        // Add new links if specific scope
        if (input.productScope === 'specific' && input.productIds?.length) {
          await db.insert(couponProducts).values(
            input.productIds.map((productId) => ({
              couponId: input.id,
              productId,
            }))
          )
        }
      }

      return updated
    }),

  // Delete (soft delete) a coupon
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const result = await db
        .update(coupons)
        .set({ isActive: false })
        .where(and(eq(coupons.id, input.id), eq(coupons.userId, ctx.userId)))
        .returning()

      if (!result.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Coupon not found',
        })
      }

      return { success: true }
    }),

  // List all coupons for the user
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        isActive: z.boolean().optional(),
        sortBy: z.enum(['code', 'createdAt', 'timesRedeemed']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = db
        .select({
          id: coupons.id,
          code: coupons.code,
          name: coupons.name,
          discountType: coupons.discountType,
          discountValue: coupons.discountValue,
          currency: coupons.currency,
          duration: coupons.duration,
          durationInMonths: coupons.durationInMonths,
          productScope: coupons.productScope,
          timesRedeemed: coupons.timesRedeemed,
          maxRedemptions: coupons.maxRedemptions,
          expiresAt: coupons.expiresAt,
          isActive: coupons.isActive,
          createdAt: coupons.createdAt,
        })
        .from(coupons)
        .where(eq(coupons.userId, ctx.userId))
        .$dynamic()

      // Apply filters
      const conditions = []
      if (input.isActive !== undefined) {
        conditions.push(eq(coupons.isActive, input.isActive))
      }
      if (input.search) {
        conditions.push(
          or(
            sql`${coupons.code} ILIKE ${`%${input.search}%`}`,
            sql`${coupons.name} ILIKE ${`%${input.search}%`}`
          )
        )
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions))
      }

      // Apply sorting
      const sortColumn =
        input.sortBy === 'code'
          ? coupons.code
          : input.sortBy === 'timesRedeemed'
          ? coupons.timesRedeemed
          : coupons.createdAt

      query = query.orderBy(input.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn))

      return await query
    }),

  // Get a single coupon with details
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const coupon = await db.query.coupons.findFirst({
        where: and(eq(coupons.id, input.id), eq(coupons.userId, ctx.userId)),
        with: {
          couponProducts: {
            with: {
              product: true,
            },
          },
          redemptions: {
            orderBy: (redemptions, { desc }) => [desc(redemptions.redeemedAt)],
            limit: 10,
          },
        },
      })

      if (!coupon) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Coupon not found',
        })
      }

      return coupon
    }),

  // Validate a coupon (public endpoint for checkout)
  validate: publicProcedure
    .input(
      z.object({
        code: z.string(),
        productId: z.string().uuid().optional(),
        planId: z.string().uuid().optional(),
        amount: z.number(),
        customerEmail: z.string().email().optional(),
      })
    )
    .query(async ({ input }) => {
      // Find coupon
      const coupon = await db.query.coupons.findFirst({
        where: and(eq(coupons.code, input.code.toUpperCase()), eq(coupons.isActive, true)),
        with: {
          couponProducts: true,
        },
      })

      if (!coupon) {
        return {
          valid: false,
          message: 'Invalid coupon code',
        }
      }

      // Check expiry
      const now = new Date()
      if (coupon.redeemableFrom && coupon.redeemableFrom > now) {
        return {
          valid: false,
          message: 'Coupon is not yet active',
        }
      }

      if (coupon.expiresAt && coupon.expiresAt < now) {
        return {
          valid: false,
          message: 'Coupon has expired',
        }
      }

      // Check redemption limits
      if (coupon.maxRedemptions && (coupon.timesRedeemed || 0) >= coupon.maxRedemptions) {
        return {
          valid: false,
          message: 'Coupon has reached maximum redemptions',
        }
      }

      // Check per-customer limits if email provided
      if (input.customerEmail && coupon.maxRedemptionsPerCustomer) {
        const customerRedemptions = await db
          .select({ count: sql<number>`count(*)` })
          .from(couponRedemptions)
          .where(
            and(
              eq(couponRedemptions.couponId, coupon.id),
              eq(couponRedemptions.customerEmail, input.customerEmail)
            )
          )

        const count = customerRedemptions[0]?.count || 0
        if (count >= coupon.maxRedemptionsPerCustomer) {
          return {
            valid: false,
            message: 'You have already used this coupon',
          }
        }
      }

      // Check product scope
      if (coupon.productScope === 'specific') {
        // Get the product ID from plan if provided
        let productIdToCheck = input.productId

        if (!productIdToCheck && input.planId) {
          const plan = await db.query.productPlans.findFirst({
            where: eq(productPlans.id, input.planId),
          })
          productIdToCheck = plan?.productId
        }

        if (!productIdToCheck) {
          return {
            valid: false,
            message: 'No product specified for validation',
          }
        }

        const isValidForProduct = coupon.couponProducts.some(
          (cp) => cp.productId === productIdToCheck
        )

        if (!isValidForProduct) {
          return {
            valid: false,
            message: 'Coupon is not valid for this product',
          }
        }
      }

      // Calculate discount
      let discountAmount = 0
      let discountDisplay = ''

      if (coupon.discountType === 'fixed') {
        discountAmount = coupon.discountValue
        discountDisplay = `$${(coupon.discountValue / 100).toFixed(2)} off`
      } else {
        discountAmount = Math.round(input.amount * (coupon.discountValue / 100))
        discountDisplay = `${coupon.discountValue}% off`
      }

      // Apply duration suffix
      if (coupon.duration === 'forever') {
        discountDisplay += ' forever'
      } else if (coupon.duration === 'repeating' && coupon.durationInMonths) {
        discountDisplay += ` for ${coupon.durationInMonths} months`
      }

      return {
        valid: true,
        couponId: coupon.id,
        discountAmount,
        discountDisplay,
        finalAmount: Math.max(0, input.amount - discountAmount),
        duration: coupon.duration,
        durationInMonths: coupon.durationInMonths,
      }
    }),

  // Record a redemption
  redeem: publicProcedure
    .input(
      z.object({
        couponId: z.string().uuid(),
        customerEmail: z.string().email(),
        customerId: z.string().optional(),
        checkoutSessionId: z.string().uuid().optional(),
        stripePaymentIntentId: z.string().optional(),
        discountApplied: z.number(),
        originalAmount: z.number(),
        finalAmount: z.number(),
        productId: z.string().uuid().optional(),
        productName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Record redemption
      await db.insert(couponRedemptions).values({
        couponId: input.couponId,
        customerEmail: input.customerEmail,
        customerId: input.customerId,
        checkoutSessionId: input.checkoutSessionId,
        stripePaymentIntentId: input.stripePaymentIntentId,
        discountApplied: input.discountApplied,
        originalAmount: input.originalAmount,
        finalAmount: input.finalAmount,
        productId: input.productId,
        productName: input.productName,
      })

      // Increment redemption count
      await db
        .update(coupons)
        .set({
          timesRedeemed: sql`${coupons.timesRedeemed} + 1`,
        })
        .where(eq(coupons.id, input.couponId))

      return { success: true }
    }),

  // Get redemption history
  getRedemptions: protectedProcedure
    .input(
      z.object({
        couponId: z.string().uuid(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const coupon = await db.query.coupons.findFirst({
        where: and(eq(coupons.id, input.couponId), eq(coupons.userId, ctx.userId)),
      })

      if (!coupon) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Coupon not found',
        })
      }

      const redemptions = await db.query.couponRedemptions.findMany({
        where: eq(couponRedemptions.couponId, input.couponId),
        with: {
          product: {
            columns: {
              name: true,
            },
          },
        },
        orderBy: (redemptions, { desc }) => [desc(redemptions.redeemedAt)],
        limit: input.limit,
        offset: input.offset,
      })

      const totalCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(couponRedemptions)
        .where(eq(couponRedemptions.couponId, input.couponId))

      return {
        redemptions,
        totalCount: totalCount[0]?.count || 0,
      }
    }),
})