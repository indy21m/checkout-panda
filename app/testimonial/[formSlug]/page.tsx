import { notFound } from 'next/navigation'
import { getTestimonialFormBySlug } from '@/lib/db/testimonials'
import { TestimonialForm } from '@/components/testimonials/TestimonialForm'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ formSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { formSlug } = await params
  const form = await getTestimonialFormBySlug(formSlug)

  if (!form) {
    return {
      title: 'Form Not Found',
    }
  }

  return {
    title: form.config?.heading ?? `Share Your Experience - ${form.name}`,
    description: form.config?.description ?? 'We would love to hear about your experience.',
  }
}

export default async function TestimonialCapturePage({ params }: PageProps) {
  const { formSlug } = await params
  const form = await getTestimonialFormBySlug(formSlug)

  if (!form) {
    notFound()
  }

  const heading = form.config?.heading ?? 'Share Your Experience'
  const description = form.config?.description

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4 py-12">
      <div
        className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        style={{ maxWidth: '32rem' }}
      >
        {/* Header */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
          {description && (
            <p className="mt-2 text-gray-600">{description}</p>
          )}
        </div>

        {/* Form */}
        <div className="p-6">
          <TestimonialForm
            formId={form.id}
            config={form.config ?? {}}
          />
        </div>
      </div>
    </div>
  )
}
