import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Plus, TrendingUp, DollarSign, ShoppingCart, AlertCircle } from 'lucide-react'
import { createApi } from '@/lib/trpc/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  interface DashboardCheckout {
    id: string
    name: string
    status: string
    revenue?: number
    views?: number
  }

  interface DashboardProduct {
    id: string
    name: string
    price: number
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
      api.product.list().catch(() => [])
    ])
    checkouts = results[0]
    products = results[1]
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    databaseError = true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-300">Welcome to your Checkout Panda dashboard</p>
        </div>

        {databaseError && (
          <div className="mb-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-300 mb-1">Database Connection Required</h3>
                <p className="text-yellow-300/80 text-sm">
                  To use the dashboard features, please configure your database connection in the environment variables.
                  Add your Neon database URL to the <code className="bg-yellow-500/20 px-1 rounded">DATABASE_URL</code> variable.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${((checkouts.reduce((sum, c) => sum + (c.revenue || 0), 0) || 0) / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Lifetime revenue</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">Available products</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Checkouts</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checkouts.length}</div>
              <p className="text-xs text-muted-foreground">
                {checkouts.filter((c) => c.status === 'published').length} published
              </p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {checkouts.reduce((sum, c) => sum + (c.views || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Across all checkouts</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Recent Checkouts</CardTitle>
              <CardDescription>Your most recently created checkout pages</CardDescription>
            </CardHeader>
            <CardContent>
              {checkouts.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="mb-4 text-gray-400">No checkouts created yet</p>
                  <Link href="/products">
                    <Button variant="primary">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Checkout
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {checkouts.slice(0, 5).map((checkout) => (
                    <div
                      key={checkout.id}
                      className="flex items-center justify-between rounded-lg border border-gray-700 p-3"
                    >
                      <div>
                        <p className="font-medium text-white">{checkout.name}</p>
                        <p className="text-sm text-gray-400">
                          {checkout.status === 'published' ? '🟢 Published' : '⚪ Draft'}
                        </p>
                      </div>
                      <Link href={`/builder/${checkout.id}`}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/checkouts/new" className="block">
                <Button variant="secondary" className="w-full justify-start">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Checkout
                </Button>
              </Link>
              <Link href="/products" className="block">
                <Button variant="secondary" className="w-full justify-start">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Manage Products
                </Button>
              </Link>
              <Link href="/analytics" className="block">
                <Button variant="secondary" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}