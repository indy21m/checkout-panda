import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Server-side environment variables schema.
   */
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    // Database (optional at build time, required for admin routes at runtime)
    // Supports both Vercel's Supabase integration (POSTGRES_URL) and traditional naming (DATABASE_URL)
    POSTGRES_URL: z.string().url().optional(),
    DATABASE_URL: z.string().url().optional(),
    // Admin access (comma-separated emails)
    ADMIN_EMAILS: z.string().optional(),
    // Supabase (optional service role key for admin operations)
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    // Stripe
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),
    // Integrations (optional)
    ZAPIER_WEBHOOK_URL: z.string().url().optional(),
    // Google Calendar OAuth (for calendar scheduling)
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_REDIRECT_URI: z.string().url().optional(),
    // Email (Resend)
    RESEND_API_KEY: z.string().optional(),
  },

  /**
   * Client-side environment variables schema.
   * Must be prefixed with `NEXT_PUBLIC_`.
   */
  client: {
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
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
    POSTGRES_URL: process.env.POSTGRES_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    ZAPIER_WEBHOOK_URL: process.env.ZAPIER_WEBHOOK_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
