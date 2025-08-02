import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Glassmorphic Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto">
        {/* Background gradient overlay */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background-secondary/30 to-background" />
        
        {/* Content */}
        <div className="relative z-0">
          {children}
        </div>
      </main>
    </div>
  )
}
