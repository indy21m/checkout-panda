'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Unlink } from 'lucide-react'
import { toast } from 'sonner'

interface GoogleCalendarConnectProps {
  connected: boolean
  onDisconnect: () => void
}

export function GoogleCalendarConnect({
  connected,
  onDisconnect,
}: GoogleCalendarConnectProps) {
  const [disconnecting, setDisconnecting] = useState(false)

  const handleConnect = () => {
    // Redirect to the Google OAuth flow
    window.location.href = '/api/admin/calendar/google/auth'
  }

  const handleDisconnect = async () => {
    setDisconnecting(true)
    try {
      const res = await fetch('/api/admin/calendar/google', { method: 'DELETE' })
      if (res.ok) {
        toast.success('Google Calendar disconnected')
        onDisconnect()
      } else {
        toast.error('Failed to disconnect')
      }
    } catch {
      toast.error('Failed to disconnect')
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900">Google Calendar</h4>
          <p className="mt-0.5 text-xs text-gray-500">
            {connected
              ? 'Connected — busy times will be excluded from available slots.'
              : 'Connect to automatically block times when you are busy.'}
          </p>
        </div>
        {connected ? (
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
              <CheckCircle className="h-4 w-4" />
              Connected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              <Unlink className="mr-1 h-3.5 w-3.5" />
              Disconnect
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={handleConnect}>
            Connect
          </Button>
        )}
      </div>
    </div>
  )
}
