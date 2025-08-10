'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { 
  Type, ShoppingCart, Gift, Star, Shield, CreditCard, 
  Check, ChevronUp, ChevronDown, Copy, Trash2, Eye, EyeOff,
  GripVertical, FileText, Clock
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
}

// Block Templates
export const blockTemplates: Record<BlockType, { data: BlockData, icon: React.ReactNode, name: string, description: string }> = {
  header: {
    data: {
      title: 'Complete Your Order',
      subtitle: 'You\'re one step away from transforming your business',
      showImage: false,
    } as HeaderBlockData,
    icon: <Type className="w-5 h-5" />,
    name: 'Header Section',
    description: 'Title and subtitle'
  },
  product: {
    data: {
      name: 'Premium Course Bundle',
      description: 'Everything you need to master the skills and grow your business to the next level.',
      price: '$497',
      comparePrice: '$997',
      type: 'onetime',
      features: [
        'Lifetime access to all content',
        'Weekly live coaching calls',
        'Private community access',
        'Certificate of completion'
      ],
      badge: 'Most Popular'
    } as ProductBlockData,
    icon: <ShoppingCart className="w-5 h-5" />,
    name: 'Product Details',
    description: 'Showcase your offer'
  },
  benefits: {
    data: {
      title: 'What You\'ll Get',
      benefits: [
        {
          icon: '🎯',
          title: 'Clear Strategy',
          description: 'Step-by-step roadmap to success'
        },
        {
          icon: '⚡',
          title: 'Fast Results',
          description: 'See improvements in just 30 days'
        },
        {
          icon: '🤝',
          title: 'Expert Support',
          description: 'Direct access to industry experts'
        }
      ]
    } as BenefitsBlockData,
    icon: <Check className="w-5 h-5" />,
    name: 'Benefits List',
    description: 'Feature highlights'
  },
  orderBump: {
    data: {
      title: '🎁 Wait! Add This Special Offer',
      description: 'Get our exclusive templates pack for 50% off - only available with this order!',
      price: '$47',
      comparePrice: '$97',
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
          author: 'Sarah Johnson',
          title: 'CEO at TechStart',
          content: 'This course completely transformed how I approach my business. The strategies are practical and the results speak for themselves.',
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
      title: '30-Day Money-Back Guarantee',
      description: 'Try the course risk-free. If you\'re not completely satisfied, get a full refund within 30 days.',
      days: 30,
      badge: '100% Risk-Free'
    } as GuaranteeBlockData,
    icon: <Shield className="w-5 h-5" />,
    name: 'Guarantee',
    description: 'Build trust'
  },
  faq: {
    data: {
      title: 'Frequently Asked Questions',
      faqs: [
        {
          question: 'How long do I have access?',
          answer: 'You get lifetime access to all course materials, including future updates.'
        },
        {
          question: 'Is there a refund policy?',
          answer: 'Yes! We offer a 30-day money-back guarantee. No questions asked.'
        }
      ]
    } as FAQBlockData,
    icon: <FileText className="w-5 h-5" />,
    name: 'FAQ Section',
    description: 'Answer questions'
  },
  countdown: {
    data: {
      title: 'Limited Time Offer Ends In:',
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
      showPhoneField: false,
      buttonText: 'Complete Purchase',
      secureText: 'Your payment information is secure and encrypted'
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
  onMoveUp: () => void
  onMoveDown: () => void
  canMoveUp: boolean
  canMoveDown: boolean
  isDragging?: boolean
}

export function CanvasBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  isDragging
}: CanvasBlockProps) {
  const template = blockTemplates[block.type]
  
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
        "relative group transition-all duration-200 cursor-pointer",
        isSelected && "z-10"
      )}
      onClick={onSelect}
    >
      <div className={cn(
        "relative overflow-hidden rounded-xl border-2 transition-all",
        isSelected 
          ? "border-blue-500 shadow-lg shadow-blue-500/20" 
          : "border-gray-200 hover:border-gray-300 hover:shadow-md",
        !block.visible && "opacity-60"
      )}>
        {/* Drag Handle */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        
        {/* Content */}
        <div className="pl-10 pr-4 py-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                isSelected ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
              )}>
                {template.icon}
              </div>
              <div>
                <h3 className="font-medium text-sm">{template.name}</h3>
                <p className="text-xs text-gray-500">{getBlockPreview(block)}</p>
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

// Helper to generate unique IDs
export function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}