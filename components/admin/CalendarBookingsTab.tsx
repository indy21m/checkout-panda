'use client'

import { useState } from 'react'
import { format, isPast } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CancelBookingDialog } from '@/components/admin/CancelBookingDialog'
import { MessageBookerDialog } from '@/components/admin/MessageBookerDialog'
import { Ban, Mail, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface Booking {
  id: string
  startTime: string
  endTime: string
  guestName: string
  guestEmail: string
  message: string | null
  meetingType: string
  status: 'confirmed' | 'cancelled'
  cancelledAt: string | null
  cancellationReason: string | null
  createdAt: string
}

interface CalendarBookingsTabProps {
  initialBookings: Booking[]
}

type StatusFilter = 'all' | 'confirmed' | 'cancelled'

export function CalendarBookingsTab({ initialBookings }: CalendarBookingsTabProps) {
  const [bookings, setBookings] = useState(initialBookings)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [refreshing, setRefreshing] = useState(false)

  // Cancel dialog state
  const [cancelTarget, setCancelTarget] = useState<{
    id: string
    guestName: string
  } | null>(null)

  // Message dialog state
  const [messageTarget, setMessageTarget] = useState<{
    id: string
    guestName: string
    guestEmail: string
  } | null>(null)

  const refreshBookings = async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/admin/calendar/bookings')
      const data = await res.json()
      if (data.bookings) setBookings(data.bookings)
    } catch {
      toast.error('Failed to refresh bookings')
    } finally {
      setRefreshing(false)
    }
  }

  const filtered = bookings.filter((b) => {
    if (filter === 'all') return true
    return b.status === filter
  })

  // Sort: upcoming confirmed first, then past, then cancelled
  const sorted = [...filtered].sort((a, b) => {
    // Confirmed before cancelled
    if (a.status !== b.status) return a.status === 'confirmed' ? -1 : 1
    // Upcoming before past (nearest first)
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  })

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1">
          {(['all', 'confirmed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={refreshBookings} disabled={refreshing}>
          <RefreshCw className={`mr-1 h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Bookings list */}
      {sorted.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
          <p className="text-sm text-gray-500">No bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((booking) => {
            const start = new Date(booking.startTime)
            const end = new Date(booking.endTime)
            const past = isPast(start)

            return (
              <div
                key={booking.id}
                className={`rounded-lg border px-4 py-3 ${
                  booking.status === 'cancelled'
                    ? 'border-gray-100 bg-gray-50'
                    : past
                      ? 'border-gray-200 bg-gray-50'
                      : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {booking.guestName}
                      </span>
                      <StatusBadge status={booking.status} past={past} />
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{booking.guestEmail}</p>
                    <p className="mt-1 text-sm text-gray-700">
                      {format(start, 'EEE, MMM d, yyyy')} &middot;{' '}
                      {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400 capitalize">
                      {booking.meetingType.replace(/-/g, ' ')}
                    </p>
                    {booking.message && (
                      <p className="mt-1 text-xs text-gray-500 italic">
                        &ldquo;{booking.message}&rdquo;
                      </p>
                    )}
                    {booking.cancellationReason && (
                      <p className="mt-1 text-xs text-red-500">
                        Reason: {booking.cancellationReason}
                      </p>
                    )}
                  </div>

                  {booking.status === 'confirmed' && (
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setMessageTarget({
                            id: booking.id,
                            guestName: booking.guestName,
                            guestEmail: booking.guestEmail,
                          })
                        }
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setCancelTarget({
                            id: booking.id,
                            guestName: booking.guestName,
                          })
                        }
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dialogs */}
      {cancelTarget && (
        <CancelBookingDialog
          bookingId={cancelTarget.id}
          guestName={cancelTarget.guestName}
          onClose={() => setCancelTarget(null)}
          onCancelled={refreshBookings}
        />
      )}

      {messageTarget && (
        <MessageBookerDialog
          bookingId={messageTarget.id}
          guestName={messageTarget.guestName}
          guestEmail={messageTarget.guestEmail}
          onClose={() => setMessageTarget(null)}
        />
      )}
    </div>
  )
}

function StatusBadge({ status, past }: { status: 'confirmed' | 'cancelled'; past: boolean }) {
  if (status === 'cancelled') {
    return <Badge variant="outline" className="text-gray-400">Cancelled</Badge>
  }
  if (past) {
    return <Badge variant="outline" className="text-gray-400">Past</Badge>
  }
  return <Badge variant="outline" className="border-green-200 text-green-700">Upcoming</Badge>
}
