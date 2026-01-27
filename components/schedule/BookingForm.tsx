'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { MeetingType, TimeSlot } from '@/types'

const bookingFormSchema = z.object({
  guestName: z.string().min(1, 'Name is required'),
  guestEmail: z.string().email('Valid email is required'),
  message: z.string().optional(),
  meetingType: z.string().min(1, 'Select a meeting type'),
})

type BookingFormData = z.infer<typeof bookingFormSchema>

interface BookingFormProps {
  selectedSlot: TimeSlot
  meetingTypes: MeetingType[]
  onSubmit: (data: BookingFormData) => Promise<void>
  submitting: boolean
}

export function BookingForm({
  meetingTypes,
  onSubmit,
  submitting,
}: BookingFormProps) {
  const enabledTypes = meetingTypes.filter((t) => t.enabled)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingFormData>({
    defaultValues: {
      meetingType: enabledTypes.length === 1 ? enabledTypes[0]!.id : '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="guestName">Name</Label>
        <Input
          id="guestName"
          placeholder="Your name"
          {...register('guestName', { required: 'Name is required' })}
        />
        {errors.guestName && (
          <p className="mt-1 text-sm text-red-500">{errors.guestName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="guestEmail">Email</Label>
        <Input
          id="guestEmail"
          type="email"
          placeholder="you@example.com"
          {...register('guestEmail', {
            required: 'Email is required',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
          })}
        />
        {errors.guestEmail && (
          <p className="mt-1 text-sm text-red-500">{errors.guestEmail.message}</p>
        )}
      </div>

      {enabledTypes.length > 1 && (
        <div>
          <Label>Meeting Type</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {enabledTypes.map((type) => (
              <label
                key={type.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm transition-colors hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50"
              >
                <input
                  type="radio"
                  value={type.id}
                  className="sr-only"
                  {...register('meetingType', { required: 'Select a meeting type' })}
                />
                {type.label}
              </label>
            ))}
          </div>
          {errors.meetingType && (
            <p className="mt-1 text-sm text-red-500">{errors.meetingType.message}</p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor="message">Message (optional)</Label>
        <Textarea
          id="message"
          placeholder="What would you like to discuss?"
          rows={3}
          {...register('message')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Booking...' : 'Confirm Booking'}
      </Button>
    </form>
  )
}
