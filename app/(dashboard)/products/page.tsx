'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react'
import { api } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.string().regex(/^\d+\.?\d{0,2}$/, 'Invalid price format'),
})

type ProductFormData = z.infer<typeof productSchema>

export default function ProductsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<{
    id: string
    name: string
    description?: string | null
    price: number
  } | null>(null)

  const utils = api.useUtils()

  // Fetch products
  const { data: products, isLoading } = api.product.list.useQuery()

  // Create product mutation
  const createProduct = api.product.create.useMutation({
    onSuccess: () => {
      toast.success('Product created successfully')
      setIsCreateOpen(false)
      utils.product.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Update product mutation
  const updateProduct = api.product.update.useMutation({
    onSuccess: () => {
      toast.success('Product updated successfully')
      setEditingProduct(null)
      utils.product.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Delete product mutation
  const deleteProduct = api.product.delete.useMutation({
    onSuccess: () => {
      toast.success('Product deleted successfully')
      utils.product.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const createForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
    },
  })

  const editForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  const onCreateSubmit = (data: ProductFormData) => {
    createProduct.mutate({
      name: data.name,
      description: data.description,
      price: Math.round(parseFloat(data.price) * 100), // Convert to cents
      isRecurring: false,
    })
  }

  const onEditSubmit = (data: ProductFormData) => {
    if (!editingProduct) return

    updateProduct.mutate({
      id: editingProduct.id,
      name: data.name,
      description: data.description,
      price: Math.round(parseFloat(data.price) * 100), // Convert to cents
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct.mutate({ id })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-white">Products</h1>
          <p className="text-gray-300">Manage your products and pricing</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="primary">
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your catalog. You can set up pricing and descriptions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  {...createForm.register('name')}
                  placeholder="e.g., Premium Course"
                />
                {createForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {createForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  {...createForm.register('description')}
                  placeholder="Brief description of your product"
                />
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="price"
                    {...createForm.register('price')}
                    placeholder="99.00"
                    className="pl-8"
                  />
                </div>
                {createForm.formState.errors.price && (
                  <p className="mt-1 text-sm text-red-500">
                    {createForm.formState.errors.price.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsCreateOpen(false)
                    createForm.reset()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createProduct.isPending}>
                  {createProduct.isPending ? 'Creating...' : 'Create Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-400">Loading products...</p>
        </div>
      ) : products?.length === 0 ? (
        <Card variant="glass">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <DollarSign className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">No products yet</h3>
            <p className="mb-4 text-gray-400">Create your first product to get started</p>
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products?.map((product) => (
            <Card key={product.id} variant="glass">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.description || 'No description'}</CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingProduct(product)
                        editForm.reset({
                          name: product.name,
                          description: product.description || '',
                          price: (product.price / 100).toFixed(2),
                        })
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">${(product.price / 100).toFixed(2)}</span>
                  {product.isRecurring && (
                    <span className="text-sm text-gray-400">per {product.interval}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update your product details and pricing.</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                {...editForm.register('name')}
                placeholder="e.g., Premium Course"
              />
              {editForm.formState.errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {editForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Input
                id="edit-description"
                {...editForm.register('description')}
                placeholder="Brief description of your product"
              />
            </div>
            <div>
              <Label htmlFor="edit-price">Price</Label>
              <div className="relative">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="edit-price"
                  {...editForm.register('price')}
                  placeholder="99.00"
                  className="pl-8"
                />
              </div>
              {editForm.formState.errors.price && (
                <p className="mt-1 text-sm text-red-500">
                  {editForm.formState.errors.price.message}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditingProduct(null)
                  editForm.reset()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateProduct.isPending}>
                {updateProduct.isPending ? 'Updating...' : 'Update Product'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
