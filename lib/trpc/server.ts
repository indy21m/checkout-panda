import 'server-only'

import { headers } from 'next/headers'
import { cache } from 'react'
import { createCaller } from '@/server/api/root'
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

export const api = await createCaller(await createContext())
