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
  Rocket
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
    'advanced analytics'
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
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut' as const
      }
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background-secondary/20 to-background pt-32 pb-16 lg:pt-40 lg:pb-24">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-black dark:bg-grid-white" />
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-gradient-conic from-emerald-500/20 via-transparent to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-conic from-teal-500/20 via-transparent to-transparent blur-3xl" />
      
      {/* Floating elements */}
      <motion.div
        className="absolute top-40 left-10 opacity-20"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 10, 0]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <CreditCard className="w-24 h-24 text-emerald-500" />
      </motion.div>
      
      <motion.div
        className="absolute bottom-40 right-10 opacity-20"
        animate={{ 
          y: [0, 20, 0],
          rotate: [0, -10, 0]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <BarChart3 className="w-32 h-32 text-teal-500" />
      </motion.div>

      <div className="relative container mx-auto px-6">
        <motion.div 
          className="text-center max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <Badge 
              variant="outline" 
              className="mb-6 px-4 py-2 text-sm border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/50 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 mr-2 text-emerald-600" />
              Built for Knowledge Entrepreneurs
            </Badge>
          </motion.div>

          {/* Main heading */}
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
            variants={itemVariants}
          >
            Transform payments into{' '}
            <span className="gradient-text-emerald">
              profitable experiences
            </span>
          </motion.h1>

          {/* Animated subtitle */}
          <motion.div 
            className="text-xl md:text-2xl text-text-secondary mb-8 h-8"
            variants={itemVariants}
          >
            <span>Everything you need for </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold transition-all duration-500">
              {features[animatedText]}
            </span>
          </motion.div>

          {/* Description */}
          <motion.p 
            className="text-lg md:text-xl text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed text-left px-6 md:px-4"
            variants={itemVariants}
          >
            Checkout Panda is the elite checkout platform that turns your payment pages into 
            high-converting sales machines. Beautiful design meets powerful conversion tools 
            to maximize your revenue on every transaction.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            variants={itemVariants}
          >
            {isSignedIn ? (
              <>
                <Link href="/dashboard">
                  <Button 
                    size="lg" 
                    className="text-base px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                
                <Link href="/checkouts/new">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-base px-8 py-6 border-2"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Create New Checkout
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/sign-up">
                  <Button 
                    size="lg" 
                    className="text-base px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Start Free Trial
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                
                <Link href="/demo">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-base px-8 py-6 border-2"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    View Live Demo
                  </Button>
                </Link>
              </>
            )}

            <Link href="/docs">
              <Button 
                variant="ghost" 
                size="lg" 
                className="text-base px-6 py-6"
              >
                View Documentation
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-8 text-sm text-text-tertiary"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Global Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Instant Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Real-time Analytics</span>
            </div>
          </motion.div>

          {/* Hero Image/Mockup */}
          <motion.div 
            className="mt-20 relative"
            variants={itemVariants}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            <div className="relative rounded-xl overflow-hidden shadow-2xl border border-border bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-8">
              <div className="aspect-video bg-background/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <p className="text-2xl font-semibold gradient-text-emerald">
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