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
  ShieldCheck
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function FeaturesSection() {
  const features = [
    {
      icon: Palette,
      title: 'Beautiful Design System',
      description: 'Stunning pre-built templates and themes that convert. Customize every pixel to match your brand.',
      color: 'text-purple-600',
      badge: 'Design First',
      gradient: 'from-purple-500/10 to-pink-500/10'
    },
    {
      icon: Zap,
      title: 'Lightning Fast Builder',
      description: 'Drag & drop checkout builder with real-time preview. Create high-converting pages in minutes.',
      color: 'text-emerald-600',
      badge: 'No Code',
      gradient: 'from-emerald-500/10 to-teal-500/10'
    },
    {
      icon: TrendingUp,
      title: 'Smart Upsells & Bumps',
      description: 'Maximize revenue with intelligent order bumps and one-click upsells that actually convert.',
      color: 'text-blue-600',
      badge: 'Revenue+',
      gradient: 'from-blue-500/10 to-cyan-500/10'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track every metric that matters. Conversion rates, revenue, and customer behavior in real-time.',
      color: 'text-orange-600',
      badge: 'Data Driven',
      gradient: 'from-orange-500/10 to-red-500/10'
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'PCI compliant with bank-level encryption. Your customers\' data is always safe and secure.',
      color: 'text-green-600',
      badge: 'Secure',
      gradient: 'from-green-500/10 to-emerald-500/10'
    },
    {
      icon: Globe,
      title: 'Global Payments',
      description: 'Accept payments from anywhere. Multi-currency support with automatic conversion.',
      color: 'text-indigo-600',
      badge: 'Worldwide',
      gradient: 'from-indigo-500/10 to-purple-500/10'
    }
  ]

  const stats = [
    {
      icon: Clock,
      value: '60s',
      label: 'Average setup time',
      color: 'text-emerald-600'
    },
    {
      icon: Users,
      value: '10k+',
      label: 'Active merchants',
      color: 'text-blue-600'
    },
    {
      icon: CreditCard,
      value: '$100M+',
      label: 'Processed annually',
      color: 'text-purple-600'
    },
    {
      icon: ShieldCheck,
      value: '99.9%',
      label: 'Uptime guarantee',
      color: 'text-orange-600'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <section id="features" className="py-20 lg:py-32 relative bg-background-secondary/30">
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
            Features
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Everything you need to{' '}
            <span className="gradient-text-emerald">maximize revenue</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary">
            Powerful features designed for knowledge entrepreneurs. 
            Beautiful checkouts that convert, backed by data that drives growth.
          </p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
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
                    "group relative overflow-hidden border-border/50",
                    "hover:border-border transition-all duration-300 hover:shadow-xl"
                  )}
                >
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    feature.gradient
                  )} />
                  <CardContent className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        "p-3 rounded-xl bg-background-secondary",
                        "group-hover:scale-110 transition-transform duration-300"
                      )}>
                        <Icon className={cn("w-6 h-6", feature.color)} />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Stats section */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
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
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={cn(
                  "inline-flex items-center justify-center w-12 h-12 rounded-full mb-3",
                  "bg-background-secondary"
                )}>
                  <Icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <h4 className="text-2xl font-bold mb-1">{stat.value}</h4>
                <p className="text-sm text-text-secondary">{stat.label}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}