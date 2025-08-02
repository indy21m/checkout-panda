import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/server/db'
import { users, products, checkouts } from '@/server/db/schema'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    const { userId } = await auth()
    
    const results = {
      timestamp: new Date().toISOString(),
      auth: {
        isAuthenticated: !!userId,
        userId: userId || 'Not authenticated'
      },
      database: {
        connected: false,
        tables: [] as string[],
        counts: {} as Record<string, number>,
        error: null as string | null
      }
    }

    try {
      // Test database connection
      const testQuery = await db.execute(sql`SELECT 1 as test`)
      results.database.connected = true

      // Get all tables
      const tables = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `)
      
      results.database.tables = tables.rows.map((row: any) => row.table_name)

      // Get counts for main tables
      try {
        const userCount = await db.select({ count: sql<number>`count(*)` }).from(users)
        results.database.counts.users = Number(userCount[0]?.count || 0)
      } catch (e) {
        results.database.counts.users = -1
      }

      try {
        const productCount = await db.select({ count: sql<number>`count(*)` }).from(products)
        results.database.counts.products = Number(productCount[0]?.count || 0)
      } catch (e) {
        results.database.counts.products = -1
      }

      try {
        const checkoutCount = await db.select({ count: sql<number>`count(*)` }).from(checkouts)
        results.database.counts.checkouts = Number(checkoutCount[0]?.count || 0)
      } catch (e) {
        results.database.counts.checkouts = -1
      }

    } catch (dbError: any) {
      results.database.error = dbError.message || 'Unknown database error'
    }

    return NextResponse.json(results, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to run database test',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}