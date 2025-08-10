import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { UserSync } from '@/components/auth/user-sync'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* User sync component */}
      <UserSync />

      {/* Glassmorphic Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20">
        {/* Background gradient overlay */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-white via-transparent to-blue-50/10" />

        {/* Content */}
        <div className="relative z-0">{children}</div>
      </main>
    </div>
  )
}
