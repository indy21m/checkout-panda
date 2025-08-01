'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface ProductBlockProps {
  data: {
    productName: string
    productDescription?: string
    price: number
    currency: string
    image?: string
    features?: string[]
    badge?: string
    layout: 'side-by-side' | 'stacked' | 'centered'
  }
  styles?: {
    padding?: string
    backgroundColor?: string
    className?: string
  }
}

export function ProductBlock({ data, styles }: ProductBlockProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency || 'USD',
    }).format(price / 100)
  }

  const layoutClasses = {
    'side-by-side': 'flex flex-col md:flex-row items-center gap-8',
    stacked: 'flex flex-col items-center text-center',
    centered: 'max-w-2xl mx-auto text-center',
  }

  return (
    <section
      className={cn('px-6 py-12', styles?.className)}
      style={{
        backgroundColor: styles?.backgroundColor,
        padding: styles?.padding,
      }}
    >
      <div className={cn('container mx-auto', layoutClasses[data.layout])}>
        {/* Product Image */}
        {data.image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={cn('relative', data.layout === 'side-by-side' ? 'md:w-1/2' : 'mb-8')}
          >
            {data.badge && (
              <span className="bg-accent absolute -top-2 -right-2 rounded-full px-3 py-1 text-sm font-semibold text-white">
                {data.badge}
              </span>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.image} alt={data.productName} className="rounded-lg shadow-2xl" />
          </motion.div>
        )}

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={data.layout === 'side-by-side' ? 'md:w-1/2' : 'w-full'}
        >
          <h2 className="mb-4 text-3xl font-bold">{data.productName}</h2>

          {data.productDescription && (
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
              {data.productDescription}
            </p>
          )}

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold">{formatPrice(data.price)}</span>
          </div>

          {/* Features */}
          {data.features && data.features.length > 0 && (
            <ul className="space-y-3">
              {data.features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-gray-700 dark:text-gray-200">{feature}</span>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </section>
  )
}
