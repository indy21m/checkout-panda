'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@clerk/nextjs'
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  ChevronRight,
  CreditCard,
  BarChart3,
  Globe,
  Rocket,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function HeroSection() {
  const { isSignedIn } = useAuth()
  const [animatedText, setAnimatedText] = useState(0)

  const features = [
    'conversion-focused checkouts',
    'beautiful payment pages',
    'powerful upsell funnels',
    'advanced analytics',
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedText((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [features.length])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const,
      },
    },
  }

  return (
    <section className="from-background via-background-secondary/20 to-background relative overflow-hidden bg-gradient-to-b pt-32 pb-16 lg:pt-40 lg:pb-24">
      {/* Background decorations */}
      <div className="bg-grid-black dark:bg-grid-white absolute inset-0" />
      <div className="bg-gradient-conic absolute top-0 right-0 h-[800px] w-[800px] translate-x-1/2 -translate-y-1/2 from-emerald-500/20 via-transparent to-transparent blur-3xl" />
      <div className="bg-gradient-conic absolute bottom-0 left-0 h-[800px] w-[800px] -translate-x-1/2 translate-y-1/2 from-teal-500/20 via-transparent to-transparent blur-3xl" />

      {/* Floating elements */}
      <motion.div
        className="absolute top-40 left-10 opacity-20"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <CreditCard className="h-24 w-24 text-emerald-500" />
      </motion.div>

      <motion.div
        className="absolute right-10 bottom-40 opacity-20"
        animate={{
          y: [0, 20, 0],
          rotate: [0, -10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <BarChart3 className="h-32 w-32 text-teal-500" />
      </motion.div>

      <div className="relative container mx-auto px-6">
        <motion.div
          className="mx-auto max-w-5xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <Badge
              variant="outline"
              className="mb-6 border-emerald-200 bg-emerald-50/50 px-4 py-2 text-sm backdrop-blur-sm dark:border-emerald-800 dark:bg-emerald-950/50"
            >
              <Sparkles className="mr-2 h-4 w-4 text-emerald-600" />
              Built for Knowledge Entrepreneurs
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="mb-6 text-center text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl"
            variants={itemVariants}
          >
            Transform payments into{' '}
            <span className="gradient-text-emerald">profitable experiences</span>
          </motion.h1>

          {/* Animated subtitle */}
          <motion.div
            className="text-text-secondary mb-8 h-8 text-center text-xl md:text-2xl"
            variants={itemVariants}
          >
            <span>Everything you need for </span>
            <span className="font-semibold text-emerald-600 transition-all duration-500 dark:text-emerald-400">
              {features[animatedText]}
            </span>
          </motion.div>

          {/* Description */}
          <motion.div className="mx-auto mb-12 max-w-5xl" variants={itemVariants}>
            <p className="text-text-secondary text-center text-lg leading-relaxed whitespace-normal md:text-xl">
              Checkout Panda is the elite checkout platform that turns your payment pages into
              high-converting sales machines. Beautiful design meets powerful conversion tools to
              maximize your revenue on every transaction.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
            variants={itemVariants}
          >
            {isSignedIn ? (
              <>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="group bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 text-base shadow-lg transition-all duration-200 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl"
                  >
                    <Rocket className="mr-2 h-5 w-5" />
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>

                <Link href="/checkouts/new">
                  <Button variant="outline" size="lg" className="border-2 px-8 py-6 text-base">
                    <Zap className="mr-2 h-5 w-5" />
                    Create New Checkout
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="group bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 text-base shadow-lg transition-all duration-200 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl"
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>

                <Link href="/demo">
                  <Button variant="outline" size="lg" className="border-2 px-8 py-6 text-base">
                    <CreditCard className="mr-2 h-5 w-5" />
                    View Live Demo
                  </Button>
                </Link>
              </>
            )}

            <Link href="/docs">
              <Button variant="ghost" size="lg" className="px-6 py-6 text-base">
                View Documentation
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="text-text-tertiary flex flex-wrap items-center justify-center gap-8 text-sm"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Global Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>Instant Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Real-time Analytics</span>
            </div>
          </motion.div>

          {/* Hero Image/Mockup */}
          <motion.div className="relative mt-20" variants={itemVariants}>
            <div className="from-background absolute inset-0 z-10 bg-gradient-to-t via-transparent to-transparent" />
            <div className="border-border relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-8 shadow-2xl">
              <div className="bg-background/50 flex aspect-video items-center justify-center rounded-lg backdrop-blur-sm">
                <div className="text-center">
                  <Sparkles className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
                  <p className="gradient-text-emerald text-2xl font-semibold">
                    Checkout Builder Preview
                  </p>
                  <p className="text-text-secondary mt-2">
                    Drag & drop your way to higher conversions
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
