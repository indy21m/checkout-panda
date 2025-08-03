'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  X,
  Zap,
  Crown,
  Rocket,
  Check,
  Edit3,
  Trash2,
  Sparkles,
  AlertCircle,
  MoreVertical,
} from 'lucide-react'
import { api } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { RouterOutputs } from '@/lib/trpc/api'

type Plan = RouterOutputs['product']['getById']['plans'][0]

interface PricingPlanBuilderProps {
  productId?: string
}

const planTemplates = [
  {
    name: 'Basic',
    tier: 'basic' as const,
    icon: Zap,
    color: 'from-blue-500 to-blue-600',
    features: ['Core features', 'Email support', '10 GB storage'],
  },
  {
    name: 'Pro',
    tier: 'pro' as const,
    icon: Crown,
    color: 'from-purple-500 to-purple-600',
    features: ['Everything in Basic', 'Priority support', '100 GB storage', 'Advanced analytics'],
    badge: 'Most Popular',
    isHighlighted: true,
  },
  {
    name: 'Enterprise',
    tier: 'enterprise' as const,
    icon: Rocket,
    color: 'from-orange-500 to-orange-600',
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Unlimited storage',
      'Custom integrations',
      'SLA',
    ],
  },
]

export function PricingPlanBuilder({ productId }: PricingPlanBuilderProps) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [newFeature, setNewFeature] = useState('')
  const [selectedPlanForFeature, setSelectedPlanForFeature] = useState<string | null>(null)

  const utils = api.useUtils()

  // Fetch existing plans
  const { data: product } = api.product.getById.useQuery(
    { id: productId! },
    { enabled: !!productId }
  )

  // Initialize plans from product data
  useState(() => {
    if (product?.plans) {
      setPlans(product.plans)
    }
  })

  const createPlan = api.product.plans.create.useMutation({
    onSuccess: (newPlan) => {
      toast.success('Pricing plan created')
      setPlans([...plans, newPlan])
      utils.product.getById.invalidate({ id: productId })
    },
  })

  const updatePlan = api.product.plans.update.useMutation({
    onSuccess: (updatedPlan) => {
      toast.success('Pricing plan updated')
      setPlans(plans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)))
      utils.product.getById.invalidate({ id: productId })
    },
  })

  const deletePlan = api.product.plans.delete.useMutation({
    onSuccess: (_, { id }) => {
      toast.success('Pricing plan deleted')
      setPlans(plans.filter((p) => p.id !== id))
      utils.product.getById.invalidate({ id: productId })
    },
  })

  const addPlanFromTemplate = (template: (typeof planTemplates)[0]) => {
    if (!productId) {
      // For new products, just add to local state
      const tempPlan: Partial<Plan> = {
        id: `temp-${Date.now()}`,
        name: template.name,
        tier: template.tier,
        price: 0,
        features: template.features,
        badge: template.badge || null,
        isHighlighted: template.isHighlighted || false,
        isRecurring: false,
        sortOrder: plans.length,
      }
      setPlans([...plans, tempPlan as Plan])
    } else {
      createPlan.mutate({
        productId,
        name: template.name,
        tier: template.tier,
        price: 0,
        features: template.features,
        badge: template.badge,
        isHighlighted: template.isHighlighted || false,
        sortOrder: plans.length,
      })
    }
  }

  const addFeatureToPlan = (planId: string) => {
    if (!newFeature.trim()) return

    const plan = plans.find((p) => p.id === planId)
    if (!plan) return

    const updatedFeatures = [...(plan.features || []), newFeature.trim()]

    if (productId && !plan.id.startsWith('temp-')) {
      updatePlan.mutate({
        id: planId,
        features: updatedFeatures,
      })
    } else {
      // Update local state for new products
      setPlans(plans.map((p) => (p.id === planId ? { ...p, features: updatedFeatures } : p)))
    }

    setNewFeature('')
    setSelectedPlanForFeature(null)
  }

  const removeFeatureFromPlan = (planId: string, featureIndex: number) => {
    const plan = plans.find((p) => p.id === planId)
    if (!plan) return

    const updatedFeatures = (plan.features || []).filter((_, i) => i !== featureIndex)

    if (productId && !plan.id.startsWith('temp-')) {
      updatePlan.mutate({
        id: planId,
        features: updatedFeatures,
      })
    } else {
      setPlans(plans.map((p) => (p.id === planId ? { ...p, features: updatedFeatures } : p)))
    }
  }

  const updatePlanField = (planId: string, field: string, value: boolean | string | number) => {
    if (productId && !planId.startsWith('temp-')) {
      updatePlan.mutate({
        id: planId,
        [field]: value,
      })
    } else {
      setPlans(plans.map((p) => (p.id === planId ? { ...p, [field]: value } : p)))
    }
  }

  const removePlan = (planId: string) => {
    if (productId && !planId.startsWith('temp-')) {
      deletePlan.mutate({ id: planId })
    } else {
      setPlans(plans.filter((p) => p.id !== planId))
    }
  }

  if (!productId) {
    return (
      <div className="space-y-6">
        <GlassmorphicCard className="p-8 text-center" variant="light">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-amber-500" />
          <h3 className="mb-2 text-lg font-semibold">Save Product First</h3>
          <p className="text-gray-600">Create the product to start adding pricing plans</p>
        </GlassmorphicCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Plan Templates */}
      {plans.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold">Quick Start Templates</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {planTemplates.map((template) => {
              const Icon = template.icon
              return (
                <motion.button
                  key={template.tier}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addPlanFromTemplate(template)}
                  className="text-left"
                >
                  <GlassmorphicCard
                    className="h-full p-6 transition-shadow hover:shadow-lg"
                    variant="light"
                  >
                    <div
                      className={cn(
                        'mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br',
                        template.color
                      )}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="mb-2 font-semibold">{template.name}</h4>
                    <ul className="space-y-1">
                      {template.features.slice(0, 3).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="h-3 w-3 text-emerald-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </GlassmorphicCard>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Existing Plans */}
      {plans.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Pricing Plans</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const template = planTemplates[plans.length % planTemplates.length]!
                addPlanFromTemplate(template)
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <AnimatePresence>
              {plans.map((plan) => {
                const template = planTemplates.find((t) => t.tier === plan.tier)
                const Icon = template?.icon || Zap
                const color = template?.color || 'from-gray-500 to-gray-600'

                return (
                  <motion.div
                    key={plan.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <GlassmorphicCard
                      className={cn(
                        'relative h-full p-6',
                        plan.isHighlighted && 'ring-primary ring-2'
                      )}
                      variant="light"
                    >
                      {/* Header */}
                      <div className="mb-4 flex items-start justify-between">
                        <div
                          className={cn(
                            'inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br',
                            color
                          )}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingPlan(plan.id)}>
                              <Edit3 className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => removePlan(plan.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Plan
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Plan Name & Badge */}
                      <div className="mb-4">
                        {editingPlan === plan.id ? (
                          <Input
                            value={plan.name}
                            onChange={(e) => updatePlanField(plan.id, 'name', e.target.value)}
                            onBlur={() => setEditingPlan(null)}
                            onKeyPress={(e) => e.key === 'Enter' && setEditingPlan(null)}
                            autoFocus
                            className="font-semibold"
                          />
                        ) : (
                          <h4 className="text-lg font-semibold">{plan.name}</h4>
                        )}
                        {plan.badge && (
                          <span className="bg-primary mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium text-white">
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      {/* Pricing */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">
                            ${(plan.price / 100).toFixed(2)}
                          </span>
                          {plan.isRecurring && (
                            <span className="text-gray-600">/{plan.billingInterval}</span>
                          )}
                        </div>
                        {plan.compareAtPrice && (
                          <p className="text-sm text-gray-500 line-through">
                            ${(plan.compareAtPrice / 100).toFixed(2)}
                          </p>
                        )}
                      </div>

                      {/* Features */}
                      <div className="mb-4 space-y-2">
                        {(plan.features || []).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                            <span className="text-gray-700">{feature}</span>
                            {editingPlan === plan.id && (
                              <button
                                onClick={() => removeFeatureFromPlan(plan.id, index)}
                                className="ml-auto text-gray-400 hover:text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Add Feature */}
                      {selectedPlanForFeature === plan.id ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="New feature..."
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addFeatureToPlan(plan.id)
                              }
                            }}
                            autoFocus
                            className="text-sm"
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => addFeatureToPlan(plan.id)}
                          >
                            Add
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => setSelectedPlanForFeature(plan.id)}
                        >
                          <Plus className="mr-2 h-3 w-3" />
                          Add feature
                        </Button>
                      )}

                      {/* Highlight Toggle */}
                      <div className="mt-4 flex items-center justify-between border-t pt-4">
                        <Label htmlFor={`highlight-${plan.id}`} className="text-sm">
                          Highlight plan
                        </Label>
                        <Switch
                          id={`highlight-${plan.id}`}
                          checked={plan.isHighlighted || false}
                          onCheckedChange={(checked) =>
                            updatePlanField(plan.id, 'isHighlighted', checked)
                          }
                        />
                      </div>
                    </GlassmorphicCard>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Tips */}
      <GlassmorphicCard className="p-6" variant="light">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Pricing Best Practices</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Offer 3 plans maximum to avoid choice paralysis</li>
              <li>• Highlight your most profitable plan to guide customers</li>
              <li>• Use comparative pricing to show value</li>
              <li>• Include a clear feature progression between plans</li>
            </ul>
          </div>
        </div>
      </GlassmorphicCard>
    </div>
  )
}
