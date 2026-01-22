'use client'

import { useState, useCallback, useRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RefreshCw, Upload, X, Link2 } from 'lucide-react'

const uploadZoneVariants = cva(
  'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
  {
    variants: {
      state: {
        default: 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100',
        active: 'border-blue-500 bg-blue-50',
        error: 'border-red-300 bg-red-50',
      },
      size: {
        sm: 'h-32 p-4',
        md: 'h-40 p-6',
        lg: 'h-48 p-8',
      },
    },
    defaultVariants: {
      state: 'default',
      size: 'md',
    },
  }
)

interface ImageUploadProps extends VariantProps<typeof uploadZoneVariants> {
  value: string
  onChange: (url: string) => void
  className?: string
}

export function ImageUpload({ value, onChange, size, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInputValue, setUrlInputValue] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true)
      setError(null)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error ?? 'Upload failed')
        }

        onChange(data.url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setIsUploading(false)
      }
    },
    [onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        void handleUpload(file)
      } else {
        setError('Please drop an image file')
      }
    },
    [handleUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        void handleUpload(file)
      }
    },
    [handleUpload]
  )

  const handleUrlSubmit = useCallback(() => {
    if (urlInputValue.trim()) {
      onChange(urlInputValue.trim())
      setShowUrlInput(false)
      setUrlInputValue('')
    }
  }, [urlInputValue, onChange])

  const handleRemove = useCallback(() => {
    onChange('')
  }, [onChange])

  const getState = (): 'default' | 'active' | 'error' => {
    if (error) return 'error'
    if (isDragging) return 'active'
    return 'default'
  }

  // Show preview if image is set
  if (value && !showUrlInput) {
    return (
      <div className={cn('relative', className)}>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Product preview" className="h-full w-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1 truncate text-xs text-gray-500">{value}</p>
      </div>
    )
  }

  // URL input mode
  if (showUrlInput) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex gap-2">
          <Input
            type="url"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            placeholder="https://example.com/image.jpg"
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
          />
          <Button type="button" onClick={handleUrlSubmit} disabled={!urlInputValue.trim()}>
            Use
          </Button>
        </div>
        <button
          type="button"
          onClick={() => setShowUrlInput(false)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Back to upload
        </button>
      </div>
    )
  }

  // Upload zone
  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(uploadZoneVariants({ state: getState(), size }), 'cursor-pointer')}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />

        {isUploading ? (
          <>
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-gray-400" />
            <p className="mt-2 text-center text-sm text-gray-500">
              Drop image here or click to upload
            </p>
            <p className="text-xs text-gray-400">JPG, PNG, WebP, GIF up to 5MB</p>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={() => setShowUrlInput(true)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
      >
        <Link2 className="h-3 w-3" />
        Use URL instead
      </button>
    </div>
  )
}
