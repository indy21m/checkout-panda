import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Server-side environment variables schema.
   */
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    // Database (optional at build time, required for admin routes at runtime)
    DATABASE_URL: z.string().url().optional(),
    // Admin access (comma-separated emails)
    ADMIN_EMAILS: z.string().optional(),
    // Clerk (minimal - kept for infrastructure)
    CLERK_SECRET_KEY: z.string(),
    // Stripe
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
    // Integrations (optional)
    ZAPIER_WEBHOOK_URL: z.string().url().optional(),
  },

  /**
   * Client-side environment variables schema.
   * Must be prefixed with `NEXT_PUBLIC_`.
   */
  client: {
    // Clerk
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
    // Stripe
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string(),
    // App
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  },

  /**
   * Runtime environment variable mapping.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    ZAPIER_WEBHOOK_URL: process.env.ZAPIER_WEBHOOK_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  /**
   * Skip validation during Docker builds or CI.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Treat empty strings as undefined.
   */
  emptyStringAsUndefined: true,
})
