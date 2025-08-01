import 'server-only'

import { headers } from 'next/headers'
import { cache } from 'react'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'

/**
 * This wraps the `createTRPCContext` helper and provides the required context
 * for the tRPC API when handling a server-side request.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers())
  heads.set('x-trpc-source', 'rsc')

  return createTRPCContext({
    headers: heads,
  })
})

/**
 * Create a server-side caller for the tRPC API.
 * This should be used in all server components and API routes.
 * The function is cached to ensure consistent context within a request.
 */
export const createApi = cache(async () => {
  const context = await createContext()
  return appRouter.createCaller(context)
})

// Legacy export for backwards compatibility - will be removed
export const api = createApi
