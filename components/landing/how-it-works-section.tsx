'use client'

import { motion } from 'framer-motion'
import {
  Rocket,
  Palette,
  TrendingUp,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Create Your Account',
      description:
        'Sign up in seconds and get instant access to all features. No credit card required for trial.',
      icon: Rocket,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      features: ['Free 14-day trial', 'No setup fees', 'Cancel anytime'],
    },
    {
      number: '02',
      title: 'Design Your Checkout',
      description:
        'Use our drag & drop builder to create stunning checkout pages that match your brand.',
      icon: Palette,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      features: ['Pre-built templates', 'Custom branding', 'Mobile optimized'],
    },
    {
      number: '03',
      title: 'Add Products & Upsells',
      description:
        'Set up your products, pricing plans, and intelligent upsells to maximize revenue.',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      features: ['Flexible pricing', 'Order bumps', 'One-click upsells'],
    },
    {
      number: '04',
      title: 'Launch & Scale',
      description: 'Go live instantly and watch your conversions soar with real-time analytics.',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      features: ['Real-time data', 'A/B testing', 'Growth insights'],
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <section id="how-it-works" className="relative overflow-hidden py-20 lg:py-32">
      <div className="container mx-auto px-6">
        <motion.div
          className="mx-auto mb-16 max-w-5xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-4">
            <Sparkles className="mr-1 h-3 w-3" />
            How It Works
          </Badge>
          <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
            From idea to launch in <span className="gradient-text-purple">4 simple steps</span>
          </h2>
          <p className="text-text-secondary text-lg md:text-xl">
            Get your high-converting checkout pages live in minutes, not days. Our intuitive
            platform guides you every step of the way.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div key={index} variants={itemVariants} className="relative">
                  {/* Connection line */}
                  {index < steps.length - 1 && (
                    <div className="from-border absolute top-20 left-8 h-full w-0.5 bg-gradient-to-b to-transparent" />
                  )}

                  <div className="flex gap-4">
                    {/* Number circle */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={cn(
                          'flex h-16 w-16 items-center justify-center rounded-full',
                          'bg-background border-border border-2 shadow-sm'
                        )}
                      >
                        <span className="gradient-text-emerald text-xl font-bold">
                          {step.number}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="mb-2 flex items-center gap-2 text-xl font-semibold">
                        {step.title}
                        <Icon className={cn('h-5 w-5', step.color)} />
                      </h3>
                      <p className="text-text-secondary mb-4">{step.description}</p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2">
                        {step.features.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="text-text-tertiary flex items-center gap-1 text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Visual representation */}
          <motion.div
            className="relative lg:sticky lg:top-32"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="border-border relative overflow-hidden rounded-2xl border bg-gradient-to-br from-emerald-500/5 to-teal-500/5 shadow-2xl">
              <div className="flex aspect-square items-center justify-center p-8">
                <div className="relative h-full w-full">
                  {/* Animated circles */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-emerald-500/20"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.2, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className="absolute inset-4 rounded-full border-4 border-teal-500/20"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.2, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.5,
                    }}
                  />
                  <motion.div
                    className="absolute inset-8 rounded-full border-4 border-purple-500/20"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.2, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1,
                    }}
                  />

                  {/* Center content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="mx-auto mb-4 h-16 w-16 text-emerald-500" />
                      </motion.div>
                      <p className="text-lg font-semibold">Your Success</p>
                      <p className="text-text-secondary mt-1 text-sm">Starts Here</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <p className="text-text-tertiary mt-4 text-sm">
                No credit card required • 14-day free trial
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
