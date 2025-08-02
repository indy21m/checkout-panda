import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    products = await api.product.list()
    hasProducts = products.length > 0
  } catch (error) {
    console.error('Failed to fetch products:', error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">Create New Checkout</h1>
          <p className="text-gray-300">Set up a beautiful checkout page for your product</p>
        </div>

        {!hasProducts ? (
          <Card variant="glass">
            <CardContent className="py-12 text-center">
              <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h2 className="mb-2 text-2xl font-semibold text-white">No Products Yet</h2>
              <p className="mx-auto mb-6 max-w-md text-gray-400">
                You need to create a product before you can build a checkout page.
              </p>
              <Link href="/products">
                <Button variant="primary" size="lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Create Your First Product
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <form className="space-y-6">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Give your checkout page a name and select a product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Checkout Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Premium Course Checkout"
                    required
                    className="bg-gray-800/50"
                  />
                  <p className="text-xs text-gray-400">
                    This is for your reference only - customers won&apos;t see this
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product">Select Product</Label>
                  <Select name="productId" required>
                    <SelectTrigger className="bg-gray-800/50">
                      <SelectValue placeholder="Choose a product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ${(product.price / 100).toFixed(2)}
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
                    className="bg-gray-800/50"
                  />
                  <p className="text-xs text-gray-400">
                    Leave blank to auto-generate from the checkout name
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Checkout Type</CardTitle>
                <CardDescription>Choose how you want to build your checkout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <label className="relative">
                    <input
                      type="radio"
                      name="template"
                      value="blank"
                      defaultChecked
                      className="peer sr-only"
                    />
                    <div className="cursor-pointer rounded-lg border-2 border-gray-700 p-4 transition-all peer-checked:border-purple-500 peer-checked:bg-purple-500/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">Start from scratch</p>
                          <p className="text-sm text-gray-400">
                            Build your checkout with our drag-and-drop builder
                          </p>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-purple-500 opacity-0 transition-opacity peer-checked:opacity-100" />
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
                    <div className="cursor-pointer rounded-lg border-2 border-gray-700 p-4 transition-all peer-checked:border-purple-500 peer-checked:bg-purple-500/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">High-converting template</p>
                          <p className="text-sm text-gray-400">
                            Pre-built with proven conversion elements
                          </p>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-purple-500 opacity-0 transition-opacity peer-checked:opacity-100" />
                      </div>
                    </div>
                  </label>

                  <label className="relative">
                    <input type="radio" name="template" value="minimal" className="peer sr-only" />
                    <div className="cursor-pointer rounded-lg border-2 border-gray-700 p-4 transition-all peer-checked:border-purple-500 peer-checked:bg-purple-500/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">Minimal checkout</p>
                          <p className="text-sm text-gray-400">
                            Clean and simple for quick purchases
                          </p>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-purple-500 opacity-0 transition-opacity peer-checked:opacity-100" />
                      </div>
                    </div>
                  </label>
                </div>
              </CardContent>
            </Card>

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
