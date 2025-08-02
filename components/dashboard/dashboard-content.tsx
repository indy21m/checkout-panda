'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertCircle,
  ArrowRight,
  Activity,
  Eye,
} from 'lucide-react'
import Link from 'next/link'

interface DashboardContentProps {
  checkouts: Array<{
    id: string
    name: string
    status: string | null
    revenue?: number | null
    views?: number | null
  }>
  products: Array<{
    id: string
    name: string
    price: number
  }>
  databaseError: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
}

export function DashboardContent({ checkouts, products, databaseError }: DashboardContentProps) {
  const totalRevenue = checkouts.reduce((sum, c) => sum + (c.revenue || 0), 0) / 100
  const totalViews = checkouts.reduce((sum, c) => sum + (c.views || 0), 0)
  const publishedCheckouts = checkouts.filter((c) => c.status === 'published').length

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      subtitle: 'Lifetime revenue',
      icon: DollarSign,
      gradient: 'from-green-400 to-green-600',
    },
    {
      title: 'Active Checkouts',
      value: checkouts.length.toString(),
      subtitle: `${publishedCheckouts} published`,
      icon: ShoppingCart,
      gradient: 'from-blue-400 to-blue-600',
    },
    {
      title: 'Total Products',
      value: products.length.toString(),
      subtitle: 'Available products',
      icon: Activity,
      gradient: 'from-purple-400 to-purple-600',
    },
    {
      title: 'Total Views',
      value: totalViews.toString(),
      subtitle: 'Across all checkouts',
      icon: Eye,
      gradient: 'from-pink-400 to-pink-600',
    },
  ]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 p-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="mb-2 text-4xl font-bold">Welcome back! 👋</h1>
        <p className="text-text-secondary text-lg">
          Here&apos;s what&apos;s happening with your checkouts today.
        </p>
      </motion.div>

      {/* Database Warning */}
      {databaseError && (
        <motion.div variants={itemVariants}>
          <GlassmorphicCard className="p-6" variant="colored">
            <div className="flex items-start gap-3">
              <div className="bg-warning/10 rounded-lg p-2">
                <AlertCircle className="text-warning h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold">Database Connection Required</h3>
                <p className="text-text-secondary text-sm">
                  To use the dashboard features, please configure your database connection in the
                  environment variables. Add your Neon database URL to the{' '}
                  <code className="bg-background-tertiary rounded px-2 py-0.5 text-xs">
                    DATABASE_URL
                  </code>{' '}
                  variable.
                </p>
              </div>
            </div>
          </GlassmorphicCard>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <GlassmorphicCard className="h-full p-6" hover>
              <div className="mb-4 flex items-start justify-between">
                <div className={`rounded-xl bg-gradient-to-br p-3 ${stat.gradient}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-text-secondary mb-1 text-sm">{stat.title}</p>
                <p className="mb-1 text-3xl font-bold">{stat.value}</p>
                <p className="text-text-tertiary text-xs">{stat.subtitle}</p>
              </div>
            </GlassmorphicCard>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Checkouts */}
        <motion.div variants={itemVariants}>
          <Card variant="glass" className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">Recent Checkouts</CardTitle>
              <CardDescription>Your most recently created checkout pages</CardDescription>
            </CardHeader>
            <CardContent>
              {checkouts.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="bg-background-tertiary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                    <ShoppingCart className="text-text-tertiary h-8 w-8" />
                  </div>
                  <p className="text-text-secondary mb-4">No checkouts created yet</p>
                  <Link href="/products">
                    <Button variant="primary">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Checkout
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {checkouts.slice(0, 5).map((checkout) => (
                    <Link key={checkout.id} href={`/builder/${checkout.id}`}>
                      <div className="group border-border-light hover:border-border hover:bg-background-secondary cursor-pointer rounded-lg border p-4 transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="group-hover:text-primary font-medium transition-colors">
                              {checkout.name}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1 text-xs ${
                                  checkout.status === 'published'
                                    ? 'text-success'
                                    : 'text-text-tertiary'
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    checkout.status === 'published'
                                      ? 'bg-success'
                                      : 'bg-text-tertiary'
                                  }`}
                                />
                                {checkout.status === 'published' ? 'Published' : 'Draft'}
                              </span>
                              {checkout.views !== null &&
                                checkout.views !== undefined &&
                                checkout.views > 0 && (
                                  <span className="text-text-tertiary text-xs">
                                    {checkout.views} views
                                  </span>
                                )}
                            </div>
                          </div>
                          <ArrowRight className="text-text-tertiary group-hover:text-primary h-4 w-4 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  ))}
                  {checkouts.length > 5 && (
                    <Link href="/checkouts">
                      <Button variant="ghost" className="w-full">
                        View all checkouts
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card variant="glass" className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/checkouts/new" className="block">
                  <div className="group border-border-light hover:border-primary/20 hover:bg-primary/5 cursor-pointer rounded-lg border p-4 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 rounded-lg bg-gradient-to-br p-3">
                        <Plus className="text-primary h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="mb-1 font-medium">Create New Checkout</p>
                        <p className="text-text-secondary text-sm">
                          Design a high-converting checkout page
                        </p>
                      </div>
                      <ArrowRight className="text-text-tertiary group-hover:text-primary h-4 w-4 transition-colors" />
                    </div>
                  </div>
                </Link>

                <Link href="/products" className="block">
                  <div className="group border-border-light hover:border-secondary/20 hover:bg-secondary/5 cursor-pointer rounded-lg border p-4 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="from-secondary/10 to-secondary/5 group-hover:from-secondary/20 group-hover:to-secondary/10 rounded-lg bg-gradient-to-br p-3">
                        <ShoppingCart className="text-secondary h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="mb-1 font-medium">Manage Products</p>
                        <p className="text-text-secondary text-sm">
                          Add and organize your products
                        </p>
                      </div>
                      <ArrowRight className="text-text-tertiary group-hover:text-secondary h-4 w-4 transition-colors" />
                    </div>
                  </div>
                </Link>

                <Link href="/analytics" className="block">
                  <div className="group border-border-light hover:border-accent/20 hover:bg-accent/5 cursor-pointer rounded-lg border p-4 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="from-accent/10 to-accent/5 group-hover:from-accent/20 group-hover:to-accent/10 rounded-lg bg-gradient-to-br p-3">
                        <TrendingUp className="text-accent h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="mb-1 font-medium">View Analytics</p>
                        <p className="text-text-secondary text-sm">
                          Track performance and conversions
                        </p>
                      </div>
                      <ArrowRight className="text-text-tertiary group-hover:text-accent h-4 w-4 transition-colors" />
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
