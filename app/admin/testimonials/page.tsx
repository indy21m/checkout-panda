import { MessageSquare } from 'lucide-react'

export default function TestimonialsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Testimonials</h2>
        <p className="text-sm text-gray-500">
          Collect and display customer testimonials on your checkout pages.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Coming Soon</h3>
        <p className="mt-2 text-sm text-gray-500">
          Testimonial management is being integrated from Testimonial Tiger.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          You&apos;ll be able to collect, curate, and embed testimonials directly in your checkout
          flow.
        </p>
      </div>
    </div>
  )
}
