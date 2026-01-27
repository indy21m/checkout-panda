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

interface CancelBookingDialogProps {
  bookingId: string | null
  guestName: string
  onClose: () => void
  onCancelled: () => void
}

export function CancelBookingDialog({
  bookingId,
  guestName,
  onClose,
  onCancelled,
}: CancelBookingDialogProps) {
  const [reason, setReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  const handleCancel = async () => {
    if (!bookingId) return
    setCancelling(true)
    try {
      const res = await fetch(`/api/admin/calendar/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason || undefined }),
      })

      if (res.ok) {
        toast.success('Booking cancelled')
        onCancelled()
        onClose()
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Failed to cancel')
      }
    } catch {
      toast.error('Failed to cancel booking')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <Dialog open={!!bookingId} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogDescription>
            Cancel the booking with {guestName}? They will be notified via email.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="cancelReason">Reason (optional)</Label>
            <Textarea
              id="cancelReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for cancellation..."
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
