'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import {
  Star,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  Clock,
} from 'lucide-react'
import type { TestimonialStatus } from '@/lib/db/schema'

interface TestimonialWithForm {
  id: string
  formId: string
  customerName: string
  customerEmail: string
  customerCompany: string | null
  customerPhoto: string | null
  content: string
  rating: number
  status: TestimonialStatus
  featured: boolean
  createdAt: Date | null
  approvedAt: Date | null
  formName: string | null
  formSlug: string | null
}

interface FormOption {
  id: string
  name: string
}

interface TestimonialsTableProps {
  testimonials: TestimonialWithForm[]
  forms: FormOption[]
}

function StatusBadge({ status }: { status: TestimonialStatus }) {
  switch (status) {
    case 'approved':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Approved
        </Badge>
      )
    case 'rejected':
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      )
    case 'pending':
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      )
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

function FeaturedStar({
  featured,
  onClick,
}: {
  featured: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="transition-transform hover:scale-110"
      title={featured ? 'Remove from featured' : 'Add to featured'}
    >
      <Star
        className={`h-5 w-5 ${
          featured
            ? 'fill-amber-400 text-amber-400'
            : 'fill-transparent text-gray-300 hover:text-amber-300'
        }`}
      />
    </button>
  )
}

function formatDate(date: Date | null): string {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function truncateContent(content: string, maxLength: number = 80): string {
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength).trim() + '...'
}

export function TestimonialsTable({ testimonials, forms }: TestimonialsTableProps) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [formFilter, setFormFilter] = useState<string>('all')
  const [viewingTestimonial, setViewingTestimonial] = useState<TestimonialWithForm | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Filter testimonials
  const filteredTestimonials = testimonials.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (formFilter !== 'all' && t.formId !== formFilter) return false
    return true
  })

  async function handleStatusChange(id: string, status: TestimonialStatus) {
    try {
      const response = await fetch('/api/admin/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to update status')
        return
      }

      toast.success(`Testimonial ${status}`)
      router.refresh()
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Failed to update status')
    }
  }

  async function handleFeatureToggle(id: string, currentFeatured: boolean) {
    try {
      const response = await fetch('/api/admin/testimonials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, featured: !currentFeatured }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to update featured status')
        return
      }

      toast.success(currentFeatured ? 'Removed from featured' : 'Added to featured')
      router.refresh()
    } catch (error) {
      console.error('Failed to toggle featured:', error)
      toast.error('Failed to update featured status')
    }
  }

  async function handleDelete() {
    if (!deletingId) return
    setIsDeleting(true)

    try {
      const response = await fetch('/api/admin/testimonials', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deletingId }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Failed to delete testimonial')
        return
      }

      toast.success('Testimonial deleted')
      setDeletingId(null)
      router.refresh()
    } catch (error) {
      console.error('Failed to delete:', error)
      toast.error('Failed to delete testimonial')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Filters */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Form:</span>
          <Select value={formFilter} onValueChange={setFormFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All forms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All forms</SelectItem>
              {forms.map((form) => (
                <SelectItem key={form.id} value={form.id}>
                  {form.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto text-sm text-gray-500">
          {filteredTestimonials.length} testimonial
          {filteredTestimonials.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Form</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Rating</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Content</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Status</th>
              <th className="w-12 px-4 py-3 text-center text-sm font-medium text-gray-600">
                <Star className="mx-auto h-4 w-4 text-gray-400" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTestimonials.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  {testimonials.length === 0
                    ? 'No testimonials yet. Create a form and start collecting!'
                    : 'No testimonials match your filters.'}
                </td>
              </tr>
            ) : (
              filteredTestimonials.map((testimonial) => (
                <tr key={testimonial.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{testimonial.customerName}</p>
                      {testimonial.customerCompany && (
                        <p className="text-sm text-gray-500">{testimonial.customerCompany}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">
                      {testimonial.formName || 'Unknown'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <StarRating rating={testimonial.rating} />
                  </td>
                  <td className="max-w-xs px-4 py-3">
                    <p className="truncate text-sm text-gray-600">
                      {truncateContent(testimonial.content)}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={testimonial.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <FeaturedStar
                      featured={testimonial.featured}
                      onClick={() => handleFeatureToggle(testimonial.id, testimonial.featured)}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(testimonial.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewingTestimonial(testimonial)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {testimonial.status !== 'approved' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(testimonial.id, 'approved')}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {testimonial.status !== 'rejected' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(testimonial.id, 'rejected')}
                            >
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              Reject
                            </DropdownMenuItem>
                          )}
                          {testimonial.status !== 'pending' && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(testimonial.id, 'pending')}
                            >
                              <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                              Set pending
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeletingId(testimonial.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Details Dialog */}
      <Dialog
        open={!!viewingTestimonial}
        onOpenChange={(isOpen) => !isOpen && setViewingTestimonial(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Testimonial Details</DialogTitle>
          </DialogHeader>
          {viewingTestimonial && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {viewingTestimonial.customerPhoto ? (
                  <img
                    src={viewingTestimonial.customerPhoto}
                    alt={viewingTestimonial.customerName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-medium text-gray-600">
                    {viewingTestimonial.customerName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{viewingTestimonial.customerName}</p>
                  {viewingTestimonial.customerCompany && (
                    <p className="text-sm text-gray-500">{viewingTestimonial.customerCompany}</p>
                  )}
                  <p className="text-sm text-gray-400">{viewingTestimonial.customerEmail}</p>
                </div>
                <StatusBadge status={viewingTestimonial.status} />
              </div>

              <div className="flex items-center gap-2">
                <StarRating rating={viewingTestimonial.rating} />
                {viewingTestimonial.featured && (
                  <Badge className="bg-amber-100 text-amber-800">Featured</Badge>
                )}
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="whitespace-pre-wrap text-gray-700">{viewingTestimonial.content}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Form: {viewingTestimonial.formName || 'Unknown'}</span>
                <span>Submitted: {formatDate(viewingTestimonial.createdAt)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingTestimonial(null)}>
              Close
            </Button>
            {viewingTestimonial && viewingTestimonial.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleStatusChange(viewingTestimonial.id, 'rejected')
                    setViewingTestimonial(null)
                  }}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    handleStatusChange(viewingTestimonial.id, 'approved')
                    setViewingTestimonial(null)
                  }}
                >
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingId} onOpenChange={(isOpen) => !isOpen && setDeletingId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Testimonial?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this testimonial? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
