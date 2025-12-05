'use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

// Check if Clerk key looks valid (has proper format)
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
const isValidClerkKey = clerkKey && clerkKey.startsWith('pk_') && clerkKey.length > 30

// Dynamically import ClerkProvider only on client-side to avoid build-time validation
const ClerkProviderDynamic = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.ClerkProvider),
  { ssr: false }
)

export function AuthProvider({ children }: AuthProviderProps) {
  // Only wrap with ClerkProvider if we have a valid-looking key
  if (!isValidClerkKey) {
    return <>{children}</>
  }

  return <ClerkProviderDynamic>{children}</ClerkProviderDynamic>
}
