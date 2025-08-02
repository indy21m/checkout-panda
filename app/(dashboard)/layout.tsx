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
    <div className="bg-background flex min-h-screen">
      {/* User sync component */}
      <UserSync />

      {/* Glassmorphic Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto">
        {/* Background gradient overlay */}
        <div className="from-background via-background-secondary/30 to-background fixed inset-0 -z-10 bg-gradient-to-br" />

        {/* Content */}
        <div className="relative z-0">{children}</div>
      </main>
    </div>
  )
}
