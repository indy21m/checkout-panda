'use client'

import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
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
import { X, Palette, Type, Settings } from 'lucide-react'
import { useBuilderStore } from '@/stores/builder-store'

export function PropertiesPanel() {
  const { blocks, selectedBlockId, selectBlock, updateBlock } = useBuilderStore()

  const block = blocks.find((b) => b.id === selectedBlockId)

  if (!block) {
    return (
      <div className="h-full bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <Settings className="text-text-tertiary mb-4 h-12 w-12" />
          <p className="text-text-secondary">Select a block to edit its properties</p>
        </div>
      </div>
    )
  }

  const handleDataChange = (key: string, value: unknown) => {
    updateBlock(block.id, { ...block, data: { ...block.data, [key]: value } })
  }

  const handleStyleChange = (key: string, value: unknown) => {
    updateBlock(block.id, { ...block, styles: { ...block.styles, [key]: value } })
  }

  const renderProperties = () => {
    switch (block.type) {
      case 'hero':
        return (
          <>
            <div>
              <Label htmlFor="headline" className="text-text">
                Headline
              </Label>
              <Input
                id="headline"
                value={(block.data.headline as string) || ''}
                onChange={(e) => handleDataChange('headline', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="subheadline" className="text-text">
                Subheadline
              </Label>
              <Textarea
                id="subheadline"
                value={(block.data.subheadline as string) || ''}
                onChange={(e) => handleDataChange('subheadline', e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="backgroundType" className="text-text">
                Background Type
              </Label>
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
                <Label htmlFor="gradientType" className="text-text">
                  Gradient Style
                </Label>
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
              <Label htmlFor="layout" className="text-text">
                Layout
              </Label>
              <Select
                value={(block.data.layout as string) || 'side-by-side'}
                onValueChange={(value: string) => handleDataChange('layout', value)}
              >
                <SelectTrigger id="layout" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="side-by-side">Side by Side</SelectItem>
                  <SelectItem value="stacked">Stacked</SelectItem>
                  <SelectItem value="centered">Centered</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showPricing" className="text-text">
                Show Pricing
              </Label>
              <Switch
                id="showPricing"
                checked={(block.data.showPricing as boolean) !== false}
                onCheckedChange={(checked: boolean) => handleDataChange('showPricing', checked)}
              />
            </div>
          </>
        )

      case 'payment':
        return (
          <>
            <div className="flex items-center justify-between">
              <Label htmlFor="showExpressCheckout" className="text-text">
                Express Checkout
              </Label>
              <Switch
                id="showExpressCheckout"
                checked={(block.data.showExpressCheckout as boolean) || false}
                onCheckedChange={(checked: boolean) =>
                  handleDataChange('showExpressCheckout', checked)
                }
              />
            </div>
            <div>
              <Label className="text-text">Payment Fields</Label>
              <div className="mt-2 space-y-2">
                <label className="text-text-secondary flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={((block.data.fields as string[]) || []).includes('email')}
                    onChange={(e) => {
                      const fields = (block.data.fields as string[]) || []
                      if (e.target.checked) {
                        handleDataChange('fields', [...fields, 'email'])
                      } else {
                        handleDataChange(
                          'fields',
                          fields.filter((f) => f !== 'email')
                        )
                      }
                    }}
                  />
                  Email Address
                </label>
                <label className="text-text-secondary flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={((block.data.fields as string[]) || []).includes('name')}
                    onChange={(e) => {
                      const fields = (block.data.fields as string[]) || []
                      if (e.target.checked) {
                        handleDataChange('fields', [...fields, 'name'])
                      } else {
                        handleDataChange(
                          'fields',
                          fields.filter((f) => f !== 'name')
                        )
                      }
                    }}
                  />
                  Full Name
                </label>
              </div>
            </div>
          </>
        )

      case 'bump':
        return (
          <>
            <div>
              <Label htmlFor="bump-headline" className="text-text">
                Headline
              </Label>
              <Input
                id="bump-headline"
                value={(block.data.headline as string) || ''}
                onChange={(e) => handleDataChange('headline', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-text">
                Description
              </Label>
              <Textarea
                id="description"
                value={(block.data.description as string) || ''}
                onChange={(e) => handleDataChange('description', e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="discount" className="text-text">
                Discount %
              </Label>
              <Input
                id="discount"
                type="number"
                value={(block.data.discountPercent as number) || 0}
                onChange={(e) => handleDataChange('discountPercent', parseInt(e.target.value))}
                className="mt-1"
                min="0"
                max="100"
              />
            </div>
            <div>
              <Label htmlFor="product-id" className="text-text">
                Product
              </Label>
              <Input
                id="product-id"
                value={(block.data.productId as string) || ''}
                onChange={(e) => handleDataChange('productId', e.target.value)}
                className="mt-1"
                placeholder="Product ID"
              />
            </div>
            <div>
              <Label htmlFor="style" className="text-text">
                Style
              </Label>
              <Select
                value={(block.data.style as string) || 'highlighted'}
                onValueChange={(value: string) => handleDataChange('style', value)}
              >
                <SelectTrigger id="style" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="highlighted">Highlighted Box</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="card">Card Style</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )

      default:
        return (
          <div className="text-text-secondary text-sm">
            Properties for this block type are not yet available
          </div>
        )
    }
  }

  return (
    <div className="custom-scrollbar h-full overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
      <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white/90 p-4 backdrop-blur-sm">
        <h3 className="text-text font-semibold capitalize">
          <Type className="mr-2 inline-block h-4 w-4" />
          {block.type} Properties
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => selectBlock(null)}
          className="text-text-secondary hover:text-text"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6 p-6">
        {/* Block Properties */}
        <GlassmorphicCard className="p-4" variant="light">
          <h4 className="text-text mb-4 flex items-center gap-2 font-medium">
            <Settings className="h-4 w-4" />
            Block Settings
          </h4>
          <div className="space-y-4">{renderProperties()}</div>
        </GlassmorphicCard>

        {/* Style Settings */}
        <GlassmorphicCard className="p-4" variant="light">
          <h4 className="text-text mb-4 flex items-center gap-2 font-medium">
            <Palette className="h-4 w-4" />
            Style Options
          </h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="padding" className="text-text">
                Padding
              </Label>
              <Input
                id="padding"
                value={(block.styles?.padding as string) || ''}
                onChange={(e) => handleStyleChange('padding', e.target.value)}
                className="mt-1"
                placeholder="e.g., 2rem, 32px"
              />
            </div>
            <div>
              <Label htmlFor="bg-color" className="text-text">
                Background Color
              </Label>
              <Input
                id="bg-color"
                value={(block.styles?.backgroundColor as string) || ''}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="mt-1"
                placeholder="e.g., #FFFFFF, rgb(255,255,255)"
              />
            </div>
          </div>
        </GlassmorphicCard>
      </div>
    </div>
  )
}
