'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, ShoppingCart, ExternalLink, Copy, BarChart, Eye, TrendingUp } from 'lucide-react'
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
}

export default function CheckoutsContent() {
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
      createForm.reset()
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

  const getConversionRate = (views: number | null, conversions: number | null) => {
    if (!views || views === 0) return '0'
    return ((conversions || 0) / views * 100).toFixed(1)
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-8 space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Checkouts</h1>
          <p className="text-text-secondary text-lg">
            Create and manage your checkout pages
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="primary" size="lg">
              <Plus className="mr-2 h-5 w-5" />
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
                  className="form-input"
                />
                {createForm.formState.errors.name && (
                  <p className="mt-1 text-sm text-accent">
                    {createForm.formState.errors.name.message}
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
                <Button type="submit" disabled={createCheckout.isPending}>
                  {createCheckout.isPending ? 'Creating...' : 'Create & Edit'}
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
            <div className="inline-flex items-center justify-center w-12 h-12 bg-background-secondary rounded-full mb-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-text-secondary">Loading checkouts...</p>
          </div>
        </motion.div>
      ) : checkouts?.length === 0 ? (
        <motion.div variants={itemVariants}>
          <GlassmorphicCard className="p-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full mb-4">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No checkouts yet</h3>
              <p className="text-text-secondary mb-6">Create your first checkout page to get started</p>
              <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Checkout
              </Button>
            </div>
          </GlassmorphicCard>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {checkouts?.map((checkout) => (
            <motion.div key={checkout.id} variants={itemVariants}>
              <GlassmorphicCard className="p-6 h-full group" hover>
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {checkout.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-xs ${
                          checkout.status === 'published' 
                            ? 'text-success' 
                            : checkout.status === 'archived'
                            ? 'text-text-tertiary'
                            : 'text-warning'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            checkout.status === 'published' 
                              ? 'bg-success' 
                              : checkout.status === 'archived'
                              ? 'bg-text-tertiary'
                              : 'bg-warning'
                          }`} />
                          {checkout.status === 'published' ? 'Published' : 
                           checkout.status === 'archived' ? 'Archived' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(checkout.id, checkout.name)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-accent hover:text-accent/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Eye className="h-4 w-4" />
                        <span>Views</span>
                      </div>
                      <span className="font-semibold">{checkout.views || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <TrendingUp className="h-4 w-4" />
                        <span>Conversions</span>
                      </div>
                      <span className="font-semibold">{checkout.conversions || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <BarChart className="h-4 w-4" />
                        <span>Rate</span>
                      </div>
                      <span className="font-semibold text-primary">
                        {getConversionRate(checkout.views, checkout.conversions)}%
                      </span>
                    </div>
                    <div className="pt-3 border-t border-border-light flex items-center justify-between">
                      <span className="text-sm text-text-secondary">Revenue</span>
                      <span className="text-lg font-bold text-success">
                        ${((checkout.revenue || 0) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
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
                </div>
              </GlassmorphicCard>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}