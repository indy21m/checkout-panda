'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { 
  Upload, 
  X, 
  Loader2, 
  Search,
  Image as ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import debounce from 'lodash.debounce'

interface UnsplashPhoto {
  id: string
  urls: {
    raw: string
    regular: string
    small: string
    thumb: string
  }
  width: number
  height: number
  description: string
  user: {
    name: string
    username: string
    profile_url: string
  }
  links: {
    download: string
  }
  blur_hash?: string
}

interface ImagePickerProps {
  value?: string
  onChange: (url: string, attribution?: { name: string; username: string }) => void
  onRemove?: () => void
  label?: string
  placeholder?: string
  className?: string
  maxSize?: number // in MB
  accept?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function ImagePicker({
  value,
  onChange,
  onRemove,
  label = 'Image',
  placeholder = 'Choose an image',
  className,
  maxSize = 5,
  accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
  open: controlledOpen,
  onOpenChange,
  trigger
}: ImagePickerProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Unsplash state
  const [unsplashQuery, setUnsplashQuery] = useState('')
  const [unsplashResults, setUnsplashResults] = useState<UnsplashPhoto[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  // Debounced Unsplash search
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchUnsplash = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setUnsplashResults([])
        return
      }

      setIsSearching(true)
      try {
        const response = await fetch(`/api/unsplash?query=${encodeURIComponent(query)}`)
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to search images')
        }

        const data = await response.json()
        setUnsplashResults(data.results)
      } catch (error) {
        console.error('Unsplash search error:', error)
        toast.error(error instanceof Error ? error.message : 'Failed to search images')
        setUnsplashResults([])
      } finally {
        setIsSearching(false)
      }
    }, 500),
    []
  )

  useEffect(() => {
    searchUnsplash(unsplashQuery)
  }, [unsplashQuery, searchUnsplash])

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
      setOpen(false)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }, [maxSize, onChange, setOpen])

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
      try {
        new URL(urlInput)
        onChange(urlInput.trim())
        setUrlInput('')
        setOpen(false)
        toast.success('Image URL added')
      } catch {
        toast.error('Please enter a valid URL')
      }
    }
  }, [urlInput, onChange, setOpen])

  const handleUnsplashSelect = useCallback(async (photo: UnsplashPhoto) => {
    try {
      // Track download as per Unsplash guidelines
      await fetch('/api/unsplash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ downloadLocation: photo.links.download }),
      })

      // Use the regular size image
      onChange(photo.urls.regular, {
        name: photo.user.name,
        username: photo.user.username,
      })
      
      setOpen(false)
      toast.success(`Image by ${photo.user.name} selected`)
    } catch (error) {
      console.error('Failed to select image:', error)
      toast.error('Failed to select image')
    }
  }, [onChange, setOpen])

  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove()
    } else {
      onChange('')
    }
  }, [onChange, onRemove])

  return (
    <>
      {/* Trigger */}
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <div className={cn('space-y-4', className)}>
          {label && <Label>{label}</Label>}
          
          {value ? (
            // Image preview
            <div className="group relative overflow-hidden rounded-lg border border-gray-200">
              <img
                src={value}
                alt="Selected"
                className="h-48 w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setOpen(true)}
                >
                  Change
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="w-full rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-gray-400 transition-colors"
            >
              <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-sm font-medium text-gray-700">{placeholder}</p>
              <p className="mt-1 text-xs text-gray-500">Click to select an image</p>
            </button>
          )}
        </div>
      )}

      {/* Image Picker Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Select Image</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-6 grid w-fit grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="unsplash">
                <ImageIcon className="mr-2 h-4 w-4" />
                Unsplash
              </TabsTrigger>
              <TabsTrigger value="embed">Embed Link</TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="flex-1 p-6">
              <div
                className={cn(
                  'h-full rounded-lg border-2 border-dashed p-8 text-center transition-all flex flex-col items-center justify-center',
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
                    <Upload className="mb-4 h-16 w-16 text-gray-400" />
                    <p className="mb-2 text-lg font-medium text-gray-700">
                      Drop your image here to upload
                    </p>
                    <p className="mb-4 text-sm text-gray-500">
                      Works with any .JPG, .PNG, or .GIF file from the web
                    </p>
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose File
                    </Button>
                    <p className="mt-4 text-xs text-gray-400">
                      Max {maxSize}MB • JPEG, PNG, GIF, WebP
                    </p>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Unsplash Tab */}
            <TabsContent value="unsplash" className="flex-1 flex flex-col overflow-hidden p-6">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search free high resolution photos"
                    value={unsplashQuery}
                    onChange={(e) => setUnsplashQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : unsplashResults.length > 0 ? (
                  <div className="grid grid-cols-3 gap-4">
                    {unsplashResults.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative cursor-pointer overflow-hidden rounded-lg bg-gray-100"
                        onClick={() => handleUnsplashSelect(photo)}
                      >
                        <img
                          src={photo.urls.small}
                          alt={photo.description}
                          className="h-40 w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                            <p className="text-sm font-medium">by {photo.user.name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : unsplashQuery ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <ImageIcon className="mb-4 h-12 w-12" />
                    <p>No images found for &quot;{unsplashQuery}&quot;</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Search className="mb-4 h-12 w-12" />
                    <p>Search for beautiful, free photos from Unsplash</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Embed Link Tab */}
            <TabsContent value="embed" className="flex-1 p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-url">Image URL</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      id="image-url"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    />
                    <Button
                      type="button"
                      onClick={handleUrlSubmit}
                      disabled={!urlInput.trim()}
                    >
                      Add Image
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Paste any image URL from the web
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}