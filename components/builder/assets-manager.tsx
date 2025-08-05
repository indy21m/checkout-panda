'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Upload,
  Search,
  Grid,
  List,
  Trash2,
  Download,
  Copy,
  Check,
  X,
  Plus,
  Eye,
  MoreVertical,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Asset {
  id: string
  name: string
  type: 'image' | 'video' | 'document' | 'audio'
  url: string
  thumbnailUrl?: string
  size: number
  dimensions?: { width: number; height: number }
  duration?: number
  uploadedAt: Date
  folder?: string
  tags?: string[]
  alt?: string
  description?: string
}

interface AssetsManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectAsset?: (asset: Asset) => void
  selectionMode?: 'single' | 'multiple'
  acceptedTypes?: string[]
}

const ASSET_TYPES = [
  { value: 'all', label: 'All Files', icon: FileText },
  { value: 'image', label: 'Images', icon: ImageIcon },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'document', label: 'Documents', icon: FileText },
  { value: 'audio', label: 'Audio', icon: Music },
]

const SAMPLE_ASSETS: Asset[] = [
  {
    id: '1',
    name: 'hero-background.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
    size: 2048000,
    dimensions: { width: 1920, height: 1080 },
    uploadedAt: new Date('2024-01-15'),
    folder: 'backgrounds',
    tags: ['hero', 'gradient', 'abstract'],
  },
  {
    id: '2',
    name: 'product-demo.mp4',
    type: 'video',
    url: 'https://example.com/demo.mp4',
    thumbnailUrl: 'https://via.placeholder.com/400x225',
    size: 15728640,
    duration: 120,
    uploadedAt: new Date('2024-01-20'),
    folder: 'videos',
    tags: ['demo', 'product'],
  },
  // Add more sample assets as needed
]

function AssetCard({
  asset,
  selected,
  onSelect,
  viewMode,
}: {
  asset: Asset
  selected: boolean
  onSelect: () => void
  viewMode: 'grid' | 'list'
}) {
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(asset.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const AssetIcon = ASSET_TYPES.find((t) => t.value === asset.type)?.icon || FileText

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
        className={cn(
          'flex cursor-pointer items-center gap-4 rounded-lg border p-3 transition-all',
          selected ? 'border-purple-500 bg-purple-50' : 'border-transparent hover:border-gray-200'
        )}
        onClick={onSelect}
      >
        <div className="relative">
          {asset.type === 'image' && asset.thumbnailUrl ? (
            <img
              src={asset.thumbnailUrl}
              alt={asset.name}
              className="h-10 w-10 rounded object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
              <AssetIcon className="h-5 w-5 text-gray-500" />
            </div>
          )}
          {selected && (
            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-500">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{asset.name}</p>
          <p className="text-sm text-gray-500">
            {formatFileSize(asset.size)} • {new Date(asset.uploadedAt).toLocaleDateString()}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShowPreview(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyUrl}>
              <Copy className="mr-2 h-4 w-4" />
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all',
        selected
          ? 'border-purple-500 shadow-lg'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
      )}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {asset.type === 'image' && asset.thumbnailUrl ? (
          <img src={asset.thumbnailUrl} alt={asset.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <AssetIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {/* Selection indicator */}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center bg-purple-500/20">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500">
              <Check className="h-6 w-6 text-white" />
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                setShowPreview(true)
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                handleCopyUrl()
              }}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="mb-1 truncate font-medium">{asset.name}</p>
        <p className="text-xs text-gray-500">
          {formatFileSize(asset.size)}
          {asset.dimensions && ` • ${asset.dimensions.width}×${asset.dimensions.height}`}
          {asset.duration &&
            ` • ${Math.floor(asset.duration / 60)}:${(asset.duration % 60).toString().padStart(2, '0')}`}
        </p>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{asset.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {asset.type === 'image' ? (
                  <img src={asset.url} alt={asset.name} className="w-full rounded-lg" />
                ) : asset.type === 'video' ? (
                  <video src={asset.url} controls className="w-full rounded-lg" />
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-lg bg-gray-100">
                    <AssetIcon className="h-24 w-24 text-gray-400" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Size:</span>{' '}
                    <span className="font-medium">{formatFileSize(asset.size)}</span>
                  </div>
                  {asset.dimensions && (
                    <div>
                      <span className="text-gray-500">Dimensions:</span>{' '}
                      <span className="font-medium">
                        {asset.dimensions.width}×{asset.dimensions.height}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Uploaded:</span>{' '}
                    <span className="font-medium">
                      {new Date(asset.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {asset.folder && (
                    <div>
                      <span className="text-gray-500">Folder:</span>{' '}
                      <span className="font-medium">{asset.folder}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={handleCopyUrl}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy URL
                  </Button>
                  <Button>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function AssetsManager({
  open,
  onOpenChange,
  onSelectAsset,
  selectionMode = 'single',
  acceptedTypes = ['image', 'video', 'document', 'audio'],
}: AssetsManagerProps) {
  const [assets] = useState<Asset[]>(SAMPLE_ASSETS)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeType, setActiveType] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url')
  const [uploadUrl, setUploadUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = activeType === 'all' || asset.type === activeType
    return matchesSearch && matchesType && acceptedTypes.includes(asset.type)
  })

  const handleSelectAsset = (assetId: string) => {
    if (selectionMode === 'single') {
      setSelectedAssets([assetId])
      const asset = assets.find((a) => a.id === assetId)
      if (asset && onSelectAsset) {
        onSelectAsset(asset)
        onOpenChange(false)
      }
    } else {
      setSelectedAssets((prev) =>
        prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
      )
    }
  }

  const handleUpload = async () => {
    setIsUploading(true)
    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsUploading(false)
    setUploadUrl('')
    // In real implementation, add the uploaded asset to the list
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-6xl overflow-hidden p-0">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-56 border-r bg-gray-50 p-4">
            <DialogHeader className="mb-6">
              <DialogTitle>Assets Library</DialogTitle>
              <DialogDescription>Manage and select media files</DialogDescription>
            </DialogHeader>

            {/* Upload Section */}
            <div className="mb-6">
              <Button className="w-full" onClick={() => setUploadMode('url')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Asset
              </Button>
            </div>

            {/* Asset Types */}
            <div className="space-y-1">
              {ASSET_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setActiveType(value)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    activeType === value
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Storage Info */}
            <div className="mt-auto border-t pt-6">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Storage Used</span>
                  <span className="font-medium">2.4 GB</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-purple-500" style={{ width: '24%' }} />
                </div>
                <p className="text-xs text-gray-500">2.4 GB of 10 GB used</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative max-w-md flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'text-purple-600' : ''}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'text-purple-600' : ''}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Upload Area */}
            {uploadMode && (
              <div className="border-b bg-purple-50 p-4">
                <div className="flex items-center gap-4">
                  <Tabs
                    value={uploadMode}
                    onValueChange={(v) => setUploadMode(v as 'url' | 'file')}
                    className="flex-1"
                  >
                    <TabsList>
                      <TabsTrigger value="url">From URL</TabsTrigger>
                      <TabsTrigger value="file">Upload File</TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="mt-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Paste image or video URL..."
                          value={uploadUrl}
                          onChange={(e) => setUploadUrl(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={handleUpload} disabled={!uploadUrl || isUploading}>
                          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="file" className="mt-4">
                      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                        <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <p className="mb-2 text-gray-600">Drag and drop files here</p>
                        <Button variant="secondary">Browse Files</Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                  <Button variant="ghost" size="icon" onClick={() => setUploadMode('url')}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Assets Grid/List */}
            <div className="flex-1 overflow-auto p-4">
              {filteredAssets.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <FileText className="mb-4 h-12 w-12 text-gray-300" />
                  <p className="mb-2 text-gray-500">No assets found</p>
                  <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className={cn(viewMode === 'grid' ? 'grid grid-cols-4 gap-4' : 'space-y-2')}>
                  {filteredAssets.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={asset}
                      selected={selectedAssets.includes(asset.id)}
                      onSelect={() => handleSelectAsset(asset.id)}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {selectionMode === 'multiple' && selectedAssets.length > 0 && (
              <div className="flex items-center justify-between border-t bg-gray-50 p-4">
                <p className="text-sm text-gray-600">
                  {selectedAssets.length} asset{selectedAssets.length > 1 ? 's' : ''} selected
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => setSelectedAssets([])}>
                    Clear
                  </Button>
                  <Button
                    onClick={() => {
                      const selectedAssetObjects = assets.filter((a) =>
                        selectedAssets.includes(a.id)
                      )
                      selectedAssetObjects.forEach((asset) => onSelectAsset?.(asset))
                      onOpenChange(false)
                    }}
                  >
                    Select {selectedAssets.length} Asset{selectedAssets.length > 1 ? 's' : ''}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
