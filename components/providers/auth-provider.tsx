'use client'

import type { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

// Supabase auth is handled via cookies - no provider wrapper needed
// This component is kept for structural compatibility
export function AuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>
}
