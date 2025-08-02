'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Package, MoreVertical } from 'lucide-react'
import { api } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

export default function ProductsContent() {
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
      createForm.reset()
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 p-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Products</h1>
          <p className="text-text-secondary text-lg">Manage your products and pricing</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="primary" size="lg">
              <Plus className="mr-2 h-5 w-5" />
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
                  <p className="text-accent mt-1 text-sm">
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
                  <span className="text-text-secondary absolute top-1/2 left-3 -translate-y-1/2">
                    $
                  </span>
                  <Input
                    id="price"
                    {...createForm.register('price')}
                    placeholder="99.00"
                    className="pl-8"
                  />
                </div>
                {createForm.formState.errors.price && (
                  <p className="text-accent mt-1 text-sm">
                    {createForm.formState.errors.price.message}
                  </p>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-4">
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
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <motion.div variants={itemVariants} className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="bg-background-secondary mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full">
              <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
            <p className="text-text-secondary">Loading products...</p>
          </div>
        </motion.div>
      ) : products?.length === 0 ? (
        <motion.div variants={itemVariants}>
          <GlassmorphicCard className="p-12">
            <div className="text-center">
              <div className="from-primary/10 to-primary/5 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br">
                <Package className="text-primary h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">No products yet</h3>
              <p className="text-text-secondary mb-6">Create your first product to get started</p>
              <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Product
              </Button>
            </div>
          </GlassmorphicCard>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {products?.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <GlassmorphicCard className="group h-full p-6" hover>
                <div className="flex h-full flex-col">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="group-hover:text-primary mb-1 text-lg font-semibold transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-text-secondary text-sm">
                        {product.description || 'No description'}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingProduct(product)
                            editForm.reset({
                              name: product.name,
                              description: product.description || '',
                              price: (product.price / 100).toFixed(2),
                            })
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(product.id)}
                          className="text-accent"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="border-border-light mt-auto border-t pt-4">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-primary text-2xl font-bold">
                          ${(product.price / 100).toFixed(2)}
                        </span>
                        {product.isRecurring && (
                          <span className="text-text-tertiary text-sm">/{product.interval}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </GlassmorphicCard>
            </motion.div>
          ))}
        </motion.div>
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
                <p className="text-accent mt-1 text-sm">{editForm.formState.errors.name.message}</p>
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
                <span className="text-text-secondary absolute top-1/2 left-3 -translate-y-1/2">
                  $
                </span>
                <Input
                  id="edit-price"
                  {...editForm.register('price')}
                  placeholder="99.00"
                  className="pl-8"
                />
              </div>
              {editForm.formState.errors.price && (
                <p className="text-accent mt-1 text-sm">
                  {editForm.formState.errors.price.message}
                </p>
              )}
            </div>
            <div className="flex justify-end space-x-2 pt-4">
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
    </motion.div>
  )
}
