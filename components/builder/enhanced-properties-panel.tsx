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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  X, 
  Settings, 
  Layout,
  Columns,
  Box
} from 'lucide-react'
import { useBuilderStore } from '@/stores/builder-store'
import { AnimationPanel } from './animation-panel'
import type { Section, Column, EnhancedBlock } from '@/types/builder'

export function EnhancedPropertiesPanel() {
  const { 
    sections,
    selectedIds, 
    selectedType,
    currentBreakpoint,
    updateSection,
    updateColumn,
    updateEnhancedBlock,
    clearSelection
  } = useBuilderStore()

  // Get selected element
  const getSelectedElement = (): Section | Column | EnhancedBlock | null => {
    if (selectedIds.length === 0 || !selectedType) return null
    
    const selectedId = selectedIds[0]
    if (!selectedId) return null

    if (selectedType === 'section') {
      return sections.find(s => s.id === selectedId) || null
    } else if (selectedType === 'column') {
      for (const section of sections) {
        const column = section.columns.find(c => c.id === selectedId)
        if (column) return column
      }
    } else if (selectedType === 'block') {
      for (const section of sections) {
        for (const column of section.columns) {
          const block = column.blocks.find(b => b.id === selectedId)
          if (block) return block
        }
      }
    }
    
    return null
  }

  const selectedElement = getSelectedElement()

  if (!selectedElement) {
    return (
      <div className="h-full bg-gradient-to-b from-gray-50 to-white p-6">
        <div className="flex h-full flex-col items-center justify-center text-center">
          <Settings className="text-text-tertiary mb-4 h-12 w-12" />
          <p className="text-text-secondary">Select an element to edit its properties</p>
        </div>
      </div>
    )
  }

  const renderSectionProperties = (section: Section) => {
    return (
      <Tabs defaultValue="layout" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="layout" className="space-y-4">
          <div>
            <Label htmlFor="section-name">Section Name</Label>
            <Input
              id="section-name"
              value={section.name || ''}
              onChange={(e) => updateSection(section.id, { name: e.target.value })}
              className="mt-1"
              placeholder="e.g., Hero Section"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="full-width">Full Width</Label>
            <Switch
              id="full-width"
              checked={section.settings.fullWidth || false}
              onCheckedChange={(checked) => 
                updateSection(section.id, { 
                  settings: { ...section.settings, fullWidth: checked }
                })
              }
            />
          </div>
          
          <div>
            <Label>Max Width ({currentBreakpoint})</Label>
            <Select
              value={section.settings.maxWidth?.[currentBreakpoint] || section.settings.maxWidth?.base || '1280px'}
              onValueChange={(value) => 
                updateSection(section.id, {
                  settings: {
                    ...section.settings,
                    maxWidth: {
                      ...section.settings.maxWidth,
                      [currentBreakpoint]: value
                    }
                  }
                })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="768px">Small (768px)</SelectItem>
                <SelectItem value="1024px">Medium (1024px)</SelectItem>
                <SelectItem value="1280px">Large (1280px)</SelectItem>
                <SelectItem value="1536px">Extra Large (1536px)</SelectItem>
                <SelectItem value="100%">Full (100%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Columns ({currentBreakpoint})</Label>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 6, 12].map((cols) => (
                <Button
                  key={cols}
                  variant={section.settings.grid.columns[currentBreakpoint] === cols ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => 
                    updateSection(section.id, {
                      settings: {
                        ...section.settings,
                        grid: {
                          ...section.settings.grid,
                          columns: {
                            ...section.settings.grid.columns,
                            [currentBreakpoint]: cols
                          }
                        }
                      }
                    })
                  }
                >
                  {cols}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Gap ({currentBreakpoint})</Label>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {['0', '0.5rem', '1rem', '1.5rem', '2rem'].map((gap) => (
                <Button
                  key={gap}
                  variant={section.settings.grid.gap[currentBreakpoint] === gap ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => 
                    updateSection(section.id, {
                      settings: {
                        ...section.settings,
                        grid: {
                          ...section.settings.grid,
                          gap: {
                            ...section.settings.grid.gap,
                            [currentBreakpoint]: gap
                          }
                        }
                      }
                    })
                  }
                >
                  {gap === '0' ? 'None' : gap}
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="style" className="space-y-4">
          <div>
            <Label>Padding ({currentBreakpoint})</Label>
            <Input
              value={section.settings.padding?.[currentBreakpoint] || section.settings.padding?.base || '2rem'}
              onChange={(e) => 
                updateSection(section.id, {
                  settings: {
                    ...section.settings,
                    padding: {
                      ...section.settings.padding,
                      [currentBreakpoint]: e.target.value
                    }
                  }
                })
              }
              className="mt-1"
              placeholder="e.g., 2rem, 32px"
            />
          </div>
          
          <div>
            <Label>Background Type</Label>
            <Select
              value={section.settings.background?.type || 'color'}
              onValueChange={(value) => 
                updateSection(section.id, {
                  settings: {
                    ...section.settings,
                    background: {
                      ...section.settings.background,
                      type: value as 'color' | 'gradient' | 'image' | 'video',
                      value: section.settings.background?.value || ''
                    }
                  }
                })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="color">Color</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {section.settings.background?.type && (
            <div>
              <Label>Background Value</Label>
              <Input
                value={section.settings.background.value}
                onChange={(e) => 
                  updateSection(section.id, {
                    settings: {
                      ...section.settings,
                      background: {
                        ...section.settings.background!,
                        value: e.target.value
                      }
                    }
                  })
                }
                className="mt-1"
                placeholder={
                  section.settings.background.type === 'color' 
                    ? '#FFFFFF or rgb(255,255,255)' 
                    : section.settings.background.type === 'gradient'
                    ? 'linear-gradient(to right, #667eea, #764ba2)'
                    : 'https://example.com/image.jpg'
                }
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <div>
            <Label>Custom CSS Class</Label>
            <Input
              value={section.settings.className || ''}
              onChange={(e) => 
                updateSection(section.id, {
                  settings: {
                    ...section.settings,
                    className: e.target.value
                  }
                })
              }
              className="mt-1"
              placeholder="e.g., my-custom-section"
            />
          </div>
          
          <div>
            <Label>Visibility</Label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2">
                <Switch
                  checked={section.visibility?.desktop !== false}
                  onCheckedChange={(checked) => 
                    updateSection(section.id, {
                      visibility: {
                        ...section.visibility,
                        desktop: checked
                      }
                    })
                  }
                />
                <span className="text-sm">Desktop</span>
              </label>
              <label className="flex items-center gap-2">
                <Switch
                  checked={section.visibility?.tablet !== false}
                  onCheckedChange={(checked) => 
                    updateSection(section.id, {
                      visibility: {
                        ...section.visibility,
                        tablet: checked
                      }
                    })
                  }
                />
                <span className="text-sm">Tablet</span>
              </label>
              <label className="flex items-center gap-2">
                <Switch
                  checked={section.visibility?.mobile !== false}
                  onCheckedChange={(checked) => 
                    updateSection(section.id, {
                      visibility: {
                        ...section.visibility,
                        mobile: checked
                      }
                    })
                  }
                />
                <span className="text-sm">Mobile</span>
              </label>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    )
  }

  const renderColumnProperties = (column: Column) => {
    return (
      <div className="space-y-4">
        <div>
          <Label>Column Span ({currentBreakpoint})</Label>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 6, 12].map((span) => (
              <Button
                key={span}
                variant={column.span[currentBreakpoint] === span ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => 
                  updateColumn(column.id, {
                    span: {
                      ...column.span,
                      [currentBreakpoint]: span
                    }
                  })
                }
              >
                {span}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <Label>Offset ({currentBreakpoint})</Label>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 6].map((offset) => (
              <Button
                key={offset}
                variant={column.offset?.[currentBreakpoint] === offset ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => 
                  updateColumn(column.id, {
                    offset: {
                      ...column.offset,
                      [currentBreakpoint]: offset
                    }
                  })
                }
              >
                {offset}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <Label>Vertical Alignment</Label>
          <Select
            value={column.settings.verticalAlign || 'top'}
            onValueChange={(value) => 
              updateColumn(column.id, {
                settings: {
                  ...column.settings,
                  verticalAlign: value as 'top' | 'middle' | 'bottom'
                }
              })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="middle">Middle</SelectItem>
              <SelectItem value="bottom">Bottom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label>Padding ({currentBreakpoint})</Label>
          <Input
            value={column.settings.padding?.[currentBreakpoint] || column.settings.padding?.base || '1rem'}
            onChange={(e) => 
              updateColumn(column.id, {
                settings: {
                  ...column.settings,
                  padding: {
                    ...column.settings.padding,
                    [currentBreakpoint]: e.target.value
                  }
                }
              })
            }
            className="mt-1"
            placeholder="e.g., 1rem, 16px"
          />
        </div>
      </div>
    )
  }

  const renderBlockProperties = (block: EnhancedBlock) => {
    // For backward compatibility with old block properties
    const handleDataChange = (key: string, value: unknown) => {
      updateEnhancedBlock(block.id, { 
        data: { ...block.data, [key]: value } 
      })
    }

    const handleStyleChange = (key: string, value: unknown) => {
      updateEnhancedBlock(block.id, { 
        styles: { ...block.styles, [key]: value } 
      })
    }

    return (
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="animation">Animation</TabsTrigger>
          <TabsTrigger value="interaction">Interaction</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4">
          {/* Reuse existing block property logic */}
          {renderBlockTypeProperties(block, handleDataChange)}
        </TabsContent>
        
        <TabsContent value="style" className="space-y-4">
          <div>
            <Label htmlFor="padding">Padding</Label>
            <Input
              id="padding"
              value={block.styles?.padding || ''}
              onChange={(e) => handleStyleChange('padding', e.target.value)}
              className="mt-1"
              placeholder="e.g., 2rem, 32px"
            />
          </div>
          <div>
            <Label htmlFor="bg-color">Background Color</Label>
            <Input
              id="bg-color"
              value={block.styles?.backgroundColor || ''}
              onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
              className="mt-1"
              placeholder="e.g., #FFFFFF, rgb(255,255,255)"
            />
          </div>
          <div>
            <Label htmlFor="min-height">Min Height</Label>
            <Input
              id="min-height"
              value={block.styles?.minHeight || ''}
              onChange={(e) => handleStyleChange('minHeight', e.target.value)}
              className="mt-1"
              placeholder="e.g., 400px, 50vh"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="animation" className="space-y-4">
          <AnimationPanel
            animations={block.animations || []}
            onChange={(animations) => 
              updateEnhancedBlock(block.id, { animations })
            }
          />
        </TabsContent>
        
        <TabsContent value="interaction" className="space-y-4">
          <div className="text-sm text-gray-500">
            Interaction settings coming soon...
          </div>
        </TabsContent>
      </Tabs>
    )
  }

  // Helper function to render block type specific properties
  const renderBlockTypeProperties = (block: EnhancedBlock, handleDataChange: (key: string, value: unknown) => void) => {
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
          </>
        )
      case 'product':
        return (
          <>
            <div>
              <Label htmlFor="layout">Layout</Label>
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
              <Label htmlFor="showPricing">Show Pricing</Label>
              <Switch
                id="showPricing"
                checked={(block.data.showPricing as boolean) !== false}
                onCheckedChange={(checked: boolean) => handleDataChange('showPricing', checked)}
              />
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
        <h3 className="text-text font-semibold capitalize flex items-center gap-2">
          {selectedType === 'section' && <Layout className="h-4 w-4" />}
          {selectedType === 'column' && <Columns className="h-4 w-4" />}
          {selectedType === 'block' && <Box className="h-4 w-4" />}
          {selectedType} Properties
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => clearSelection()}
          className="text-text-secondary hover:text-text"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-6">
        <GlassmorphicCard className="p-4" variant="light">
          {selectedType === 'section' && renderSectionProperties(selectedElement as Section)}
          {selectedType === 'column' && renderColumnProperties(selectedElement as Column)}
          {selectedType === 'block' && renderBlockProperties(selectedElement as EnhancedBlock)}
        </GlassmorphicCard>
      </div>
    </div>
  )
}