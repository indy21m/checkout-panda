'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface MessageBookerDialogProps {
  bookingId: string | null
  guestName: string
  guestEmail: string
  onClose: () => void
}

export function MessageBookerDialog({
  bookingId,
  guestName,
  guestEmail,
  onClose,
}: MessageBookerDialogProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!bookingId || !message.trim()) return
    setSending(true)
    try {
      const res = await fetch(`/api/admin/calendar/bookings/${bookingId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (res.ok) {
        toast.success(`Message sent to ${guestName}`)
        setMessage('')
        onClose()
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Failed to send message')
      }
    } catch {
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={!!bookingId} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>
            Send an email to {guestName} ({guestEmail}).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="bookingMessage">Message</Label>
            <Textarea
              id="bookingMessage"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message..."
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending || !message.trim()}>
              {sending ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
