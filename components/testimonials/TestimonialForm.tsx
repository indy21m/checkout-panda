'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/testimonials/StarRating'
import { CheckCircle2 } from 'lucide-react'
import type { TestimonialFormConfig } from '@/lib/db/schema'

interface TestimonialFormProps {
  formId: string
  config: TestimonialFormConfig
}

const createSchema = (_config: TestimonialFormConfig) =>
  z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please enter a valid email'),
    company: z.string().optional(),
    rating: z.number().min(1, 'Please select a rating').max(5),
    content: z.string().min(20, 'Please share at least 20 characters about your experience'),
  })

type FormData = z.infer<ReturnType<typeof createSchema>>

export function TestimonialForm({ formId, config }: TestimonialFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const schema = createSchema(config)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      rating: 0,
      content: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    setError(null)

    try {
      const res = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId,
          customerName: data.name,
          customerEmail: data.email,
          customerCompany: data.company || null,
          rating: data.rating,
          content: data.content,
        }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Something went wrong. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Thank you!</h2>
        <p className="text-gray-600">
          {config.thankYouMessage ?? 'Your testimonial has been submitted and is pending review.'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          placeholder="Your name"
          {...register('name')}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Company (optional) */}
      {config.collectCompany !== false && (
        <div>
          <Label htmlFor="company">Company (optional)</Label>
          <Input
            id="company"
            placeholder="Your company"
            {...register('company')}
          />
        </div>
      )}

      {/* Rating */}
      <div>
        <Label>Rating *</Label>
        <div className="mt-2">
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <StarRating
                value={field.value}
                onChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />
        </div>
        {errors.rating && (
          <p className="mt-1 text-sm text-red-500">{errors.rating.message}</p>
        )}
      </div>

      {/* Content */}
      <div>
        <Label htmlFor="content">Your Experience *</Label>
        <Textarea
          id="content"
          placeholder="Tell us about your experience..."
          rows={4}
          {...register('content')}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="gradient"
        size="lg"
        className="w-full"
        loading={isSubmitting}
      >
        Submit Testimonial
      </Button>
    </form>
  )
}
