'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Founder, Digital Academy',
      avatar: 'SC',
      content:
        'Checkout Panda transformed our conversion rates overnight. The builder is intuitive, and the upsell features alone paid for the subscription 10x over. Best investment we made this year.',
      rating: 5,
      metric: '312% ROI',
      metricLabel: 'in first month',
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      role: 'CEO, InfoProduct Empire',
      avatar: 'MR',
      content:
        "Finally, a checkout platform that understands online courses! The analytics are incredible, and the support team actually knows what they're talking about. Highly recommend.",
      rating: 5,
      metric: '47% increase',
      metricLabel: 'in conversions',
    },
    {
      id: 3,
      name: 'Emily Watson',
      role: 'Creator, Mindful Marketing',
      avatar: 'EW',
      content:
        "I've tried every checkout solution out there. Checkout Panda is miles ahead. The design options are beautiful, and my customers love the smooth payment experience.",
      rating: 5,
      metric: '$127k',
      metricLabel: 'monthly revenue',
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Founder, Tech Tutorials Pro',
      avatar: 'DK',
      content:
        'The order bumps feature alone doubled my average order value. Plus, the real-time analytics help me make data-driven decisions. Game changer for my business.',
      rating: 5,
      metric: '2.3x AOV',
      metricLabel: 'with order bumps',
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      role: 'Coach, Executive Excellence',
      avatar: 'LT',
      content:
        'Setting up was a breeze, and the templates are gorgeous. My high-ticket coaching programs finally have a checkout experience that matches their value.',
      rating: 5,
      metric: '89% close rate',
      metricLabel: 'on high-ticket',
    },
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <section id="testimonials" className="bg-background-secondary/30 relative py-20 lg:py-32">
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
            Testimonials
          </Badge>
          <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
            Loved by <span className="gradient-text-purple">knowledge entrepreneurs</span>
          </h2>
          <p className="text-text-secondary text-lg md:text-xl">
            Join thousands of creators who are scaling their business with beautiful,
            high-converting checkout pages.
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            {/* Navigation Buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={prevTestimonial}
              className="absolute top-1/2 left-0 z-10 hidden -translate-x-12 -translate-y-1/2 md:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextTestimonial}
              className="absolute top-1/2 right-0 z-10 hidden translate-x-12 -translate-y-1/2 md:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Testimonial Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-border/50 shadow-xl">
                  <div className="p-8 md:p-12">
                    {/* Quote Icon */}
                    <Quote className="mb-6 h-10 w-10 text-emerald-500/20" />

                    {/* Stars */}
                    <div className="mb-6 flex gap-1">
                      {[...Array(testimonials[currentIndex]?.rating ?? 0)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="mb-8 text-lg leading-relaxed md:text-xl">
                      &ldquo;{testimonials[currentIndex]?.content}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'flex h-12 w-12 items-center justify-center rounded-full',
                            'bg-gradient-to-br from-emerald-500 to-teal-500 font-semibold text-white'
                          )}
                        >
                          {testimonials[currentIndex]?.avatar}
                        </div>
                        <div>
                          <p className="font-semibold">{testimonials[currentIndex]?.name}</p>
                          <p className="text-text-secondary text-sm">
                            {testimonials[currentIndex]?.role}
                          </p>
                        </div>
                      </div>

                      {/* Metric */}
                      <div className="text-right">
                        <p className="gradient-text-emerald text-2xl font-bold">
                          {testimonials[currentIndex]?.metric}
                        </p>
                        <p className="text-text-secondary text-sm">
                          {testimonials[currentIndex]?.metricLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Mobile Navigation */}
            <div className="mt-6 flex items-center justify-center gap-2 md:hidden">
              <Button variant="ghost" size="icon" onClick={prevTestimonial}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-text-secondary px-4 text-sm">
                {currentIndex + 1} / {testimonials.length}
              </span>
              <Button variant="ghost" size="icon" onClick={nextTestimonial}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Dots Indicator */}
            <div className="mt-8 flex justify-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all duration-300',
                    index === currentIndex ? 'w-8 bg-emerald-600' : 'bg-border hover:bg-border/70'
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Social Proof Stats */}
        <motion.div
          className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {[
            { value: '4.9/5', label: 'Average Rating' },
            { value: '10,000+', label: 'Happy Customers' },
            { value: '98%', label: 'Would Recommend' },
            { value: '24/7', label: 'Support Available' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="mb-1 text-2xl font-bold">{stat.value}</p>
              <p className="text-text-secondary text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
