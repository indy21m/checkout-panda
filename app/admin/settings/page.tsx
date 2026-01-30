import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">Configure your Checkout Panda instance.</p>
      </div>

      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <Settings className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Coming Soon</h3>
        <p className="mt-2 text-sm text-gray-500">
          Settings page will include integrations, branding, and account management.
        </p>
      </div>
    </div>
  )
}
