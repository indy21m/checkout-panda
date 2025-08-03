'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Plus, Trash2, Play, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import type { AnimationConfig } from '@/types/builder'

interface AnimationPanelProps {
  animations: AnimationConfig[]
  onChange: (animations: AnimationConfig[]) => void
}

export function AnimationPanel({ animations, onChange }: AnimationPanelProps) {
  const [expandedAnimation, setExpandedAnimation] = useState<string | null>(null)

  const addAnimation = () => {
    const newAnimation: AnimationConfig = {
      id: `anim-${Date.now()}`,
      type: 'fade',
      trigger: 'onLoad',
      duration: 500,
      delay: 0,
      easing: 'easeOut',
    }
    onChange([...animations, newAnimation])
    setExpandedAnimation(newAnimation.id)
  }

  const updateAnimation = (id: string, updates: Partial<AnimationConfig>) => {
    onChange(animations.map((anim) => (anim.id === id ? { ...anim, ...updates } : anim)))
  }

  const deleteAnimation = (id: string) => {
    onChange(animations.filter((anim) => anim.id !== id))
  }

  const previewAnimation = (animation: AnimationConfig) => {
    // This would trigger a preview in the canvas
    console.log('Preview animation:', animation)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Animations ({animations.length})
        </Label>
        <Button variant="primary" size="sm" onClick={addAnimation}>
          <Plus className="mr-1 h-3 w-3" />
          Add Animation
        </Button>
      </div>

      <AnimatePresence>
        {animations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8 text-center"
          >
            <Zap className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-500">
              No animations yet. Add one to bring your block to life!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {animations.map((animation, index) => (
              <motion.div
                key={animation.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GlassmorphicCard
                  className="cursor-pointer p-3"
                  variant="light"
                  onClick={() =>
                    setExpandedAnimation(expandedAnimation === animation.id ? null : animation.id)
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{animation.type}</p>
                        <p className="text-xs text-gray-500">
                          {animation.trigger} • {animation.duration}ms
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => previewAnimation(animation)}
                        className="h-8 w-8"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAnimation(animation.id)}
                        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {expandedAnimation === animation.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="mt-4 space-y-3 border-t pt-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Type</Label>
                            <Select
                              value={animation.type}
                              onValueChange={(value) =>
                                updateAnimation(animation.id, {
                                  type: value as AnimationConfig['type'],
                                })
                              }
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fade">Fade</SelectItem>
                                <SelectItem value="slide">Slide</SelectItem>
                                <SelectItem value="scale">Scale</SelectItem>
                                <SelectItem value="rotate">Rotate</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-xs">Trigger</Label>
                            <Select
                              value={animation.trigger}
                              onValueChange={(value) =>
                                updateAnimation(animation.id, {
                                  trigger: value as AnimationConfig['trigger'],
                                })
                              }
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="onLoad">On Load</SelectItem>
                                <SelectItem value="onScroll">On Scroll</SelectItem>
                                <SelectItem value="onHover">On Hover</SelectItem>
                                <SelectItem value="onClick">On Click</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {animation.type === 'slide' && (
                          <div>
                            <Label className="text-xs">Direction</Label>
                            <Select
                              value={animation.direction || 'up'}
                              onValueChange={(value) =>
                                updateAnimation(animation.id, {
                                  direction: value as 'up' | 'down' | 'left' | 'right',
                                })
                              }
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="up">Up</SelectItem>
                                <SelectItem value="down">Down</SelectItem>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="right">Right</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <Label className="text-xs">Duration</Label>
                            <span className="text-xs text-gray-500">{animation.duration}ms</span>
                          </div>
                          <Slider
                            value={[animation.duration]}
                            onValueChange={([value]: number[]) =>
                              updateAnimation(animation.id, { duration: value })
                            }
                            min={100}
                            max={2000}
                            step={50}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <Label className="text-xs">Delay</Label>
                            <span className="text-xs text-gray-500">{animation.delay || 0}ms</span>
                          </div>
                          <Slider
                            value={[animation.delay || 0]}
                            onValueChange={([value]: number[]) =>
                              updateAnimation(animation.id, { delay: value })
                            }
                            min={0}
                            max={2000}
                            step={50}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Easing</Label>
                          <Select
                            value={animation.easing || 'easeOut'}
                            onValueChange={(value) =>
                              updateAnimation(animation.id, { easing: value })
                            }
                          >
                            <SelectTrigger className="h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="linear">Linear</SelectItem>
                              <SelectItem value="easeIn">Ease In</SelectItem>
                              <SelectItem value="easeOut">Ease Out</SelectItem>
                              <SelectItem value="easeInOut">Ease In Out</SelectItem>
                              <SelectItem value="circIn">Circ In</SelectItem>
                              <SelectItem value="circOut">Circ Out</SelectItem>
                              <SelectItem value="backIn">Back In</SelectItem>
                              <SelectItem value="backOut">Back Out</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {animation.trigger === 'onScroll' && (
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <Label className="text-xs">Scroll Threshold</Label>
                              <span className="text-xs text-gray-500">
                                {Math.round((animation.scrollThreshold || 0.5) * 100)}%
                              </span>
                            </div>
                            <Slider
                              value={[animation.scrollThreshold || 0.5]}
                              onValueChange={([value]: number[]) =>
                                updateAnimation(animation.id, { scrollThreshold: value })
                              }
                              min={0}
                              max={1}
                              step={0.1}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </GlassmorphicCard>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
