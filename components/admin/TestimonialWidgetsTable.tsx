'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, MoreHorizontal, Pencil, Trash2, Code } from 'lucide-react'
import { toast } from 'sonner'
import type { TestimonialWidgetRecord, TestimonialWidgetConfig } from '@/lib/db/schema'

interface WidgetWithInfo extends TestimonialWidgetRecord {
  sourceInfo?: string
}

interface TestimonialWidgetsTableProps {
  widgets: WidgetWithInfo[]
}

function formatDate(date: Date | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function TestimonialWidgetsTable({ widgets }: TestimonialWidgetsTableProps) {
  const router = useRouter()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newWidgetName, setNewWidgetName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [widgetToDelete, setWidgetToDelete] = useState<WidgetWithInfo | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false)
  const [embedWidget, setEmbedWidget] = useState<WidgetWithInfo | null>(null)

  async function handleCreate() {
    if (!newWidgetName.trim()) {
      toast.error('Please enter a widget name')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/admin/testimonials/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWidgetName.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Failed to create widget')
      }

      const { widget } = await response.json()
      toast.success('Widget created')
      setCreateDialogOpen(false)
      setNewWidgetName('')
      // Navigate to edit page
      router.push(`/admin/testimonials/widgets/${widget.id}/edit`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create widget')
    } finally {
      setIsCreating(false)
    }
  }

  function handleDeleteClick(widget: WidgetWithInfo) {
    setWidgetToDelete(widget)
    setDeleteDialogOpen(true)
  }

  async function handleDelete() {
    if (!widgetToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/testimonials/widgets?id=${widgetToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Failed to delete widget')
      }

      toast.success('Widget deleted successfully')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete widget')
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setWidgetToDelete(null)
    }
  }

  function handleShowEmbed(widget: WidgetWithInfo) {
    setEmbedWidget(widget)
    setEmbedDialogOpen(true)
  }

  function getEmbedCode(widgetId: string): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `<script src="${baseUrl}/embed/testimonials.js" data-widget-id="${widgetId}"></script>`
  }

  async function handleCopyEmbed() {
    if (!embedWidget) return
    const code = getEmbedCode(embedWidget.id)
    try {
      await navigator.clipboard.writeText(code)
      toast.success('Embed code copied to clipboard')
    } catch {
      toast.error('Failed to copy embed code')
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Widget
        </Button>
      </div>

      {widgets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No display widgets yet.</p>
          <p className="mt-1 text-sm text-gray-400">
            Create a widget to display testimonials on your pages.
          </p>
          <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Widget
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {widgets.map((widget) => {
                const config = widget.config as TestimonialWidgetConfig | null

                return (
                  <TableRow key={widget.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{widget.name}</p>
                        {config?.layout && (
                          <p className="text-sm text-gray-500 capitalize">{config.layout} layout</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{widget.sourceInfo}</span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(widget.createdAt)}
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
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/testimonials/widgets/${widget.id}/edit`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShowEmbed(widget)}>
                            <Code className="mr-2 h-4 w-4" />
                            Embed Code
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteClick(widget)}
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

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Widget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="widget-name">Widget Name</Label>
              <Input
                id="widget-name"
                value={newWidgetName}
                onChange={(e) => setNewWidgetName(e.target.value)}
                placeholder="e.g., Homepage Testimonials"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreate()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create & Configure'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Embed Code Dialog */}
      <Dialog open={embedDialogOpen} onOpenChange={setEmbedDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Embed Code</DialogTitle>
          </DialogHeader>
          {embedWidget && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600">
                Add this code to your website where you want the testimonials to appear:
              </p>
              <div className="rounded-lg bg-gray-900 p-4">
                <code className="text-sm text-green-400 break-all">
                  {getEmbedCode(embedWidget.id)}
                </code>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmbedDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleCopyEmbed}>Copy Code</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Widget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{widgetToDelete?.name}&quot;? This will remove
              it from any pages where it&apos;s embedded. This action cannot be undone.
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
