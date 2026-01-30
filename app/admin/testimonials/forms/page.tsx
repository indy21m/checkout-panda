import { FileText } from 'lucide-react'

export default function TestimonialFormsPage() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
      <FileText className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">Collection Forms</h3>
      <p className="mt-2 text-sm text-gray-500">
        Create and manage testimonial collection forms.
      </p>
      <p className="mt-1 text-xs text-gray-400">Coming in Phase 2b</p>
    </div>
  )
}
