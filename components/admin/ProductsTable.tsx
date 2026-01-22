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
import { OfferProductDialog } from './OfferProductDialog'
import { OfferLinkDialog } from './OfferLinkDialog'
import { CheckoutContentEditDialog } from './CheckoutContentEditDialog'
import { ThankYouContentEditDialog } from './ThankYouContentEditDialog'
import { ProductCreateDialog } from './ProductCreateDialog'
import type { ProductRecord, ProductConfig } from '@/lib/db/schema'
import type { CheckoutContent, ThankYouContent, OfferRole, Currency, ProductType } from '@/types'
import {
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Link2,
  Unlink,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Extended product record with usage info from API
interface ExtendedProductRecord extends ProductRecord {
  usedIn?: Array<{ productId: string; productName: string; role: string }>
  linkedOffers?: Array<{
    offerId: string
    offerName: string
    role: string
    position: number
    enabled: boolean
  }>
}

interface ProductsTableProps {
  products: ExtendedProductRecord[]
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
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Synced</Badge>
    case 'error':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Error</Badge>
    case 'pending':
    default:
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
  }
}

// Dialog state types
type DialogState =
  | { type: 'none' }
  | { type: 'createProduct' }
  | {
      type: 'offerProduct'
      product: ProductRecord | null
      isNew: boolean
      productType: 'upsell' | 'downsell' | 'bump'
    }
  | { type: 'linkOffer'; productId: string; role: OfferRole }
  | { type: 'replaceOffer'; productId: string; currentOfferId: string; role: OfferRole }
  | { type: 'checkoutContent'; content: CheckoutContent }
  | { type: 'thankYouContent'; content: ThankYouContent }
  | { type: 'confirmDelete'; productId: string; productName: string }
  | {
      type: 'confirmUnlink'
      productId: string
      offerId: string
      offerName: string
      role: OfferRole
    }

type TopTab = 'products' | 'upsells' | 'downsells' | 'bumps'

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter()
  const [topTab, setTopTab] = useState<TopTab>('products')
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [syncingProductId, setSyncingProductId] = useState<string | null>(null)
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'offers' | 'pages' | 'settings'>('offers')
  const [dialogState, setDialogState] = useState<DialogState>({ type: 'none' })
  const [savingProductId, setSavingProductId] = useState<string | null>(null)

  const editingProduct = products.find((p) => p.id === editingProductId)
  const expandedProduct = products.find((p) => p.id === expandedProductId)

  // Filter products by type based on top tab
  const filteredProducts = products.filter((p) => {
    if (topTab === 'products') return p.type === 'main'
    if (topTab === 'upsells') return p.type === 'upsell'
    if (topTab === 'downsells') return p.type === 'downsell'
    if (topTab === 'bumps') return p.type === 'bump'
    return false
  })

  // Get available offers for linking
  const availableOffers = products.filter((p) => p.type !== 'main')

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
      const product = products.find((p) => p.id === productId)
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

  async function handleSaveOfferProduct(productData: {
    id: string
    slug: string
    name: string
    type: ProductType
    config: ProductConfig
  }): Promise<void> {
    const existingProduct = products.find((p) => p.id === productData.id)

    if (existingProduct) {
      // Update existing
      const response = await fetch(`/api/admin/products/${productData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productData.name,
          slug: productData.slug,
          config: productData.config,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update product')
      }
    } else {
      // Create new
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error('Failed to create product')
      }
    }

    router.refresh()
  }

  async function handleLinkOffer(offerId: string, role: OfferRole): Promise<void> {
    // Get productId from either linkOffer or replaceOffer dialog state
    const productId =
      dialogState.type === 'linkOffer'
        ? dialogState.productId
        : dialogState.type === 'replaceOffer'
          ? dialogState.productId
          : null

    if (!productId) return

    const response = await fetch('/api/admin/product-offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        offerId,
        role,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to link offer')
    }

    router.refresh()
  }

  async function handleUnlinkOffer(): Promise<void> {
    if (dialogState.type !== 'confirmUnlink') return

    const response = await fetch('/api/admin/product-offers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: dialogState.productId,
        offerId: dialogState.offerId,
        role: dialogState.role,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to unlink:', error)
    }

    setDialogState({ type: 'none' })
    router.refresh()
  }

  async function handleDeleteProduct(): Promise<void> {
    if (dialogState.type !== 'confirmDelete') return

    const response = await fetch(`/api/admin/products/${dialogState.productId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Failed to delete:', error)
    }

    setDialogState({ type: 'none' })
    router.refresh()
  }

  function handleSaveCheckoutContent(content: CheckoutContent): void {
    if (!expandedProduct) return

    const updatedConfig: ProductConfig = {
      ...expandedProduct.config,
      checkout: content,
    }

    void saveProductConfig(expandedProduct.id, updatedConfig)
  }

  function handleSaveThankYouContent(content: ThankYouContent): void {
    if (!expandedProduct) return

    const updatedConfig: ProductConfig = {
      ...expandedProduct.config,
      thankYou: content,
    }

    void saveProductConfig(expandedProduct.id, updatedConfig)
  }

  function toggleExpand(productId: string): void {
    setExpandedProductId((prev) => (prev === productId ? null : productId))
  }

  const topTabLabel = {
    products: 'Products',
    upsells: 'Upsells',
    downsells: 'Downsells',
    bumps: 'Order Bumps',
  }

  return (
    <>
      {/* Top Level Tabs */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex border-b border-gray-200">
          {(['products', 'upsells', 'downsells', 'bumps'] as TopTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setTopTab(tab)
                setExpandedProductId(null)
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                topTab === tab
                  ? 'border-b-2 border-gray-900 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {topTabLabel[tab]}
              <span className="ml-1 text-xs text-gray-400">
                (
                {
                  products.filter((p) =>
                    tab === 'products' ? p.type === 'main' : p.type === tab.slice(0, -1)
                  ).length
                }
                )
              </span>
            </button>
          ))}
        </div>

        {/* Create New Button */}
        {topTab === 'products' ? (
          <Button onClick={() => setDialogState({ type: 'createProduct' })}>
            <Plus className="mr-2 h-4 w-4" />
            New Product
          </Button>
        ) : (
          <Button
            onClick={() =>
              setDialogState({
                type: 'offerProduct',
                product: null,
                isNew: true,
                productType:
                  topTab === 'bumps' ? 'bump' : (topTab.slice(0, -1) as 'upsell' | 'downsell'),
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            New{' '}
            {topTab === 'bumps'
              ? 'Order Bump'
              : topTab.slice(0, -1).charAt(0).toUpperCase() + topTab.slice(1, -1)}
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              {topTab === 'products' && <th className="w-8 px-2 py-3"></th>}
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                {topTab === 'products' ? 'Product' : topTabLabel[topTab].slice(0, -1)}
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Price</th>
              {topTab !== 'products' && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Used In</th>
              )}
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Stripe Status
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={topTab === 'products' ? 5 : 5}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No {topTabLabel[topTab].toLowerCase()} found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const isExpanded = expandedProductId === product.id
                const isSaving = savingProductId === product.id

                return (
                  <>
                    <tr
                      key={product.id}
                      className={`${topTab === 'products' ? 'cursor-pointer' : ''} hover:bg-gray-50 ${isExpanded ? 'bg-gray-50' : ''}`}
                      onClick={() => topTab === 'products' && toggleExpand(product.id)}
                    >
                      {topTab === 'products' && (
                        <td className="px-2 py-3 text-gray-400">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-500">/{product.slug}</span>
                            {topTab === 'products' && (
                              <Link
                                href={`/${product.slug}/checkout`}
                                target="_blank"
                                onClick={(e) => e.stopPropagation()}
                                className="text-gray-400 hover:text-blue-600"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                          {/* Show linked offers count for main products */}
                          {topTab === 'products' &&
                            product.linkedOffers &&
                            product.linkedOffers.length > 0 && (
                              <p className="mt-1 text-xs text-gray-400">
                                {product.linkedOffers.length} linked offer
                                {product.linkedOffers.length !== 1 ? 's' : ''}
                              </p>
                            )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-900">
                          {formatPrice(
                            product.config.stripe.priceAmount,
                            product.config.stripe.currency
                          )}
                        </p>
                        {topTab === 'products' &&
                          product.config.stripe.pricingTiers &&
                          product.config.stripe.pricingTiers.length > 1 && (
                            <p className="text-xs text-gray-500">
                              {product.config.stripe.pricingTiers.length} pricing tiers
                            </p>
                          )}
                      </td>
                      {topTab !== 'products' && (
                        <td className="px-4 py-3">
                          {product.usedIn && product.usedIn.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {product.usedIn.map((usage, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {usage.productName}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Not linked</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <SyncStatusBadge status={product.stripeSyncStatus} />
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {topTab !== 'products' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setDialogState({
                                    type: 'offerProduct',
                                    product,
                                    isNew: false,
                                    productType: product.type as 'upsell' | 'downsell' | 'bump',
                                  })
                                }
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                                onClick={() =>
                                  setDialogState({
                                    type: 'confirmDelete',
                                    productId: product.id,
                                    productName: product.name,
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
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

                    {/* Expanded Row for Main Products */}
                    {topTab === 'products' && isExpanded && (
                      <tr key={`${product.id}-expanded`}>
                        <td colSpan={5} className="bg-gray-50 px-4 py-4">
                          <div className="rounded-lg border border-gray-200 bg-white">
                            {/* Inner Tabs */}
                            <div className="flex border-b border-gray-200">
                              <button
                                onClick={() => setActiveTab('offers')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                  activeTab === 'offers'
                                    ? 'border-b-2 border-gray-900 text-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                Linked Offers
                              </button>
                              <button
                                onClick={() => setActiveTab('pages')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                  activeTab === 'pages'
                                    ? 'border-b-2 border-gray-900 text-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                Pages
                              </button>
                              <button
                                onClick={() => setActiveTab('settings')}
                                className={`px-4 py-2 text-sm font-medium transition-colors ${
                                  activeTab === 'settings'
                                    ? 'border-b-2 border-gray-900 text-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                              >
                                Settings
                              </button>
                              {isSaving && (
                                <div className="ml-auto flex items-center gap-2 px-4 text-sm text-gray-500">
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                  Saving...
                                </div>
                              )}
                            </div>

                            {/* Tab Content */}
                            <div className="p-4">
                              {activeTab === 'offers' && (
                                <div className="space-y-4">
                                  {/* Order Bump */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-sm font-medium text-gray-700">
                                        Order Bump
                                      </h4>
                                      {!product.linkedOffers?.some((o) => o.role === 'bump') && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={() =>
                                            setDialogState({
                                              type: 'linkOffer',
                                              productId: product.id,
                                              role: 'bump',
                                            })
                                          }
                                        >
                                          <Link2 className="mr-1 h-3 w-3" />
                                          Link
                                        </Button>
                                      )}
                                    </div>
                                    {product.linkedOffers
                                      ?.filter((o) => o.role === 'bump')
                                      .map((offer) => (
                                        <div
                                          key={offer.offerId}
                                          className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-3 py-2"
                                        >
                                          <div>
                                            <span className="text-sm text-gray-900">
                                              {offer.offerName}
                                            </span>
                                            {!offer.enabled && (
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
                                              className="h-7 text-xs"
                                              onClick={() =>
                                                setDialogState({
                                                  type: 'replaceOffer',
                                                  productId: product.id,
                                                  currentOfferId: offer.offerId,
                                                  role: 'bump',
                                                })
                                              }
                                            >
                                              <Link2 className="mr-1 h-3 w-3" />
                                              Replace
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                                              onClick={() =>
                                                setDialogState({
                                                  type: 'confirmUnlink',
                                                  productId: product.id,
                                                  offerId: offer.offerId,
                                                  offerName: offer.offerName,
                                                  role: 'bump',
                                                })
                                              }
                                            >
                                              <Unlink className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    {!product.linkedOffers?.some((o) => o.role === 'bump') && (
                                      <p className="text-sm text-gray-400">No order bump linked</p>
                                    )}
                                  </div>

                                  {/* Upsells */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-sm font-medium text-gray-700">Upsells</h4>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={() =>
                                          setDialogState({
                                            type: 'linkOffer',
                                            productId: product.id,
                                            role: 'upsell',
                                          })
                                        }
                                      >
                                        <Link2 className="mr-1 h-3 w-3" />
                                        Link
                                      </Button>
                                    </div>
                                    {product.linkedOffers
                                      ?.filter((o) => o.role === 'upsell')
                                      .map((offer) => (
                                        <div
                                          key={offer.offerId}
                                          className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-3 py-2"
                                        >
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">
                                              #{offer.position}
                                            </span>
                                            <span className="text-sm text-gray-900">
                                              {offer.offerName}
                                            </span>
                                            {!offer.enabled && (
                                              <Badge
                                                variant="outline"
                                                className="text-xs text-gray-400"
                                              >
                                                Disabled
                                              </Badge>
                                            )}
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                                            onClick={() =>
                                              setDialogState({
                                                type: 'confirmUnlink',
                                                productId: product.id,
                                                offerId: offer.offerId,
                                                offerName: offer.offerName,
                                                role: 'upsell',
                                              })
                                            }
                                          >
                                            <Unlink className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    {!product.linkedOffers?.some((o) => o.role === 'upsell') && (
                                      <p className="text-sm text-gray-400">No upsells linked</p>
                                    )}
                                  </div>

                                  {/* Downsell */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-sm font-medium text-gray-700">
                                        Downsell
                                      </h4>
                                      {!product.linkedOffers?.some(
                                        (o) => o.role === 'downsell'
                                      ) && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={() =>
                                            setDialogState({
                                              type: 'linkOffer',
                                              productId: product.id,
                                              role: 'downsell',
                                            })
                                          }
                                        >
                                          <Link2 className="mr-1 h-3 w-3" />
                                          Link
                                        </Button>
                                      )}
                                    </div>
                                    {product.linkedOffers
                                      ?.filter((o) => o.role === 'downsell')
                                      .map((offer) => (
                                        <div
                                          key={offer.offerId}
                                          className="flex items-center justify-between rounded border border-gray-100 bg-gray-50 px-3 py-2"
                                        >
                                          <div>
                                            <span className="text-sm text-gray-900">
                                              {offer.offerName}
                                            </span>
                                            {!offer.enabled && (
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
                                              className="h-7 text-xs"
                                              onClick={() =>
                                                setDialogState({
                                                  type: 'replaceOffer',
                                                  productId: product.id,
                                                  currentOfferId: offer.offerId,
                                                  role: 'downsell',
                                                })
                                              }
                                            >
                                              <Link2 className="mr-1 h-3 w-3" />
                                              Replace
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                                              onClick={() =>
                                                setDialogState({
                                                  type: 'confirmUnlink',
                                                  productId: product.id,
                                                  offerId: offer.offerId,
                                                  offerName: offer.offerName,
                                                  role: 'downsell',
                                                })
                                              }
                                            >
                                              <Unlink className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    {!product.linkedOffers?.some((o) => o.role === 'downsell') && (
                                      <p className="text-sm text-gray-400">No downsell linked</p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {activeTab === 'pages' && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                  {/* Checkout Page */}
                                  <div
                                    className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
                                    onClick={() =>
                                      product.config.checkout &&
                                      setDialogState({
                                        type: 'checkoutContent',
                                        content: product.config.checkout,
                                      })
                                    }
                                  >
                                    <div className="mb-2 flex items-center justify-between">
                                      <h4 className="text-sm font-medium text-gray-900">
                                        Checkout Page
                                      </h4>
                                      <Pencil className="h-3 w-3 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-700">
                                      {product.config.checkout?.title}
                                    </p>
                                    {product.config.checkout?.subtitle && (
                                      <p className="text-xs text-gray-500">
                                        {product.config.checkout.subtitle}
                                      </p>
                                    )}
                                  </div>

                                  {/* Thank You Page */}
                                  <div
                                    className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
                                    onClick={() =>
                                      product.config.thankYou &&
                                      setDialogState({
                                        type: 'thankYouContent',
                                        content: product.config.thankYou,
                                      })
                                    }
                                  >
                                    <div className="mb-2 flex items-center justify-between">
                                      <h4 className="text-sm font-medium text-gray-900">
                                        Thank You Page
                                      </h4>
                                      <Pencil className="h-3 w-3 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-700">
                                      {product.config.thankYou?.headline}
                                    </p>
                                    {product.config.thankYou?.subheadline && (
                                      <p className="text-xs text-gray-500">
                                        {product.config.thankYou.subheadline}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {activeTab === 'settings' && (
                                <div
                                  className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
                                  onClick={() => setEditingProductId(product.id)}
                                >
                                  <div className="mb-2 flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-gray-900">
                                      Product Settings
                                    </h4>
                                    <Pencil className="h-3 w-3 text-gray-400" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm text-gray-700">{product.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {product.config.stripe.currency} ·{' '}
                                      {formatPrice(
                                        product.config.stripe.priceAmount,
                                        product.config.stripe.currency
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Product Create Dialog (for new main products) */}
      <ProductCreateDialog
        open={dialogState.type === 'createProduct'}
        onClose={() => setDialogState({ type: 'none' })}
      />

      {/* Product Edit Dialog (for main products) */}
      <ProductEditDialog
        product={editingProduct ?? null}
        open={!!editingProductId}
        onClose={() => setEditingProductId(null)}
      />

      {/* Offer Product Dialog (for upsell/downsell/bump) */}
      <OfferProductDialog
        product={dialogState.type === 'offerProduct' ? dialogState.product : null}
        open={dialogState.type === 'offerProduct'}
        onClose={() => setDialogState({ type: 'none' })}
        onSave={handleSaveOfferProduct}
        isNew={dialogState.type === 'offerProduct' ? dialogState.isNew : false}
        productType={dialogState.type === 'offerProduct' ? dialogState.productType : 'upsell'}
        defaultCurrency={expandedProduct?.config.stripe.currency as Currency | undefined}
      />

      {/* Offer Link Dialog */}
      <OfferLinkDialog
        open={dialogState.type === 'linkOffer'}
        onClose={() => setDialogState({ type: 'none' })}
        onLink={handleLinkOffer}
        productId={dialogState.type === 'linkOffer' ? dialogState.productId : ''}
        role={dialogState.type === 'linkOffer' ? dialogState.role : 'upsell'}
        availableOffers={availableOffers}
        linkedOfferIds={
          dialogState.type === 'linkOffer'
            ? (products
                .find((p) => p.id === dialogState.productId)
                ?.linkedOffers?.map((o) => o.offerId) ?? [])
            : []
        }
      />

      {/* Offer Replace Dialog (reuses OfferLinkDialog with different handler) */}
      <OfferLinkDialog
        open={dialogState.type === 'replaceOffer'}
        onClose={() => setDialogState({ type: 'none' })}
        onLink={handleLinkOffer}
        productId={dialogState.type === 'replaceOffer' ? dialogState.productId : ''}
        role={dialogState.type === 'replaceOffer' ? dialogState.role : 'upsell'}
        availableOffers={availableOffers}
        linkedOfferIds={
          dialogState.type === 'replaceOffer'
            ? [dialogState.currentOfferId] // Exclude only the current offer being replaced
            : []
        }
        isReplace
        currentOfferId={dialogState.type === 'replaceOffer' ? dialogState.currentOfferId : undefined}
      />

      {/* Checkout Content Edit Dialog */}
      <CheckoutContentEditDialog
        content={dialogState.type === 'checkoutContent' ? dialogState.content : null}
        open={dialogState.type === 'checkoutContent'}
        onClose={() => setDialogState({ type: 'none' })}
        onSave={handleSaveCheckoutContent}
      />

      {/* Thank You Content Edit Dialog */}
      <ThankYouContentEditDialog
        content={dialogState.type === 'thankYouContent' ? dialogState.content : null}
        open={dialogState.type === 'thankYouContent'}
        onClose={() => setDialogState({ type: 'none' })}
        onSave={handleSaveThankYouContent}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={dialogState.type === 'confirmDelete'}
        onOpenChange={(isOpen) => !isOpen && setDialogState({ type: 'none' })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete &quot;
            {dialogState.type === 'confirmDelete' ? dialogState.productName : ''}&quot;? This action
            cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogState({ type: 'none' })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlink Confirmation Dialog */}
      <Dialog
        open={dialogState.type === 'confirmUnlink'}
        onOpenChange={(isOpen) => !isOpen && setDialogState({ type: 'none' })}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unlink Offer?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to unlink &quot;
            {dialogState.type === 'confirmUnlink' ? dialogState.offerName : ''}&quot;? The offer
            product will not be deleted, just unlinked from this product.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogState({ type: 'none' })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUnlinkOffer}>
              Unlink
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
