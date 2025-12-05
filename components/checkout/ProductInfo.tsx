'use client'

import { Check } from 'lucide-react'
import { Testimonial } from './Testimonial'
import type { Product } from '@/types'

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { checkout } = product

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{checkout.title}</h1>
        {checkout.subtitle && <p className="mt-2 text-lg text-gray-600">{checkout.subtitle}</p>}
      </div>

      {/* Benefits */}
      {checkout.benefits.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-md">
          <h3 className="mb-4 font-semibold text-gray-900">What&apos;s Included:</h3>
          <ul className="space-y-3">
            {checkout.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Testimonial */}
      {checkout.testimonial && (
        <Testimonial
          quote={checkout.testimonial.quote}
          author={checkout.testimonial.author}
          role={checkout.testimonial.role}
          avatar={checkout.testimonial.avatar}
        />
      )}
    </div>
  )
}
