'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  X,
  Loader2,
  Search,
  Image as ImageIcon,
  Link2,
  Sparkles,
  Camera,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
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
  trigger,
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

  const handleFileUpload = useCallback(
    async (file: File) => {
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
    },
    [maxSize, onChange, setOpen]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileUpload(file)
      }
    },
    [handleFileUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith('image/')) {
        handleFileUpload(file)
      }
    },
    [handleFileUpload]
  )

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

  const handleUnsplashSelect = useCallback(
    async (photo: UnsplashPhoto) => {
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
    },
    [onChange, setOpen]
  )

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
            <motion.div
              className="group relative overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <img src={value} alt="Selected" className="h-48 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="absolute right-0 bottom-0 left-0 flex items-center justify-center gap-2 p-4">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setOpen(true)}
                    className="bg-white/90 text-gray-900 shadow-lg backdrop-blur hover:bg-white"
                  >
                    <Camera className="mr-1 h-4 w-4" />
                    Change
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleRemove}
                    className="bg-red-500/90 text-white shadow-lg backdrop-blur hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.button
              type="button"
              onClick={() => setOpen(true)}
              className="group relative w-full overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 text-center shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
                  <ImageIcon className="h-7 w-7 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">{placeholder}</p>
                <p className="mt-1 text-xs text-gray-500">Click to browse or drag and drop</p>
              </div>
            </motion.button>
          )}
        </div>
      )}

      {/* Image Picker Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="h-[75vh] max-w-4xl overflow-hidden border border-gray-200 bg-white/95 p-0 backdrop-blur-xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
            <div className="border-b border-gray-100">
              <div className="flex items-center justify-between px-4 pt-3 pb-1">
                <DialogTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-base font-semibold text-transparent">
                  Select Image
                </DialogTitle>
              </div>
              <TabsList className="ml-4 grid h-auto w-fit grid-cols-3 bg-transparent p-0">
                <TabsTrigger
                  value="upload"
                  className="flex items-center gap-1.5 border-b-2 px-4 pb-2 transition-all data-[state=active]:border-purple-500 data-[state=active]:text-purple-600 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-500"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger
                  value="unsplash"
                  className="flex items-center gap-1.5 border-b-2 px-4 pb-2 transition-all data-[state=active]:border-purple-500 data-[state=active]:text-purple-600 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-500"
                >
                  <Camera className="h-4 w-4" />
                  Unsplash
                </TabsTrigger>
                <TabsTrigger
                  value="embed"
                  className="flex items-center gap-1.5 border-b-2 px-4 pb-2 transition-all data-[state=active]:border-purple-500 data-[state=active]:text-purple-600 data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-500"
                >
                  <Link2 className="h-4 w-4" />
                  Embed
                </TabsTrigger>
              </TabsList>
            </div>
            {/* Upload Tab */}
            <TabsContent value="upload" className="flex-1 p-4">
              <motion.div
                className={cn(
                  'relative flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all',
                  isDragging
                    ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50'
                    : 'border-gray-200 bg-gradient-to-br from-gray-50/50 to-white hover:border-gray-300',
                  isUploading && 'pointer-events-none opacity-50'
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                animate={{
                  scale: isDragging ? 1.02 : 1,
                  transition: { duration: 0.2 },
                }}
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
                  <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
                      <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">Uploading your image...</p>
                    <p className="mt-1 text-xs text-gray-500">This will just take a moment</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center"
                  >
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100 transition-transform group-hover:scale-110">
                      <Upload className="h-10 w-10 text-purple-600" />
                    </div>
                    <p className="mb-2 text-lg font-semibold text-gray-900">Drop your image here</p>
                    <p className="mb-6 text-sm text-gray-500">
                      or click to browse from your computer
                    </p>
                    <Button
                      type="button"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-lg"
                      size="lg"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                    <div className="mt-6 flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Max {maxSize}MB
                      </span>
                      <span>•</span>
                      <span>JPEG, PNG, GIF, WebP</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            {/* Unsplash Tab */}
            <TabsContent value="unsplash" className="flex flex-1 flex-col overflow-hidden p-4">
              <div className="mb-4">
                <div className="group relative">
                  <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-purple-500" />
                  <Input
                    type="text"
                    placeholder="Search millions of free high-resolution photos..."
                    value={unsplashQuery}
                    onChange={(e) => setUnsplashQuery(e.target.value)}
                    className="h-11 rounded-lg border-gray-200 pr-4 pl-11 transition-all focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                  />
                  {isSearching && (
                    <div className="absolute top-1/2 right-3 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto rounded-lg">
                {isSearching && !unsplashResults.length ? (
                  <motion.div
                    className="flex h-full items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                      </div>
                      <p className="text-sm text-gray-600">Searching Unsplash...</p>
                    </div>
                  </motion.div>
                ) : unsplashResults.length > 0 ? (
                  <motion.div
                    className="grid grid-cols-3 gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {unsplashResults.map((photo, index) => (
                      <motion.div
                        key={photo.id}
                        className="group relative cursor-pointer overflow-hidden rounded-lg bg-gray-100 shadow-sm transition-all hover:shadow-xl"
                        onClick={() => handleUnsplashSelect(photo)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative aspect-[4/3]">
                          <img
                            src={photo.urls.small}
                            alt={photo.description}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                            <div className="absolute right-0 bottom-0 left-0 translate-y-2 transform p-3 text-white transition-transform group-hover:translate-y-0">
                              <p className="text-sm font-medium drop-shadow-lg">
                                by {photo.user.name}
                              </p>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur">
                                <Camera className="h-6 w-6 text-purple-600" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : unsplashQuery ? (
                  <motion.div
                    className="flex h-full flex-col items-center justify-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-600">No images found</p>
                    <p className="mt-1 text-sm text-gray-500">Try searching for something else</p>
                  </motion.div>
                ) : (
                  <motion.div
                    className="flex h-full flex-col items-center justify-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
                      <Camera className="h-10 w-10 text-purple-600" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">Search Unsplash</p>
                    <p className="mt-2 text-sm text-gray-500">
                      Access millions of free, high-quality photos
                    </p>
                  </motion.div>
                )}
              </div>
            </TabsContent>

            {/* Embed Link Tab */}
            <TabsContent value="embed" className="flex-1 p-4">
              <motion.div
                className="flex h-full flex-col items-center justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full max-w-xl px-8">
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
                      <Link2 className="h-10 w-10 text-purple-600" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold whitespace-nowrap text-gray-900">
                      Embed from URL
                    </h3>
                    <p className="text-sm whitespace-nowrap text-gray-500">
                      Paste any image URL from the web to use it
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label
                        htmlFor="image-url"
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        Image URL
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="image-url"
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                          className="h-11 flex-1 rounded-lg border-gray-200 transition-all focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
                        />
                        <Button
                          type="button"
                          onClick={handleUrlSubmit}
                          disabled={!urlInput.trim()}
                          className="h-11 bg-gradient-to-r from-purple-500 to-pink-500 px-6 text-white shadow-md transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Add Image
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <p className="mb-3 text-center text-xs whitespace-nowrap text-gray-500">
                        Supported formats
                      </p>
                      <div className="flex justify-center gap-2">
                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-gray-600">
                          JPEG
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-gray-600">
                          PNG
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-gray-600">
                          GIF
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-gray-600">
                          WebP
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}
