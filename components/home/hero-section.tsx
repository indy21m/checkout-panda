'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import { GradientText } from '@/components/ui/gradient-text'
import { ArrowRight, Sparkles, Zap, Shield, BarChart3 } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
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
      ease: 'easeOut'
    }
  }
}

const features = [
  {
    icon: Sparkles,
    title: 'Beautiful Checkouts',
    description: 'Convert more with stunning, conversion-optimized checkout pages',
    gradient: 'from-blue-400 to-blue-600'
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Built on edge infrastructure for instant global performance',
    gradient: 'from-purple-400 to-purple-600'
  },
  {
    icon: Shield,
    title: 'Secure Payments',
    description: 'PCI-compliant with Stripe integration for safe transactions',
    gradient: 'from-green-400 to-green-600'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track conversions and optimize with detailed insights',
    gradient: 'from-pink-400 to-pink-600'
  }
]

export function HeroSection() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary/30 to-background" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex min-h-[85vh] flex-col items-center justify-center text-center"
        >
          {/* Logo and Title */}
          <motion.div variants={itemVariants} className="mb-8">
            <motion.img 
              src="/logo.png" 
              alt="Checkout Panda" 
              className="mx-auto mb-6 h-20 w-20 object-contain md:h-24 md:w-24"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1 
              }}
            />
            <h1 className="mb-4 text-5xl font-bold md:text-7xl">
              <GradientText gradient="primary">Checkout Panda</GradientText>
            </h1>
            <p className="text-xl text-text-secondary md:text-2xl max-w-3xl mx-auto">
              The elite checkout platform that transforms payment transactions into 
              <span className="text-primary font-semibold"> visually stunning</span>, 
              highly profitable customer journeys
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/sign-up">
              <Button variant="primary" size="lg" className="group">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="glass" size="lg">
                View Live Demo
              </Button>
            </Link>
          </motion.div>

          {/* Feature Cards */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <GlassmorphicCard className="p-6 h-full text-left group" hover>
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-secondary">{feature.description}</p>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Badge */}
          <motion.div variants={itemVariants} className="mt-16">
            <p className="text-sm text-text-tertiary">
              Trusted by over <span className="font-semibold text-text-secondary">1,000+ entrepreneurs</span> to power their checkout experience
            </p>
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}