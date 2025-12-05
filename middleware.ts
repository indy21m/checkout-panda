import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Check if Clerk is properly configured
const isClerkConfigured =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_') &&
  (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.length ?? 0) > 30

// All checkout and API routes are public
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/terms',
  '/privacy',
  // Product checkout routes
  '/:product/checkout',
  '/:product/upsell-(.*)',
  '/:product/downsell',
  '/:product/thank-you',
  // API routes
  '/api/create-payment-intent',
  '/api/charge-upsell',
  '/api/validate-coupon',
  '/api/webhooks/(.*)',
])

// If Clerk isn't configured, use a pass-through middleware
function passthroughMiddleware(_req: NextRequest) {
  return NextResponse.next()
}

// Export the appropriate middleware based on configuration
export default isClerkConfigured
  ? clerkMiddleware(async (auth, req) => {
      if (!isPublicRoute(req)) {
        await auth.protect()
      }
    })
  : passthroughMiddleware

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api)(.*)'],
}
