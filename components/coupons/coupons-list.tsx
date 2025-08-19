'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Tag,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  TrendingUp,
  Calendar,
  Percent,
  DollarSign,
} from 'lucide-react'
import { api } from '@/lib/trpc/client'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import type { RouterOutputs } from '@/lib/trpc/api'

type Coupon = RouterOutputs['coupon']['list'][0]

interface CouponsListProps {
  onCreateCoupon: () => void
  onEditCoupon: (coupon: Coupon) => void
}

export function CouponsList({ onCreateCoupon, onEditCoupon }: CouponsListProps) {
  const [search, setSearch] = useState('')
  const utils = api.useUtils()

  const { data: coupons = [], isLoading } = api.coupon.list.useQuery({
    search,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const deleteCoupon = api.coupon.delete.useMutation({
    onSuccess: () => {
      toast.success('Coupon deleted successfully')
      utils.coupon.list.invalidate()
    },
    onError: () => {
      toast.error('Failed to delete coupon')
    },
  })

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      deleteCoupon.mutate({ id })
    }
  }

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Coupon code copied to clipboard')
  }

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% off`
    } else {
      return `$${(coupon.discountValue / 100).toFixed(2)} off`
    }
  }

  const formatDuration = (coupon: Coupon) => {
    if (coupon.duration === 'forever') {
      return 'forever'
    } else if (coupon.duration === 'repeating' && coupon.durationInMonths) {
      return `for ${coupon.durationInMonths} months`
    }
    return 'once'
  }

  const formatTerms = (coupon: Coupon) => {
    return `${formatDiscount(coupon)} ${formatDuration(coupon)}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-3xl font-bold text-transparent">
            Coupons
          </h1>
          <p className="mt-1 text-gray-600">Create and manage discount codes for your products</p>
        </div>
        <Button
          onClick={onCreateCoupon}
          className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Coupon
        </Button>
      </div>

      {/* Search and Filters */}
      <GlassmorphicCard>
        <div className="p-6">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search coupons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </GlassmorphicCard>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <GlassmorphicCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Coupons</p>
                <p className="mt-1 text-2xl font-bold">
                  {coupons.filter((c) => c.isActive).length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-200">
                <Tag className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Redemptions</p>
                <p className="mt-1 text-2xl font-bold">
                  {coupons.reduce((sum, c) => sum + (c.timesRedeemed || 0), 0)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </GlassmorphicCard>

        <GlassmorphicCard>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Discount</p>
                <p className="mt-1 text-2xl font-bold">
                  {coupons.length > 0
                    ? Math.round(
                        coupons
                          .filter((c) => c.discountType === 'percentage')
                          .reduce((sum, c) => sum + c.discountValue, 0) /
                          coupons.filter((c) => c.discountType === 'percentage').length || 1
                      )
                    : 0}
                  %
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
                <Percent className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </GlassmorphicCard>
      </div>

      {/* Coupons Table */}
      <GlassmorphicCard>
        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="p-6 text-left font-medium text-gray-700">Code</th>
                <th className="p-6 text-left font-medium text-gray-700">Terms</th>
                <th className="p-6 text-left font-medium text-gray-700">Redemptions</th>
                <th className="p-6 text-left font-medium text-gray-700">Status</th>
                <th className="p-6 text-left font-medium text-gray-700">Created</th>
                <th className="p-6"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    No coupons found. Create your first coupon to get started.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon, index) => (
                  <motion.tr
                    key={coupon.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50/50"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <code className="rounded-lg bg-gray-100 px-3 py-1 font-mono font-semibold">
                          {coupon.code}
                        </code>
                        <button
                          onClick={() => handleCopy(coupon.code)}
                          className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                        >
                          <Copy className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        {coupon.discountType === 'percentage' ? (
                          <Percent className="h-4 w-4 text-gray-400" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-gray-700">{formatTerms(coupon)}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">{coupon.timesRedeemed || 0}</span>
                        {coupon.maxRedemptions && (
                          <span className="text-gray-400">/ {coupon.maxRedemptions}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-6">
                      {coupon.isActive ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-6 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {coupon.createdAt ? new Date(coupon.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="p-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-lg p-2 transition-colors hover:bg-gray-100">
                            <MoreVertical className="h-4 w-4 text-gray-500" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditCoupon(coupon)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(coupon.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassmorphicCard>
    </div>
  )
}
