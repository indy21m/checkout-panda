'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Shield, CreditCard, Award } from 'lucide-react'

interface TrustBlockProps {
  data: {
    badges: Array<{
      id: string
      type: 'security' | 'payment' | 'guarantee' | 'certification' | 'custom'
      text: string
      icon?: string
      image?: string
    }>
    layout: 'horizontal' | 'grid'
    showIcons?: boolean
  }
  styles?: {
    padding?: string
    backgroundColor?: string
    className?: string
  }
}

const iconMap = {
  security: Shield,
  payment: CreditCard,
  guarantee: Shield,
  certification: Award,
  custom: Shield,
}

export function TrustBlock({ data, styles }: TrustBlockProps) {
  const badges = data.badges || []

  if (badges.length === 0) {
    return null
  }

  const layoutClasses = {
    horizontal: 'flex flex-wrap justify-center gap-8',
    grid: 'grid grid-cols-2 md:grid-cols-4 gap-6',
  }

  return (
    <section
      className={cn('bg-gray-50 px-6 py-8 dark:bg-gray-900', styles?.className)}
      style={{
        backgroundColor: styles?.backgroundColor,
        padding: styles?.padding,
      }}
    >
      <div className="container mx-auto">
        <div className={layoutClasses[data.layout]}>
          {badges.map((badge, index) => {
            const Icon = iconMap[badge.type] || Shield

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                {badge.image ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={badge.image} alt={badge.text} className="mb-2 h-12 object-contain" />
                  </>
                ) : data.showIcons !== false ? (
                  <Icon className="mb-2 h-8 w-8 text-gray-600 dark:text-gray-400" />
                ) : null}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {badge.text}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
