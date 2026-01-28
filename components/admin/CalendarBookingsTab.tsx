'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isPast } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CancelBookingDialog } from '@/components/admin/CancelBookingDialog'
import { MessageBookerDialog } from '@/components/admin/MessageBookerDialog'
import {
  Ban,
  Mail,
  RefreshCw,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Video,
  CalendarX,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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
      toast.success('Bookings refreshed')
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

  const upcomingCount = bookings.filter(
    (b) => b.status === 'confirmed' && !isPast(new Date(b.startTime))
  ).length

  const filters: { value: StatusFilter; label: string; count?: number }[] = [
    { value: 'all', label: 'All', count: bookings.length },
    { value: 'confirmed', label: 'Upcoming', count: upcomingCount },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with filters */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                filter === f.value
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              {f.label}
              {f.count !== undefined && f.count > 0 && (
                <span
                  className={cn(
                    'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                    filter === f.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={refreshBookings}
          disabled={refreshing}
          className="gap-1.5 border-gray-300 shadow-sm"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Bookings list */}
      {sorted.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-16 text-center"
        >
          <CalendarX className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-sm font-medium text-gray-500">No bookings found</p>
          <p className="mt-1 text-xs text-gray-400">
            {filter === 'all'
              ? 'Bookings will appear here once someone schedules a meeting.'
              : `No ${filter} bookings to show.`}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {sorted.map((booking, index) => {
              const start = new Date(booking.startTime)
              const end = new Date(booking.endTime)
              const past = isPast(start)

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className={cn(
                    'group rounded-xl border-2 p-4 transition-all',
                    booking.status === 'cancelled'
                      ? 'border-gray-200 bg-gray-50/50'
                      : past
                        ? 'border-gray-200 bg-gray-50/50'
                        : 'border-emerald-200 bg-gradient-to-r from-emerald-50/30 to-transparent hover:border-emerald-300 hover:shadow-md'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {/* Guest info */}
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                            booking.status === 'cancelled' || past
                              ? 'bg-gray-200 text-gray-500'
                              : 'bg-emerald-100 text-emerald-700'
                          )}
                        >
                          {booking.guestName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-900">
                            {booking.guestName}
                          </span>
                          <StatusBadge status={booking.status} past={past} />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                        <User className="h-3 w-3" />
                        {booking.guestEmail}
                      </div>

                      {/* Date and time */}
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          {format(start, 'EEE, MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {format(start, 'h:mm a')} - {format(end, 'h:mm a')}
                        </div>
                      </div>

                      {/* Meeting type */}
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                        <Video className="h-3 w-3" />
                        <span className="capitalize">{booking.meetingType.replace(/-/g, ' ')}</span>
                      </div>

                      {/* Message */}
                      {booking.message && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg bg-gray-100/80 p-2.5">
                          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <p className="text-xs leading-relaxed text-gray-600">{booking.message}</p>
                        </div>
                      )}

                      {/* Cancellation reason */}
                      {booking.cancellationReason && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 p-2.5">
                          <Ban className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                          <p className="text-xs leading-relaxed text-red-600">
                            <span className="font-medium">Cancelled:</span>{' '}
                            {booking.cancellationReason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {booking.status === 'confirmed' && (
                      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setMessageTarget({
                              id: booking.id,
                              guestName: booking.guestName,
                              guestEmail: booking.guestEmail,
                            })
                          }
                          className="h-8 w-8 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600"
                          title="Send message"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setCancelTarget({
                              id: booking.id,
                              guestName: booking.guestName,
                            })
                          }
                          className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Cancel booking"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
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
    </motion.div>
  )
}

function StatusBadge({ status, past }: { status: 'confirmed' | 'cancelled'; past: boolean }) {
  if (status === 'cancelled') {
    return (
      <Badge
        variant="outline"
        className="ml-2 border-gray-300 bg-gray-100 text-xs text-gray-500"
      >
        Cancelled
      </Badge>
    )
  }
  if (past) {
    return (
      <Badge variant="outline" className="ml-2 border-gray-300 bg-gray-100 text-xs text-gray-500">
        Past
      </Badge>
    )
  }
  return (
    <Badge
      variant="outline"
      className="ml-2 border-emerald-300 bg-emerald-50 text-xs text-emerald-700"
    >
      Upcoming
    </Badge>
  )
}
