'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Zap, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'

export function CTASection() {
  const { isSignedIn } = useAuth()

  const benefits = [
    'No credit card required',
    '14-day free trial',
    'Cancel anytime',
    'Full feature access',
  ]

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />

      {/* Animated background elements */}
      <motion.div
        className="absolute top-10 left-10 opacity-10"
        animate={{
          y: [0, -30, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <Sparkles className="h-32 w-32 text-emerald-500" />
      </motion.div>

      <motion.div
        className="absolute right-10 bottom-10 opacity-10"
        animate={{
          y: [0, 30, 0],
          rotate: [360, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <Zap className="h-40 w-40 text-teal-500" />
      </motion.div>

      <div className="relative container mx-auto px-6">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Heading */}
          <motion.h2
            className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Ready to transform your{' '}
            <span className="gradient-text-emerald">checkout experience</span>?
          </motion.h2>

          <motion.p
            className="text-text-secondary mx-auto mb-12 max-w-5xl text-center text-xl leading-relaxed whitespace-normal md:text-2xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Join thousands of entrepreneurs who are already converting more customers with
            beautiful, high-performing checkout pages.
          </motion.p>

          {/* Benefits */}
          <motion.div
            className="mb-12 flex flex-wrap justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <span className="text-text-secondary">{benefit}</span>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {isSignedIn ? (
              <>
                <Link href="/checkouts/new">
                  <Button
                    size="lg"
                    className="group bg-gradient-to-r from-emerald-600 to-teal-600 px-10 py-7 text-lg shadow-lg transition-all duration-200 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Create Your First Checkout
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>

                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="border-2 px-10 py-7 text-lg">
                    Go to Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="group bg-gradient-to-r from-emerald-600 to-teal-600 px-10 py-7 text-lg shadow-lg transition-all duration-200 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>

                <Link href="/demo">
                  <Button variant="outline" size="lg" className="border-2 px-10 py-7 text-lg">
                    Watch Demo
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Trust text */}
          <motion.p
            className="text-text-tertiary mt-8 text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Trusted by over 10,000+ entrepreneurs • Average 47% conversion rate increase
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
