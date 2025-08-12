'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  Check, Shield, Star, ChevronDown, ChevronUp,
  CreditCard, Lock, ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { 
  Block, 
  HeaderBlockData, 
  ProductBlockData,
  BenefitsBlockData,
  OrderBumpBlockData,
  TestimonialBlockData,
  GuaranteeBlockData,
  FAQBlockData,
  CountdownBlockData,
  PaymentBlockData
} from '@/components/builder/checkout-blocks'

interface SimplifiedCheckoutRendererProps {
  checkout: {
    id: string
    name: string
    slug: string
    pageData: {
      blocks: Block[]
      settings?: Record<string, unknown>
    }
  }
}

export function SimplifiedCheckoutRenderer({ checkout }: SimplifiedCheckoutRendererProps) {
  const blocks = checkout.pageData.blocks || []
  const visibleBlocks = blocks.filter(block => block.visible !== false)
  
  // Separate blocks by column
  const leftBlocks = visibleBlocks.filter(b => b.column === 'left' || !b.column)
  const rightBlocks = visibleBlocks.filter(b => b.column === 'right')
  
  const hasRightColumn = rightBlocks.length > 0
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className={cn(
          "grid gap-8",
          hasRightColumn ? "md:grid-cols-[1fr_400px]" : "md:grid-cols-1 max-w-3xl mx-auto"
        )}>
          {/* Main Column */}
          <div className="space-y-6">
            {leftBlocks.map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))}
          </div>
          
          {/* Right Column */}
          {hasRightColumn && (
            <div className="space-y-6">
              {rightBlocks.map((block) => (
                <BlockRenderer key={block.id} block={block} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BlockRenderer({ block }: { block: Block }) {
  const applyStyles = (defaultClasses: string) => {
    return cn(
      defaultClasses
    )
  }
  
  const getBlockStyles = (): React.CSSProperties => {
    const styles = block.styles || {}
    return {
      padding: styles.padding,
      margin: styles.margin,
      background: styles.backgroundType === 'gradient' ? styles.background : styles.background,
      borderRadius: styles.borderRadius,
      borderColor: styles.borderColor,
      borderWidth: styles.borderWidth,
      borderStyle: styles.borderWidth ? 'solid' : undefined,
      boxShadow: styles.shadow,
      color: styles.textColor,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight as React.CSSProperties['fontWeight'],
    }
  }
  
  switch (block.type) {
    case 'header':
      const headerData = block.data as HeaderBlockData
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={applyStyles("text-center py-8 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl")}
          style={getBlockStyles()}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {headerData.title}
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            {headerData.subtitle}
          </p>
        </motion.div>
      )
    
    case 'product':
      const productData = block.data as ProductBlockData
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={applyStyles("bg-white rounded-xl shadow-sm p-6")}
          style={getBlockStyles()}
        >
          {productData.badge && (
            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-4">
              {productData.badge}
            </span>
          )}
          <h2 className="text-2xl font-bold mb-2">{productData.name}</h2>
          <p className="text-gray-600 mb-4">{productData.description}</p>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-3xl font-bold text-blue-600">{productData.price}</span>
            {productData.comparePrice && (
              <span className="text-lg text-gray-400 line-through">{productData.comparePrice}</span>
            )}
            {productData.type === 'subscription' && <span className="text-gray-500">/month</span>}
          </div>
          <ul className="space-y-3">
            {productData.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )
    
    case 'benefits':
      const benefitsData = block.data as BenefitsBlockData
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={applyStyles("bg-gray-50 rounded-xl p-6")}
          style={getBlockStyles()}
        >
          <h3 className="text-xl font-bold mb-4">{benefitsData.title}</h3>
          <div className="space-y-4">
            {benefitsData.benefits.map((benefit, i) => (
              <div key={i} className="flex gap-4">
                <div className="text-2xl flex-shrink-0">{benefit.icon}</div>
                <div>
                  <h4 className="font-semibold mb-1">{benefit.title}</h4>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )
    
    case 'orderBump':
      return <OrderBumpBlock block={block} applyStyles={applyStyles} getBlockStyles={getBlockStyles} />
    
    case 'testimonial':
      const testimonialData = block.data as TestimonialBlockData
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={applyStyles("bg-white rounded-xl border border-gray-200 p-6")}
          style={getBlockStyles()}
        >
          {testimonialData.testimonials.map((testimonial, i) => (
            <div key={i}>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star 
                    key={j} 
                    className={cn(
                      "w-5 h-5",
                      j < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <p className="text-gray-700 italic mb-3">&ldquo;{testimonial.content}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  {testimonial.title && (
                    <p className="text-sm text-gray-500">{testimonial.title}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )
    
    case 'guarantee':
      const guaranteeData = block.data as GuaranteeBlockData
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className={applyStyles("bg-green-50 border border-green-200 rounded-xl p-6 text-center")}
          style={getBlockStyles()}
        >
          <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
          {guaranteeData.badge && (
            <span className="inline-block px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-full mb-3">
              {guaranteeData.badge}
            </span>
          )}
          <h3 className="text-xl font-bold mb-2">{guaranteeData.title}</h3>
          <p className="text-gray-700">{guaranteeData.description}</p>
        </motion.div>
      )
    
    case 'faq':
      return <FAQBlock block={block} applyStyles={applyStyles} getBlockStyles={getBlockStyles} />
    
    case 'countdown':
      return <CountdownBlock block={block} applyStyles={applyStyles} getBlockStyles={getBlockStyles} />
    
    case 'payment':
      return <PaymentBlock data={block.data as PaymentBlockData} getBlockStyles={getBlockStyles} />
    
    default:
      return null
  }
}

// Order Bump Block Component
function OrderBumpBlock({ 
  block, 
  applyStyles, 
  getBlockStyles 
}: { 
  block: Block
  applyStyles: (classes: string) => string
  getBlockStyles: () => React.CSSProperties
}) {
  const bumpData = block.data as OrderBumpBlockData
  const [isChecked, setIsChecked] = React.useState(bumpData.isCheckedByDefault || false)
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className={applyStyles("border-2 border-yellow-400 bg-yellow-50 rounded-xl p-4")}
      style={getBlockStyles()}
    >
      <div className="flex items-start gap-3">
        <input 
          type="checkbox" 
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
          className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 cursor-pointer"
        />
        <div className="flex-1">
          <h4 className="font-bold text-lg mb-1">{bumpData.title}</h4>
          <p className="text-gray-700 mb-2">{bumpData.description}</p>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-green-600">{bumpData.price}</span>
            {bumpData.comparePrice && (
              <span className="text-gray-400 line-through">{bumpData.comparePrice}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// FAQ Block Component
function FAQBlock({ 
  block, 
  applyStyles, 
  getBlockStyles 
}: { 
  block: Block
  applyStyles: (classes: string) => string
  getBlockStyles: () => React.CSSProperties
}) {
  const faqData = block.data as FAQBlockData
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className={applyStyles("bg-white rounded-xl p-6")}
      style={getBlockStyles()}
    >
      <h3 className="text-xl font-bold mb-4">{faqData.title}</h3>
      <div className="space-y-3">
        {faqData.faqs.map((faq, i) => (
          <div key={i} className="border-b border-gray-200 pb-3 last:border-0">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between text-left py-2"
            >
              <span className="font-medium">{faq.question}</span>
              {openIndex === i ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="text-gray-600 pt-2"
              >
                {faq.answer}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Countdown Block Component
function CountdownBlock({ 
  block, 
  applyStyles, 
  getBlockStyles 
}: { 
  block: Block
  applyStyles: (classes: string) => string
  getBlockStyles: () => React.CSSProperties
}) {
  const countdownData = block.data as CountdownBlockData
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  
  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const end = new Date(countdownData.endDate).getTime()
      const distance = end - now
      
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }, 1000)
    
    return () => clearInterval(timer)
  }, [countdownData.endDate])
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className={applyStyles("bg-red-50 border border-red-200 rounded-xl p-4 text-center")}
      style={getBlockStyles()}
    >
      <p className="font-semibold mb-3">{countdownData.title}</p>
      <div className="flex justify-center gap-3">
        {countdownData.showDays && (
          <div className="bg-white rounded-lg p-3">
            <div className="text-2xl font-bold">{String(timeLeft.days).padStart(2, '0')}</div>
            <div className="text-xs text-gray-500">Days</div>
          </div>
        )}
        {countdownData.showHours && (
          <div className="bg-white rounded-lg p-3">
            <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
            <div className="text-xs text-gray-500">Hours</div>
          </div>
        )}
        {countdownData.showMinutes && (
          <div className="bg-white rounded-lg p-3">
            <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
            <div className="text-xs text-gray-500">Mins</div>
          </div>
        )}
        {countdownData.showSeconds && (
          <div className="bg-white rounded-lg p-3">
            <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
            <div className="text-xs text-gray-500">Secs</div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Professional Payment Block Component
function PaymentBlock({ data, getBlockStyles }: { data: PaymentBlockData; getBlockStyles: () => React.CSSProperties }) {
  const [email, setEmail] = React.useState('')
  const [cardNumber, setCardNumber] = React.useState('')
  const [expiry, setExpiry] = React.useState('')
  const [cvc, setCvc] = React.useState('')
  const [name, setName] = React.useState('')
  const [billingAddress, setBillingAddress] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [company, setCompany] = React.useState('')
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [cardType, setCardType] = React.useState<'visa' | 'mastercard' | 'amex' | null>(null)
  
  // Detect card type
  React.useEffect(() => {
    const cleaned = cardNumber.replace(/\s/g, '')
    if (cleaned.startsWith('4')) {
      setCardType('visa')
    } else if (cleaned.startsWith('5')) {
      setCardType('mastercard')
    } else if (cleaned.startsWith('3')) {
      setCardType('amex')
    } else {
      setCardType(null)
    }
  }, [cardNumber])
  
  // Format card number
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const match = cleaned.match(/.{1,4}/g)
    return match ? match.join(' ') : cleaned
  }
  
  // Format expiry
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In a real app, this would submit to Stripe
    console.log('Payment submitted')
    setIsProcessing(false)
  }
  
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="bg-white rounded-xl shadow-lg p-6"
      style={getBlockStyles()}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-sm font-medium">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            required
            className="mt-1"
          />
        </div>
        
        {/* Name */}
        <div>
          <Label htmlFor="name" className="text-sm font-medium">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            className="mt-1"
          />
        </div>
        
        {/* Card Information */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            Card Information
          </Label>
          <div className="space-y-3">
            <div className="relative">
              <Input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value.slice(0, 19)))}
                placeholder="1234 5678 9012 3456"
                required
                className="pr-12"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                {cardType === 'visa' && (
                  <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                )}
                {cardType === 'mastercard' && (
                  <div className="w-8 h-5 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    MC
                  </div>
                )}
                {cardType === 'amex' && (
                  <div className="w-8 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    AMEX
                  </div>
                )}
                <CreditCard className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value.slice(0, 5)))}
                placeholder="MM/YY"
                required
              />
              <Input
                type="text"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.slice(0, 4))}
                placeholder="CVC"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Billing Address */}
        {data.showBillingAddress && (
          <div>
            <Label htmlFor="billing" className="text-sm font-medium">
              Billing Address
            </Label>
            <Input
              id="billing"
              type="text"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              placeholder="123 Main St, City, State 12345"
              className="mt-1"
            />
          </div>
        )}
        
        {/* Phone */}
        {data.showPhoneField && (
          <div>
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="mt-1"
            />
          </div>
        )}
        
        {/* Company */}
        {data.showCompanyField && (
          <div>
            <Label htmlFor="company" className="text-sm font-medium">
              Company Name
            </Label>
            <Input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Inc."
              className="mt-1"
            />
          </div>
        )}
        
        {/* Express Checkout Options */}
        <div className="border-t pt-4">
          <div className="flex gap-3 mb-4">
            <button
              type="button"
              className="flex-1 bg-black text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl">🍎</span> Pay
            </button>
            <button
              type="button"
              className="flex-1 bg-white border border-gray-300 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <span className="text-xl">G</span> Pay
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or pay with card</span>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full py-3 text-lg font-semibold"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>Processing...</>
          ) : (
            <>{data.buttonText || 'Complete Purchase'}</>
          )}
        </Button>
        
        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Lock className="w-4 h-4" />
          <span>{data.secureText || 'Your payment is secured with 256-bit SSL encryption'}</span>
        </div>
        
        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 pt-2">
          <ShieldCheck className="w-6 h-6 text-gray-400" />
          <div className="text-xs text-gray-400">PCI DSS Compliant</div>
          <div className="text-xs text-gray-400">Powered by Stripe</div>
        </div>
      </form>
    </motion.div>
  )
}