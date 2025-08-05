'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Maximize2,
  Minimize2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Zap,
  Eye,
  Settings,
  RotateCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBuilderStore } from '@/stores/builder-store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface LivePreviewProps {
  checkoutSlug: string
  className?: string
}

const DEVICE_PRESETS = [
  { id: 'desktop', name: 'Desktop', icon: Monitor, width: '100%', height: '100%' },
  { id: 'tablet', name: 'Tablet', icon: Tablet, width: '768px', height: '1024px' },
  { id: 'mobile', name: 'Mobile', icon: Smartphone, width: '375px', height: '812px' },
]

const PREVIEW_MODES = [
  { id: 'live', name: 'Live Preview', description: 'Real-time updates' },
  { id: 'test', name: 'Test Mode', description: 'With test data' },
  { id: 'published', name: 'Published', description: 'Current live version' },
]

export function LivePreview({ checkoutSlug, className }: LivePreviewProps) {
  const [device, setDevice] = useState('desktop')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [previewMode, setPreviewMode] = useState('live')
  const [showInteractions, setShowInteractions] = useState(true)
  const [scale, setScale] = useState(100)
  const [rotation, setRotation] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { sections, hasUnsavedChanges } = useBuilderStore()

  // Generate preview URL based on mode
  const previewUrl = `/c/${checkoutSlug}?preview=${previewMode}&device=${device}`

  // Sync changes to preview
  useEffect(() => {
    if (hasUnsavedChanges && iframeRef.current && previewMode === 'live') {
      setIsSyncing(true)

      // Send updated data to iframe
      const message = {
        type: 'updatePreview',
        sections,
        timestamp: Date.now(),
      }

      iframeRef.current.contentWindow?.postMessage(message, '*')

      // Simulate sync delay
      setTimeout(() => setIsSyncing(false), 500)
    }
  }, [sections, hasUnsavedChanges, previewMode])

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  // Refresh preview
  const refreshPreview = () => {
    if (iframeRef.current) {
      setIsLoading(true)
      iframeRef.current.src = iframeRef.current.src
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else if (document.exitFullscreen) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Handle device rotation
  const rotateDevice = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const selectedDevice = DEVICE_PRESETS.find((d) => d.id === device) || DEVICE_PRESETS[0]!
  const isRotated = rotation === 90 || rotation === 270

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex h-full flex-col bg-gradient-to-br from-gray-50 to-white',
        isFullscreen && 'fixed inset-0 z-50',
        className
      )}
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between gap-4 border-b bg-white/80 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          {/* Device Selector */}
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1">
            {DEVICE_PRESETS.map((preset) => {
              const Icon = preset.icon
              return (
                <Button
                  key={preset.id}
                  variant={device === preset.id ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setDevice(preset.id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{preset.name}</span>
                </Button>
              )
            })}
          </div>

          {/* Preview Mode */}
          <Select value={previewMode} onValueChange={setPreviewMode}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PREVIEW_MODES.map((mode) => (
                <SelectItem key={mode.id} value={mode.id}>
                  <div>
                    <div className="font-medium">{mode.name}</div>
                    <div className="text-xs text-gray-500">{mode.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sync Status */}
          <AnimatePresence>
            {isSyncing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1.5 text-sm text-purple-700"
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                Syncing...
              </motion.div>
            )}
            {!isSyncing && hasUnsavedChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1.5 text-sm text-yellow-700"
              >
                <AlertCircle className="h-3 w-3" />
                Unsaved changes
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {/* Scale Control */}
          <div className="flex items-center gap-2">
            <Label className="text-sm">Scale</Label>
            <Slider
              value={[scale]}
              onValueChange={([value]) => setScale(value || 100)}
              min={50}
              max={150}
              step={10}
              className="w-24"
            />
            <span className="w-10 text-sm text-gray-500">{scale}%</span>
          </div>

          {/* Action Buttons */}
          <Button
            variant="ghost"
            size="icon"
            onClick={rotateDevice}
            disabled={device === 'desktop'}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={refreshPreview}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => window.open(previewUrl, '_blank')}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Settings Bar */}
      <div className="flex items-center gap-4 border-b bg-gray-50 px-4 py-2">
        <div className="flex items-center gap-2">
          <Switch
            id="show-interactions"
            checked={showInteractions}
            onCheckedChange={setShowInteractions}
          />
          <Label htmlFor="show-interactions" className="text-sm">
            Show interactions
          </Label>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Zap className="h-3 w-3" />
          Real-time sync enabled
        </div>
      </div>

      {/* Preview Container */}
      <div className="relative flex-1 overflow-hidden bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          {/* Device Frame */}
          <motion.div
            animate={{
              rotate: rotation,
              scale: scale / 100,
            }}
            transition={{ type: 'spring', damping: 20 }}
            className={cn(
              'relative overflow-hidden rounded-lg bg-white shadow-2xl transition-all',
              device !== 'desktop' && 'ring-8 ring-gray-800',
              isRotated && device !== 'desktop' && 'aspect-[16/9]'
            )}
            style={{
              width:
                isRotated && device !== 'desktop' ? selectedDevice.height : selectedDevice.width,
              height:
                isRotated && device !== 'desktop' ? selectedDevice.width : selectedDevice.height,
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            {/* Device Notch (for mobile) */}
            {device === 'mobile' && (
              <div className="absolute top-0 left-1/2 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-gray-800" />
            )}

            {/* Loading State */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex items-center justify-center bg-white"
                >
                  <div className="text-center">
                    <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-purple-600" />
                    <p className="text-gray-600">Loading preview...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Iframe */}
            <iframe
              ref={iframeRef}
              src={previewUrl}
              onLoad={handleIframeLoad}
              className="h-full w-full border-0"
              title="Checkout Preview"
              sandbox="allow-scripts allow-forms allow-same-origin"
            />

            {/* Interaction Overlay */}
            {showInteractions && !isLoading && (
              <div className="pointer-events-none absolute inset-0">
                <motion.div
                  className="absolute top-20 left-20 h-6 w-6 rounded-full bg-purple-500 opacity-50"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0.2, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                <motion.div
                  className="absolute right-20 bottom-32 h-8 w-8 rounded-full bg-blue-500 opacity-50"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0.3, 0.5],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    delay: 0.5,
                  }}
                />
              </div>
            )}
          </motion.div>

          {/* Dimension Info */}
          {device !== 'desktop' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 rounded-full bg-gray-900/80 px-3 py-1.5 text-xs text-white backdrop-blur-sm"
            >
              {isRotated
                ? `${selectedDevice.height} × ${selectedDevice.width}`
                : `${selectedDevice.width} × ${selectedDevice.height}`}
            </motion.div>
          )}
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="flex items-center justify-between border-t bg-white p-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Eye className="h-4 w-4" />
          Preview URL: <code className="rounded bg-gray-100 px-2 py-0.5">{previewUrl}</code>
        </div>
        <Button size="sm" variant="ghost" className="gap-2">
          <Settings className="h-4 w-4" />
          Preview Settings
        </Button>
      </div>
    </div>
  )
}
