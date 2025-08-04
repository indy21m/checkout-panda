'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Move,
  Scale,
  RotateCw,
  Eye,
  EyeOff,
  Copy,
  Layers,
  Clock,
  Activity,
  Sparkles,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EnhancedBlock } from '@/types/builder'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnimationValue = Record<string, any>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TransitionValue = Record<string, any>

interface AnimationPreset {
  id: string
  name: string
  category: string
  icon: React.ComponentType<{ className?: string }>
  animation: {
    initial?: AnimationValue
    animate?: AnimationValue
    exit?: AnimationValue
    transition?: TransitionValue
    whileHover?: AnimationValue
    whileTap?: AnimationValue
  }
}

interface AnimationControlsProps {
  block: EnhancedBlock
  onChange: (animations: AnimationState) => void
}

const ANIMATION_PRESETS: AnimationPreset[] = [
  // Entrance animations
  {
    id: 'fade-in',
    name: 'Fade In',
    category: 'entrance',
    icon: Eye,
    animation: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5 },
    },
  },
  {
    id: 'slide-up',
    name: 'Slide Up',
    category: 'entrance',
    icon: Move,
    animation: {
      initial: { opacity: 0, y: 50 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  },
  {
    id: 'scale-in',
    name: 'Scale In',
    category: 'entrance',
    icon: Scale,
    animation: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  },
  {
    id: 'rotate-in',
    name: 'Rotate In',
    category: 'entrance',
    icon: RotateCw,
    animation: {
      initial: { opacity: 0, rotate: -180, scale: 0.5 },
      animate: { opacity: 1, rotate: 0, scale: 1 },
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  },
  // Attention seekers
  {
    id: 'pulse',
    name: 'Pulse',
    category: 'attention',
    icon: Activity,
    animation: {
      animate: {
        scale: [1, 1.05, 1],
      },
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatDelay: 1,
      },
    },
  },
  {
    id: 'bounce',
    name: 'Bounce',
    category: 'attention',
    icon: Move,
    animation: {
      animate: {
        y: [0, -20, 0],
      },
      transition: {
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 2,
        ease: 'easeInOut',
      },
    },
  },
  {
    id: 'shake',
    name: 'Shake',
    category: 'attention',
    icon: Zap,
    animation: {
      animate: {
        x: [-10, 10, -10, 10, 0],
      },
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 3,
      },
    },
  },
  // Hover effects
  {
    id: 'hover-lift',
    name: 'Lift on Hover',
    category: 'hover',
    icon: Move,
    animation: {
      whileHover: {
        y: -8,
        scale: 1.02,
      },
      transition: { duration: 0.2 },
    },
  },
  {
    id: 'hover-glow',
    name: 'Glow on Hover',
    category: 'hover',
    icon: Sparkles,
    animation: {
      whileHover: {
        scale: 1.05,
        filter: 'brightness(1.1)',
      },
      transition: { duration: 0.2 },
    },
  },
]

const EASING_FUNCTIONS = [
  { value: 'linear', label: 'Linear' },
  { value: 'easeIn', label: 'Ease In' },
  { value: 'easeOut', label: 'Ease Out' },
  { value: 'easeInOut', label: 'Ease In Out' },
  { value: 'circIn', label: 'Circ In' },
  { value: 'circOut', label: 'Circ Out' },
  { value: 'backIn', label: 'Back In' },
  { value: 'backOut', label: 'Back Out' },
  { value: 'anticipate', label: 'Anticipate' },
]

function AnimationTimeline({ animations, duration }: { animations: AnimationValue; duration: number }) {
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      const startTime = Date.now() - currentTime * 1000
      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000
        if (elapsed >= duration) {
          setCurrentTime(0)
          setIsPlaying(false)
        } else {
          setCurrentTime(elapsed)
          if (isPlaying) requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)
    }
  }

  return (
    <div className="space-y-4">
      {/* Playback controls */}
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={handlePlay}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setCurrentTime(0)}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <Slider
            value={[currentTime]}
            onValueChange={([value]) => setCurrentTime(value || 0)}
            max={duration}
            step={0.1}
            className="w-full"
          />
        </div>
        <span className="text-sm text-gray-500 font-mono">
          {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
        </span>
      </div>

      {/* Timeline tracks */}
      <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
        {Object.entries(animations).map(([property, keyframes]) => (
          <div key={property} className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-600 w-16">{property}</span>
            <div className="flex-1 relative h-6 bg-white rounded border border-gray-200">
              {/* Keyframe markers */}
              <div className="absolute inset-0 flex items-center">
                {Array.isArray(keyframes) && keyframes.map((_, index) => (
                  <div
                    key={index}
                    className="absolute w-2 h-2 bg-purple-500 rounded-full"
                    style={{ left: `${(index / (keyframes.length - 1)) * 100}%` }}
                  />
                ))}
              </div>
              {/* Current time indicator */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-blue-500"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface AnimationState {
  initial?: AnimationValue
  animate?: AnimationValue
  exit?: AnimationValue
  transition?: TransitionValue
  whileHover?: AnimationValue
  whileTap?: AnimationValue
}

export function AnimationControls({ block, onChange }: AnimationControlsProps) {
  const [activeTab, setActiveTab] = useState('presets')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [customAnimation, setCustomAnimation] = useState<AnimationState>(
    block.styles?.animationState || {}
  )
  const [showPreview, setShowPreview] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['entrance'])

  const handlePresetSelect = (preset: AnimationPreset) => {
    setSelectedPreset(preset.id)
    const newAnimation = {
      ...customAnimation,
      ...preset.animation,
    }
    setCustomAnimation(newAnimation)
    onChange(newAnimation)
  }

  const updateCustomProperty = (property: string, value: AnimationValue | TransitionValue) => {
    const updated = {
      ...customAnimation,
      [property]: value,
    }
    setCustomAnimation(updated)
    onChange(updated)
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const categories = [...new Set(ANIMATION_PRESETS.map(p => p.category))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Animation Controls</h3>
          <p className="text-sm text-gray-500">
            Add motion and interactivity to your elements
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>

      {/* Preview */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-8">
              <div className="flex items-center justify-center">
                <motion.div
                  className="relative"
                  initial={customAnimation.initial}
                  animate={customAnimation.animate}
                  exit={customAnimation.exit}
                  transition={customAnimation.transition}
                  whileHover={customAnimation.whileHover}
                  whileTap={customAnimation.whileTap}
                >
                  <div className="h-24 w-48 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg flex items-center justify-center">
                    <span className="text-white font-semibold">Preview Element</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animation Controls */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="mt-6 space-y-4">
          {categories.map(category => (
            <div key={category} className="space-y-2">
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center gap-2 text-sm font-medium capitalize hover:text-purple-600 transition-colors"
              >
                {expandedCategories.includes(category) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {category} Animations
              </button>

              <AnimatePresence>
                {expandedCategories.includes(category) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    {ANIMATION_PRESETS.filter(p => p.category === category).map(preset => {
                      const Icon = preset.icon
                      const isSelected = selectedPreset === preset.id

                      return (
                        <motion.button
                          key={preset.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePresetSelect(preset)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                            isSelected
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center",
                            isSelected ? "bg-purple-500 text-white" : "bg-gray-100 text-gray-600"
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{preset.name}</p>
                            <p className="text-xs text-gray-500">Click to apply</p>
                          </div>
                        </motion.button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="custom" className="mt-6 space-y-6">
          {/* Initial State */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Initial State
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Opacity</Label>
                <Slider
                  value={[customAnimation.initial?.opacity || 1]}
                  onValueChange={([value]) => updateCustomProperty('initial', {
                    ...customAnimation.initial,
                    opacity: value,
                  })}
                  min={0}
                  max={1}
                  step={0.1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Scale</Label>
                <Slider
                  value={[customAnimation.initial?.scale || 1]}
                  onValueChange={([value]) => updateCustomProperty('initial', {
                    ...customAnimation.initial,
                    scale: value,
                  })}
                  min={0}
                  max={2}
                  step={0.1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>X Position</Label>
                <Input
                  type="number"
                  value={customAnimation.initial?.x || 0}
                  onChange={(e) => updateCustomProperty('initial', {
                    ...customAnimation.initial,
                    x: parseInt(e.target.value),
                  })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Y Position</Label>
                <Input
                  type="number"
                  value={customAnimation.initial?.y || 0}
                  onChange={(e) => updateCustomProperty('initial', {
                    ...customAnimation.initial,
                    y: parseInt(e.target.value),
                  })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Transition Settings */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Transition
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration (seconds)</Label>
                <Input
                  type="number"
                  value={customAnimation.transition?.duration || 0.5}
                  onChange={(e) => updateCustomProperty('transition', {
                    ...customAnimation.transition,
                    duration: parseFloat(e.target.value),
                  })}
                  step={0.1}
                  min={0}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Delay (seconds)</Label>
                <Input
                  type="number"
                  value={customAnimation.transition?.delay || 0}
                  onChange={(e) => updateCustomProperty('transition', {
                    ...customAnimation.transition,
                    delay: parseFloat(e.target.value),
                  })}
                  step={0.1}
                  min={0}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>Easing</Label>
                <Select
                  value={customAnimation.transition?.ease || 'easeOut'}
                  onValueChange={(value) => updateCustomProperty('transition', {
                    ...customAnimation.transition,
                    ease: value,
                  })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EASING_FUNCTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Loop Settings */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Loop Settings
            </h4>
            <div className="flex items-center justify-between">
              <Label>Enable Loop</Label>
              <Switch
                checked={customAnimation.transition?.repeat === Infinity}
                onCheckedChange={(checked) => updateCustomProperty('transition', {
                  ...customAnimation.transition,
                  repeat: checked ? Infinity : 0,
                })}
              />
            </div>
            {customAnimation.transition?.repeat === Infinity && (
              <div>
                <Label>Repeat Delay (seconds)</Label>
                <Input
                  type="number"
                  value={customAnimation.transition?.repeatDelay || 0}
                  onChange={(e) => updateCustomProperty('transition', {
                    ...customAnimation.transition,
                    repeatDelay: parseFloat(e.target.value),
                  })}
                  step={0.1}
                  min={0}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <AnimationTimeline
            animations={customAnimation.animate || {}}
            duration={customAnimation.transition?.duration || 1}
          />
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="ghost"
          onClick={() => {
            setCustomAnimation({})
            setSelectedPreset(null)
            onChange({})
          }}
        >
          Clear All
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary">
            <Copy className="h-4 w-4 mr-2" />
            Copy Animation
          </Button>
          <Button>
            Apply to Similar
          </Button>
        </div>
      </div>
    </div>
  )
}