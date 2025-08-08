'use client'

import { motion } from 'framer-motion'
import { 
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'

export function CTASection() {
  const { isSignedIn } = useAuth()

  const benefits = [
    'No credit card required',
    '14-day free trial',
    'Cancel anytime',
    'Full feature access'
  ]

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
      
      {/* Animated background elements */}
      <motion.div
        className="absolute top-10 left-10 opacity-10"
        animate={{ 
          y: [0, -30, 0],
          rotate: [0, 360]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Sparkles className="w-32 h-32 text-emerald-500" />
      </motion.div>
      
      <motion.div
        className="absolute bottom-10 right-10 opacity-10"
        animate={{ 
          y: [0, 30, 0],
          rotate: [360, 0]
        }}
        transition={{ 
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Zap className="w-40 h-40 text-teal-500" />
      </motion.div>

      <div className="relative container mx-auto px-6">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Heading */}
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Ready to transform your{' '}
            <span className="gradient-text-emerald">checkout experience</span>?
          </motion.h2>
          
          <motion.p 
            className="text-xl md:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto text-center leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Join thousands of entrepreneurs who are already converting more customers 
            with beautiful, high-performing checkout pages.
          </motion.p>

          {/* Benefits */}
          <motion.div 
            className="flex flex-wrap justify-center gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-text-secondary">{benefit}</span>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {isSignedIn ? (
              <>
                <Link href="/checkouts/new">
                  <Button 
                    size="lg" 
                    className="text-lg px-10 py-7 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Create Your First Checkout
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                
                <Link href="/dashboard">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-10 py-7 border-2"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/sign-up">
                  <Button 
                    size="lg" 
                    className="text-lg px-10 py-7 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-200 group"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Start Your Free Trial
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                
                <Link href="/demo">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-10 py-7 border-2"
                  >
                    Watch Demo
                  </Button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Trust text */}
          <motion.p 
            className="text-sm text-text-tertiary mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Trusted by over 10,000+ entrepreneurs • Average 47% conversion rate increase
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}