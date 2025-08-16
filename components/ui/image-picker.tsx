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
  Camera
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
            <motion.div 
              className="group relative overflow-hidden rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <img
                src={value}
                alt="Selected"
                className="h-48 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setOpen(true)}
                    className="bg-white/90 backdrop-blur text-gray-900 hover:bg-white shadow-lg"
                  >
                    <Camera className="h-4 w-4 mr-1" />
                    Change
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleRemove}
                    className="bg-red-500/90 backdrop-blur text-white hover:bg-red-600 shadow-lg"
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
              className="relative w-full rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8 text-center shadow-sm transition-all hover:shadow-md hover:border-gray-300 overflow-hidden group"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
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
        <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden bg-white/95 backdrop-blur-xl border border-gray-200">
          <DialogHeader className="px-6 pt-4 pb-3 border-b border-gray-100">
            <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Select Image
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="mx-6 mt-2 grid w-fit grid-cols-3 bg-gray-100/50 p-1 rounded-lg">
              <TabsTrigger value="upload" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="unsplash" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Camera className="h-4 w-4" />
                Unsplash
              </TabsTrigger>
              <TabsTrigger value="embed" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Link2 className="h-4 w-4" />
                Embed
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="flex-1 p-6">
              <motion.div
                className={cn(
                  'relative h-full rounded-xl border-2 border-dashed p-8 text-center transition-all flex flex-col items-center justify-center',
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
                  transition: { duration: 0.2 }
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
                    <div className="mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
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
                    <div className="mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="h-10 w-10 text-purple-600" />
                    </div>
                    <p className="mb-2 text-lg font-semibold text-gray-900">
                      Drop your image here
                    </p>
                    <p className="mb-6 text-sm text-gray-500">
                      or click to browse from your computer
                    </p>
                    <Button
                      type="button"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all"
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
            <TabsContent value="unsplash" className="flex-1 flex flex-col overflow-hidden p-6">
              <div className="mb-6">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                  <Input
                    type="text"
                    placeholder="Search millions of free high-resolution photos..."
                    value={unsplashQuery}
                    onChange={(e) => setUnsplashQuery(e.target.value)}
                    className="pl-11 pr-4 h-11 border-gray-200 rounded-lg focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto rounded-lg">
                {isSearching && !unsplashResults.length ? (
                  <motion.div 
                    className="flex items-center justify-center h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-center">
                      <div className="mb-4 h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
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
                        className="group relative cursor-pointer overflow-hidden rounded-lg bg-gray-100 shadow-sm hover:shadow-xl transition-all"
                        onClick={() => handleUnsplashSelect(photo)}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="aspect-[4/3] relative">
                          <img
                            src={photo.urls.small}
                            alt={photo.description}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                              <p className="text-sm font-medium drop-shadow-lg">by {photo.user.name}</p>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="h-12 w-12 rounded-full bg-white/90 backdrop-blur flex items-center justify-center">
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
                    className="flex flex-col items-center justify-center h-full"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium">No images found</p>
                    <p className="text-sm text-gray-500 mt-1">Try searching for something else</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="flex flex-col items-center justify-center h-full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="mb-4 h-20 w-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <Camera className="h-10 w-10 text-purple-600" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">Search Unsplash</p>
                    <p className="text-sm text-gray-500 text-center max-w-md px-4">
                      Access millions of free, high-quality photos from the Unsplash community
                    </p>
                  </motion.div>
                )}
              </div>
            </TabsContent>

            {/* Embed Link Tab */}
            <TabsContent value="embed" className="flex-1 p-6">
              <motion.div 
                className="h-full flex flex-col items-center justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full max-w-md space-y-6">
                  <div className="text-center mb-6">
                    <div className="mb-4 h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <Link2 className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Embed from URL</h3>
                    <p className="text-sm text-gray-500 mt-1">Paste any image URL from the web</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        id="image-url"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                        className="pr-24 h-12 rounded-lg border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 transition-all"
                      />
                      <Button
                        type="button"
                        onClick={handleUrlSubmit}
                        disabled={!urlInput.trim()}
                        className="absolute right-1 top-1 h-10 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="h-px flex-1 bg-gray-200" />
                      <span>Supported formats</span>
                      <div className="h-px flex-1 bg-gray-200" />
                    </div>
                    
                    <div className="flex justify-center gap-3 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded">JPEG</span>
                      <span className="px-2 py-1 bg-gray-100 rounded">PNG</span>
                      <span className="px-2 py-1 bg-gray-100 rounded">GIF</span>
                      <span className="px-2 py-1 bg-gray-100 rounded">WebP</span>
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