'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Link, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  label?: string
  placeholder?: string
  className?: string
  maxSize?: number // in MB
  accept?: string
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  label = 'Image',
  placeholder = 'Upload image',
  className,
  maxSize = 5,
  accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = useCallback(async (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.')
      return
    }

    // Validate file size
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      toast.error(`File too large. Maximum size is ${maxSize}MB.`)
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      onChange(data.url)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }, [maxSize, onChange])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleUrlSubmit = useCallback(() => {
    if (urlInput.trim()) {
      // Basic URL validation
      try {
        new URL(urlInput)
        onChange(urlInput.trim())
        setUrlInput('')
        setShowUrlInput(false)
        toast.success('Image URL added')
      } catch {
        toast.error('Please enter a valid URL')
      }
    }
  }, [urlInput, onChange])

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove()
    } else {
      onChange('')
    }
  }, [onChange, onRemove])

  return (
    <div className={cn('space-y-4', className)}>
      {label && <Label>{label}</Label>}
      
      {value ? (
        // Image preview
        <div className="group relative overflow-hidden rounded-lg border border-gray-200">
          <img
            src={value}
            alt="Uploaded"
            className="h-48 w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRemove}
            >
              <X className="mr-1 h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Upload area */}
          <div
            className={cn(
              'relative rounded-lg border-2 border-dashed p-8 text-center transition-all',
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400',
              isUploading && 'pointer-events-none opacity-50'
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-500" />
                <p className="text-sm font-medium text-gray-700">Uploading...</p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="mb-2 text-sm font-medium text-gray-700">
                  {placeholder}
                </p>
                <p className="mb-4 text-xs text-gray-500">
                  Drag and drop or click to browse
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
                <p className="mt-2 text-xs text-gray-400">
                  Max {maxSize}MB • JPEG, PNG, GIF, WebP
                </p>
              </>
            )}
          </div>

          {/* URL input option */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="bg-white px-4 text-gray-500 hover:text-gray-700"
              >
                <Link className="mr-1 inline h-3 w-3" />
                Or use image URL
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showUrlInput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleUrlSubmit}
                    disabled={!urlInput.trim()}
                  >
                    Add
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}