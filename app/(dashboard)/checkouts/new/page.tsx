import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createApi } from '@/lib/trpc/server'
import { ArrowRight, ShoppingCart, Package } from 'lucide-react'
import Link from 'next/link'

export default async function NewCheckoutPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  let products: Array<{ id: string; name: string; price: number }> = []
  let hasProducts = false

  try {
    const api = await createApi()
    products = await api.product.list({ includeArchived: false })
    hasProducts = products.length > 0
  } catch (error) {
    console.error('Failed to fetch products:', error)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Create New Checkout</h1>
          <p className="text-text-secondary text-lg">
            Set up a beautiful checkout page for your product
          </p>
        </div>

        {!hasProducts ? (
          <GlassmorphicCard className="p-12" variant="light">
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200">
                <Package className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="mb-2 text-2xl font-semibold">No Products Yet</h2>
              <p className="text-text-secondary mx-auto mb-6 max-w-md">
                You need to create a product before you can build a checkout page.
              </p>
              <Link href="/products">
                <Button variant="primary" size="lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Create Your First Product
                </Button>
              </Link>
            </div>
          </GlassmorphicCard>
        ) : (
          <form className="space-y-6">
            <GlassmorphicCard className="p-6" variant="light">
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-semibold">Basic Information</h2>
                <p className="text-text-secondary">
                  Give your checkout page a name and select a product
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Checkout Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Premium Course Checkout"
                    required
                    className="glass-morphism"
                  />
                  <p className="text-text-tertiary text-xs">
                    This is for your reference only - customers won&apos;t see this
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product">Select Product</Label>
                  <Select name="productId" required>
                    <SelectTrigger className="glass-morphism">
                      <SelectValue placeholder="Choose a product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug (Optional)</Label>
                  <Input
                    id="slug"
                    name="slug"
                    placeholder="premium-course"
                    className="glass-morphism"
                  />
                  <p className="text-text-tertiary text-xs">
                    Leave blank to auto-generate from the checkout name
                  </p>
                </div>
              </div>
            </GlassmorphicCard>

            <GlassmorphicCard className="p-6" variant="light">
              <div className="mb-6">
                <h2 className="mb-2 text-2xl font-semibold">Checkout Type</h2>
                <p className="text-text-secondary">Choose how you want to build your checkout</p>
              </div>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <label className="relative">
                    <input
                      type="radio"
                      name="template"
                      value="blank"
                      defaultChecked
                      className="peer sr-only"
                    />
                    <div className="peer-checked:border-primary peer-checked:bg-primary/10 cursor-pointer rounded-lg border-2 border-gray-200 p-4 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Start from scratch</p>
                          <p className="text-text-secondary text-sm">
                            Build your checkout with our drag-and-drop builder
                          </p>
                        </div>
                        <div className="bg-primary h-2 w-2 rounded-full opacity-0 transition-opacity peer-checked:opacity-100" />
                      </div>
                    </div>
                  </label>

                  <label className="relative">
                    <input
                      type="radio"
                      name="template"
                      value="high-converting"
                      className="peer sr-only"
                    />
                    <div className="peer-checked:border-primary peer-checked:bg-primary/10 cursor-pointer rounded-lg border-2 border-gray-200 p-4 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">High-converting template</p>
                          <p className="text-text-secondary text-sm">
                            Pre-built with proven conversion elements
                          </p>
                        </div>
                        <div className="bg-primary h-2 w-2 rounded-full opacity-0 transition-opacity peer-checked:opacity-100" />
                      </div>
                    </div>
                  </label>

                  <label className="relative">
                    <input type="radio" name="template" value="minimal" className="peer sr-only" />
                    <div className="peer-checked:border-primary peer-checked:bg-primary/10 cursor-pointer rounded-lg border-2 border-gray-200 p-4 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Minimal checkout</p>
                          <p className="text-text-secondary text-sm">
                            Clean and simple for quick purchases
                          </p>
                        </div>
                        <div className="bg-primary h-2 w-2 rounded-full opacity-0 transition-opacity peer-checked:opacity-100" />
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </GlassmorphicCard>

            <div className="flex gap-4">
              <Link href="/checkouts" className="flex-1">
                <Button variant="secondary" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" className="flex-1">
                Create Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
