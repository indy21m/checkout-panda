import { Users } from 'lucide-react'

export default function SegmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Segments</h2>
        <p className="text-sm text-gray-500">
          Create customer segments and personalize their checkout experience.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Coming Soon</h3>
        <p className="mt-2 text-sm text-gray-500">
          Customer segmentation is being integrated from Segment Fox.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          You&apos;ll be able to survey customers and show personalized offers based on their
          responses.
        </p>
      </div>
    </div>
  )
}
