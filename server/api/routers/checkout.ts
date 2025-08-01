import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { checkouts, checkoutSessions, funnels } from '@/server/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
}

export const checkoutRouter = createTRPCRouter({
  // Get all checkouts for current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const userCheckouts = await ctx.db.query.checkouts.findMany({
      where: eq(checkouts.userId, ctx.userId),
      orderBy: [desc(checkouts.updatedAt)],
    })

    return userCheckouts
  }),

  // Get single checkout by ID (for editing)
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const checkout = await ctx.db.query.checkouts.findFirst({
        where: and(eq(checkouts.id, input.id), eq(checkouts.userId, ctx.userId)),
      })

      if (!checkout) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checkout not found',
        })
      }

      return checkout
    }),

  // Get published checkout by slug (public)
  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    const checkout = await ctx.db.query.checkouts.findFirst({
      where: and(eq(checkouts.slug, input.slug), eq(checkouts.status, 'published')),
    })

    if (!checkout) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Checkout page not found',
      })
    }

    // Increment view count
    await ctx.db
      .update(checkouts)
      .set({ views: (checkout.views || 0) + 1 })
      .where(eq(checkouts.id, checkout.id))

    return checkout
  }),

  // Create new checkout
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Checkout name is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate unique slug
      let slug = generateSlug(input.name)
      let slugSuffix = 0

      // Check for existing slugs and make unique
      while (true) {
        const existingSlug = await ctx.db.query.checkouts.findFirst({
          where: eq(checkouts.slug, slug + (slugSuffix ? `-${slugSuffix}` : '')),
        })

        if (!existingSlug) {
          slug = slug + (slugSuffix ? `-${slugSuffix}` : '')
          break
        }
        slugSuffix++
      }

      const [newCheckout] = await ctx.db
        .insert(checkouts)
        .values({
          userId: ctx.userId,
          name: input.name,
          slug,
          pageData: {
            blocks: [],
            settings: {
              theme: 'default',
            },
          },
        })
        .returning()

      return newCheckout
    }),

  // Update checkout metadata
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Check if checkout exists and belongs to user
      const existingCheckout = await ctx.db.query.checkouts.findFirst({
        where: and(eq(checkouts.id, id), eq(checkouts.userId, ctx.userId)),
      })

      if (!existingCheckout) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checkout not found',
        })
      }

      // If publishing, set publishedAt timestamp
      if (updateData.status === 'published' && existingCheckout.status !== 'published') {
        ;(updateData as any).publishedAt = new Date()
      }

      const [updatedCheckout] = await ctx.db
        .update(checkouts)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(eq(checkouts.id, id), eq(checkouts.userId, ctx.userId)))
        .returning()

      return updatedCheckout
    }),

  // Save checkout page data (for builder)
  savePageData: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        pageData: z.object({
          blocks: z.array(z.any()),
          settings: z.any(),
        }),
        publish: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, pageData, publish } = input

      // Check if checkout exists and belongs to user
      const existingCheckout = await ctx.db.query.checkouts.findFirst({
        where: and(eq(checkouts.id, id), eq(checkouts.userId, ctx.userId)),
      })

      if (!existingCheckout) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checkout not found',
        })
      }

      const updateData: any = {
        pageData,
        updatedAt: new Date(),
      }

      if (publish) {
        updateData.status = 'published'
        updateData.publishedAt = new Date()
      }

      const [updatedCheckout] = await ctx.db
        .update(checkouts)
        .set(updateData)
        .where(and(eq(checkouts.id, id), eq(checkouts.userId, ctx.userId)))
        .returning()

      return updatedCheckout
    }),

  // Delete checkout
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check if checkout exists and belongs to user
      const existingCheckout = await ctx.db.query.checkouts.findFirst({
        where: and(eq(checkouts.id, input.id), eq(checkouts.userId, ctx.userId)),
      })

      if (!existingCheckout) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checkout not found',
        })
      }

      await ctx.db
        .delete(checkouts)
        .where(and(eq(checkouts.id, input.id), eq(checkouts.userId, ctx.userId)))

      return { success: true }
    }),

  // Duplicate checkout
  duplicate: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1, 'New checkout name is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get original checkout
      const original = await ctx.db.query.checkouts.findFirst({
        where: and(eq(checkouts.id, input.id), eq(checkouts.userId, ctx.userId)),
      })

      if (!original) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checkout not found',
        })
      }

      // Generate unique slug for duplicate
      let slug = generateSlug(input.name)
      let slugSuffix = 0

      while (true) {
        const existingSlug = await ctx.db.query.checkouts.findFirst({
          where: eq(checkouts.slug, slug + (slugSuffix ? `-${slugSuffix}` : '')),
        })

        if (!existingSlug) {
          slug = slug + (slugSuffix ? `-${slugSuffix}` : '')
          break
        }
        slugSuffix++
      }

      const [duplicatedCheckout] = await ctx.db
        .insert(checkouts)
        .values({
          userId: ctx.userId,
          name: input.name,
          slug,
          pageData: original.pageData,
          status: 'draft', // Always start as draft
        })
        .returning()

      return duplicatedCheckout
    }),

  // Get session for upsell/thank you pages
  getSession: publicProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.query.checkoutSessions.findFirst({
        where: eq(checkoutSessions.id, input.sessionId),
        with: {
          checkout: true,
        },
      })

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      }

      // Get funnel data if in upsell flow
      let funnelData = null
      if (session.currentStep !== 'checkout' && session.currentStep !== 'thank-you') {
        const funnel = await ctx.db.query.funnels.findFirst({
          where: eq(funnels.checkoutId, session.checkoutId),
        })

        if (funnel && funnel.flowData) {
          // Extract current offer from funnel flow
          const currentNode = funnel.flowData.nodes.find((n) => n.id === session.currentStep)
          if (currentNode) {
            funnelData = {
              currentOffer: currentNode.data,
              acceptPath: funnel.flowData.edges.find(
                (e) => e.source === currentNode.id && e.data?.condition === 'accept'
              )?.target,
              declinePath: funnel.flowData.edges.find(
                (e) => e.source === currentNode.id && e.data?.condition === 'decline'
              )?.target,
            }
          }
        }
      }

      // Get product details
      const productIds = [
        ...session.sessionData.productsPurchased,
        ...session.sessionData.bumpsAccepted,
        ...session.sessionData.upsellsAccepted,
      ]

      const productsData =
        productIds.length > 0
          ? await ctx.db.query.products.findMany({
              where: (products, { inArray }) => inArray(products.id, productIds),
            })
          : []

      return {
        ...session,
        funnelData,
        products: productsData,
      }
    }),

  // Accept upsell offer
  acceptUpsell: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        offerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.query.checkoutSessions.findFirst({
        where: eq(checkoutSessions.id, input.sessionId),
      })

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      }

      // Update session data
      const updatedSessionData = {
        ...session.sessionData,
        upsellsAccepted: [...session.sessionData.upsellsAccepted, input.offerId],
        // In real implementation, would calculate actual price
        totalSpent: session.sessionData.totalSpent + 2900, // Example price
      }

      // Get next step from funnel
      const funnel = await ctx.db.query.funnels.findFirst({
        where: eq(funnels.checkoutId, session.checkoutId),
      })

      let nextPath = null
      if (funnel && funnel.flowData) {
        const edge = funnel.flowData.edges.find(
          (e) => e.source === session.currentStep && e.data?.condition === 'accept'
        )
        if (edge) {
          const nextNode = funnel.flowData.nodes.find((n) => n.id === edge.target)
          if (nextNode?.type === 'thankYou') {
            nextPath = `/thank-you/${session.id}`
          } else if (nextNode) {
            nextPath = `/upsell/${session.id}`
            // Update current step
            await ctx.db
              .update(checkoutSessions)
              .set({
                currentStep: nextNode.id,
                sessionData: updatedSessionData,
              })
              .where(eq(checkoutSessions.id, input.sessionId))
          }
        }
      }

      if (!nextPath) {
        // Default to thank you if no next step
        await ctx.db
          .update(checkoutSessions)
          .set({
            currentStep: 'thank-you',
            sessionData: updatedSessionData,
            completedAt: new Date(),
          })
          .where(eq(checkoutSessions.id, input.sessionId))

        nextPath = `/thank-you/${session.id}`
      }

      return { nextPath }
    }),

  // Decline upsell offer
  declineUpsell: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        offerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.query.checkoutSessions.findFirst({
        where: eq(checkoutSessions.id, input.sessionId),
      })

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      }

      // Get next step from funnel
      const funnel = await ctx.db.query.funnels.findFirst({
        where: eq(funnels.checkoutId, session.checkoutId),
      })

      let nextPath = null
      if (funnel && funnel.flowData) {
        const edge = funnel.flowData.edges.find(
          (e) => e.source === session.currentStep && e.data?.condition === 'decline'
        )
        if (edge) {
          const nextNode = funnel.flowData.nodes.find((n) => n.id === edge.target)
          if (nextNode?.type === 'thankYou') {
            nextPath = `/thank-you/${session.id}`
          } else if (nextNode?.type === 'downsell') {
            nextPath = `/upsell/${session.id}`
            // Update current step
            await ctx.db
              .update(checkoutSessions)
              .set({
                currentStep: nextNode.id,
              })
              .where(eq(checkoutSessions.id, input.sessionId))
          }
        }
      }

      if (!nextPath) {
        // Default to thank you if no next step
        await ctx.db
          .update(checkoutSessions)
          .set({
            currentStep: 'thank-you',
            completedAt: new Date(),
          })
          .where(eq(checkoutSessions.id, input.sessionId))

        nextPath = `/thank-you/${session.id}`
      }

      return { nextPath }
    }),
})
