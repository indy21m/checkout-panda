'use client'

import { motion } from 'framer-motion'
import {
  Palette,
  Zap,
  BarChart3,
  Globe,
  Lock,
  Sparkles,
  CreditCard,
  TrendingUp,
  Clock,
  Users,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function FeaturesSection() {
  const features = [
    {
      icon: Palette,
      title: 'Beautiful Design System',
      description:
        'Stunning pre-built templates and themes that convert. Customize every pixel to match your brand.',
      color: 'text-purple-600',
      badge: 'Design First',
      gradient: 'from-purple-500/10 to-pink-500/10',
    },
    {
      icon: Zap,
      title: 'Lightning Fast Builder',
      description:
        'Drag & drop checkout builder with real-time preview. Create high-converting pages in minutes.',
      color: 'text-emerald-600',
      badge: 'No Code',
      gradient: 'from-emerald-500/10 to-teal-500/10',
    },
    {
      icon: TrendingUp,
      title: 'Smart Upsells & Bumps',
      description:
        'Maximize revenue with intelligent order bumps and one-click upsells that actually convert.',
      color: 'text-blue-600',
      badge: 'Revenue+',
      gradient: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description:
        'Track every metric that matters. Conversion rates, revenue, and customer behavior in real-time.',
      color: 'text-orange-600',
      badge: 'Data Driven',
      gradient: 'from-orange-500/10 to-red-500/10',
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description:
        "PCI compliant with bank-level encryption. Your customers' data is always safe and secure.",
      color: 'text-green-600',
      badge: 'Secure',
      gradient: 'from-green-500/10 to-emerald-500/10',
    },
    {
      icon: Globe,
      title: 'Global Payments',
      description:
        'Accept payments from anywhere. Multi-currency support with automatic conversion.',
      color: 'text-indigo-600',
      badge: 'Worldwide',
      gradient: 'from-indigo-500/10 to-purple-500/10',
    },
  ]

  const stats = [
    {
      icon: Clock,
      value: '60s',
      label: 'Average setup time',
      color: 'text-emerald-600',
    },
    {
      icon: Users,
      value: '10k+',
      label: 'Active merchants',
      color: 'text-blue-600',
    },
    {
      icon: CreditCard,
      value: '$100M+',
      label: 'Processed annually',
      color: 'text-purple-600',
    },
    {
      icon: ShieldCheck,
      value: '99.9%',
      label: 'Uptime guarantee',
      color: 'text-orange-600',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
      },
    },
  }

  return (
    <section id="features" className="bg-background-secondary/30 relative py-20 lg:py-32">
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
            Features
          </Badge>
          <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
            Everything you need to <span className="gradient-text-emerald">maximize revenue</span>
          </h2>
          <p className="text-text-secondary text-lg md:text-xl">
            Powerful features designed for knowledge entrepreneurs. Beautiful checkouts that
            convert, backed by data that drives growth.
          </p>
        </motion.div>

        <motion.div
          className="mb-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card
                  className={cn(
                    'group border-border/50 relative overflow-hidden',
                    'hover:border-border transition-all duration-300 hover:shadow-xl'
                  )}
                >
                  <div
                    className={cn(
                      'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                      feature.gradient
                    )}
                  />
                  <CardContent className="relative p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div
                        className={cn(
                          'bg-background-secondary rounded-xl p-3',
                          'transition-transform duration-300 group-hover:scale-110'
                        )}
                      >
                        <Icon className={cn('h-6 w-6', feature.color)} />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-text-secondary leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Stats section */}
        <motion.div
          className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div
                  className={cn(
                    'mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full',
                    'bg-background-secondary'
                  )}
                >
                  <Icon className={cn('h-6 w-6', stat.color)} />
                </div>
                <h4 className="mb-1 text-2xl font-bold">{stat.value}</h4>
                <p className="text-text-secondary text-sm">{stat.label}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
