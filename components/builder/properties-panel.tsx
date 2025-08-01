'use client'

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface PropertiesPanelProps {
  block?: {
    id: string
    type: string
    data: Record<string, unknown>
    styles: Record<string, unknown>
  }
  onClose: () => void
  onUpdate: (
    blockId: string,
    data: Record<string, unknown>,
    styles: Record<string, unknown>
  ) => void
}

export function PropertiesPanel({ block, onClose, onUpdate }: PropertiesPanelProps) {
  if (!block) {
    return (
      <div className="h-full border-l bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <p className="text-center text-gray-500">Select a block to edit its properties</p>
      </div>
    )
  }

  const handleDataChange = (key: string, value: unknown) => {
    onUpdate(block.id, { ...block.data, [key]: value }, block.styles)
  }

  const handleStyleChange = (key: string, value: unknown) => {
    onUpdate(block.id, block.data, { ...block.styles, [key]: value })
  }

  const renderProperties = () => {
    switch (block.type) {
      case 'hero':
        return (
          <>
            <div>
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={(block.data.headline as string) || ''}
                onChange={(e) => handleDataChange('headline', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="subheadline">Subheadline</Label>
              <Textarea
                id="subheadline"
                value={(block.data.subheadline as string) || ''}
                onChange={(e) => handleDataChange('subheadline', e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="backgroundType">Background Type</Label>
              <Select
                value={(block.data.backgroundType as string) || 'gradient'}
                onValueChange={(value: string) => handleDataChange('backgroundType', value)}
              >
                <SelectTrigger id="backgroundType" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gradient">Gradient</SelectItem>
                  <SelectItem value="solid">Solid Color</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {block.data.backgroundType === 'gradient' && (
              <div>
                <Label htmlFor="gradientType">Gradient Style</Label>
                <Select
                  value={
                    ((block.data.gradient as Record<string, unknown>)?.type as string) || 'aurora'
                  }
                  onValueChange={(value: string) =>
                    handleDataChange('gradient', {
                      ...((block.data.gradient as Record<string, unknown>) || {}),
                      type: value,
                    })
                  }
                >
                  <SelectTrigger id="gradientType" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aurora">Aurora</SelectItem>
                    <SelectItem value="sunset">Sunset</SelectItem>
                    <SelectItem value="ocean">Ocean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )

      case 'product':
        return (
          <>
            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                value={(block.data.productName as string) || ''}
                onChange={(e) => handleDataChange('productName', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="price">Price (in dollars)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={((block.data.price as number) || 0) / 100}
                onChange={(e) =>
                  handleDataChange('price', Math.round(parseFloat(e.target.value) * 100))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="productDescription">Description</Label>
              <Textarea
                id="productDescription"
                value={(block.data.productDescription as string) || ''}
                onChange={(e) => handleDataChange('productDescription', e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="badge">Badge Text (optional)</Label>
              <Input
                id="badge"
                value={(block.data.badge as string) || ''}
                onChange={(e) => handleDataChange('badge', e.target.value)}
                className="mt-1"
                placeholder="e.g., Best Seller"
              />
            </div>
          </>
        )

      case 'payment':
        return (
          <>
            <div>
              <Label htmlFor="buttonText">Button Text</Label>
              <Input
                id="buttonText"
                value={(block.data.buttonText as string) || ''}
                onChange={(e) => handleDataChange('buttonText', e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showExpressCheckout">Express Checkout</Label>
              <Switch
                id="showExpressCheckout"
                checked={(block.data.showExpressCheckout as boolean) || false}
                onCheckedChange={(checked: boolean) =>
                  handleDataChange('showExpressCheckout', checked)
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="securityBadges">Security Badges</Label>
              <Switch
                id="securityBadges"
                checked={(block.data.securityBadges as boolean) !== false}
                onCheckedChange={(checked: boolean) => handleDataChange('securityBadges', checked)}
              />
            </div>
          </>
        )

      case 'bump':
        return (
          <>
            <div>
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                value={(block.data.headline as string) || ''}
                onChange={(e) => handleDataChange('headline', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={(block.data.description as string) || ''}
                onChange={(e) => handleDataChange('description', e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="checkboxText">Checkbox Text</Label>
              <Input
                id="checkboxText"
                value={(block.data.checkboxText as string) || ''}
                onChange={(e) => handleDataChange('checkboxText', e.target.value)}
                className="mt-1"
                placeholder="Yes! Add this to my order"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="originalPrice">Original Price ($)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  value={((block.data.originalPrice as number) || 0) / 100}
                  onChange={(e) =>
                    handleDataChange('originalPrice', Math.round(parseFloat(e.target.value) * 100))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="discountPercent">Discount %</Label>
                <Input
                  id="discountPercent"
                  type="number"
                  min="0"
                  max="100"
                  value={(block.data.discountPercent as number) || 0}
                  onChange={(e) => {
                    const percent = parseInt(e.target.value)
                    handleDataChange('discountPercent', percent)
                    // Auto-calculate discounted price
                    const original = (block.data.originalPrice as number) || 0
                    const discounted = Math.round(original * (1 - percent / 100))
                    handleDataChange('discountedPrice', discounted)
                  }}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="badge">Badge Text</Label>
              <Input
                id="badge"
                value={(block.data.badge as string) || ''}
                onChange={(e) => handleDataChange('badge', e.target.value)}
                className="mt-1"
                placeholder="e.g., LIMITED OFFER"
              />
            </div>
            <div>
              <Label htmlFor="urgencyText">Urgency Text</Label>
              <Input
                id="urgencyText"
                value={(block.data.urgencyText as string) || ''}
                onChange={(e) => handleDataChange('urgencyText', e.target.value)}
                className="mt-1"
                placeholder="e.g., Only available at checkout!"
              />
            </div>
          </>
        )

      default:
        return (
          <div className="text-sm text-gray-500">
            Properties for this block type are not yet available
          </div>
        )
    }
  }

  return (
    <div className="h-full overflow-y-auto border-l bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="sticky top-0 flex items-center justify-between border-b bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="font-semibold capitalize">{block.type} Properties</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6 p-6">
        {/* Block Properties */}
        <Card className="p-4">
          <h4 className="mb-4 font-medium">Content</h4>
          <div className="space-y-4">{renderProperties()}</div>
        </Card>

        {/* Style Properties */}
        <Card className="p-4">
          <h4 className="mb-4 font-medium">Styles</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="padding">Padding</Label>
              <Input
                id="padding"
                value={(block.styles.padding as string) || ''}
                onChange={(e) => handleStyleChange('padding', e.target.value)}
                className="mt-1"
                placeholder="e.g., 2rem 1rem"
              />
            </div>
            <div>
              <Label htmlFor="backgroundColor">Background Color</Label>
              <Input
                id="backgroundColor"
                value={(block.styles.backgroundColor as string) || ''}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="mt-1"
                placeholder="e.g., #f5f5f5"
              />
            </div>
            <div>
              <Label htmlFor="className">Custom CSS Classes</Label>
              <Input
                id="className"
                value={(block.styles.className as string) || ''}
                onChange={(e) => handleStyleChange('className', e.target.value)}
                className="mt-1"
                placeholder="e.g., my-custom-class"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
