import { neon } from '@neondatabase/serverless'
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http'
import * as schema from './schema'

// Lazy initialization to avoid build-time errors
let dbInstance: NeonHttpDatabase<typeof schema> | null = null

export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!dbInstance) {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not configured')
    }
    const sql = neon(databaseUrl)
    dbInstance = drizzle(sql, { schema })
  }
  return dbInstance
}

// For backwards compatibility - uses a proxy to lazy-load
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    return getDb()[prop as keyof NeonHttpDatabase<typeof schema>]
  },
})

export type DB = NeonHttpDatabase<typeof schema>
