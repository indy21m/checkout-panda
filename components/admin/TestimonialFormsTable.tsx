'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, MoreHorizontal, Pencil, Trash2, Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { TestimonialFormDialog } from './TestimonialFormDialog'
import type { TestimonialFormRecord, TestimonialFormConfig } from '@/lib/db/schema'

interface Product {
  id: string
  name: string
}

interface FormWithCount extends TestimonialFormRecord {
  submissionCount: number
  productName?: string
}

interface TestimonialFormsTableProps {
  forms: FormWithCount[]
  products: Product[]
}

export function TestimonialFormsTable({ forms, products }: TestimonialFormsTableProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<TestimonialFormRecord | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formToDelete, setFormToDelete] = useState<FormWithCount | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  function handleCreateNew() {
    setEditingForm(null)
    setDialogOpen(true)
  }

  function handleEdit(form: TestimonialFormRecord) {
    setEditingForm(form)
    setDialogOpen(true)
  }

  function handleDeleteClick(form: FormWithCount) {
    setFormToDelete(form)
    setDeleteDialogOpen(true)
  }

  async function handleDelete() {
    if (!formToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/testimonials/forms?id=${formToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Failed to delete form')
      }

      toast.success('Form deleted successfully')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete form')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setFormToDelete(null)
    }
  }

  function getPublicUrl(slug: string): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/testimonials/${slug}`
  }

  async function handleCopyUrl(slug: string) {
    const url = getPublicUrl(slug)
    try {
      await navigator.clipboard.writeText(url)
      toast.success('URL copied to clipboard')
    } catch {
      toast.error('Failed to copy URL')
    }
  }

  function handleOpenUrl(slug: string) {
    const url = getPublicUrl(slug)
    window.open(url, '_blank')
  }

  function getProductName(productId: string | null): string | null {
    if (!productId) return null
    const product = products.find((p) => p.id === productId)
    return product?.name ?? null
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Form
        </Button>
      </div>

      {forms.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No testimonial forms yet.</p>
          <p className="mt-1 text-sm text-gray-400">
            Create a form to start collecting testimonials from your customers.
          </p>
          <Button className="mt-4" onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Form
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Linked Product</TableHead>
                <TableHead className="text-center">Submissions</TableHead>
                <TableHead>Public URL</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form) => {
                const productName = getProductName(form.productId)
                const config = form.config as TestimonialFormConfig | null

                return (
                  <TableRow key={form.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{form.name}</p>
                        {config?.heading && (
                          <p className="text-sm text-gray-500 truncate max-w-[200px]">
                            {config.heading}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {productName ? (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          {productName}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        {form.submissionCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[180px]">
                          /testimonials/{form.slug}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleCopyUrl(form.slug)}
                          title="Copy URL"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleOpenUrl(form.slug)}
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(form)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteClick(form)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <TestimonialFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        form={editingForm}
        products={products}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{formToDelete?.name}&quot;?
              {formToDelete && formToDelete.submissionCount > 0 && (
                <>
                  {' '}
                  This will also delete{' '}
                  <strong>{formToDelete.submissionCount} testimonial(s)</strong> associated with
                  this form.
                </>
              )}{' '}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
