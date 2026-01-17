'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { ProductEditDialog } from './ProductEditDialog'
import { UpsellEditDialog } from './UpsellEditDialog'
import { OrderBumpEditDialog } from './OrderBumpEditDialog'
import { DownsellEditDialog } from './DownsellEditDialog'
import type { ProductRecord, ProductConfig } from '@/lib/db/schema'
import type { Upsell, OrderBump, Downsell } from '@/types'
import { RefreshCw, ChevronRight, ChevronDown, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
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

// Dialog state types
type DialogState =
  | { type: 'none' }
  | { type: 'upsell'; upsell: Upsell | null; isNew: boolean; upsellIndex: number }
  | { type: 'orderBump'; orderBump: OrderBump | null; isNew: boolean }
  | { type: 'downsell'; downsell: Downsell | null; isNew: boolean }
  | { type: 'confirmDelete'; target: 'upsell' | 'orderBump' | 'downsell'; upsellId?: string; title: string }

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter()
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [syncingProductId, setSyncingProductId] = useState<string | null>(null)
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)
  const [dialogState, setDialogState] = useState<DialogState>({ type: 'none' })
  const [savingProductId, setSavingProductId] = useState<string | null>(null)

  const editingProduct = products.find(p => p.id === editingProductId)
  const expandedProduct = products.find(p => p.id === expandedProductId)

  async function handleSync(productId: string): Promise<void> {
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

  async function saveProductConfig(productId: string, config: ProductConfig): Promise<void> {
    setSavingProductId(productId)
    try {
      const product = products.find(p => p.id === productId)
      if (!product) return

      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          config,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        console.error('Save failed:', data.error)
      }
      router.refresh()
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setSavingProductId(null)
    }
  }

  function handleSaveUpsell(upsell: Upsell): void {
    if (!expandedProduct) return

    const existingUpsells = expandedProduct.config.upsells ?? []
    const existingIndex = existingUpsells.findIndex(u => u.id === upsell.id)

    let updatedUpsells: Upsell[]
    if (existingIndex >= 0) {
      // Update existing
      updatedUpsells = existingUpsells.map((u, i) => (i === existingIndex ? upsell : u))
    } else {
      // Add new
      updatedUpsells = [...existingUpsells, upsell]
    }

    const updatedConfig: ProductConfig = {
      ...expandedProduct.config,
      upsells: updatedUpsells,
    }

    void saveProductConfig(expandedProduct.id, updatedConfig)
  }

  function handleDeleteUpsell(upsellId: string): void {
    if (!expandedProduct) return

    const updatedUpsells = (expandedProduct.config.upsells ?? []).filter(u => u.id !== upsellId)

    const updatedConfig: ProductConfig = {
      ...expandedProduct.config,
      upsells: updatedUpsells.length > 0 ? updatedUpsells : undefined,
    }

    void saveProductConfig(expandedProduct.id, updatedConfig)
  }

  function handleSaveOrderBump(orderBump: OrderBump): void {
    if (!expandedProduct) return

    const updatedConfig: ProductConfig = {
      ...expandedProduct.config,
      orderBump,
    }

    void saveProductConfig(expandedProduct.id, updatedConfig)
  }

  function handleDeleteOrderBump(): void {
    if (!expandedProduct) return

    const updatedConfig: ProductConfig = {
      ...expandedProduct.config,
      orderBump: undefined,
    }

    void saveProductConfig(expandedProduct.id, updatedConfig)
  }

  function handleSaveDownsell(downsell: Downsell): void {
    if (!expandedProduct) return

    const updatedConfig: ProductConfig = {
      ...expandedProduct.config,
      downsell,
    }

    void saveProductConfig(expandedProduct.id, updatedConfig)
  }

  function handleDeleteDownsell(): void {
    if (!expandedProduct) return

    const updatedConfig: ProductConfig = {
      ...expandedProduct.config,
      downsell: undefined,
    }

    void saveProductConfig(expandedProduct.id, updatedConfig)
  }

  function toggleExpand(productId: string): void {
    setExpandedProductId(prev => (prev === productId ? null : productId))
  }

  function handleConfirmDelete(): void {
    if (dialogState.type !== 'confirmDelete' || !expandedProduct) return

    if (dialogState.target === 'upsell' && dialogState.upsellId) {
      handleDeleteUpsell(dialogState.upsellId)
    } else if (dialogState.target === 'orderBump') {
      handleDeleteOrderBump()
    } else if (dialogState.target === 'downsell') {
      handleDeleteDownsell()
    }
    setDialogState({ type: 'none' })
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="w-8 px-2 py-3"></th>
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
            {products.map(product => {
              const isExpanded = expandedProductId === product.id
              const isSaving = savingProductId === product.id

              return (
                <>
                  <tr
                    key={product.id}
                    className={`cursor-pointer hover:bg-gray-50 ${isExpanded ? 'bg-gray-50' : ''}`}
                    onClick={() => toggleExpand(product.id)}
                  >
                    <td className="px-2 py-3 text-gray-400">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">/{product.slug}</span>
                          <Link
                            href={`/${product.slug}/checkout`}
                            target="_blank"
                            onClick={e => e.stopPropagation()}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
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
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
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

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr key={`${product.id}-expanded`}>
                      <td colSpan={5} className="bg-gray-50 px-4 py-4">
                        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
                          {isSaving && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Saving...
                            </div>
                          )}

                          {/* Order Bump Section */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-700">Order Bump</h4>
                              {!product.config.orderBump && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() =>
                                    setDialogState({
                                      type: 'orderBump',
                                      orderBump: null,
                                      isNew: true,
                                    })
                                  }
                                >
                                  <Plus className="mr-1 h-3 w-3" />
                                  Add
                                </Button>
                              )}
                            </div>
                            {product.config.orderBump ? (
                              <div className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-3 py-2">
                                <div>
                                  <span className="text-sm text-gray-900">
                                    {product.config.orderBump.title}
                                  </span>
                                  <span className="ml-2 text-sm text-gray-500">
                                    {formatPrice(
                                      product.config.orderBump.stripe.priceAmount,
                                      product.config.orderBump.stripe.currency
                                    )}
                                  </span>
                                  {!product.config.orderBump.enabled && (
                                    <Badge
                                      variant="outline"
                                      className="ml-2 text-xs text-gray-400"
                                    >
                                      Disabled
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() =>
                                      setDialogState({
                                        type: 'orderBump',
                                        orderBump: product.config.orderBump ?? null,
                                        isNew: false,
                                      })
                                    }
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                                    onClick={() =>
                                      setDialogState({
                                        type: 'confirmDelete',
                                        target: 'orderBump',
                                        title: product.config.orderBump?.title ?? 'Order Bump',
                                      })
                                    }
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">No order bump configured</p>
                            )}
                          </div>

                          {/* Upsells Section */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-700">Upsells</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() =>
                                  setDialogState({
                                    type: 'upsell',
                                    upsell: null,
                                    isNew: true,
                                    upsellIndex: (product.config.upsells?.length ?? 0) + 1,
                                  })
                                }
                              >
                                <Plus className="mr-1 h-3 w-3" />
                                Add
                              </Button>
                            </div>
                            {product.config.upsells && product.config.upsells.length > 0 ? (
                              <div className="space-y-1">
                                {product.config.upsells.map(upsell => (
                                  <div
                                    key={upsell.id}
                                    className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-3 py-2"
                                  >
                                    <div>
                                      <span className="text-sm text-gray-900">{upsell.title}</span>
                                      <span className="ml-2 text-sm text-gray-500">
                                        {formatPrice(
                                          upsell.stripe.priceAmount,
                                          upsell.stripe.currency
                                        )}
                                      </span>
                                      <span className="ml-2 text-xs text-gray-400">
                                        {upsell.benefits.length} benefit
                                        {upsell.benefits.length !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={() =>
                                          setDialogState({
                                            type: 'upsell',
                                            upsell,
                                            isNew: false,
                                            upsellIndex: 0,
                                          })
                                        }
                                      >
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                                        onClick={() =>
                                          setDialogState({
                                            type: 'confirmDelete',
                                            target: 'upsell',
                                            upsellId: upsell.id,
                                            title: upsell.title,
                                          })
                                        }
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">No upsells configured</p>
                            )}
                          </div>

                          {/* Downsell Section */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-700">Downsell</h4>
                              {!product.config.downsell && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() =>
                                    setDialogState({
                                      type: 'downsell',
                                      downsell: null,
                                      isNew: true,
                                    })
                                  }
                                >
                                  <Plus className="mr-1 h-3 w-3" />
                                  Add
                                </Button>
                              )}
                            </div>
                            {product.config.downsell ? (
                              <div className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-3 py-2">
                                <div>
                                  <span className="text-sm text-gray-900">
                                    {product.config.downsell.title}
                                  </span>
                                  <span className="ml-2 text-sm text-gray-500">
                                    {formatPrice(
                                      product.config.downsell.stripe.priceAmount,
                                      product.config.downsell.stripe.currency
                                    )}
                                  </span>
                                  {!product.config.downsell.enabled && (
                                    <Badge
                                      variant="outline"
                                      className="ml-2 text-xs text-gray-400"
                                    >
                                      Disabled
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    onClick={() =>
                                      setDialogState({
                                        type: 'downsell',
                                        downsell: product.config.downsell ?? null,
                                        isNew: false,
                                      })
                                    }
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                                    onClick={() =>
                                      setDialogState({
                                        type: 'confirmDelete',
                                        target: 'downsell',
                                        title: product.config.downsell?.title ?? 'Downsell',
                                      })
                                    }
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">No downsell configured</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Product Edit Dialog */}
      <ProductEditDialog
        product={editingProduct ?? null}
        open={!!editingProductId}
        onClose={() => setEditingProductId(null)}
      />

      {/* Upsell Edit Dialog */}
      <UpsellEditDialog
        upsell={dialogState.type === 'upsell' ? dialogState.upsell : null}
        open={dialogState.type === 'upsell'}
        onClose={() => setDialogState({ type: 'none' })}
        onSave={handleSaveUpsell}
        isNew={dialogState.type === 'upsell' ? dialogState.isNew : false}
        defaultCurrency={expandedProduct?.config.stripe.currency ?? 'DKK'}
        upsellIndex={dialogState.type === 'upsell' ? dialogState.upsellIndex : 1}
      />

      {/* Order Bump Edit Dialog */}
      <OrderBumpEditDialog
        orderBump={dialogState.type === 'orderBump' ? dialogState.orderBump : null}
        open={dialogState.type === 'orderBump'}
        onClose={() => setDialogState({ type: 'none' })}
        onSave={handleSaveOrderBump}
        isNew={dialogState.type === 'orderBump' ? dialogState.isNew : false}
        defaultCurrency={expandedProduct?.config.stripe.currency ?? 'DKK'}
      />

      {/* Downsell Edit Dialog */}
      <DownsellEditDialog
        downsell={dialogState.type === 'downsell' ? dialogState.downsell : null}
        open={dialogState.type === 'downsell'}
        onClose={() => setDialogState({ type: 'none' })}
        onSave={handleSaveDownsell}
        isNew={dialogState.type === 'downsell' ? dialogState.isNew : false}
        defaultCurrency={expandedProduct?.config.stripe.currency ?? 'DKK'}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={dialogState.type === 'confirmDelete'}
        onOpenChange={isOpen => !isOpen && setDialogState({ type: 'none' })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete {dialogState.type === 'confirmDelete' ? dialogState.target : ''}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete &quot;{dialogState.type === 'confirmDelete' ? dialogState.title : ''}&quot;?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogState({ type: 'none' })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
