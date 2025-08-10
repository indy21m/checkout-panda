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

export interface Block {
  id: string
  type: BlockType
  data: BlockData
  visible: boolean
  column?: 'left' | 'right'
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
    switch (block.type) {
      case 'header':
        const headerData = block.data as HeaderBlockData
        return (
          <div className="text-center py-8 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
            <h1 className="text-3xl font-bold mb-2">{headerData.title}</h1>
            <p className="text-lg opacity-90">{headerData.subtitle}</p>
          </div>
        )
      
      case 'product':
        const productData = block.data as ProductBlockData
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
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
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Card Information</label>
                <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <CreditCard className="w-6 h-6 text-gray-400 inline mr-2" />
                  <span className="text-gray-500">•••• •••• •••• ••••</span>
                </div>
              </div>
              {paymentData.showBillingAddress && (
                <div>
                  <label className="block text-sm font-medium mb-1">Billing Address</label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="123 Main St" />
                </div>
              )}
              <button className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                {paymentData.buttonText}
              </button>
              <p className="text-xs text-center text-gray-500">
                <Shield className="w-4 h-4 inline mr-1" />
                {paymentData.secureText}
              </p>
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