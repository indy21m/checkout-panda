'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, ShoppingCart, ExternalLink, Copy } from 'lucide-react'
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
import Link from 'next/link'

const checkoutSchema = z.object({
  name: z.string().min(1, 'Checkout name is required'),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const utils = api.useUtils()

  // Fetch checkouts
  const { data: checkouts, isLoading } = api.checkout.list.useQuery()

  // Create checkout mutation
  const createCheckout = api.checkout.create.useMutation({
    onSuccess: (data) => {
      toast.success('Checkout created successfully')
      setIsCreateOpen(false)
      utils.checkout.list.invalidate()
      // Redirect to builder
      if (data?.id) {
        window.location.href = `/builder/${data.id}`
      }
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Delete checkout mutation
  const deleteCheckout = api.checkout.delete.useMutation({
    onSuccess: () => {
      toast.success('Checkout deleted successfully')
      utils.checkout.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const createForm = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
    },
  })

  const onCreateSubmit = (data: CheckoutFormData) => {
    createCheckout.mutate(data)
  }

  const handleDelete = (id: string, name: string) => {
    // Using template literal to avoid ESLint unescaped entity warning
    const message = `Are you sure you want to delete "${name}"?`
    if (confirm(message)) {
      deleteCheckout.mutate({ id })
    }
  }

  const copyCheckoutUrl = (slug: string) => {
    const url = `${window.location.origin}/c/${slug}`
    navigator.clipboard.writeText(url)
    toast.success('Checkout URL copied to clipboard')
  }

  const getCheckoutUrl = (slug: string) => {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/c/${slug}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-white">Checkouts</h1>
          <p className="text-gray-300">Create and manage your checkout pages</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="primary">
              <Plus className="mr-2 h-4 w-4" />
              Create Checkout
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Checkout</DialogTitle>
              <DialogDescription>
                Give your checkout a name and we&apos;ll set up a new page for you.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Checkout Name</Label>
                <Input
                  id="name"
                  {...createForm.register('name')}
                  placeholder="e.g., Premium Course Checkout"
                />
                {createForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {createForm.formState.errors.name.message}
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
                <Button type="submit" disabled={createCheckout.isPending}>
                  {createCheckout.isPending ? 'Creating...' : 'Create & Edit'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-400">Loading checkouts...</p>
        </div>
      ) : checkouts?.length === 0 ? (
        <Card variant="glass">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">No checkouts yet</h3>
            <p className="mb-4 text-gray-400">Create your first checkout page to get started</p>
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Checkout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {checkouts?.map((checkout) => (
            <Card key={checkout.id} variant="glass">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-1">{checkout.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {checkout.status === 'published' ? (
                        <span className="text-green-500">🟢 Published</span>
                      ) : checkout.status === 'archived' ? (
                        <span className="text-gray-500">🔒 Archived</span>
                      ) : (
                        <span className="text-yellow-500">⚪ Draft</span>
                      )}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(checkout.id, checkout.name)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Views</span>
                    <span className="font-medium">{checkout.views || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Conversions</span>
                    <span className="font-medium">{checkout.conversions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Revenue</span>
                    <span className="font-medium">
                      ${((checkout.revenue || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/builder/${checkout.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                  {checkout.status === 'published' && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyCheckoutUrl(checkout.slug)}
                        title="Copy checkout URL"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <a
                        href={getCheckoutUrl(checkout.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon" title="View checkout page">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
