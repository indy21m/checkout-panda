import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { env } from '@/env'

function getAdminEmails(): string[] {
  const adminEmails = env.ADMIN_EMAILS
  if (!adminEmails) return []
  return adminEmails.split(',').map((email) => email.trim().toLowerCase())
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    redirect('/sign-in?redirect_url=/admin')
  }

  const email = sessionClaims?.email as string | undefined
  const adminEmails = getAdminEmails()

  // If no admin emails configured, allow any authenticated user (dev mode)
  if (adminEmails.length > 0 && (!email || !adminEmails.includes(email.toLowerCase()))) {
    redirect('/?error=unauthorized')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Checkout Panda Admin</h1>
          <span className="text-sm text-gray-500">{email}</span>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  )
}
