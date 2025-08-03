'use client'

import { useState } from 'react'
import { ModernProductDashboard } from './modern-product-dashboard'
import { ProductEditorModal } from './product-editor-modal'
import type { RouterOutputs } from '@/lib/trpc/api'

type Product = RouterOutputs['product']['list'][0]

export default function ProductsContent() {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const handleCreateProduct = () => {
    setEditingProduct(null)
    setIsEditorOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsEditorOpen(true)
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setEditingProduct(null)
  }

  return (
    <div className="p-8">
      <ModernProductDashboard
        onCreateProduct={handleCreateProduct}
        onEditProduct={handleEditProduct}
      />

      <ProductEditorModal
        isOpen={isEditorOpen}
        onClose={handleCloseEditor}
        product={editingProduct}
      />
    </div>
  )
}
