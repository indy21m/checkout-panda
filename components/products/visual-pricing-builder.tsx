'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Plus,
  Trash2,
  Check,
  X,
  Zap,
  Star,
  Crown,
  Rocket,
  Shield,
  Gift,
  Sparkles,
  Settings,
  Copy,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Currency } from '@/lib/currency'
import { formatPrice } from '@/lib/currency'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PricingPlan {
  id: string
  name: string
  description?: string
  price: number
  compareAtPrice?: number
  currency: Currency
  interval?: 'once' | 'month' | 'year'
  features: string[]
  highlighted?: boolean
  badge?: string
  icon?: string
  color?: string
  setupFee?: number
  trialDays?: number
  customFields?: Record<string, string | number | boolean>
}

interface VisualPricingBuilderProps {
  plans: PricingPlan[]
  onChange: (plans: PricingPlan[]) => void
  productName?: string
}

const PLAN_ICONS = [
  { value: 'zap', icon: Zap, label: 'Lightning' },
  { value: 'star', icon: Star, label: 'Star' },
  { value: 'crown', icon: Crown, label: 'Crown' },
  { value: 'rocket', icon: Rocket, label: 'Rocket' },
  { value: 'shield', icon: Shield, label: 'Shield' },
  { value: 'gift', icon: Gift, label: 'Gift' },
]

const PLAN_COLORS = [
  { value: 'purple', label: 'Purple', class: 'from-purple-500 to-purple-600' },
  { value: 'blue', label: 'Blue', class: 'from-blue-500 to-blue-600' },
  { value: 'green', label: 'Green', class: 'from-green-500 to-green-600' },
  { value: 'orange', label: 'Orange', class: 'from-orange-500 to-orange-600' },
  { value: 'pink', label: 'Pink', class: 'from-pink-500 to-pink-600' },
  { value: 'indigo', label: 'Indigo', class: 'from-indigo-500 to-indigo-600' },
]

const PLAN_TEMPLATES = [
  {
    id: 'basic',
    name: 'Basic Plan',
    description: 'Perfect for getting started',
    price: 29,
    features: ['Access to core features', 'Email support', 'Basic analytics'],
    icon: 'star',
    color: 'blue',
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    description: 'For growing businesses',
    price: 79,
    features: ['Everything in Basic', 'Priority support', 'Advanced analytics', 'API access'],
    highlighted: true,
    badge: 'Most Popular',
    icon: 'zap',
    color: 'purple',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 299,
    features: ['Everything in Pro', 'Dedicated support', 'Custom integrations', 'SLA guarantee'],
    icon: 'crown',
    color: 'indigo',
  },
]

function PlanCard({
  plan,
  onUpdate,
  onRemove,
  onDuplicate,
  isPreview = false,
}: {
  plan: PricingPlan
  onUpdate?: (updates: Partial<PricingPlan>) => void
  onRemove?: () => void
  onDuplicate?: () => void
  isPreview?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedPlan, setEditedPlan] = useState(plan)

  const selectedIcon = PLAN_ICONS.find((i) => i.value === plan.icon)
  const Icon = selectedIcon?.icon || Star
  const selectedColor = PLAN_COLORS.find((c) => c.value === plan.color) || PLAN_COLORS[0]

  const handleSave = () => {
    onUpdate?.(editedPlan)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedPlan(plan)
    setIsEditing(false)
  }

  if (isPreview) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        className={cn(
          'relative rounded-2xl border-2 bg-white p-6 shadow-sm transition-all',
          plan.highlighted ? 'scale-105 border-purple-500 shadow-lg' : 'border-gray-200'
        )}
      >
        {plan.badge && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-gradient-to-r from-purple-500 to-purple-600 px-3 py-1 text-xs font-semibold text-white">
              {plan.badge}
            </span>
          </div>
        )}

        <div
          className={cn(
            'mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br',
            selectedColor?.class || 'from-purple-500 to-purple-600'
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>

        <h3 className="mb-2 text-xl font-bold">{plan.name}</h3>
        {plan.description && <p className="mb-4 text-sm text-gray-600">{plan.description}</p>}

        <div className="mb-6">
          {plan.compareAtPrice && (
            <div className="text-sm text-gray-500 line-through">
              {formatPrice(plan.compareAtPrice, plan.currency)}
            </div>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{formatPrice(plan.price, plan.currency)}</span>
            {plan.interval && plan.interval !== 'once' && (
              <span className="text-gray-600">/{plan.interval}</span>
            )}
          </div>
          {plan.setupFee && (
            <div className="mt-1 text-sm text-gray-600">
              + {formatPrice(plan.setupFee, plan.currency)} setup fee
            </div>
          )}
          {plan.trialDays && (
            <div className="mt-1 text-sm text-green-600">{plan.trialDays} day free trial</div>
          )}
        </div>

        <div className="mb-6 space-y-3">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <Button className="w-full" variant={plan.highlighted ? 'primary' : 'secondary'}>
          Get Started
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div layout className="relative rounded-2xl border-2 border-gray-200 bg-white p-6">
      {/* Edit/Preview Toggle */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {!isEditing && (
          <>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDuplicate?.()}
              title="Duplicate plan"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              title="Edit plan"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onRemove?.()}
              title="Remove plan"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div>
              <Label>Plan Name</Label>
              <Input
                value={editedPlan.name}
                onChange={(e) => setEditedPlan({ ...editedPlan, name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={editedPlan.description || ''}
                onChange={(e) => setEditedPlan({ ...editedPlan, description: e.target.value })}
                placeholder="Brief description..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={editedPlan.price}
                  onChange={(e) =>
                    setEditedPlan({ ...editedPlan, price: parseFloat(e.target.value) || 0 })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Compare at</Label>
                <Input
                  type="number"
                  value={editedPlan.compareAtPrice || ''}
                  onChange={(e) =>
                    setEditedPlan({
                      ...editedPlan,
                      compareAtPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  placeholder="Original price"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Icon</Label>
                <Select
                  value={editedPlan.icon || 'star'}
                  onValueChange={(value) => setEditedPlan({ ...editedPlan, icon: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_ICONS.map(({ value, icon: IconComponent, label }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          <span>{label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Color</Label>
                <Select
                  value={editedPlan.color || 'purple'}
                  onValueChange={(value) => setEditedPlan({ ...editedPlan, color: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAN_COLORS.map(({ value, label, class: colorClass }) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <div className={cn('h-4 w-4 rounded bg-gradient-to-r', colorClass)} />
                          <span>{label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Badge (optional)</Label>
              <Input
                value={editedPlan.badge || ''}
                onChange={(e) => setEditedPlan({ ...editedPlan, badge: e.target.value })}
                placeholder="e.g., Most Popular"
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Highlight this plan</Label>
              <Switch
                checked={editedPlan.highlighted || false}
                onCheckedChange={(checked) =>
                  setEditedPlan({ ...editedPlan, highlighted: checked })
                }
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Features</Label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setEditedPlan({
                      ...editedPlan,
                      features: [...editedPlan.features, ''],
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {editedPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => {
                        const newFeatures = [...editedPlan.features]
                        newFeatures[index] = e.target.value
                        setEditedPlan({ ...editedPlan, features: newFeatures })
                      }}
                      placeholder="Feature description..."
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        const newFeatures = editedPlan.features.filter((_, i) => i !== index)
                        setEditedPlan({ ...editedPlan, features: newFeatures })
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PlanCard plan={plan} isPreview />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function VisualPricingBuilder({
  plans,
  onChange,
  productName = 'Product',
}: VisualPricingBuilderProps) {
  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit')
  const [showTemplates, setShowTemplates] = useState(false)

  const addPlan = (template?: Partial<PricingPlan>) => {
    const newPlan: PricingPlan = template
      ? {
          name: template.name || 'New Plan',
          price: template.price || 0,
          currency: template.currency || plans[0]?.currency || 'USD',
          features: template.features || [],
          ...template,
          id: `plan-${Date.now()}`,
        }
      : {
          id: `plan-${Date.now()}`,
          name: 'New Plan',
          price: 0,
          currency: plans[0]?.currency || 'USD',
          features: [],
          icon: 'star',
          color: 'purple',
        }
    onChange([...plans, newPlan])
    setShowTemplates(false)
  }

  const updatePlan = (id: string, updates: Partial<PricingPlan>) => {
    onChange(plans.map((plan) => (plan.id === id ? { ...plan, ...updates } : plan)))
  }

  const removePlan = (id: string) => {
    onChange(plans.filter((plan) => plan.id !== id))
  }

  const duplicatePlan = (id: string) => {
    const planToDuplicate = plans.find((p) => p.id === id)
    if (planToDuplicate) {
      const newPlan = {
        ...planToDuplicate,
        id: `plan-${Date.now()}`,
        name: `${planToDuplicate.name} (Copy)`,
      }
      onChange([...plans, newPlan])
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pricing Plans</h3>
          <p className="text-sm text-gray-500">
            Create compelling pricing options for {productName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
            <Button
              size="sm"
              variant={activeView === 'edit' ? 'secondary' : 'ghost'}
              onClick={() => setActiveView('edit')}
            >
              <Settings className="mr-1 h-4 w-4" />
              Edit
            </Button>
            <Button
              size="sm"
              variant={activeView === 'preview' ? 'secondary' : 'ghost'}
              onClick={() => setActiveView('preview')}
            >
              <Eye className="mr-1 h-4 w-4" />
              Preview
            </Button>
          </div>
          <Button size="sm" onClick={() => setShowTemplates(!showTemplates)}>
            <Plus className="mr-1 h-4 w-4" />
            Add Plan
          </Button>
        </div>
      </div>

      {/* Templates */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 rounded-lg bg-gray-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Choose a template</span>
                <Button size="sm" variant="ghost" onClick={() => addPlan()}>
                  Start from scratch
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {PLAN_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => addPlan(template)}
                    className="rounded-lg border-2 border-gray-200 bg-white p-4 text-left transition-colors hover:border-purple-500"
                  >
                    <h4 className="mb-1 font-medium">{template.name}</h4>
                    <p className="mb-2 text-sm text-gray-500">{template.description}</p>
                    <div className="text-lg font-bold">${template.price}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans */}
      {plans.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
          <Sparkles className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="mb-4 text-gray-500">No pricing plans yet</p>
          <Button onClick={() => setShowTemplates(true)}>Create Your First Plan</Button>
        </div>
      ) : (
        <div
          className={cn(
            'grid gap-6',
            plans.length === 1
              ? 'mx-auto max-w-sm grid-cols-1'
              : plans.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-3'
          )}
        >
          {activeView === 'preview'
            ? plans.map((plan) => <PlanCard key={plan.id} plan={plan} isPreview />)
            : plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onUpdate={(updates) => updatePlan(plan.id, updates)}
                  onRemove={() => removePlan(plan.id)}
                  onDuplicate={() => duplicatePlan(plan.id)}
                />
              ))}
        </div>
      )}

      {/* Tips */}
      {plans.length > 0 && activeView === 'edit' && (
        <div className="rounded-lg bg-purple-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-purple-900">💡 Pricing Tips</h4>
          <ul className="space-y-1 text-sm text-purple-700">
            <li>• Highlight your most popular plan to guide customers</li>
            <li>• Use comparison pricing to show value</li>
            <li>• Keep feature lists concise and benefit-focused</li>
            <li>• Consider offering a trial period for subscriptions</li>
          </ul>
        </div>
      )}
    </div>
  )
}
