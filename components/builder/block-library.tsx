'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

// Draggable block item
function DraggableBlock({ block }: { block: BlockType }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `new-${block.id}`,
    data: { type: 'new-block', blockType: block.id },
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className={cn(
          'cursor-move p-4 transition-all hover:shadow-md',
          block.pro && 'relative overflow-hidden opacity-60 cursor-not-allowed'
        )}
      >
        {block.pro && (
          <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-pink-500 px-2 py-1 text-xs font-semibold text-white">
            PRO
          </div>
        )}
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'rounded-lg p-2',
              block.category === 'content' && 'bg-blue-100 text-blue-600 dark:bg-blue-900/20',
              block.category === 'commerce' &&
                'bg-green-100 text-green-600 dark:bg-green-900/20',
              block.category === 'social' &&
                'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20',
              block.category === 'utility' &&
                'bg-purple-100 text-purple-600 dark:bg-purple-900/20'
            )}
          >
            {block.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-white">{block.name}</h3>
            <p className="mt-1 text-sm text-gray-400">{block.description}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export function BlockLibrary() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { addBlock } = useBuilderStore()

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

  const getDefaultBlockData = (type: string) => {
    switch (type) {
      case 'hero':
        return {
          headline: 'Welcome to Our Checkout',
          subheadline: 'Complete your purchase in just a few steps',
          backgroundType: 'gradient',
          gradient: { type: 'aurora', animate: true },
        }
      case 'product':
        return {
          layout: 'side-by-side',
          showPricing: true,
          features: [],
        }
      case 'payment':
        return {
          showExpressCheckout: true,
          fields: ['email', 'card'],
        }
      case 'bump':
        return {
          style: 'highlighted',
          animation: 'pulse',
        }
      case 'testimonial':
        return {
          layout: 'carousel',
          autoplay: true,
        }
      case 'trust':
        return {
          badges: ['secure', 'guarantee', 'support'],
        }
      default:
        return {}
    }
  }

  const handleAddBlock = (type: string) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      data: getDefaultBlockData(type),
      styles: {},
      position: 999, // Will be updated based on drop position
    }
    addBlock(newBlock)
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-900 p-6">
      <h2 className="mb-4 text-lg font-semibold text-white">Block Library</h2>

      {/* Search */}
      <Input
        placeholder="Search blocks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 bg-gray-800/50"
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

      {/* Quick Add Button */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <p className="text-sm text-gray-400 mb-3">Or quickly add a block:</p>
        <div className="grid grid-cols-2 gap-2">
          {blockTypes
            .filter((b) => !b.pro)
            .slice(0, 4)
            .map((block) => (
              <Button
                key={block.id}
                variant="secondary"
                size="sm"
                onClick={() => handleAddBlock(block.id)}
                className="justify-start"
              >
                {block.icon}
                <span className="ml-2">{block.name}</span>
              </Button>
            ))}
        </div>
      </div>

      {filteredBlocks.length === 0 && (
        <div className="py-8 text-center text-gray-500">No blocks found matching your search</div>
      )}
    </div>
  )
}