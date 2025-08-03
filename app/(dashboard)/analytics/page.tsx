import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Analytics</h1>
          <p className="text-text-secondary text-lg">
            Track your checkout performance and revenue metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <GlassmorphicCard variant="light" className="p-6">
            <div className="mb-2 flex flex-row items-center justify-between">
              <h3 className="text-text-secondary text-sm font-medium">Total Revenue</h3>
              <div className="rounded-lg bg-gradient-to-br from-green-400 to-green-600 p-2">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold">${(stats.totalRevenue / 100).toFixed(2)}</div>
            <p className="text-text-tertiary mt-1 text-xs">All time revenue</p>
          </GlassmorphicCard>

          <GlassmorphicCard variant="light" className="p-6">
            <div className="mb-2 flex flex-row items-center justify-between">
              <h3 className="text-text-secondary text-sm font-medium">Conversion Rate</h3>
              <div className="rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 p-2">
                <Target className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-text-tertiary mt-1 text-xs">Visitors to customers</p>
          </GlassmorphicCard>

          <GlassmorphicCard variant="light" className="p-6">
            <div className="mb-2 flex flex-row items-center justify-between">
              <h3 className="text-text-secondary text-sm font-medium">Average Order Value</h3>
              <div className="rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 p-2">
                <ShoppingCart className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold">${(stats.avgOrderValue / 100).toFixed(2)}</div>
            <p className="text-text-tertiary mt-1 text-xs">Per transaction</p>
          </GlassmorphicCard>

          <GlassmorphicCard variant="light" className="p-6">
            <div className="mb-2 flex flex-row items-center justify-between">
              <h3 className="text-text-secondary text-sm font-medium">Page Views</h3>
              <div className="rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 p-2">
                <MousePointer className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.pageViews}</div>
            <p className="text-text-tertiary mt-1 text-xs">Total checkout views</p>
          </GlassmorphicCard>
        </div>

        {/* Detailed Analytics Sections */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GlassmorphicCard variant="light" className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Revenue Over Time</h3>
              <p className="text-text-secondary text-sm">
                Your revenue trends for the last 30 days
              </p>
            </div>
            <div className="text-text-tertiary flex h-64 items-center justify-center">
              <div className="text-center">
                <TrendingUp className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p>Revenue chart will be displayed here</p>
                <p className="mt-1 text-sm">Connect your payment processor to see data</p>
              </div>
            </div>
          </GlassmorphicCard>

          <GlassmorphicCard variant="light" className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Funnel Performance</h3>
              <p className="text-text-secondary text-sm">Order bump and upsell conversion rates</p>
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-text-secondary text-sm">Order Bumps</span>
                  <span className="text-sm font-medium">{stats.bumpConversionRate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${stats.bumpConversionRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-text-secondary text-sm">Upsells</span>
                  <span className="text-sm font-medium">{stats.upsellConversionRate}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    style={{ width: `${stats.upsellConversionRate}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-text-tertiary mt-4 text-xs">Track how your offers are performing</p>
          </GlassmorphicCard>
        </div>

        {/* Coming Soon Notice */}
        <GlassmorphicCard variant="light" className="mt-6 p-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200">
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">Advanced Analytics Coming Soon</h3>
          <p className="text-text-secondary mx-auto max-w-md">
            We&apos;re building powerful analytics tools including cohort analysis, A/B test
            results, and detailed customer journey tracking.
          </p>
        </GlassmorphicCard>
      </div>
    </div>
  )
}
