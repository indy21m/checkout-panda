import { Puzzle } from 'lucide-react'

export default function TestimonialWidgetsPage() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
      <Puzzle className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">Display Widgets</h3>
      <p className="mt-2 text-sm text-gray-500">
        Configure how testimonials appear on your checkout pages.
      </p>
      <p className="mt-1 text-xs text-gray-400">Coming in Phase 2c</p>
    </div>
  )
}
