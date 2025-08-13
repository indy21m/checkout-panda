import { createTRPCRouter } from '@/server/api/trpc'
import { productRouter } from '@/server/api/routers/product'
import { checkoutRouter } from '@/server/api/routers/checkout'
import { paymentRouter } from '@/server/api/routers/payment'
import { couponRouter } from '@/server/api/routers/coupon'
import { offerRouter } from '@/server/api/routers/offer'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  product: productRouter,
  checkout: checkoutRouter,
  payment: paymentRouter,
  coupon: couponRouter,
  offer: offerRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 */
export const createCaller = appRouter.createCaller
