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
import { StripeProvider } from '@/components/checkout/StripeProvider'
import { StripePaymentBlock } from '@/components/checkout/StripePaymentBlock'
import { api } from '@/lib/trpc/client'
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
  
  // State for order management
  const [selectedOrderBumps, setSelectedOrderBumps] = React.useState<string[]>([])
  const [clientSecret, setClientSecret] = React.useState<string | null>(null)
  const [totalAmount, setTotalAmount] = React.useState(0)
  const [selectedProductId] = React.useState<string | null>(null)
  const [selectedPlanId] = React.useState<string | null>(null)
  const [isLoadingPayment, setIsLoadingPayment] = React.useState(false)
  const [, setCustomerEmail] = React.useState('')
  
  // Find product and payment blocks to extract data
  const productBlock = blocks.find(b => b.type === 'product')
  // const paymentBlock = blocks.find(b => b.type === 'payment')
  // const orderBumpBlocks = blocks.filter(b => b.type === 'orderBump')
  
  // Create payment intent mutation
  const createIntentMutation = api.payment.createCheckoutIntent.useMutation()
  
  // Extract product data
  React.useEffect(() => {
    if (productBlock) {
      const productData = productBlock.data as ProductBlockData
      // For now, we'll use a simple product ID (would need to be passed from builder)
      // In production, this would come from the product selection in the builder
      setTotalAmount(parseInt(productData.price.replace(/[^0-9]/g, '')) * 100) // Convert to cents
    }
  }, [productBlock])
  
  // Initialize payment when email is provided
  const initializePayment = React.useCallback(async (email: string) => {
    if (!email || isLoadingPayment) return
    
    setIsLoadingPayment(true)
    setCustomerEmail(email)
    
    try {
      const result = await createIntentMutation.mutateAsync({
        checkoutId: checkout.id,
        email,
        productId: selectedProductId || undefined,
        planId: selectedPlanId || undefined,
        orderBumpIds: selectedOrderBumps,
        enableTax: false, // Could be configured in payment block settings
      })
      
      setClientSecret(result.clientSecret)
      setTotalAmount(result.amount)
    } catch (error) {
      console.error('Failed to create payment intent:', error)
    } finally {
      setIsLoadingPayment(false)
    }
  }, [checkout.id, selectedProductId, selectedPlanId, selectedOrderBumps, createIntentMutation, isLoadingPayment])
  
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
              <BlockRenderer 
                key={block.id} 
                block={block}
                checkout={checkout}
                selectedOrderBumps={selectedOrderBumps}
                setSelectedOrderBumps={setSelectedOrderBumps}
                initializePayment={initializePayment}
                clientSecret={clientSecret}
                totalAmount={totalAmount}
                selectedProductId={selectedProductId}
                selectedPlanId={selectedPlanId}
              />
            ))}
          </div>
          
          {/* Right Column */}
          {hasRightColumn && (
            <div className="space-y-6">
              {rightBlocks.map((block) => (
                <BlockRenderer 
                  key={block.id} 
                  block={block}
                  checkout={checkout}
                  selectedOrderBumps={selectedOrderBumps}
                  setSelectedOrderBumps={setSelectedOrderBumps}
                  initializePayment={initializePayment}
                  clientSecret={clientSecret}
                  totalAmount={totalAmount}
                  selectedProductId={selectedProductId}
                  selectedPlanId={selectedPlanId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BlockRenderer({ block, checkout, selectedOrderBumps, setSelectedOrderBumps: _setSelectedOrderBumps, initializePayment: _initializePayment, clientSecret, totalAmount, selectedProductId, selectedPlanId }: { 
  block: Block
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  checkout?: any
  selectedOrderBumps?: string[]
  setSelectedOrderBumps?: (bumps: string[]) => void
  initializePayment?: (email: string) => void
  clientSecret?: string | null
  totalAmount?: number
  selectedProductId?: string | null
  selectedPlanId?: string | null
}) {
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
      const paymentData = block.data as PaymentBlockData
      
      // If we're using Stripe Elements, wrap in provider
      if (paymentData.useStripeElements !== false) {
        return (
          <StripeProvider clientSecret={clientSecret || undefined} amount={totalAmount}>
            <StripePaymentBlock
              data={paymentData}
              checkoutId={checkout.id}
              productId={selectedProductId || undefined}
              planId={selectedPlanId || undefined}
              orderBumpIds={selectedOrderBumps}
              amount={totalAmount || 0}
              onPaymentSuccess={(paymentIntentId) => {
                console.log('Payment successful:', paymentIntentId)
              }}
              onAnalyticsEvent={(event, data) => {
                console.log('Analytics event:', event, data)
              }}
            />
          </StripeProvider>
        )
      }
      
      // Fallback to old payment block (will be removed)
      return <PaymentBlock data={paymentData} getBlockStyles={getBlockStyles} />
    
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
        <div className="pt-4">
          <div className="flex gap-3 mb-4">
            <button
              type="button"
              className="flex-1 bg-black text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span>Pay</span>
            </button>
            <button
              type="button"
              className="flex-1 bg-white border border-gray-300 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Pay</span>
            </button>
          </div>
          
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">Or pay with card</span>
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