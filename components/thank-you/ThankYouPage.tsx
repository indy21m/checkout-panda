'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Mail, Users, BookOpen } from 'lucide-react'
import type { Product } from '@/types'

interface ThankYouPageProps {
  product: Product
  purchasedItems?: string[]
  paymentIntentId?: string
}

export function ThankYouPage({
  product,
  purchasedItems = ['main'],
  paymentIntentId: _paymentIntentId,
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
      <main className="mx-auto max-w-2xl px-4 py-16">
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

        {/* What You Purchased */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-10 rounded-xl border border-gray-100 bg-white p-6 shadow-lg"
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
            transition={{ delay: 0.4 }}
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
            transition={{ delay: 0.6 }}
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

        {/* Support Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-sm text-gray-500"
        >
          Questions? Check your email for support contact information.
        </motion.p>
      </main>
    </div>
  )
}
