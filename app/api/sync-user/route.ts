import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/server/db'
import { users } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get user details from Clerk
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 })
    }

    // Check if user exists in database
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (existingUser) {
      return NextResponse.json({
        message: 'User already exists',
        user: existingUser,
      })
    }

    // Create user in database
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        createdAt: new Date(),
      })
      .returning()

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser,
    })
  } catch (error) {
    console.error('Sync user error:', error)
    return NextResponse.json(
      {
        error: 'Failed to sync user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
