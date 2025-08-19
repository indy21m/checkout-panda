'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Check, Shield, Star, ChevronDown, ChevronUp, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StripeProvider } from '@/components/checkout/StripeProvider'
import { StripePaymentBlock } from '@/components/checkout/StripePaymentBlock'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { api } from '@/lib/trpc/client'
import { formatMoney } from '@/lib/currency'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'
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
  PaymentBlockData,
} from '@/components/builder/checkout-blocks'
import type { RouterOutputs } from '@/lib/trpc/api'

// Centralized cart state for entire checkout
interface CartState {
  checkoutId: string
  productId?: string
  offerId?: string // Add offerId support
  planId?: string
  currency: string
  orderBumps: Array<{
    id: string
    selected: boolean
    productId?: string
    amount: number
    currency: string
  }>
  couponCode?: string
  customerEmail?: string
  quantity: number
  // VAT fields
  customerCountry?: string
  vatNumber?: string
  collectVAT?: boolean
}

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

type Quote = RouterOutputs['checkout']['quote']

// Hook to manage cart and quotes
function useCartAndQuote(initialCart: CartState) {
  const [cart, setCart] = React.useState<CartState>(initialCart)
  const [quote, setQuote] = React.useState<Quote | null>(null)
  const [isQuoteLoading, setIsQuoteLoading] = React.useState(false)

  // Debounce cart changes by 500ms to avoid excessive API calls
  const debouncedCart = useDebounce(cart, 500)

  // Quote query
  const quoteQuery = api.checkout.quote.useQuery(
    {
      checkoutId: debouncedCart.checkoutId,
      productId: debouncedCart.productId,
      offerId: debouncedCart.offerId, // Add offerId to query
      planId: debouncedCart.planId,
      orderBumpIds: debouncedCart.orderBumps
        .filter((b) => b.selected)
        .map((b) => b.productId || b.id),
      couponCode: debouncedCart.couponCode,
      customerEmail: debouncedCart.customerEmail,
      customerCountry: debouncedCart.customerCountry || 'US',
      vatNumber: debouncedCart.vatNumber,
      collectVAT: debouncedCart.collectVAT || false,
      enableStripeTax: false, // Can be enabled via settings
    },
    {
      enabled: !!(debouncedCart.productId || debouncedCart.offerId), // Enable if we have product or offer
    }
  )

  // Handle quote success/error
  React.useEffect(() => {
    if (quoteQuery.data) {
      setQuote(quoteQuery.data)
      setIsQuoteLoading(false)
    }
    if (quoteQuery.error) {
      console.error('Quote error:', quoteQuery.error)
      toast.error('Failed to calculate price')
      setIsQuoteLoading(false)
    }
  }, [quoteQuery.data, quoteQuery.error])

  // Set loading state when cart changes
  React.useEffect(() => {
    if (JSON.stringify(cart) !== JSON.stringify(debouncedCart)) {
      setIsQuoteLoading(true)
    }
  }, [cart, debouncedCart])

  // Update functions
  const updateCart = React.useCallback((updates: Partial<CartState>) => {
    setCart((prev) => ({ ...prev, ...updates }))
  }, [])

  const toggleOrderBump = React.useCallback((bumpId: string) => {
    setCart((prev) => ({
      ...prev,
      orderBumps: prev.orderBumps.map((bump) =>
        bump.id === bumpId ? { ...bump, selected: !bump.selected } : bump
      ),
    }))
  }, [])

  return {
    cart,
    quote: quoteQuery.data || quote,
    isQuoteLoading: isQuoteLoading || quoteQuery.isLoading,
    updateCart,
    toggleOrderBump,
    refetchQuote: quoteQuery.refetch,
  }
}

export function SimplifiedCheckoutRenderer({ checkout }: SimplifiedCheckoutRendererProps) {
  const blocks = checkout.pageData.blocks || []
  const visibleBlocks = blocks.filter((block) => block.visible !== false)

  // Extract initial product and order bumps from blocks
  const productBlock = blocks.find((b) => b.type === 'product')
  const orderBumpBlocks = blocks.filter((b) => b.type === 'orderBump')
  const paymentBlock = blocks.find((b) => b.type === 'payment')

  // Initialize cart state from blocks
  const initialCart = React.useMemo<CartState>(() => {
    const productData = productBlock?.data as ProductBlockData | undefined

    return {
      checkoutId: checkout.id,
      productId: productData?.productId,
      offerId: productData?.offerId, // Extract offerId from product block
      planId: productData?.planId || undefined,
      currency: 'USD', // Default, will be updated from product
      orderBumps: orderBumpBlocks.map((block) => {
        const bumpData = block.data as OrderBumpBlockData
        return {
          id: block.id,
          selected: bumpData.isCheckedByDefault || false,
          productId: bumpData.productId,
          amount: parseInt(bumpData.price.replace(/[^0-9]/g, '')) * 100, // Convert to cents
          currency: 'USD',
        }
      }),
      quantity: 1,
    }
  }, [checkout.id, productBlock, orderBumpBlocks])

  // Use centralized cart and quote management
  const { cart, quote, isQuoteLoading, updateCart, toggleOrderBump } = useCartAndQuote(initialCart)

  // Payment state
  const [clientSecret, setClientSecret] = React.useState<string | null>(null)
  const [paymentIntent, setPaymentIntent] = React.useState<string | null>(null)
  const [isInitializingPayment, setIsInitializingPayment] = React.useState(false)

  // Initialize payment mutation
  const initializePaymentMutation = api.checkout.initializePayment.useMutation({
    onSuccess: (data) => {
      setClientSecret(data.clientSecret)
      if ('paymentIntentId' in data && data.paymentIntentId) {
        setPaymentIntent(data.paymentIntentId as string)
      }
      setIsInitializingPayment(false)
    },
    onError: (error) => {
      console.error('Payment initialization error:', error)
      toast.error('Failed to initialize payment')
      setIsInitializingPayment(false)
    },
  })

  // Initialize payment when email is provided
  const initializePayment = React.useCallback(
    async (email: string) => {
      if (!email || !quote || isInitializingPayment) return

      setIsInitializingPayment(true)
      updateCart({ customerEmail: email })

      await initializePaymentMutation.mutateAsync({
        quoteId: quote.id,
        customerEmail: email,
        checkoutId: checkout.id,
        productId: cart.productId,
        offerId: cart.offerId, // Include offerId
        planId: cart.planId,
        orderBumpIds: cart.orderBumps.filter((b) => b.selected).map((b) => b.productId || b.id),
        couponCode: cart.couponCode,
      })
    },
    [quote, isInitializingPayment, updateCart, checkout.id, cart, initializePaymentMutation]
  )

  // Separate blocks by column for layout
  const leftBlocks = visibleBlocks.filter(
    (b) => b.column === 'left' || (!b.column && b.type !== 'product')
  )
  const rightBlocks = visibleBlocks.filter((b) => b.column === 'right' || b.type === 'product')

  // Determine if we have a right column
  const hasRightColumn = rightBlocks.length > 0 || !!quote

  // Check if this is a zero-total checkout
  const isZeroTotal = quote?.total === 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Circle-style header if present */}
      {blocks.find((b) => b.type === 'header') && (
        <BlockRenderer
          block={blocks.find((b) => b.type === 'header')!}
          cart={cart}
          quote={quote}
          updateCart={updateCart}
          toggleOrderBump={toggleOrderBump}
          initializePayment={initializePayment}
          clientSecret={clientSecret}
          checkout={checkout}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div
          className={cn(
            'grid gap-8',
            hasRightColumn ? 'lg:grid-cols-[1fr_420px]' : 'mx-auto max-w-3xl lg:grid-cols-1'
          )}
        >
          {/* Main Column - Payment and Content */}
          <div className="space-y-6">
            {/* Payment Section - Always First */}
            {paymentBlock && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:p-8"
              >
                {/* Show loading state while quote is loading */}
                {isQuoteLoading && !quote && (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  </div>
                )}

                {/* Show payment form when quote is ready */}
                {quote && (
                  <>
                    {/* Zero-total flow - Skip payment collection */}
                    {isZeroTotal ? (
                      <div className="py-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                          <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-gray-900">
                          {quote.meta?.trialDays
                            ? `Start Your ${quote.meta.trialDays}-Day Free Trial`
                            : 'Complete Your Order'}
                        </h3>
                        <p className="mb-6 text-gray-600">
                          {quote.meta?.trialDays
                            ? 'No payment required. Cancel anytime during your trial.'
                            : 'Your order total is free. Click below to complete.'}
                        </p>
                        <Button
                          size="lg"
                          onClick={() => {
                            if (!cart.customerEmail) {
                              toast.error('Please enter your email address')
                              return
                            }
                            initializePayment(cart.customerEmail)
                          }}
                          disabled={!cart.customerEmail || isInitializingPayment}
                          className="w-full sm:w-auto"
                        >
                          {isInitializingPayment ? 'Processing...' : 'Start Free Trial'}
                        </Button>
                      </div>
                    ) : (
                      // Regular payment flow with Stripe Elements
                      <StripeProvider
                        clientSecret={clientSecret || undefined}
                        amount={quote.total}
                        currency={quote.currency}
                        mode={quote.meta?.planInterval ? 'subscription' : 'payment'}
                        quoteId={quote.id}
                      >
                        <StripePaymentBlock
                          data={paymentBlock.data as PaymentBlockData}
                          checkoutId={checkout.id}
                          quote={quote}
                          productId={cart.productId}
                          offerId={cart.offerId} // Pass offerId
                          planId={cart.planId}
                          orderBumpIds={cart.orderBumps.filter((b) => b.selected).map((b) => b.id)}
                          amount={quote.total}
                          currency={quote.currency}
                          onEmailChange={(email) => updateCart({ customerEmail: email })}
                          onPaymentInitialize={initializePayment}
                          clientSecret={clientSecret}
                          paymentIntentId={paymentIntent}
                          onPaymentSuccess={(paymentIntentId) => {
                            console.log('Payment successful:', paymentIntentId)
                            // Redirect to success page
                            window.location.href = `/checkout/success?payment_intent=${paymentIntentId}`
                          }}
                          onAnalyticsEvent={(event, data) => {
                            console.log('Analytics event:', event, data)
                          }}
                        />
                      </StripeProvider>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* Order Bumps */}
            {orderBumpBlocks.map((block) => (
              <OrderBumpBlock
                key={block.id}
                block={block}
                isSelected={cart.orderBumps.find((b) => b.id === block.id)?.selected || false}
                onToggle={() => toggleOrderBump(block.id)}
              />
            ))}

            {/* Other Left Column Content */}
            {leftBlocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                cart={cart}
                quote={quote}
                updateCart={updateCart}
                toggleOrderBump={toggleOrderBump}
                initializePayment={initializePayment}
                clientSecret={clientSecret}
                checkout={checkout}
              />
            ))}
          </div>

          {/* Right Column - Order Summary and Product */}
          {hasRightColumn && (
            <div className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
              {/* Order Summary - Circle Style */}
              {quote && <OrderSummary quote={quote} className="shadow-lg" />}

              {/* Product Details */}
              {productBlock && <ProductBlock block={productBlock} cart={cart} quote={quote} />}

              {/* Other Right Column Content */}
              {rightBlocks
                .filter((b) => b.type !== 'product')
                .map((block) => (
                  <BlockRenderer
                    key={block.id}
                    block={block}
                    cart={cart}
                    quote={quote}
                    updateCart={updateCart}
                    toggleOrderBump={toggleOrderBump}
                    initializePayment={initializePayment}
                    clientSecret={clientSecret}
                    checkout={checkout}
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Individual block renderers
function BlockRenderer({
  block,
}: {
  block: Block
  cart?: CartState
  quote?: Quote | null
  updateCart?: (updates: Partial<CartState>) => void
  toggleOrderBump?: (id: string) => void
  initializePayment?: (email: string) => void
  clientSecret?: string | null
  checkout?: unknown
}) {
  const applyStyles = (defaultClasses: string) => cn(defaultClasses)

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
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="mb-4 text-3xl font-bold md:text-5xl">{headerData.title}</h1>
              <p className="mx-auto max-w-2xl text-lg opacity-90 md:text-xl">
                {headerData.subtitle}
              </p>
            </motion.div>
          </div>
        </div>
      )

    case 'benefits':
      const benefitsData = block.data as BenefitsBlockData
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={applyStyles('rounded-xl border border-gray-100 bg-white p-6 shadow-sm')}
          style={getBlockStyles()}
        >
          <h3 className="mb-6 text-xl font-bold">{benefitsData.title}</h3>
          <div className="space-y-4">
            {benefitsData.benefits.map((benefit, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 text-2xl">{benefit.icon}</div>
                <div>
                  <h4 className="mb-1 font-semibold">{benefit.title}</h4>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )

    case 'testimonial':
      const testimonialData = block.data as TestimonialBlockData
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={applyStyles('rounded-xl border border-gray-100 bg-white p-6 shadow-sm')}
          style={getBlockStyles()}
        >
          {testimonialData.testimonials.map((testimonial, i) => (
            <div key={i}>
              <div className="mb-3 flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={cn(
                      'h-5 w-5',
                      j < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              <p className="mb-3 text-gray-700 italic">&ldquo;{testimonial.content}&rdquo;</p>
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
          className={applyStyles('rounded-xl border border-green-200 bg-green-50 p-6 text-center')}
          style={getBlockStyles()}
        >
          <Shield className="mx-auto mb-3 h-12 w-12 text-green-600" />
          {guaranteeData.badge && (
            <span className="mb-3 inline-block rounded-full bg-green-600 px-3 py-1 text-sm font-medium text-white">
              {guaranteeData.badge}
            </span>
          )}
          <h3 className="mb-2 text-xl font-bold">{guaranteeData.title}</h3>
          <p className="text-gray-700">{guaranteeData.description}</p>
        </motion.div>
      )

    case 'faq':
      return <FAQBlock block={block} applyStyles={applyStyles} getBlockStyles={getBlockStyles} />

    case 'countdown':
      return (
        <CountdownBlock block={block} applyStyles={applyStyles} getBlockStyles={getBlockStyles} />
      )

    default:
      return null
  }
}

// Product Block Component
function ProductBlock({
  block,
  cart,
  quote,
}: {
  block: Block
  cart: CartState
  quote: Quote | null
}) {
  const productData = block.data as ProductBlockData

  // Fetch offer data if offerId is present
  const { data: offer } = api.offer.getById.useQuery(
    { id: productData.offerId! },
    { enabled: !!productData.offerId && productData.useOfferPricing }
  )

  // Use offer data when available, otherwise fall back to productData
  const displayName = offer?.name || productData.name
  const displayDescription = offer?.description || productData.description
  const displayBadge = offer?.badgeText || productData.badge
  const displayFeatures = offer?.product?.features || productData.features

  const currency = quote?.currency || offer?.currency || cart.currency || 'USD'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
    >
      {displayBadge && (
        <span className="mb-4 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
          <Tag className="h-3 w-3" />
          {displayBadge}
        </span>
      )}
      <h2 className="mb-2 text-2xl font-bold">{displayName}</h2>
      <p className="mb-4 text-gray-600">{displayDescription}</p>

      {/* Use quote price if available, otherwise fallback to offer/display price */}
      <div className="mb-6 flex items-baseline gap-2">
        {quote ? (
          <>
            <span className="text-3xl font-bold text-blue-600">
              {formatMoney(quote.subtotal, currency)}
            </span>
            {(offer?.compareAtPrice || productData.comparePrice) && (
              <span className="text-lg text-gray-400 line-through">
                {offer?.compareAtPrice
                  ? formatMoney(offer.compareAtPrice, currency)
                  : productData.comparePrice}
              </span>
            )}
            {quote.meta?.planInterval && (
              <span className="text-gray-500">/{quote.meta.planInterval}</span>
            )}
          </>
        ) : offer && productData.useOfferPricing ? (
          <>
            <span className="text-3xl font-bold text-blue-600">
              {formatMoney(offer.price, currency)}
            </span>
            {offer.compareAtPrice && (
              <span className="text-lg text-gray-400 line-through">
                {formatMoney(offer.compareAtPrice, currency)}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="text-3xl font-bold text-blue-600">{productData.price}</span>
            {productData.comparePrice && (
              <span className="text-lg text-gray-400 line-through">{productData.comparePrice}</span>
            )}
            {productData.type === 'subscription' && <span className="text-gray-500">/month</span>}
          </>
        )}
      </div>

      <ul className="space-y-3">
        {displayFeatures.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

// Order Bump Block Component
function OrderBumpBlock({
  block,
  isSelected,
  onToggle,
}: {
  block: Block
  isSelected: boolean
  onToggle: () => void
}) {
  const bumpData = block.data as OrderBumpBlockData

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className={cn(
        'cursor-pointer rounded-xl border-2 p-4 transition-all',
        isSelected
          ? 'border-green-500 bg-green-50'
          : 'border-yellow-400 bg-yellow-50 hover:border-yellow-500'
      )}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600"
        />
        <div className="flex-1">
          <h4 className="mb-1 text-lg font-bold">{bumpData.title}</h4>
          <p className="mb-2 text-gray-700">{bumpData.description}</p>
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
  getBlockStyles,
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
      className={applyStyles('rounded-xl border border-gray-100 bg-white p-6 shadow-sm')}
      style={getBlockStyles()}
    >
      <h3 className="mb-4 text-xl font-bold">{faqData.title}</h3>
      <div className="space-y-3">
        {faqData.faqs.map((faq, i) => (
          <div key={i} className="border-b border-gray-200 pb-3 last:border-0">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between py-2 text-left"
            >
              <span className="font-medium">{faq.question}</span>
              {openIndex === i ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pt-2 text-gray-600"
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
  getBlockStyles,
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
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [countdownData.endDate])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={applyStyles('rounded-xl border border-red-200 bg-red-50 p-6 text-center')}
      style={getBlockStyles()}
    >
      <h3 className="mb-2 text-lg font-bold">{countdownData.title}</h3>
      <div className="mb-4 flex justify-center gap-4">
        {timeLeft.days > 0 && (
          <div>
            <div className="text-3xl font-bold text-red-600">{timeLeft.days}</div>
            <div className="text-xs text-gray-600">DAYS</div>
          </div>
        )}
        <div>
          <div className="text-3xl font-bold text-red-600">{timeLeft.hours}</div>
          <div className="text-xs text-gray-600">HOURS</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-red-600">{timeLeft.minutes}</div>
          <div className="text-xs text-gray-600">MINS</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-red-600">{timeLeft.seconds}</div>
          <div className="text-xs text-gray-600">SECS</div>
        </div>
      </div>
    </motion.div>
  )
}
