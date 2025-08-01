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
  Image,
  Zap,
  Gift,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { cn } from '@/lib/utils'

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
    icon: <Image className="h-5 w-5" aria-hidden="true" />,
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

interface BlockLibraryProps {
  onAddBlock: (type: string) => void
}

export function BlockLibrary({ onAddBlock }: BlockLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

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
    return matchesSearch && matchesCategory
  })

  return (
    <div className="h-full overflow-y-auto border-r bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-4 text-lg font-semibold">Block Library</h2>

      {/* Search */}
      <Input
        placeholder="Search blocks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
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
          <Card
            key={block.id}
            className={cn(
              'cursor-pointer p-4 transition-all hover:shadow-md',
              block.pro && 'relative overflow-hidden'
            )}
            onClick={() => !block.pro && onAddBlock(block.id)}
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
                <h3 className="font-medium">{block.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{block.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredBlocks.length === 0 && (
        <div className="py-8 text-center text-gray-500">No blocks found matching your search</div>
      )}
    </div>
  )
}
