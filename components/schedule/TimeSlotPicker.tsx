'use client'

import { format } from 'date-fns'
import type { TimeSlot } from '@/types'

interface TimeSlotPickerProps {
  slots: TimeSlot[]
  selectedSlot: TimeSlot | null
  onSelectSlot: (slot: TimeSlot) => void
  loading: boolean
}

export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelectSlot,
  loading,
}: TimeSlotPickerProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        No available slots for this date.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {slots.map((slot) => {
        const isSelected = selectedSlot?.start === slot.start
        const startTime = format(new Date(slot.start), 'h:mm a')

        return (
          <button
            key={slot.start}
            type="button"
            onClick={() => onSelectSlot(slot)}
            className={`
              rounded-lg border px-4 py-3 text-sm font-medium transition-colors
              ${isSelected
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
              }
            `}
          >
            {startTime}
          </button>
        )
      })}
    </div>
  )
}
