import { createTRPCRouter } from '@/server/api/trpc'
import { productRouter } from '@/server/api/routers/product'
import { checkoutRouter } from '@/server/api/routers/checkout'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  product: productRouter,
  checkout: checkoutRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 */
export const createCaller = appRouter.createCaller
