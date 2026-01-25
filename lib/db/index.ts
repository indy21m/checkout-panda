import postgres from 'postgres'
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

// Lazy initialization to avoid build-time errors
let dbInstance: PostgresJsDatabase<typeof schema> | null = null

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!dbInstance) {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not configured')
    }
    const client = postgres(databaseUrl, { prepare: false })
    dbInstance = drizzle(client, { schema })
  }
  return dbInstance
}

// For backwards compatibility - uses a proxy to lazy-load
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop) {
    return getDb()[prop as keyof PostgresJsDatabase<typeof schema>]
  },
})

export type DB = PostgresJsDatabase<typeof schema>
