'use client'

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

interface SuccessBannerProps {
  productName: string
}

export function SuccessBanner({ productName }: SuccessBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-green-900">Your Order is Confirmed!</h2>
          <p className="text-sm text-green-700">
            Thank you for purchasing <span className="font-medium">{productName}</span>. Check your
            email for access details.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
