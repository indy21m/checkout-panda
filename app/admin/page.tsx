import { getProductsWithOffers } from '@/lib/db/products'
import Link from 'next/link'
import { Package, Calendar, MessageSquare, Users, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const allProducts = await getProductsWithOffers()

  const stats = [
    {
      name: 'Products',
      value: allProducts.length,
      href: '/admin/products',
      icon: Package,
      color: 'from-emerald-400 to-emerald-600',
    },
    {
      name: 'Calendar Events',
      value: '—',
      href: '/admin/calendar',
      icon: Calendar,
      color: 'from-purple-400 to-purple-600',
    },
    {
      name: 'Testimonials',
      value: 'Coming soon',
      href: '/admin/testimonials',
      icon: MessageSquare,
      color: 'from-amber-400 to-amber-600',
    },
    {
      name: 'Segments',
      value: 'Coming soon',
      href: '/admin/segments',
      icon: Users,
      color: 'from-pink-400 to-pink-600',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Welcome to Checkout Panda Admin</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 transition-opacity duration-200 group-hover:opacity-5`}
              />
              <div className="relative">
                <div
                  className={`inline-flex rounded-xl bg-gradient-to-br ${stat.color} p-3 text-white shadow-lg`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium text-gray-600 group-hover:text-gray-900">
                  View details
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/products"
            className="rounded-xl border border-gray-200 p-4 transition-colors hover:border-emerald-300 hover:bg-emerald-50"
          >
            <Package className="h-5 w-5 text-emerald-600" />
            <p className="mt-2 font-medium text-gray-900">Manage Products</p>
            <p className="mt-1 text-sm text-gray-500">Add, edit, or sync products with Stripe</p>
          </Link>
          <Link
            href="/admin/calendar"
            className="rounded-xl border border-gray-200 p-4 transition-colors hover:border-purple-300 hover:bg-purple-50"
          >
            <Calendar className="h-5 w-5 text-purple-600" />
            <p className="mt-2 font-medium text-gray-900">View Calendar</p>
            <p className="mt-1 text-sm text-gray-500">See upcoming events and deadlines</p>
          </Link>
          <div className="rounded-xl border border-dashed border-gray-200 p-4 opacity-60">
            <MessageSquare className="h-5 w-5 text-gray-400" />
            <p className="mt-2 font-medium text-gray-500">Testimonials</p>
            <p className="mt-1 text-sm text-gray-400">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
