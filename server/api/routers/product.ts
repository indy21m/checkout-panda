import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'
import { products } from '@/server/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

export const productRouter = createTRPCRouter({
  // Get all products for current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const userProducts = await ctx.db.query.products.findMany({
      where: eq(products.userId, ctx.userId),
      orderBy: [desc(products.createdAt)],
    })

    return userProducts
  }),

  // Get single product by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.query.products.findFirst({
        where: and(eq(products.id, input.id), eq(products.userId, ctx.userId)),
      })

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        })
      }

      return product
    }),

  // Create new product
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Product name is required'),
        description: z.string().optional(),
        price: z.number().positive('Price must be positive').int('Price must be in cents'),
        isRecurring: z.boolean().default(false),
        interval: z.enum(['month', 'year', 'week', 'day']).optional(),
        intervalCount: z.number().int().positive().default(1).optional(),
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

      const [newProduct] = await ctx.db
        .insert(products)
        .values({
          userId: ctx.userId,
          name: input.name,
          description: input.description,
          price: input.price,
          isRecurring: input.isRecurring,
          interval: input.isRecurring ? input.interval : null,
          intervalCount: input.isRecurring ? input.intervalCount : null,
        })
        .returning()

      return newProduct
    }),

  // Update product
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        price: z.number().positive().int().optional(),
        isRecurring: z.boolean().optional(),
        interval: z.enum(['month', 'year', 'week', 'day']).optional(),
        intervalCount: z.number().int().positive().optional(),
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
        .set(updateData)
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
})
