'use client'

import { useState, useEffect } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DatePickerProps {
  selectedDate: string | null
  onSelectDate: (date: string) => void
  availableDates: string[]
  onMonthChange: (year: number, month: number) => void
}

export function DatePicker({
  selectedDate,
  onSelectDate,
  availableDates,
  onMonthChange,
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth() + 1
    onMonthChange(year, month)
  }, [currentMonth, onMonthChange])

  const handlePrevMonth = () => {
    const prev = subMonths(currentMonth, 1)
    // Don't go before current month
    if (prev.getMonth() >= new Date().getMonth() || prev.getFullYear() > new Date().getFullYear()) {
      setCurrentMonth(prev)
    }
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const canGoPrev = () => {
    const prev = subMonths(currentMonth, 1)
    return prev >= startOfMonth(new Date())
  }

  // Generate calendar grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday start
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let day = calStart
  while (day <= calEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const availableSet = new Set(availableDates)

  return (
    <div>
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevMonth}
          disabled={!canGoPrev()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <Button variant="ghost" size="sm" onClick={handleNextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const dateStr = format(d, 'yyyy-MM-dd')
          const isCurrentMonth = isSameMonth(d, currentMonth)
          const isAvailable = availableSet.has(dateStr)
          const isSelected = selectedDate === dateStr

          return (
            <button
              key={i}
              type="button"
              disabled={!isCurrentMonth || !isAvailable}
              onClick={() => isAvailable && onSelectDate(dateStr)}
              className={`
                flex h-10 w-full items-center justify-center rounded-lg text-sm transition-colors
                ${!isCurrentMonth ? 'text-gray-300' : ''}
                ${isCurrentMonth && !isAvailable ? 'cursor-not-allowed text-gray-300' : ''}
                ${isCurrentMonth && isAvailable && !isSelected ? 'cursor-pointer font-medium text-gray-900 hover:bg-blue-50' : ''}
                ${isSelected ? 'bg-blue-600 font-semibold text-white' : ''}
              `}
            >
              {format(d, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
