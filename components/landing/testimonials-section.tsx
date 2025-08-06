'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star,
  ChevronLeft,
  ChevronRight,
  Quote,
  Sparkles
} from 'lucide-react'
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
      content: 'Checkout Panda transformed our conversion rates overnight. The builder is intuitive, and the upsell features alone paid for the subscription 10x over. Best investment we made this year.',
      rating: 5,
      metric: '312% ROI',
      metricLabel: 'in first month'
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      role: 'CEO, InfoProduct Empire',
      avatar: 'MR',
      content: 'Finally, a checkout platform that understands online courses! The analytics are incredible, and the support team actually knows what they\'re talking about. Highly recommend.',
      rating: 5,
      metric: '47% increase',
      metricLabel: 'in conversions'
    },
    {
      id: 3,
      name: 'Emily Watson',
      role: 'Creator, Mindful Marketing',
      avatar: 'EW',
      content: 'I\'ve tried every checkout solution out there. Checkout Panda is miles ahead. The design options are beautiful, and my customers love the smooth payment experience.',
      rating: 5,
      metric: '$127k',
      metricLabel: 'monthly revenue'
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Founder, Tech Tutorials Pro',
      avatar: 'DK',
      content: 'The order bumps feature alone doubled my average order value. Plus, the real-time analytics help me make data-driven decisions. Game changer for my business.',
      rating: 5,
      metric: '2.3x AOV',
      metricLabel: 'with order bumps'
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      role: 'Coach, Executive Excellence',
      avatar: 'LT',
      content: 'Setting up was a breeze, and the templates are gorgeous. My high-ticket coaching programs finally have a checkout experience that matches their value.',
      rating: 5,
      metric: '89% close rate',
      metricLabel: 'on high-ticket'
    }
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
    <section id="testimonials" className="py-20 lg:py-32 relative bg-background-secondary/30">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Testimonials
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Loved by{' '}
            <span className="gradient-text-purple">knowledge entrepreneurs</span>
          </h2>
          <p className="text-lg md:text-xl text-text-secondary">
            Join thousands of creators who are scaling their business 
            with beautiful, high-converting checkout pages.
          </p>
        </motion.div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Navigation Buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 z-10 hidden md:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 z-10 hidden md:flex"
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
                    <Quote className="w-10 h-10 text-emerald-500/20 mb-6" />
                    
                    {/* Stars */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                        <Star 
                          key={i} 
                          className="w-5 h-5 fill-yellow-500 text-yellow-500" 
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-lg md:text-xl mb-8 leading-relaxed">
                      "{testimonials[currentIndex].content}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center",
                          "bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-semibold"
                        )}>
                          {testimonials[currentIndex].avatar}
                        </div>
                        <div>
                          <p className="font-semibold">{testimonials[currentIndex].name}</p>
                          <p className="text-sm text-text-secondary">
                            {testimonials[currentIndex].role}
                          </p>
                        </div>
                      </div>

                      {/* Metric */}
                      <div className="text-right">
                        <p className="text-2xl font-bold gradient-text-emerald">
                          {testimonials[currentIndex].metric}
                        </p>
                        <p className="text-sm text-text-secondary">
                          {testimonials[currentIndex].metricLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Mobile Navigation */}
            <div className="flex items-center justify-center gap-2 mt-6 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevTestimonial}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm text-text-secondary px-4">
                {currentIndex + 1} / {testimonials.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextTestimonial}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentIndex
                      ? "w-8 bg-emerald-600"
                      : "bg-border hover:bg-border/70"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Social Proof Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {[
            { value: '4.9/5', label: 'Average Rating' },
            { value: '10,000+', label: 'Happy Customers' },
            { value: '98%', label: 'Would Recommend' },
            { value: '24/7', label: 'Support Available' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-text-secondary">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}