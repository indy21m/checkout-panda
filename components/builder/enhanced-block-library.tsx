'use client'

import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import {
  Type,
  ShoppingCart,
  CreditCard,
  Star,
  Shield,
  Layers,
  Image as ImageIcon,
  Zap,
  Gift,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useBuilderStore } from '@/stores/builder-store'
import { useDraggable } from '@dnd-kit/core'

interface BlockType {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'content' | 'commerce' | 'social' | 'utility'
  pro?: boolean
}

const blockTypes: BlockType[] = [
  {
    id: 'hero',
    name: 'Hero Section',
    description: 'Eye-catching header with gradient backgrounds',
    icon: <Type className="h-5 w-5" aria-hidden="true" />,
    category: 'content',
  },
  {
    id: 'product',
    name: 'Product Showcase',
    description: 'Display product details with pricing',
    icon: <ShoppingCart className="h-5 w-5" aria-hidden="true" />,
    category: 'commerce',
  },
  {
    id: 'payment',
    name: 'Payment Form',
    description: 'Secure payment collection with Stripe',
    icon: <CreditCard className="h-5 w-5" aria-hidden="true" />,
    category: 'commerce',
  },
  {
    id: 'bump',
    name: 'Order Bump',
    description: 'Add-on offers to increase order value',
    icon: <Gift className="h-5 w-5" aria-hidden="true" />,
    category: 'commerce',
  },
  {
    id: 'testimonial',
    name: 'Testimonials',
    description: 'Customer reviews and social proof',
    icon: <Star className="h-5 w-5" aria-hidden="true" />,
    category: 'social',
  },
  {
    id: 'trust',
    name: 'Trust Badges',
    description: 'Security and guarantee badges',
    icon: <Shield className="h-5 w-5" aria-hidden="true" />,
    category: 'social',
  },
  {
    id: 'gallery',
    name: 'Image Gallery',
    description: 'Showcase multiple product images',
    icon: <ImageIcon className="h-5 w-5" aria-hidden="true" />,
    category: 'content',
    pro: true,
  },
  {
    id: 'countdown',
    name: 'Countdown Timer',
    description: 'Create urgency with time limits',
    icon: <Zap className="h-5 w-5" aria-hidden="true" />,
    category: 'utility',
    pro: true,
  },
  {
    id: 'faq',
    name: 'FAQ Section',
    description: 'Answer common questions',
    icon: <Layers className="h-5 w-5" aria-hidden="true" />,
    category: 'content',
    pro: true,
  },
]

// Draggable block item for the new structure
function DraggableBlock({ block }: { block: BlockType }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `new-${block.id}`,
    data: { type: 'new-block', blockType: block.id },
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  }

  const iconColors = {
    content: 'from-blue-400 to-blue-600',
    commerce: 'from-emerald-400 to-emerald-600',
    social: 'from-amber-400 to-amber-600',
    utility: 'from-purple-400 to-purple-600',
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <GlassmorphicCard
        className={cn(
          'hover-lift cursor-move p-4',
          block.pro && 'relative cursor-not-allowed opacity-60'
        )}
        variant="light"
        hover
      >
        {block.pro && (
          <div className="absolute top-0 right-0 rounded-bl-lg bg-gradient-to-l from-purple-500 to-pink-500 px-2 py-1 text-xs font-semibold text-white">
            PRO
          </div>
        )}
        <div className="flex items-start gap-3">
          <motion.div
            whileHover={{ rotate: 5 }}
            className={cn('rounded-lg bg-gradient-to-br p-3 shadow-sm', iconColors[block.category])}
          >
            <div className="text-white">{block.icon}</div>
          </motion.div>
          <div className="flex-1">
            <h3 className="text-text font-semibold">{block.name}</h3>
            <p className="text-text-secondary mt-1 text-sm">{block.description}</p>
          </div>
        </div>
      </GlassmorphicCard>
    </motion.div>
  )
}

export function EnhancedBlockLibrary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { sections, selectedType } = useBuilderStore()

  const categories = [
    { id: 'all', name: 'All Blocks' },
    { id: 'content', name: 'Content' },
    { id: 'commerce', name: 'Commerce' },
    { id: 'social', name: 'Social Proof' },
    { id: 'utility', name: 'Utility' },
  ]

  const filteredBlocks = blockTypes.filter((block) => {
    const matchesSearch =
      block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || block.category === selectedCategory
    return matchesSearch && matchesCategory && !block.pro // Hide pro blocks for now
  })

  // const getDefaultBlockData = (type: string) => {
  //   switch (type) {
  //     case 'hero':
  //       return {
  //         headline: 'Welcome to Our Checkout',
  //         subheadline: 'Complete your purchase in just a few steps',
  //         backgroundType: 'gradient',
  //         gradient: { type: 'aurora', animate: true },
  //       }
  //     case 'product':
  //       return {
  //         layout: 'side-by-side',
  //         showPricing: true,
  //         features: [],
  //       }
  //     case 'payment':
  //       return {
  //         showExpressCheckout: true,
  //         fields: ['email', 'card'],
  //       }
  //     case 'bump':
  //       return {
  //         style: 'highlighted',
  //         animation: 'pulse',
  //       }
  //     case 'testimonial':
  //       return {
  //         layout: 'carousel',
  //         autoplay: true,
  //       }
  //     case 'trust':
  //       return {
  //         badges: ['secure', 'guarantee', 'support'],
  //       }
  //     default:
  //       return {}
  //   }
  // }

  // Helper text to guide users
  const getHelperText = () => {
    if (sections.length === 0) {
      return 'Add a section first from the Sections tab'
    }
    if (selectedType === 'column') {
      return 'Drag blocks into the selected column'
    }
    if (selectedType === 'section') {
      return 'Select a column to add blocks'
    }
    return 'Select a column or drag blocks directly onto the canvas'
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-gray-50 to-white p-6">
      <h2 className="text-text mb-4 text-lg font-semibold">Block Library</h2>

      {/* Helper Text */}
      {sections.length === 0 || !selectedType || selectedType !== 'column' ? (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">{getHelperText()}</p>
        </div>
      ) : null}

      {/* Search */}
      <Input
        placeholder="Search blocks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="glass-morphism mb-4"
      />

      {/* Categories */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Block List */}
      <div className="space-y-3">
        {filteredBlocks.map((block) => (
          <DraggableBlock key={block.id} block={block} />
        ))}
      </div>

      {/* Quick Add Instructions */}
      <div className="border-border mt-6 border-t pt-6">
        <p className="text-text-secondary mb-3 text-sm font-medium">How to add blocks:</p>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Switch to the Sections tab and add a section</li>
          <li>Click on a column within the section</li>
          <li>Drag blocks from here into the column</li>
        </ol>
      </div>

      {filteredBlocks.length === 0 && (
        <div className="text-text-tertiary py-8 text-center">
          No blocks found matching your search
        </div>
      )}
    </div>
  )
}