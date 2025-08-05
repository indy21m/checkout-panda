'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sparkles,
  Wand2,
  Layout,
  ShoppingCart,
  Rocket,
  Gift,
  BookOpen,
  Star,
  Search,
  ChevronRight,
  Users,
  Check,
  Loader2,
  Eye,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Section } from '@/types/builder'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Template {
  id: string
  name: string
  description: string
  category: string
  icon: React.ComponentType<{ className?: string }>
  tags: string[]
  popularity: number
  conversionRate?: number
  sections: Section[]
  preview?: string
  color: string
}

interface SmartTemplatesProps {
  onApplyTemplate: (sections: Section[]) => void
  productType?: string
}

const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: Layout },
  { id: 'ecommerce', name: 'E-commerce', icon: ShoppingCart },
  { id: 'saas', name: 'SaaS', icon: Rocket },
  { id: 'course', name: 'Courses', icon: BookOpen },
  { id: 'coaching', name: 'Coaching', icon: Users },
  { id: 'digital', name: 'Digital Products', icon: Gift },
]

const SMART_TEMPLATES: Template[] = [
  {
    id: 'high-converting-saas',
    name: 'High-Converting SaaS',
    description: 'Optimized for software products with free trial offers',
    category: 'saas',
    icon: Rocket,
    tags: ['conversion', 'trial', 'software'],
    popularity: 95,
    conversionRate: 12.5,
    color: 'from-blue-500 to-purple-600',
    sections: [], // Would contain actual section data
  },
  {
    id: 'course-launch-pro',
    name: 'Course Launch Pro',
    description: 'Perfect for online course creators with bonuses',
    category: 'course',
    icon: BookOpen,
    tags: ['education', 'bonus', 'testimonials'],
    popularity: 88,
    conversionRate: 15.2,
    color: 'from-green-500 to-teal-600',
    sections: [],
  },
  {
    id: 'premium-coaching',
    name: 'Premium Coaching',
    description: 'High-ticket coaching program checkout',
    category: 'coaching',
    icon: Star,
    tags: ['high-ticket', 'consultation', 'premium'],
    popularity: 76,
    conversionRate: 8.9,
    color: 'from-purple-500 to-pink-600',
    sections: [],
  },
  {
    id: 'digital-download',
    name: 'Digital Download Express',
    description: 'Quick checkout for digital products',
    category: 'digital',
    icon: Download,
    tags: ['simple', 'fast', 'digital'],
    popularity: 82,
    conversionRate: 18.3,
    color: 'from-orange-500 to-red-600',
    sections: [],
  },
  {
    id: 'ecommerce-bundle',
    name: 'E-commerce Bundle Master',
    description: 'Upsells and bundles for physical products',
    category: 'ecommerce',
    icon: ShoppingCart,
    tags: ['bundle', 'upsell', 'physical'],
    popularity: 90,
    conversionRate: 11.7,
    color: 'from-indigo-500 to-blue-600',
    sections: [],
  },
]

export function SmartTemplates({ onApplyTemplate }: SmartTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)

  const filteredTemplates = SMART_TEMPLATES.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  }).sort((a, b) => b.popularity - a.popularity)

  const handleApplyTemplate = async (template: Template) => {
    setIsGenerating(true)

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real implementation, this would generate sections based on the template
    // and potentially use AI to customize content
    onApplyTemplate(template.sections)

    setIsGenerating(false)
    setIsOpen(false)
    setSelectedTemplate(null)
  }

  const handleAiGenerate = async () => {
    setIsGenerating(true)

    // Simulate AI analysis and generation
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // In a real implementation, this would analyze the product type
    // and generate a custom template using AI
    const aiGeneratedSections: Section[] = []
    onApplyTemplate(aiGeneratedSections)

    setIsGenerating(false)
    setIsOpen(false)
  }

  return (
    <>
      {/* Trigger Button */}
      <Button onClick={() => setIsOpen(true)} className="gap-2" variant="secondary">
        <Sparkles className="h-4 w-4" />
        Smart Templates
      </Button>

      {/* Templates Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[85vh] max-w-6xl overflow-hidden p-0">
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 border-r bg-gray-50 p-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Smart Templates
                </DialogTitle>
                <DialogDescription>AI-powered templates optimized for conversion</DialogDescription>
              </DialogHeader>

              {/* AI Generate Section */}
              <div className="mt-6 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">AI Template Generator</span>
                </div>
                <p className="mb-3 text-xs text-gray-600">
                  Let AI create a custom template based on your product
                </p>
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleAiGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate Template
                    </>
                  )}
                </Button>
              </div>

              {/* Categories */}
              <div className="mt-6 space-y-1">
                <h3 className="mb-2 text-sm font-medium text-gray-700">Categories</h3>
                {TEMPLATE_CATEGORIES.map((category) => {
                  const Icon = category.icon
                  const count =
                    category.id === 'all'
                      ? SMART_TEMPLATES.length
                      : SMART_TEMPLATES.filter((t) => t.category === category.id).length

                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                        selectedCategory === category.id
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{category.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{count}</span>
                    </button>
                  )
                })}
              </div>

              {/* Stats */}
              <div className="mt-auto border-t pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Templates Used</span>
                    <span className="font-medium">1,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Avg. Conversion</span>
                    <span className="font-medium text-green-600">+23%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
              {/* Search Header */}
              <div className="border-b p-6">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Templates Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-6">
                  {filteredTemplates.map((template) => {
                    const Icon = template.icon

                    return (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        onHoverStart={() => setHoveredTemplate(template.id)}
                        onHoverEnd={() => setHoveredTemplate(null)}
                        className="group relative cursor-pointer"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white transition-all hover:border-purple-500 hover:shadow-xl">
                          {/* Preview Header */}
                          <div className={cn('h-32 bg-gradient-to-br p-6', template.color)}>
                            <div className="flex items-start justify-between">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <Icon className="h-6 w-6 text-white" />
                              </div>
                              {template.conversionRate && (
                                <Badge
                                  variant="secondary"
                                  className="border-0 bg-white/20 text-white"
                                >
                                  +{template.conversionRate}% CVR
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-6">
                            <h3 className="mb-2 text-lg font-semibold">{template.name}</h3>
                            <p className="mb-4 text-sm text-gray-600">{template.description}</p>

                            {/* Tags */}
                            <div className="mb-4 flex flex-wrap gap-2">
                              {template.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-gray-500">
                                  <Users className="h-4 w-4" />
                                  <span>{template.popularity}% popular</span>
                                </div>
                              </div>

                              <Button size="sm" variant="ghost">
                                Preview <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Hover Actions */}
                          <AnimatePresence>
                            {hoveredTemplate === template.id && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center gap-3 bg-black/80"
                              >
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Preview logic
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Preview
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleApplyTemplate(template)
                                  }}
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Use Template
                                </Button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {filteredTemplates.length === 0 && (
                  <div className="py-12 text-center">
                    <Sparkles className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">No templates found</p>
                    <p className="mt-1 text-sm text-gray-400">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Template Preview Panel */}
            <AnimatePresence>
              {selectedTemplate && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 400, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="overflow-hidden border-l bg-gray-50"
                >
                  <div className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <h3 className="font-semibold">Template Preview</h3>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedTemplate(null)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Template Details */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="mb-2 font-medium">{selectedTemplate.name}</h4>
                        <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                      </div>

                      {/* Sections Preview */}
                      <div>
                        <h5 className="mb-3 text-sm font-medium">Included Sections</h5>
                        <div className="space-y-2">
                          {[
                            'Hero',
                            'Product Details',
                            'Pricing',
                            'Testimonials',
                            'FAQ',
                            'Guarantee',
                          ].map((section) => (
                            <div
                              key={section}
                              className="flex items-center gap-2 rounded-lg bg-white p-3"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100">
                                <Layout className="h-4 w-4 text-gray-600" />
                              </div>
                              <span className="text-sm">{section}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Apply Button */}
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => handleApplyTemplate(selectedTemplate)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Applying Template...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Use This Template
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
