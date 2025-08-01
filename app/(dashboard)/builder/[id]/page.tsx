'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Save, Eye, Rocket, ArrowLeft, Palette, Code } from 'lucide-react'
import Link from 'next/link'
import { BuilderCanvas } from '@/components/builder/builder-canvas'
import { BlockLibrary } from '@/components/builder/block-library'
import { PropertiesPanel } from '@/components/builder/properties-panel'

export default function BuilderPage() {
  const params = useParams()
  const checkoutId = params?.id as string

  const [pageData, setPageData] = useState<{
    blocks: Array<{
      id: string
      type: string
      position: number
      data: Record<string, unknown>
      styles: Record<string, unknown>
    }>
    settings: {
      theme: string
      customCss?: string
      seoMeta?: Record<string, unknown>
    }
  }>({
    blocks: [],
    settings: {
      theme: 'default',
    },
  })

  const [selectedBlockId, setSelectedBlockId] = useState<string | undefined>()
  const [showProperties, setShowProperties] = useState(true)
  const [isAddingBlock, setIsAddingBlock] = useState(false)

  // Fetch checkout data
  const { data: checkout, isLoading } = api.checkout.getById.useQuery({ id: checkoutId })

  // Save mutation
  const saveCheckout = api.checkout.savePageData.useMutation({
    onSuccess: (data) => {
      if (data?.status === 'published') {
        toast.success('Checkout published successfully!')
      } else {
        toast.success('Checkout saved!')
      }
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  // Load checkout data
  useEffect(() => {
    if (checkout) {
      setPageData(checkout.pageData)
    }
  }, [checkout])

  const handleSave = (publish = false) => {
    saveCheckout.mutate({
      id: checkoutId,
      pageData,
      publish,
    })
  }

  const addBlock = (type: string) => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      position: pageData.blocks.length,
      data: getDefaultBlockData(type),
      styles: {},
    }

    setPageData({
      ...pageData,
      blocks: [...pageData.blocks, newBlock],
    })

    // Select the newly added block
    setSelectedBlockId(newBlock.id)
    setIsAddingBlock(false)
  }

  const getDefaultBlockData = (type: string) => {
    switch (type) {
      case 'hero':
        return {
          headline: 'Welcome to Our Checkout',
          subheadline: 'Complete your purchase in just a few steps',
          backgroundType: 'gradient',
          gradient: { type: 'aurora', animate: true },
        }
      case 'product':
        return {
          productName: 'Amazing Product',
          productDescription: 'This is an incredible product that will change your life.',
          price: 9900, // $99.00
          currency: 'USD',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          layout: 'side-by-side',
        }
      case 'payment':
        return {
          fields: ['email', 'card'],
          buttonText: 'Complete Purchase',
          securityBadges: true,
        }
      case 'testimonial':
        return {
          testimonials: [
            {
              id: '1',
              name: 'John Doe',
              role: 'CEO',
              content: 'This product exceeded all my expectations!',
              rating: 5,
            },
          ],
          layout: 'single',
          showRating: true,
        }
      case 'trust':
        return {
          badges: [
            { id: '1', type: 'security', text: 'SSL Secured' },
            { id: '2', type: 'payment', text: 'Safe Payments' },
            { id: '3', type: 'guarantee', text: '30-Day Guarantee' },
          ],
          layout: 'horizontal',
          showIcons: true,
        }
      case 'bump':
        return {
          headline: 'Add Our Best-Selling Guide',
          description:
            'Get instant access to our comprehensive guide that complements your purchase perfectly.',
          badge: 'LIMITED OFFER',
          originalPrice: 4900, // $49.00
          discountedPrice: 2900, // $29.00
          discountPercent: 40,
          features: ['Step-by-step tutorials', 'Bonus templates included', 'Lifetime updates'],
          urgencyText: 'Only available at checkout!',
          checkboxText: 'Yes! Add this special offer to my order',
        }
      default:
        return {}
    }
  }

  const updateBlock = (
    blockId: string,
    data: Record<string, unknown>,
    styles: Record<string, unknown>
  ) => {
    setPageData({
      ...pageData,
      blocks: pageData.blocks.map((block) =>
        block.id === blockId ? { ...block, data, styles } : block
      ),
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-400">Loading checkout...</p>
      </div>
    )
  }

  if (!checkout) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">Checkout not found</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Link href="/checkouts">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">{checkout.name}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowProperties(!showProperties)}
              title="Toggle properties panel"
            >
              <Palette className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title="View page settings">
              <Code className="h-4 w-4" />
            </Button>
            <div className="mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700" />
            <Button variant="ghost" onClick={() => handleSave()}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <a href={`/c/${checkout.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </a>
            <Button
              variant="primary"
              onClick={() => handleSave(true)}
              disabled={saveCheckout.isPending}
            >
              <Rocket className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>
      </div>

      {/* Builder Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Block Library */}
        {isAddingBlock && (
          <div className="w-80 flex-shrink-0">
            <BlockLibrary onAddBlock={addBlock} />
          </div>
        )}

        {/* Canvas */}
        <div className="flex-1">
          <BuilderCanvas
            blocks={pageData.blocks}
            onBlocksChange={(blocks) => setPageData({ ...pageData, blocks })}
            onBlockSelect={setSelectedBlockId}
            onAddBlock={() => setIsAddingBlock(true)}
            selectedBlockId={selectedBlockId}
          />
        </div>

        {/* Properties Panel */}
        {showProperties && (
          <div className="w-80 flex-shrink-0">
            <PropertiesPanel
              block={pageData.blocks.find((b) => b.id === selectedBlockId)}
              onClose={() => setSelectedBlockId(undefined)}
              onUpdate={updateBlock}
            />
          </div>
        )}
      </div>
    </div>
  )
}
