import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, ShoppingCart, MousePointer, Target } from 'lucide-react'

export default async function AnalyticsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Placeholder data - will be connected to real analytics later
  const stats = {
    totalRevenue: 0,
    totalOrders: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    pageViews: 0,
    uniqueVisitors: 0,
    bumpConversionRate: 0,
    upsellConversionRate: 0,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">Analytics</h1>
          <p className="text-gray-300">Track your checkout performance and revenue metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${(stats.totalRevenue / 100).toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 mt-1">All time revenue</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.conversionRate}%</div>
              <p className="text-xs text-gray-400 mt-1">Visitors to customers</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${(stats.avgOrderValue / 100).toFixed(2)}
              </div>
              <p className="text-xs text-gray-400 mt-1">Per transaction</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <MousePointer className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.pageViews}</div>
              <p className="text-xs text-gray-400 mt-1">Total checkout views</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Sections */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Your revenue trends for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Revenue chart will be displayed here</p>
                  <p className="text-sm mt-1">Connect your payment processor to see data</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Funnel Performance</CardTitle>
              <CardDescription>Order bump and upsell conversion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-300">Order Bumps</span>
                    <span className="text-sm font-medium text-white">
                      {stats.bumpConversionRate}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${stats.bumpConversionRate}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-300">Upsells</span>
                    <span className="text-sm font-medium text-white">
                      {stats.upsellConversionRate}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      style={{ width: `${stats.upsellConversionRate}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Track how your offers are performing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Notice */}
        <Card variant="glass" className="mt-6">
          <CardContent className="py-8 text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-purple-400" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Advanced Analytics Coming Soon
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              We&apos;re building powerful analytics tools including cohort analysis, A/B test results,
              and detailed customer journey tracking.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}