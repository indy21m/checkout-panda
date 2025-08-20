'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import {
  Type,
  ShoppingCart,
  Gift,
  Star,
  Shield,
  CreditCard,
  Check,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  FileText,
  Clock,
  Columns2,
  Tag,
} from 'lucide-react'
import { motion } from 'framer-motion'

// Block Type Definitions
export type BlockType =
  | 'header'
  | 'product'
  | 'benefits'
  | 'orderBump'
  | 'testimonial'
  | 'guarantee'
  | 'faq'
  | 'countdown'
  | 'payment'

// Export both names for backward compatibility during migration
export type ProductBlockData = OfferBlockData

export interface HeaderBlockData {
  title: string
  subtitle: string
  showImage?: boolean
  imageUrl?: string
}

export interface OfferBlockData {
  // Display fields (for preview and manual entry)
  name: string
  description: string
  price: string // Display only when useProductPricing=false
  comparePrice?: string
  type: 'onetime' | 'subscription' | 'payment-plan'
  features: string[]
  imageUrl?: string
  badge?: string

  // NEW: Authoritative fields for offer-driven pricing
  productId?: string // Legacy - Database ID of the product
  offerId?: string // New - Database ID of the offer (includes product + context pricing)
  planId?: string | null // Selected plan/price ID (optional)
  useProductPricing?: boolean // Default true; if false, use manual price string
  useOfferPricing?: boolean // When true, use offer details for price/description
}

export interface BenefitsBlockData {
  title: string
  benefits: Array<{
    icon?: string
    title: string
    description: string
  }>
}

export interface OrderBumpBlockData {
  title: string
  description: string
  price: string
  comparePrice?: string
  isCheckedByDefault?: boolean
  productId?: string // Legacy - for backward compatibility
  offerId?: string // New - links to offer for pricing
  useOfferPricing?: boolean // Whether to use offer pricing
}

export interface TestimonialBlockData {
  testimonials: Array<{
    author: string
    content: string
    rating: number
    imageUrl?: string
    title?: string
  }>
  layout: 'single' | 'grid' | 'carousel'
}

export interface GuaranteeBlockData {
  title: string
  description: string
  days?: number
  badge?: string
}

export interface FAQBlockData {
  title: string
  faqs: Array<{
    question: string
    answer: string
  }>
}

export interface CountdownBlockData {
  title: string
  endDate: string
  showDays?: boolean
  showHours?: boolean
  showMinutes?: boolean
  showSeconds?: boolean
}

export interface PaymentBlockData {
  showBillingAddress?: boolean
  showCompanyField?: boolean
  showPhoneField?: boolean
  buttonText?: string
  secureText?: string
  // New Stripe-specific settings
  useStripeElements?: boolean
  enableWallets?: boolean
  enableStripeLink?: boolean
  collectVAT?: boolean
  enableStripeTax?: boolean
  enableCoupons?: boolean
  showGuarantee?: boolean
  guaranteeText?: string
}

export type BlockData =
  | HeaderBlockData
  | OfferBlockData
  | BenefitsBlockData
  | OrderBumpBlockData
  | TestimonialBlockData
  | GuaranteeBlockData
  | FAQBlockData
  | CountdownBlockData
  | PaymentBlockData

export interface BlockStyles {
  padding?: string
  margin?: string
  background?: string
  backgroundType?: 'color' | 'gradient' | 'image'
  borderRadius?: string
  borderColor?: string
  borderWidth?: string
  shadow?: string
  fontSize?: string
  fontWeight?: string
  textColor?: string
  titleColor?: string
  subtitleColor?: string
}

export interface Block {
  id: string
  type: BlockType
  data: BlockData
  visible: boolean
  column?: 'left' | 'right'
  styles?: BlockStyles
}

// Block Templates with Danish Real Estate Example
export const blockTemplates: Record<
  BlockType,
  { data: BlockData; icon: React.ReactNode; name: string; description: string }
> = {
  header: {
    data: {
      title: 'Sikr Din Drømmebolig i København',
      subtitle: 'Eksklusiv ejendomsinvestering med 12% årligt afkast',
      showImage: false,
    } as HeaderBlockData,
    icon: <Type className="h-5 w-5" />,
    name: 'Header Section',
    description: 'Title and subtitle',
  },
  product: {
    data: {
      name: 'Dream Home Denmark - Premium Investor Package',
      description:
        'Få adgang til off-market ejendomme i København med garanteret afkast. Inkluderer juridisk hjælp, property management og exit-strategi.',
      price: 'DKK 249.000',
      comparePrice: 'DKK 349.000',
      type: 'onetime',
      features: [
        'Adgang til 10+ off-market ejendomme månedligt',
        'Personlig investeringsrådgiver',
        'Gratis juridisk gennemgang af alle handler',
        'Property management i 2 år inkluderet',
        'Garanteret 12% årligt afkast eller pengene tilbage',
      ],
      badge: 'Kun 5 pladser tilbage',
    } as OfferBlockData,
    icon: <ShoppingCart className="h-5 w-5" />,
    name: 'Offer Details',
    description: 'Showcase your offer',
  },
  benefits: {
    data: {
      title: 'Derfor Vælger Investorer Os',
      benefits: [
        {
          icon: '🏡',
          title: 'Off-Market Adgang',
          description: 'Ejendomme 20-30% under markedspris',
        },
        {
          icon: '📈',
          title: 'Garanteret Afkast',
          description: 'Minimum 12% årligt eller fuld refundering',
        },
        {
          icon: '🛡️',
          title: 'Juridisk Sikkerhed',
          description: 'Advokat-godkendte handler og kontrakter',
        },
      ],
    } as BenefitsBlockData,
    icon: <Check className="h-5 w-5" />,
    name: 'Benefits List',
    description: 'Feature highlights',
  },
  orderBump: {
    data: {
      title: '🎁 Tilføj VIP Property Tour (Spar 50%)',
      description:
        'Få en personlig tour af 5 premium ejendomme i København med vores ekspert. Normalpris DKK 19.900',
      price: 'DKK 9.900',
      comparePrice: 'DKK 19.900',
      isCheckedByDefault: false,
    } as OrderBumpBlockData,
    icon: <Gift className="h-5 w-5" />,
    name: 'Order Bump',
    description: 'Increase order value',
  },
  testimonial: {
    data: {
      testimonials: [
        {
          author: 'Lars Nielsen',
          title: 'Investor, København',
          content:
            'Jeg har købt 3 ejendomme gennem Dream Home Denmark. Afkastet har været over 15% årligt, og deres team håndterer alt det praktiske.',
          rating: 5,
        },
      ],
      layout: 'single',
    } as TestimonialBlockData,
    icon: <Star className="h-5 w-5" />,
    name: 'Testimonials',
    description: 'Social proof',
  },
  guarantee: {
    data: {
      title: '90-Dages Fuld Tilfredshedsgaranti',
      description:
        'Hvis du ikke finder mindst én rentabel ejendom inden for 90 dage, får du alle dine penge tilbage - ingen spørgsmål stillet.',
      days: 90,
      badge: '100% Risikofrit',
    } as GuaranteeBlockData,
    icon: <Shield className="h-5 w-5" />,
    name: 'Guarantee',
    description: 'Build trust',
  },
  faq: {
    data: {
      title: 'Ofte Stillede Spørgsmål',
      faqs: [
        {
          question: 'Hvordan finder I ejendomme under markedspris?',
          answer:
            'Vi har et netværk af 200+ ejendomsmæglere og får adgang til ejendomme før de kommer på markedet. Vores AI-system analyserer 10.000+ ejendomme dagligt.',
        },
        {
          question: 'Hvad hvis jeg ikke finder den rigtige ejendom?',
          answer:
            'Du har 90 dages fuld returret. Hvis du ikke finder mindst én rentabel ejendom, får du alle dine penge tilbage.',
        },
        {
          question: 'Kan jeg bruge programmet som førstegangskøber?',
          answer:
            'Absolut! 40% af vores medlemmer er førstegangskøbere. Vi hjælper med alt fra finansiering til juridisk rådgivning.',
        },
      ],
    } as FAQBlockData,
    icon: <FileText className="h-5 w-5" />,
    name: 'FAQ Section',
    description: 'Answer questions',
  },
  countdown: {
    data: {
      title: 'Early Bird Tilbud Udløber Om:',
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
    } as CountdownBlockData,
    icon: <Clock className="h-5 w-5" />,
    name: 'Countdown Timer',
    description: 'Create urgency',
  },
  payment: {
    data: {
      showBillingAddress: true,
      showCompanyField: false,
      showPhoneField: true,
      buttonText: 'Gennemfør Køb - DKK 249.000',
      secureText: 'Din betaling er sikret med 256-bit SSL kryptering',
    } as PaymentBlockData,
    icon: <CreditCard className="h-5 w-5" />,
    name: 'Payment Form',
    description: 'Collect payment',
  },
}

// Canvas Block Component
interface CanvasBlockProps {
  block: Block
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
  onToggleVisibility: () => void
  onToggleColumn?: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  isDragging?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragAttributes?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragListeners?: any
}

export function CanvasBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onToggleColumn,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isDragging,
  dragAttributes,
  dragListeners,
}: CanvasBlockProps) {
  const template = blockTemplates[block.type]

  // Handle unknown block types
  if (!template) {
    console.warn(`Unknown block type: ${block.type}`)
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        <p className="font-medium">Unknown block type: {block.type}</p>
        <button onClick={onDelete} className="mt-2 text-sm underline hover:no-underline">
          Remove this block
        </button>
      </div>
    )
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isDragging ? 0.5 : block.visible ? 1 : 0.5,
        y: 0,
        scale: isSelected ? 1.02 : 1,
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative w-full cursor-pointer transition-all duration-200',
        isSelected && 'z-10'
      )}
      onClick={onSelect}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-xl border-2 transition-all',
          isSelected
            ? 'border-blue-500 shadow-lg shadow-blue-500/20'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md',
          !block.visible && 'opacity-60'
        )}
      >
        {/* Drag Handle */}
        <div
          className="absolute top-0 bottom-0 left-0 flex w-8 cursor-move items-center justify-center bg-gray-50 opacity-0 transition-opacity group-hover:opacity-100"
          {...dragAttributes}
          {...dragListeners}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {/* Content */}
        <div className="w-full bg-white py-4 pr-4 pl-10">
          <div className="flex w-full items-center justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className={cn(
                  'rounded-lg p-2',
                  isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                )}
              >
                {template.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium">{template.name}</h3>
                <p className="truncate text-xs text-gray-500">{getBlockPreview(block)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveUp()
                }}
                disabled={!canMoveUp}
                className="rounded p-1.5 transition-colors hover:bg-gray-100 disabled:opacity-30"
                title="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onMoveDown()
                }}
                disabled={!canMoveDown}
                className="rounded p-1.5 transition-colors hover:bg-gray-100 disabled:opacity-30"
                title="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleVisibility()
                }}
                className="rounded p-1.5 transition-colors hover:bg-gray-100"
                title={block.visible ? 'Hide' : 'Show'}
              >
                {block.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              {onToggleColumn && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleColumn()
                  }}
                  className="rounded p-1.5 transition-colors hover:bg-gray-100"
                  title={`Move to ${block.column === 'right' ? 'left' : 'right'} column`}
                >
                  <Columns2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDuplicate()
                }}
                className="rounded p-1.5 transition-colors hover:bg-gray-100"
                title="Duplicate"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="rounded p-1.5 text-red-500 transition-colors hover:bg-red-50"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Get block preview text
function getBlockPreview(block: Block): string {
  // Check if block type exists in templates
  if (!blockTemplates[block.type]) {
    return `Unknown block type: ${block.type}`
  }

  switch (block.type) {
    case 'header':
      return (block.data as HeaderBlockData).title || 'No title set'
    case 'product':
      const offerData = block.data as OfferBlockData
      return `${offerData.name} - ${offerData.price}`
    case 'benefits':
      const benefitsData = block.data as BenefitsBlockData
      return `${benefitsData.benefits.length} benefits`
    case 'orderBump':
      const bumpData = block.data as OrderBumpBlockData
      return `${bumpData.title} - ${bumpData.price}`
    case 'testimonial':
      const testimonialData = block.data as TestimonialBlockData
      return `${testimonialData.testimonials.length} testimonial${testimonialData.testimonials.length > 1 ? 's' : ''}`
    case 'guarantee':
      return (block.data as GuaranteeBlockData).title
    case 'faq':
      const faqData = block.data as FAQBlockData
      return `${faqData.faqs.length} questions`
    case 'countdown':
      return (block.data as CountdownBlockData).title
    case 'payment':
      return 'Payment form configuration'
    default:
      return 'Block content'
  }
}

// WYSIWYG Block Component - Shows actual styled checkout content
interface WYSIWYGBlockProps {
  block: Block
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
  onToggleVisibility: () => void
  onToggleColumn?: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  isDragging?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragAttributes?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragListeners?: any
}

export function WYSIWYGBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onToggleColumn,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isDragging,
  dragAttributes,
  dragListeners,
}: WYSIWYGBlockProps) {
  const renderContent = () => {
    // Apply custom styles if provided
    const customStyles: React.CSSProperties = block.styles
      ? {
          padding: block.styles.padding,
          margin: block.styles.margin,
          background:
            block.styles.backgroundType === 'gradient'
              ? block.styles.background
              : block.styles.background,
          borderRadius: block.styles.borderRadius,
          borderColor: block.styles.borderColor,
          borderWidth: block.styles.borderWidth,
          borderStyle: block.styles.borderWidth ? 'solid' : undefined,
          boxShadow: block.styles.shadow,
          color: block.styles.textColor,
          fontSize: block.styles.fontSize,
          fontWeight: block.styles.fontWeight as React.CSSProperties['fontWeight'],
        }
      : {}

    switch (block.type) {
      case 'header':
        const headerData = block.data as HeaderBlockData
        const defaultHeaderStyle = !block.styles?.background
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
          : ''
        return (
          <div
            className={cn('rounded-t-xl px-6 py-8 text-center', defaultHeaderStyle)}
            style={customStyles}
          >
            <h1 className="mb-2 text-3xl font-bold" style={{ color: block.styles?.titleColor }}>
              {headerData.title}
            </h1>
            <p className="text-lg opacity-90" style={{ color: block.styles?.subtitleColor }}>
              {headerData.subtitle}
            </p>
          </div>
        )

      case 'product':
        const offerData = block.data as OfferBlockData
        const defaultProductStyle = !block.styles?.background
          ? 'bg-white border border-gray-100 shadow-sm'
          : ''
        return (
          <div className={cn('rounded-xl p-6', defaultProductStyle)} style={customStyles}>
            {offerData.badge && (
              <span className="mb-4 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                <Tag className="h-3 w-3" />
                {offerData.badge}
              </span>
            )}
            <h2 className="mb-2 text-2xl font-bold">{offerData.name}</h2>
            <p className="mb-4 text-gray-600">{offerData.description}</p>
            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">{offerData.price}</span>
              {offerData.comparePrice && (
                <span className="text-lg text-gray-400 line-through">{offerData.comparePrice}</span>
              )}
              {offerData.type === 'subscription' && <span className="text-gray-500">/month</span>}
            </div>
            <ul className="space-y-3">
              {offerData.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )

      case 'benefits':
        const benefitsData = block.data as BenefitsBlockData
        return (
          <div className="rounded-xl bg-gray-50 p-6">
            <h3 className="mb-4 text-xl font-bold">{benefitsData.title}</h3>
            <div className="space-y-4">
              {benefitsData.benefits.map((benefit, i) => (
                <div key={i} className="flex gap-4">
                  <div className="text-2xl">{benefit.icon}</div>
                  <div>
                    <h4 className="font-semibold">{benefit.title}</h4>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'orderBump':
        const bumpData = block.data as OrderBumpBlockData
        return (
          <div className="rounded-xl border-2 border-yellow-400 bg-yellow-50 p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                defaultChecked={bumpData.isCheckedByDefault}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600"
                onClick={(e) => e.stopPropagation()}
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
          </div>
        )

      case 'testimonial':
        const testimonialData = block.data as TestimonialBlockData
        return (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            {testimonialData.testimonials.map((testimonial, i) => (
              <div key={i}>
                <div className="mb-3 flex gap-1">
                  {[...Array(5)].map((_, j) => (
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
                  {testimonial.imageUrl && <div className="h-10 w-10 rounded-full bg-gray-200" />}
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    {testimonial.title && (
                      <p className="text-sm text-gray-500">{testimonial.title}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )

      case 'guarantee':
        const guaranteeData = block.data as GuaranteeBlockData
        return (
          <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
            <Shield className="mx-auto mb-3 h-12 w-12 text-green-600" />
            {guaranteeData.badge && (
              <span className="mb-3 inline-block rounded-full bg-green-600 px-3 py-1 text-sm font-medium text-white">
                {guaranteeData.badge}
              </span>
            )}
            <h3 className="mb-2 text-xl font-bold">{guaranteeData.title}</h3>
            <p className="text-gray-700">{guaranteeData.description}</p>
          </div>
        )

      case 'faq':
        const faqData = block.data as FAQBlockData
        return (
          <div className="rounded-xl bg-white p-6">
            <h3 className="mb-4 text-xl font-bold">{faqData.title}</h3>
            <div className="space-y-3">
              {faqData.faqs.map((faq, i) => (
                <details key={i} className="group">
                  <summary className="cursor-pointer font-medium transition-colors hover:text-blue-600">
                    {faq.question}
                  </summary>
                  <p className="mt-2 pl-4 text-gray-600">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        )

      case 'countdown':
        const countdownData = block.data as CountdownBlockData
        return (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="mb-3 font-semibold">{countdownData.title}</p>
            <div className="flex justify-center gap-3">
              {countdownData.showDays && (
                <div className="rounded-lg bg-white p-3">
                  <div className="text-2xl font-bold">00</div>
                  <div className="text-xs text-gray-500">Days</div>
                </div>
              )}
              {countdownData.showHours && (
                <div className="rounded-lg bg-white p-3">
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-xs text-gray-500">Hours</div>
                </div>
              )}
              {countdownData.showMinutes && (
                <div className="rounded-lg bg-white p-3">
                  <div className="text-2xl font-bold">34</div>
                  <div className="text-xs text-gray-500">Mins</div>
                </div>
              )}
              {countdownData.showSeconds && (
                <div className="rounded-lg bg-white p-3">
                  <div className="text-2xl font-bold">56</div>
                  <div className="text-xs text-gray-500">Secs</div>
                </div>
              )}
            </div>
          </div>
        )

      case 'payment':
        const paymentData = block.data as PaymentBlockData
        return (
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="space-y-6">
              {/* Express Checkout / Digital Wallet Buttons (when enabled) */}
              {paymentData.enableWallets && (
                <>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                      <div className="text-center">
                        <p className="mb-1 text-sm font-medium text-gray-700">Express Checkout</p>
                        <p className="text-xs text-gray-500">
                          Payment buttons will display based on your browser:
                        </p>
                        <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
                          <span className="rounded bg-black px-2 py-1 text-white">Apple Pay</span>
                          <span className="rounded bg-blue-500 px-2 py-1 text-white">
                            Google Pay
                          </span>
                          <span className="rounded bg-orange-500 px-2 py-1 text-white">
                            Amazon Pay
                          </span>
                          <span className="rounded bg-purple-500 px-2 py-1 text-white">Link</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-3 text-gray-500">Or pay with card</span>
                    </div>
                  </div>
                </>
              )}

              {/* Stripe Link Email (when enabled) */}
              {paymentData.enableStripeLink !== false && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <span className="text-xs font-medium text-blue-600">Link</span>
                  </div>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                    placeholder="john@example.com"
                    defaultValue="john@example.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">Save your info for 1-click checkout</p>
                </div>
              )}

              {/* Payment Element Mockup */}
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-4 flex items-center gap-3">
                  <button className="flex items-center gap-2 rounded-lg border-2 border-blue-500 bg-blue-50 px-3 py-2 text-sm font-medium">
                    <CreditCard className="h-4 w-4" />
                    Card
                  </button>
                  <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600">
                    Bank
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Card information
                    </label>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-12"
                          placeholder="1234 5678 9012 3456"
                          defaultValue="1234 5678 9012 3456"
                        />
                        <div className="absolute top-1/2 right-3 flex -translate-y-1/2 gap-1">
                          <div className="flex h-5 w-8 items-center justify-center rounded bg-blue-600 text-xs font-bold text-white">
                            VISA
                          </div>
                          <CreditCard className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          className="rounded-lg border border-gray-300 px-3 py-2"
                          placeholder="MM / YY"
                          defaultValue="MM / YY"
                        />
                        <input
                          type="text"
                          className="rounded-lg border border-gray-300 px-3 py-2"
                          placeholder="CVC"
                          defaultValue="CVC"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Cardholder name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="John Doe"
                      defaultValue="John Doe"
                    />
                  </div>

                  {/* Phone (if enabled) */}
                  {paymentData.showPhoneField && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Phone number
                      </label>
                      <input
                        type="tel"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Billing Address (if enabled) */}
              {paymentData.showBillingAddress && (
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-3 text-sm font-medium text-gray-700">Billing address</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="Address line 1"
                      defaultValue="123 Main St"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        className="rounded-lg border border-gray-300 px-3 py-2"
                        placeholder="City"
                        defaultValue="City"
                      />
                      <input
                        type="text"
                        className="rounded-lg border border-gray-300 px-3 py-2"
                        placeholder="State"
                        defaultValue="State"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Company & VAT (if enabled) */}
              {paymentData.showCompanyField && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Company {paymentData.collectVAT && '& VAT Number'}
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder={
                      paymentData.collectVAT ? 'Company Name / VAT Number' : 'Company Name'
                    }
                  />
                </div>
              )}

              {/* Coupon Field (if enabled) */}
              {paymentData.enableCoupons && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="Enter code"
                    />
                    <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
                      Apply
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
                <CreditCard className="mr-2 inline h-5 w-5" />
                {paymentData.buttonText || 'Complete Purchase'}
              </button>

              {/* Security & Trust */}
              <div className="space-y-3">
                {/* Security Text */}
                <p className="text-center text-xs text-gray-500">
                  <Shield className="mr-1 inline h-4 w-4" />
                  {paymentData.secureText || 'Your payment is secured with 256-bit SSL encryption'}
                </p>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Shield className="h-5 w-5" />
                    <span>PCI DSS</span>
                  </div>
                  <div className="text-xs text-gray-400">Powered by Stripe</div>
                </div>

                {/* Money Back Guarantee (if enabled) */}
                {paymentData.showGuarantee && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                    <p className="text-sm font-medium text-green-900">
                      {paymentData.guaranteeText || '30-Day Money Back Guarantee'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="rounded-lg bg-gray-100 p-4 text-gray-600">
            <p className="font-medium">Unknown block type: {block.type}</p>
          </div>
        )
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isDragging ? 0.5 : block.visible ? 1 : 0.5,
        y: 0,
        scale: isSelected ? 1.02 : 1,
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative w-full cursor-pointer transition-all duration-200',
        isSelected && 'z-10'
      )}
      onClick={onSelect}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-xl transition-all',
          isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:shadow-lg',
          !block.visible && 'opacity-60'
        )}
      >
        {/* Drag Handle Overlay */}
        <div
          className="absolute top-2 left-2 z-20 cursor-move rounded-lg bg-white/90 p-2 opacity-0 shadow-lg backdrop-blur transition-opacity group-hover:opacity-100"
          {...dragAttributes}
          {...dragListeners}
        >
          <GripVertical className="h-4 w-4 text-gray-600" />
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex rounded-lg bg-white/90 shadow-lg backdrop-blur">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMoveUp()
              }}
              disabled={!canMoveUp}
              className="rounded-l-lg p-2 transition-colors hover:bg-gray-100 disabled:opacity-30"
              title="Move up"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMoveDown()
              }}
              disabled={!canMoveDown}
              className="p-2 transition-colors hover:bg-gray-100 disabled:opacity-30"
              title="Move down"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleVisibility()
              }}
              className="p-2 transition-colors hover:bg-gray-100"
              title={block.visible ? 'Hide' : 'Show'}
            >
              {block.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            {onToggleColumn && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleColumn()
                }}
                className="p-2 transition-colors hover:bg-gray-100"
                title={`Move to ${block.column === 'right' ? 'left' : 'right'} column`}
              >
                <Columns2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDuplicate()
              }}
              className="p-2 transition-colors hover:bg-gray-100"
              title="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="rounded-r-lg p-2 text-red-500 transition-colors hover:bg-red-50"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={cn('transition-all', !block.visible && 'grayscale')}>{renderContent()}</div>
      </div>
    </motion.div>
  )
}

// Helper to generate unique IDs
export function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
