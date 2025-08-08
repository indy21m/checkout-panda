'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Check, 
  Sparkles, 
  Zap, 
  Building2,
  Star,
  ArrowRight,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for new entrepreneurs',
      monthlyPrice: 49,
      annualPrice: 39,
      icon: Sparkles,
      features: [
        'Up to 100 transactions/month',
        '3 checkout pages',
        'Basic templates',
        'Order bumps',
        'Email support',
        'Basic analytics',
        'Stripe integration',
        'Mobile responsive'
      ],
      notIncluded: [
        'A/B testing',
        'Advanced analytics',
        'Custom domains',
        'Priority support'
      ],
      cta: 'Start Free Trial',
      highlighted: false,
      badge: null
    },
    {
      name: 'Professional',
      description: 'For growing businesses',
      monthlyPrice: 149,
      annualPrice: 119,
      icon: Zap,
      features: [
        'Unlimited transactions',
        'Unlimited checkout pages',
        'Premium templates',
        'Order bumps & upsells',
        'Priority email support',
        'Advanced analytics',
        'A/B testing',
        'Custom domains',
        'Team collaboration',
        'API access',
        'Webhook integrations',
        'Remove branding'
      ],
      notIncluded: [],
      cta: 'Start Free Trial',
      highlighted: true,
      badge: 'Most Popular'
    },
    {
      name: 'Enterprise',
      description: 'For large organizations',
      monthlyPrice: null,
      annualPrice: null,
      customPrice: 'Custom',
      icon: Building2,
      features: [
        'Everything in Professional',
        'Unlimited team members',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        'Advanced security',
        'Custom contracts',
        'Phone support',
        'Training sessions',
        'White-label options',
        'Priority feature requests',
        'Dedicated infrastructure'
      ],
      notIncluded: [],
      cta: 'Contact Sales',
      highlighted: false,
      badge: null
    }
  ]

  const calculatePrice = (plan: typeof plans[0]) => {
    if (plan.customPrice) return plan.customPrice
    const price = isAnnual ? plan.annualPrice : plan.monthlyPrice
    return `$${price}`
  }

  const calculateSavings = (plan: typeof plans[0]) => {
    if (!plan.monthlyPrice || !plan.annualPrice) return null
    const monthlyCost = plan.monthlyPrice * 12
    const annualCost = plan.annualPrice * 12
    const savings = monthlyCost - annualCost
    const percentage = Math.round((savings / monthlyCost) * 100)
    return percentage
  }

  return (
    <section id="pricing" className="py-20 lg:py-32 relative">
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
            Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Simple pricing that{' '}
            <span className="gradient-text-blue">scales with you</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary mb-8">
            Start free, upgrade when you need. No hidden fees, 
            no surprises. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={cn(
              "text-sm font-medium transition-colors",
              !isAnnual ? "text-text" : "text-text-secondary"
            )}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-emerald-600"
            />
            <span className={cn(
              "text-sm font-medium transition-colors",
              isAnnual ? "text-text" : "text-text-secondary"
            )}>
              Annual
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="ml-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Save up to 20%
              </Badge>
            )}
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            const savings = calculateSavings(plan)
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card 
                  className={cn(
                    "relative h-full transition-all duration-300",
                    plan.highlighted 
                      ? "border-emerald-600 shadow-xl scale-105" 
                      : "border-border/50 hover:border-border hover:shadow-lg"
                  )}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-8">
                    <div className={cn(
                      "w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center",
                      plan.highlighted
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                        : "bg-background-secondary"
                    )}>
                      <Icon className={cn(
                        "w-7 h-7",
                        plan.highlighted ? "text-white" : "text-text"
                      )} />
                    </div>
                    
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <p className="text-text-secondary">{plan.description}</p>
                    
                    <div className="mt-6">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold">
                          {calculatePrice(plan)}
                        </span>
                        {!plan.customPrice && (
                          <span className="text-text-secondary">/month</span>
                        )}
                      </div>
                      {isAnnual && !plan.customPrice && (
                        <p className="text-sm text-emerald-600 mt-1">
                          {savings}% savings
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Features */}
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex gap-3">
                          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* CTA Button */}
                    <Link href={plan.customPrice ? "/contact" : "/sign-up"}>
                      <Button 
                        variant={plan.highlighted ? "primary" : "outline"}
                        className={cn(
                          "w-full group",
                          plan.highlighted && "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                        )}
                      >
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* FAQ or additional info */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-text-secondary mb-8">
            All plans include SSL certificates, PCI compliance, and 99.9% uptime guarantee
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}