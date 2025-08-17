import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createApi } from '@/lib/trpc/server'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  interface DashboardCheckout {
    id: string
    name: string
    status: string | null
    revenue?: number | null
    views?: number | null
  }

  interface DashboardProduct {
    id: string
    name: string
  }

  let checkouts: DashboardCheckout[] = []
  let products: DashboardProduct[] = []
  let databaseError = false

  try {
    // Create API instance
    const api = await createApi()
    // Fetch user's checkouts and products
    const results = await Promise.all([
      api.checkout.list().catch(() => []),
      api.product.list({ includeArchived: false }).catch(() => []),
    ])
    checkouts = results[0]
    const fetchedProducts = results[1]
    products = fetchedProducts.map(p => ({ id: p.id, name: p.name }))
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    databaseError = true
  }

  return (
    <DashboardContent checkouts={checkouts} products={products} databaseError={databaseError} />
  )
}
