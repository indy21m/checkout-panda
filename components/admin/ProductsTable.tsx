'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductEditDialog } from './ProductEditDialog'
import type { ProductRecord } from '@/lib/db/schema'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProductsTableProps {
  products: ProductRecord[]
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100)
}

function SyncStatusBadge({ status }: { status: string | null }) {
  switch (status) {
    case 'synced':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Synced
        </Badge>
      )
    case 'error':
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Error
        </Badge>
      )
    case 'pending':
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Pending
        </Badge>
      )
  }
}

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter()
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [syncingProductId, setSyncingProductId] = useState<string | null>(null)

  const editingProduct = products.find(p => p.id === editingProductId)

  async function handleSync(productId: string) {
    setSyncingProductId(productId)
    try {
      const response = await fetch(`/api/admin/products/${productId}/sync`, {
        method: 'POST',
      })
      if (!response.ok) {
        const error = await response.json()
        console.error('Sync failed:', error)
      }
      router.refresh()
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setSyncingProductId(null)
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Product
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Price
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Stripe Status
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">/{product.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-900">
                    {formatPrice(
                      product.config.stripe.priceAmount,
                      product.config.stripe.currency
                    )}
                  </p>
                  {product.config.stripe.pricingTiers &&
                    product.config.stripe.pricingTiers.length > 1 && (
                      <p className="text-xs text-gray-500">
                        {product.config.stripe.pricingTiers.length} pricing tiers
                      </p>
                    )}
                </td>
                <td className="px-4 py-3">
                  <SyncStatusBadge status={product.stripeSyncStatus} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProductId(product.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(product.id)}
                      disabled={syncingProductId === product.id}
                    >
                      {syncingProductId === product.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        'Sync'
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductEditDialog
        product={editingProduct ?? null}
        open={!!editingProductId}
        onClose={() => setEditingProductId(null)}
      />
    </>
  )
}
