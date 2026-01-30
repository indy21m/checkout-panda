'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Mail, Users, BookOpen, MessageSquarePlus } from 'lucide-react'
import { TestimonialCarousel } from '@/components/testimonials'
import type { Product } from '@/types'
import type { TestimonialRecord } from '@/lib/db/schema'

interface ThankYouPageProps {
  product: Product
  purchasedItems?: string[]
  paymentIntentId?: string
  testimonials?: TestimonialRecord[]
  testimonialFormSlug?: string
}

export function ThankYouPage({
  product,
  purchasedItems = ['main'],
  paymentIntentId: _paymentIntentId,
  testimonials = [],
  testimonialFormSlug,
}: ThankYouPageProps) {
  const { thankYou } = product

  // Fire confetti on mount
  useEffect(() => {
    const duration = 2000
    const end = Date.now() + duration

    const colors = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b']

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [])

  // Get step icon
  const getStepIcon = (index: number) => {
    const icons = [Mail, Users, BookOpen]
    const Icon = icons[index % icons.length] || Mail
    return Icon
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <main className="mx-auto px-4 py-16" style={{ maxWidth: '42rem', width: '100%' }}>
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">{thankYou.headline}</h1>
          {thankYou.subheadline && (
            <p className="mt-3 text-lg text-gray-600">{thankYou.subheadline}</p>
          )}
        </motion.div>

        {/* Email Notice - Prominent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8 rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Check Your Email</h3>
              <p className="mt-1 text-sm text-blue-700">
                We&apos;ve sent your receipt and access instructions to your email. If you
                don&apos;t see it, check your spam folder.
              </p>
            </div>
          </div>
        </motion.div>

        {/* What You Purchased */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-xl border border-gray-100 bg-white p-6 shadow-lg"
        >
          <h2 className="mb-4 font-semibold text-gray-900">Your Purchase:</h2>
          <ul className="space-y-2">
            {purchasedItems.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {item === 'main' && product.name}
                {item === 'bump' && product.orderBump?.title}
                {item.startsWith('upsell') &&
                  product.upsells?.find((u) => u.id === item || u.slug === item)?.title}
                {item === 'downsell' && product.downsell?.title}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Next Steps */}
        {thankYou.steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-8"
          >
            <h2 className="mb-4 text-center font-semibold text-gray-900">What&apos;s Next:</h2>
            <div className="space-y-4">
              {thankYou.steps.map((step, index) => {
                const Icon = getStepIcon(index)
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {index + 1}. {step.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* CTA Button */}
        {thankYou.ctaButton && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="mt-10 text-center"
          >
            <Link
              href={thankYou.ctaButton.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700"
            >
              {thankYou.ctaButton.text}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        )}

        {/* Testimonials Section */}
        {testimonials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-10"
          >
            <h2 className="mb-4 text-center font-semibold text-gray-900">
              What Others Are Saying
            </h2>
            <TestimonialCarousel testimonials={testimonials} />
          </motion.div>
        )}

        {/* Share Your Experience CTA */}
        {testimonialFormSlug && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
            className="mt-8 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-5 text-center"
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <MessageSquarePlus className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-purple-900">Share Your Experience</h3>
            <p className="mt-1 text-sm text-purple-700">
              Loved {product.name}? Help others by sharing your story!
            </p>
            <Link
              href={`/testimonials/${testimonialFormSlug}`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-700"
            >
              Write a Testimonial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        )}

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-12 rounded-lg border border-gray-100 bg-gray-50 p-4 text-center"
        >
          <h4 className="text-sm font-medium text-gray-700">Need Help?</h4>
          <p className="mt-1 text-sm text-gray-500">
            Check your email for support contact information, or reply to your receipt email.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
