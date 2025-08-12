'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { 
  Type, ShoppingCart, Gift, Star, Shield, CreditCard, 
  Check, ChevronUp, ChevronDown, Copy, Trash2, Eye, EyeOff,
  GripVertical, FileText, Clock, Columns2
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

export interface HeaderBlockData {
  title: string
  subtitle: string
  showImage?: boolean
  imageUrl?: string
}

export interface ProductBlockData {
  name: string
  description: string
  price: string
  comparePrice?: string
  type: 'onetime' | 'subscription' | 'payment-plan'
  features: string[]
  imageUrl?: string
  badge?: string
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
  | ProductBlockData
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
export const blockTemplates: Record<BlockType, { data: BlockData, icon: React.ReactNode, name: string, description: string }> = {
  header: {
    data: {
      title: 'Sikr Din Drømmebolig i København',
      subtitle: 'Eksklusiv ejendomsinvestering med 12% årligt afkast',
      showImage: false,
    } as HeaderBlockData,
    icon: <Type className="w-5 h-5" />,
    name: 'Header Section',
    description: 'Title and subtitle'
  },
  product: {
    data: {
      name: 'Dream Home Denmark - Premium Investor Package',
      description: 'Få adgang til off-market ejendomme i København med garanteret afkast. Inkluderer juridisk hjælp, property management og exit-strategi.',
      price: 'DKK 249.000',
      comparePrice: 'DKK 349.000',
      type: 'onetime',
      features: [
        'Adgang til 10+ off-market ejendomme månedligt',
        'Personlig investeringsrådgiver',
        'Gratis juridisk gennemgang af alle handler',
        'Property management i 2 år inkluderet',
        'Garanteret 12% årligt afkast eller pengene tilbage'
      ],
      badge: 'Kun 5 pladser tilbage'
    } as ProductBlockData,
    icon: <ShoppingCart className="w-5 h-5" />,
    name: 'Product Details',
    description: 'Showcase your offer'
  },
  benefits: {
    data: {
      title: 'Derfor Vælger Investorer Os',
      benefits: [
        {
          icon: '🏡',
          title: 'Off-Market Adgang',
          description: 'Ejendomme 20-30% under markedspris'
        },
        {
          icon: '📈',
          title: 'Garanteret Afkast',
          description: 'Minimum 12% årligt eller fuld refundering'
        },
        {
          icon: '🛡️',
          title: 'Juridisk Sikkerhed',
          description: 'Advokat-godkendte handler og kontrakter'
        }
      ]
    } as BenefitsBlockData,
    icon: <Check className="w-5 h-5" />,
    name: 'Benefits List',
    description: 'Feature highlights'
  },
  orderBump: {
    data: {
      title: '🎁 Tilføj VIP Property Tour (Spar 50%)',
      description: 'Få en personlig tour af 5 premium ejendomme i København med vores ekspert. Normalpris DKK 19.900',
      price: 'DKK 9.900',
      comparePrice: 'DKK 19.900',
      isCheckedByDefault: false
    } as OrderBumpBlockData,
    icon: <Gift className="w-5 h-5" />,
    name: 'Order Bump',
    description: 'Increase order value'
  },
  testimonial: {
    data: {
      testimonials: [
        {
          author: 'Lars Nielsen',
          title: 'Investor, København',
          content: 'Jeg har købt 3 ejendomme gennem Dream Home Denmark. Afkastet har været over 15% årligt, og deres team håndterer alt det praktiske.',
          rating: 5,
        }
      ],
      layout: 'single'
    } as TestimonialBlockData,
    icon: <Star className="w-5 h-5" />,
    name: 'Testimonials',
    description: 'Social proof'
  },
  guarantee: {
    data: {
      title: '90-Dages Fuld Tilfredshedsgaranti',
      description: 'Hvis du ikke finder mindst én rentabel ejendom inden for 90 dage, får du alle dine penge tilbage - ingen spørgsmål stillet.',
      days: 90,
      badge: '100% Risikofrit'
    } as GuaranteeBlockData,
    icon: <Shield className="w-5 h-5" />,
    name: 'Guarantee',
    description: 'Build trust'
  },
  faq: {
    data: {
      title: 'Ofte Stillede Spørgsmål',
      faqs: [
        {
          question: 'Hvordan finder I ejendomme under markedspris?',
          answer: 'Vi har et netværk af 200+ ejendomsmæglere og får adgang til ejendomme før de kommer på markedet. Vores AI-system analyserer 10.000+ ejendomme dagligt.'
        },
        {
          question: 'Hvad hvis jeg ikke finder den rigtige ejendom?',
          answer: 'Du har 90 dages fuld returret. Hvis du ikke finder mindst én rentabel ejendom, får du alle dine penge tilbage.'
        },
        {
          question: 'Kan jeg bruge programmet som førstegangskøber?',
          answer: 'Absolut! 40% af vores medlemmer er førstegangskøbere. Vi hjælper med alt fra finansiering til juridisk rådgivning.'
        }
      ]
    } as FAQBlockData,
    icon: <FileText className="w-5 h-5" />,
    name: 'FAQ Section',
    description: 'Answer questions'
  },
  countdown: {
    data: {
      title: 'Early Bird Tilbud Udløber Om:',
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true
    } as CountdownBlockData,
    icon: <Clock className="w-5 h-5" />,
    name: 'Countdown Timer',
    description: 'Create urgency'
  },
  payment: {
    data: {
      showBillingAddress: true,
      showCompanyField: false,
      showPhoneField: true,
      buttonText: 'Gennemfør Køb - DKK 249.000',
      secureText: 'Din betaling er sikret med 256-bit SSL kryptering'
    } as PaymentBlockData,
    icon: <CreditCard className="w-5 h-5" />,
    name: 'Payment Form',
    description: 'Collect payment'
  }
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
  dragListeners
}: CanvasBlockProps) {
  const template = blockTemplates[block.type]
  
  // Handle unknown block types
  if (!template) {
    console.warn(`Unknown block type: ${block.type}`)
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
        <p className="font-medium">Unknown block type: {block.type}</p>
        <button
          onClick={onDelete}
          className="mt-2 text-sm underline hover:no-underline"
        >
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
        scale: isSelected ? 1.02 : 1
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative group transition-all duration-200 cursor-pointer w-full",
        isSelected && "z-10"
      )}
      onClick={onSelect}
    >
      <div className={cn(
        "relative overflow-hidden rounded-xl border-2 transition-all w-full",
        isSelected 
          ? "border-blue-500 shadow-lg shadow-blue-500/20" 
          : "border-gray-200 hover:border-gray-300 hover:shadow-md",
        !block.visible && "opacity-60"
      )}>
        {/* Drag Handle */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-8 bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
          {...dragAttributes}
          {...dragListeners}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        
        {/* Content */}
        <div className="pl-10 pr-4 py-4 bg-white w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={cn(
                "p-2 rounded-lg",
                isSelected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
              )}>
                {template.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{template.name}</h3>
                <p className="text-xs text-gray-500 truncate">{getBlockPreview(block)}</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                disabled={!canMoveUp}
                className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors"
                title="Move up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
                disabled={!canMoveDown}
                className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-30 transition-colors"
                title="Move down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title={block.visible ? "Hide" : "Show"}
              >
                {block.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              {onToggleColumn && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleColumn(); }}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  title={`Move to ${block.column === 'right' ? 'left' : 'right'} column`}
                >
                  <Columns2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title="Duplicate"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
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
      const productData = block.data as ProductBlockData
      return `${productData.name} - ${productData.price}`
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
  dragListeners
}: WYSIWYGBlockProps) {
  const renderContent = () => {
    // Apply custom styles if provided
    const customStyles: React.CSSProperties = block.styles ? {
      padding: block.styles.padding,
      margin: block.styles.margin,
      background: block.styles.backgroundType === 'gradient' ? block.styles.background : block.styles.background,
      borderRadius: block.styles.borderRadius,
      borderColor: block.styles.borderColor,
      borderWidth: block.styles.borderWidth,
      borderStyle: block.styles.borderWidth ? 'solid' : undefined,
      boxShadow: block.styles.shadow,
      color: block.styles.textColor,
      fontSize: block.styles.fontSize,
      fontWeight: block.styles.fontWeight as React.CSSProperties['fontWeight'],
    } : {}

    switch (block.type) {
      case 'header':
        const headerData = block.data as HeaderBlockData
        const defaultHeaderStyle = !block.styles?.background ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' : ''
        return (
          <div 
            className={cn("text-center py-8 px-6 rounded-t-xl", defaultHeaderStyle)}
            style={customStyles}
          >
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: block.styles?.titleColor }}
            >
              {headerData.title}
            </h1>
            <p 
              className="text-lg opacity-90"
              style={{ color: block.styles?.subtitleColor }}
            >
              {headerData.subtitle}
            </p>
          </div>
        )
      
      case 'product':
        const productData = block.data as ProductBlockData
        const defaultProductStyle = !block.styles?.background ? 'bg-white border border-gray-200 shadow-sm' : ''
        return (
          <div 
            className={cn("rounded-xl p-6", defaultProductStyle)}
            style={customStyles}
          >
            {productData.badge && (
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-4">
                {productData.badge}
              </span>
            )}
            <h2 className="text-2xl font-bold mb-2">{productData.name}</h2>
            <p className="text-gray-600 mb-4">{productData.description}</p>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-blue-600">{productData.price}</span>
              {productData.comparePrice && (
                <span className="text-lg text-gray-400 line-through">{productData.comparePrice}</span>
              )}
              {productData.type === 'subscription' && <span className="text-gray-500">/month</span>}
            </div>
            <ul className="space-y-2">
              {productData.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      
      case 'benefits':
        const benefitsData = block.data as BenefitsBlockData
        return (
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">{benefitsData.title}</h3>
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
          <div className="border-2 border-yellow-400 bg-yellow-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                defaultChecked={bumpData.isCheckedByDefault}
                className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300"
                onClick={(e) => e.stopPropagation()}
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
          </div>
        )
      
      case 'testimonial':
        const testimonialData = block.data as TestimonialBlockData
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
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
                  {testimonial.imageUrl && (
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  )}
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
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
            {guaranteeData.badge && (
              <span className="inline-block px-3 py-1 bg-green-600 text-white text-sm font-medium rounded-full mb-3">
                {guaranteeData.badge}
              </span>
            )}
            <h3 className="text-xl font-bold mb-2">{guaranteeData.title}</h3>
            <p className="text-gray-700">{guaranteeData.description}</p>
          </div>
        )
      
      case 'faq':
        const faqData = block.data as FAQBlockData
        return (
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">{faqData.title}</h3>
            <div className="space-y-3">
              {faqData.faqs.map((faq, i) => (
                <details key={i} className="group">
                  <summary className="cursor-pointer font-medium hover:text-blue-600 transition-colors">
                    {faq.question}
                  </summary>
                  <p className="mt-2 text-gray-600 pl-4">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        )
      
      case 'countdown':
        const countdownData = block.data as CountdownBlockData
        return (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="font-semibold mb-3">{countdownData.title}</p>
            <div className="flex justify-center gap-3">
              {countdownData.showDays && (
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold">00</div>
                  <div className="text-xs text-gray-500">Days</div>
                </div>
              )}
              {countdownData.showHours && (
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-xs text-gray-500">Hours</div>
                </div>
              )}
              {countdownData.showMinutes && (
                <div className="bg-white rounded-lg p-3">
                  <div className="text-2xl font-bold">34</div>
                  <div className="text-xs text-gray-500">Mins</div>
                </div>
              )}
              {countdownData.showSeconds && (
                <div className="bg-white rounded-lg p-3">
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
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="space-y-6">
              {/* Apple Pay / Google Pay Buttons (when enabled) */}
              {paymentData.enableWallets && (
                <>
                  <div className="space-y-3">
                    <button className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors shadow-sm">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      <span>Pay</span>
                    </button>
                    <button className="w-full bg-white border border-gray-300 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Pay</span>
                    </button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white text-gray-500">Or pay with card</span>
                    </div>
                  </div>
                </>
              )}

              {/* Stripe Link Email (when enabled) */}
              {paymentData.enableStripeLink !== false && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <span className="text-xs text-blue-600 font-medium">Link</span>
                  </div>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white" 
                    placeholder="john@example.com"
                    defaultValue="john@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Save your info for 1-click checkout</p>
                </div>
              )}
              
              {/* Payment Element Mockup */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <button className="flex items-center gap-2 px-3 py-2 border-2 border-blue-500 bg-blue-50 rounded-lg text-sm font-medium">
                    <CreditCard className="w-4 h-4" />
                    Card
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">
                    Bank
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Card information</label>
                    <div className="space-y-3">
                      <div className="relative">
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg" 
                          placeholder="1234 5678 9012 3456"
                          defaultValue="1234 5678 9012 3456"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                          <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                            VISA
                          </div>
                          <CreditCard className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          type="text" 
                          className="px-3 py-2 border border-gray-300 rounded-lg" 
                          placeholder="MM / YY"
                          defaultValue="MM / YY"
                        />
                        <input 
                          type="text" 
                          className="px-3 py-2 border border-gray-300 rounded-lg" 
                          placeholder="CVC"
                          defaultValue="CVC"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                      placeholder="John Doe"
                      defaultValue="John Doe"
                    />
                  </div>
                  
                  {/* Phone (if enabled) */}
                  {paymentData.showPhoneField && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                      <input 
                        type="tel" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Billing Address (if enabled) */}
              {paymentData.showBillingAddress && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Billing address</h3>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                      placeholder="Address line 1"
                      defaultValue="123 Main St"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        className="px-3 py-2 border border-gray-300 rounded-lg" 
                        placeholder="City"
                        defaultValue="City"
                      />
                      <input 
                        type="text" 
                        className="px-3 py-2 border border-gray-300 rounded-lg" 
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company {paymentData.collectVAT && '& VAT Number'}
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                    placeholder={paymentData.collectVAT ? "Company Name / VAT Number" : "Company Name"}
                  />
                </div>
              )}
              
              {/* Coupon Field (if enabled) */}
              {paymentData.enableCoupons && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" 
                      placeholder="Enter code"
                    />
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                      Apply
                    </button>
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              <button className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                <CreditCard className="w-5 h-5 inline mr-2" />
                {paymentData.buttonText || 'Complete Purchase'}
              </button>
              
              {/* Security & Trust */}
              <div className="space-y-3">
                {/* Security Text */}
                <p className="text-xs text-center text-gray-500">
                  <Shield className="w-4 h-4 inline mr-1" />
                  {paymentData.secureText || 'Your payment is secured with 256-bit SSL encryption'}
                </p>
                
                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Shield className="w-5 h-5" />
                    <span>PCI DSS</span>
                  </div>
                  <div className="text-xs text-gray-400">Powered by Stripe</div>
                </div>
                
                {/* Money Back Guarantee (if enabled) */}
                {paymentData.showGuarantee && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
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
          <div className="p-4 bg-gray-100 rounded-lg text-gray-600">
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
        scale: isSelected ? 1.02 : 1
      }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative group transition-all duration-200 cursor-pointer w-full",
        isSelected && "z-10"
      )}
      onClick={onSelect}
    >
      <div className={cn(
        "relative overflow-hidden rounded-xl transition-all w-full",
        isSelected 
          ? "ring-2 ring-blue-500 ring-offset-2" 
          : "hover:shadow-lg",
        !block.visible && "opacity-60"
      )}>
        {/* Drag Handle Overlay */}
        <div 
          className="absolute left-2 top-2 z-20 bg-white/90 backdrop-blur rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move shadow-lg"
          {...dragAttributes}
          {...dragListeners}
        >
          <GripVertical className="w-4 h-4 text-gray-600" />
        </div>
        
        {/* Action Buttons Overlay */}
        <div className="absolute right-2 top-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 backdrop-blur rounded-lg shadow-lg flex">
            <button
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
              disabled={!canMoveUp}
              className="p-2 hover:bg-gray-100 rounded-l-lg disabled:opacity-30 transition-colors"
              title="Move up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
              disabled={!canMoveDown}
              className="p-2 hover:bg-gray-100 disabled:opacity-30 transition-colors"
              title="Move down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
              className="p-2 hover:bg-gray-100 transition-colors"
              title={block.visible ? "Hide" : "Show"}
            >
              {block.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            {onToggleColumn && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleColumn(); }}
                className="p-2 hover:bg-gray-100 transition-colors"
                title={`Move to ${block.column === 'right' ? 'left' : 'right'} column`}
              >
                <Columns2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="p-2 hover:bg-gray-100 transition-colors"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-2 hover:bg-red-50 text-red-500 rounded-r-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className={cn(
          "transition-all",
          !block.visible && "grayscale"
        )}>
          {renderContent()}
        </div>
      </div>
    </motion.div>
  )
}

// Helper to generate unique IDs
export function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}