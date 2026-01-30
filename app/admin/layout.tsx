import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { env } from '@/env'

function getAdminEmails(): string[] {
  const adminEmails = env.ADMIN_EMAILS
  if (!adminEmails) return []
  return adminEmails.split(',').map((email) => email.trim().toLowerCase())
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in?redirect_url=/admin')
  }

  const email = user.email
  const adminEmails = getAdminEmails()

  // If no admin emails configured, allow any authenticated user (dev mode)
  if (adminEmails.length > 0 && (!email || !adminEmails.includes(email.toLowerCase()))) {
    redirect('/?error=unauthorized')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold text-gray-900">Checkout Panda Admin</h1>
            <nav className="flex gap-4">
              <a href="/admin" className="text-sm text-gray-600 hover:text-gray-900">
                Products
              </a>
              <a href="/admin/calendar" className="text-sm text-gray-600 hover:text-gray-900">
                Calendar
              </a>
            </nav>
          </div>
          <span className="text-sm text-gray-500">{email}</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  )
}
