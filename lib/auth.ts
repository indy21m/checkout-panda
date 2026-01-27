import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { env } from '@/env'

/**
 * Verify the current request is from an authenticated admin user.
 * Returns the user on success, or an error string on failure.
 */
export async function verifyAdminRequest(): Promise<
  { user: { id: string; email: string }; error?: never } | { user?: never; error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return { error: 'Unauthorized' }
  }

  const adminEmails = env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? []
  if (adminEmails.length > 0 && !adminEmails.includes(user.email.toLowerCase())) {
    return { error: 'Forbidden' }
  }

  return { user: { id: user.id, email: user.email } }
}
