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
import { X, Palette, Type, Settings } from 'lucide-react'
import { useBuilderStore } from '@/stores/builder-store'

export function PropertiesPanel() {
  const { blocks, selectedBlockId, selectBlock, updateBlock } = useBuilderStore()

  const block = blocks.find((b) => b.id === selectedBlockId)

  if (!block) {
    return (
      <div className="h-full bg-gray-900 p-6">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <Settings className="mb-4 h-12 w-12 text-gray-600" />
          <p className="text-gray-400">Select a block to edit its properties</p>
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
              <Label htmlFor="headline" className="text-white">
                Headline
              </Label>
              <Input
                id="headline"
                value={(block.data.headline as string) || ''}
                onChange={(e) => handleDataChange('headline', e.target.value)}
                className="mt-1 bg-gray-800/50"
              />
            </div>
            <div>
              <Label htmlFor="subheadline" className="text-white">
                Subheadline
              </Label>
              <Textarea
                id="subheadline"
                value={(block.data.subheadline as string) || ''}
                onChange={(e) => handleDataChange('subheadline', e.target.value)}
                className="mt-1 bg-gray-800/50"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="backgroundType" className="text-white">
                Background Type
              </Label>
              <Select
                value={(block.data.backgroundType as string) || 'gradient'}
                onValueChange={(value: string) => handleDataChange('backgroundType', value)}
              >
                <SelectTrigger id="backgroundType" className="mt-1 bg-gray-800/50">
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
                <Label htmlFor="gradientType" className="text-white">
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
                  <SelectTrigger id="gradientType" className="mt-1 bg-gray-800/50">
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
              <Label htmlFor="layout" className="text-white">
                Layout
              </Label>
              <Select
                value={(block.data.layout as string) || 'side-by-side'}
                onValueChange={(value: string) => handleDataChange('layout', value)}
              >
                <SelectTrigger id="layout" className="mt-1 bg-gray-800/50">
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
              <Label htmlFor="showPricing" className="text-white">
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
              <Label htmlFor="showExpressCheckout" className="text-white">
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
              <Label className="text-white">Payment Fields</Label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-300">
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
                <label className="flex items-center gap-2 text-sm text-gray-300">
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
              <Label htmlFor="headline" className="text-white">
                Headline
              </Label>
              <Input
                id="headline"
                value={(block.data.headline as string) || ''}
                onChange={(e) => handleDataChange('headline', e.target.value)}
                className="mt-1 bg-gray-800/50"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                value={(block.data.description as string) || ''}
                onChange={(e) => handleDataChange('description', e.target.value)}
                className="mt-1 bg-gray-800/50"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="style" className="text-white">
                Style
              </Label>
              <Select
                value={(block.data.style as string) || 'highlighted'}
                onValueChange={(value: string) => handleDataChange('style', value)}
              >
                <SelectTrigger id="style" className="mt-1 bg-gray-800/50">
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
          <div className="text-sm text-gray-400">
            Properties for this block type are not yet available
          </div>
        )
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-900">
      <div className="sticky top-0 flex items-center justify-between border-b border-gray-800 bg-gray-900 p-4">
        <h3 className="font-semibold text-white capitalize">
          <Type className="mr-2 inline-block h-4 w-4" />
          {block.type} Properties
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => selectBlock(null)}
          className="text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6 p-6">
        {/* Block Properties */}
        <Card variant="glass" className="p-4">
          <h4 className="mb-4 flex items-center gap-2 font-medium text-white">
            <Settings className="h-4 w-4" />
            Content
          </h4>
          <div className="space-y-4">{renderProperties()}</div>
        </Card>

        {/* Style Properties */}
        <Card variant="glass" className="p-4">
          <h4 className="mb-4 flex items-center gap-2 font-medium text-white">
            <Palette className="h-4 w-4" />
            Styles
          </h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="padding" className="text-white">
                Padding
              </Label>
              <Input
                id="padding"
                value={(block.styles.padding as string) || ''}
                onChange={(e) => handleStyleChange('padding', e.target.value)}
                className="mt-1 bg-gray-800/50"
                placeholder="e.g., 2rem 1rem"
              />
            </div>
            <div>
              <Label htmlFor="className" className="text-white">
                Custom CSS Classes
              </Label>
              <Input
                id="className"
                value={(block.styles.className as string) || ''}
                onChange={(e) => handleStyleChange('className', e.target.value)}
                className="mt-1 bg-gray-800/50"
                placeholder="e.g., my-custom-class"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
