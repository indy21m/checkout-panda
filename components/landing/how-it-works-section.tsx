'use client'

import { motion } from 'framer-motion'
import { 
  Rocket,
  Palette,
  TrendingUp,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Sparkles
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
      description: 'Sign up in seconds and get instant access to all features. No credit card required for trial.',
      icon: Rocket,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      features: [
        'Free 14-day trial',
        'No setup fees',
        'Cancel anytime'
      ]
    },
    {
      number: '02',
      title: 'Design Your Checkout',
      description: 'Use our drag & drop builder to create stunning checkout pages that match your brand.',
      icon: Palette,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      features: [
        'Pre-built templates',
        'Custom branding',
        'Mobile optimized'
      ]
    },
    {
      number: '03',
      title: 'Add Products & Upsells',
      description: 'Set up your products, pricing plans, and intelligent upsells to maximize revenue.',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      features: [
        'Flexible pricing',
        'Order bumps',
        'One-click upsells'
      ]
    },
    {
      number: '04',
      title: 'Launch & Scale',
      description: 'Go live instantly and watch your conversions soar with real-time analytics.',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      features: [
        'Real-time data',
        'A/B testing',
        'Growth insights'
      ]
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <section id="how-it-works" className="py-20 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center max-w-5xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            How It Works
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            From idea to launch in{' '}
            <span className="gradient-text-purple">4 simple steps</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary">
            Get your high-converting checkout pages live in minutes, not days. 
            Our intuitive platform guides you every step of the way.
          </p>
        </motion.div>

        <motion.div 
          className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto"
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
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative"
                >
                  {/* Connection line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-8 top-20 w-0.5 h-full bg-gradient-to-b from-border to-transparent" />
                  )}
                  
                  <div className="flex gap-4">
                    {/* Number circle */}
                    <div className="relative flex-shrink-0">
                      <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center",
                        "bg-background border-2 border-border shadow-sm"
                      )}>
                        <span className="text-xl font-bold gradient-text-emerald">
                          {step.number}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                        {step.title}
                        <Icon className={cn("w-5 h-5", step.color)} />
                      </h3>
                      <p className="text-text-secondary mb-4">
                        {step.description}
                      </p>
                      
                      {/* Features */}
                      <div className="flex flex-wrap gap-2">
                        {step.features.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="flex items-center gap-1 text-sm text-text-tertiary"
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
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
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
              <div className="aspect-square p-8 flex items-center justify-center">
                <div className="w-full h-full relative">
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
                      ease: "easeInOut"
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
                      ease: "easeInOut",
                      delay: 0.5
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
                      ease: "easeInOut",
                      delay: 1
                    }}
                  />
                  
                  {/* Center content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                      </motion.div>
                      <p className="text-lg font-semibold">Your Success</p>
                      <p className="text-sm text-text-secondary mt-1">
                        Starts Here
                      </p>
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
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 group"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <p className="text-sm text-text-tertiary mt-4">
                No credit card required • 14-day free trial
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}