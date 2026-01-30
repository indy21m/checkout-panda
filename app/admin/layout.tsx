import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { env } from '@/env'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <AdminSidebar userEmail={email} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
