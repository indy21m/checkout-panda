import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { StripeService } from '@/server/services/stripe-service'
import { db } from '@/server/db'
import { eq } from 'drizzle-orm'
import { checkouts, products, users } from '@/server/db/schema'
import { TRPCError } from '@trpc/server'
import { stripe } from '@/lib/stripe/config'

const stripeService = new StripeService()

export const paymentRouter = createTRPCRouter({
  createIntent: publicProcedure
    .input(
      z.object({
        checkoutId: z.string().uuid(),
        productId: z.string().uuid(),
        amount: z.number().positive(),
        customerEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Get checkout and product info
        const [checkout, product] = await Promise.all([
          db.query.checkouts.findFirst({
            where: eq(checkouts.id, input.checkoutId),
          }),
          db.query.products.findFirst({
            where: eq(products.id, input.productId),
          }),
        ])

        if (!checkout || !product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Checkout or product not found',
          })
        }

        // Get or create customer
        let customerId: string | undefined
        // For public procedures, we'll handle customer creation differently
        // This would typically be handled with a customer email input

        // Create payment intent
        const paymentIntent = await stripeService.createPaymentIntent({
          amount: input.amount,
          customerId: customerId || '',
          metadata: {
            checkoutId: input.checkoutId,
            productId: input.productId,
            productName: product.name,
          },
        })

        return {
          clientSecret: paymentIntent.client_secret!,
          paymentIntentId: paymentIntent.id,
        }
      } catch (error) {
        console.error('Payment intent creation error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create payment intent',
        })
      }
    }),

  createCheckoutSession: publicProcedure
    .input(
      z.object({
        checkoutId: z.string().uuid(),
        productId: z.string().uuid(),
        customerEmail: z.string().email(),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Get checkout and product
        const [checkout, product] = await Promise.all([
          db.query.checkouts.findFirst({
            where: eq(checkouts.id, input.checkoutId),
          }),
          db.query.products.findFirst({
            where: eq(products.id, input.productId),
          }),
        ])

        if (!checkout || !product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Checkout or product not found',
          })
        }

        // Get customer ID if available
        let customerId: string | undefined
        // For public checkouts, customer will be created at payment time

        // Create Stripe checkout session
        const sessionUrl = await stripeService.createCheckoutSession({
          checkoutId: input.checkoutId,
          productName: product.name,
          amount: product.price,
          customerId,
          customerEmail: input.customerEmail,
          successUrl: input.successUrl,
          cancelUrl: input.cancelUrl,
          metadata: {
            productId: input.productId,
          },
        })

        return { url: sessionUrl }
      } catch (error) {
        console.error('Checkout session creation error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create checkout session',
        })
      }
    }),

  getPaymentMethods: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const user = await db.query.users.findFirst({
          where: eq(users.id, ctx.userId),
        })

        if (!user?.stripeCustomerId) {
          return { paymentMethods: [] }
        }

        // Get payment methods from Stripe
        const paymentMethods = await stripe.paymentMethods.list({
          customer: user.stripeCustomerId,
          type: 'card',
        })

        return {
          paymentMethods: paymentMethods.data.map((pm) => ({
            id: pm.id,
            brand: pm.card?.brand,
            last4: pm.card?.last4,
            expMonth: pm.card?.exp_month,
            expYear: pm.card?.exp_year,
          })),
        }
      } catch (error) {
        console.error('Get payment methods error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get payment methods',
        })
      }
    }),

  setupIntent: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const user = await db.query.users.findFirst({
          where: eq(users.id, ctx.userId),
        })

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          })
        }

        // Get or create customer
        const customerId = await stripeService.getOrCreateCustomer(
          user.id,
          user.email
        )

        // Create setup intent
        const setupIntent = await stripeService.createSetupIntent(customerId)

        return {
          clientSecret: setupIntent.client_secret!,
        }
      } catch (error) {
        console.error('Setup intent creation error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create setup intent',
        })
      }
    }),
})