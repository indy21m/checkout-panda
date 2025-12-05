'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FAQItem } from '@/types'

interface FAQProps {
  items: FAQItem[]
  className?: string
}

export function FAQ({ items, className }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className={cn('rounded-xl bg-white p-6 shadow-md', className)}>
      <h3 className="mb-4 text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>

      <div className="divide-y divide-gray-100">
        {items.map((item, index) => (
          <div key={index} className="py-3">
            <button
              type="button"
              onClick={() => toggleItem(index)}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="font-medium text-gray-900">{item.question}</span>
              <ChevronDown
                className={cn(
                  'h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200',
                  openIndex === index && 'rotate-180'
                )}
              />
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="mt-2 text-sm text-gray-600">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}
