'use client'

import { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'

export function UserSync() {
  const { isSignedIn, userId } = useAuth()

  useEffect(() => {
    if (isSignedIn && userId) {
      // Sync user with database
      fetch('/api/sync-user')
        .then((res) => res.json())
        .then((data) => {
          if (data.message === 'User created successfully') {
            console.log('User synced with database')
          }
        })
        .catch((err) => console.error('Failed to sync user:', err))
    }
  }, [isSignedIn, userId])

  return null
}
