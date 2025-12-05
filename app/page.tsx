import Link from 'next/link'
import { getAllProducts } from '@/config/products'
import { formatMoney } from '@/lib/currency'
import { ArrowRight } from 'lucide-react'

export default function HomePage() {
  const products = getAllProducts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Checkout Panda</h1>
          <p className="text-gray-600">High-converting checkout pages</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-8 text-xl font-semibold text-gray-900">Available Products</h2>

        <div className="grid gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/${product.slug}/checkout`}
              className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-gray-600">{product.checkout.subtitle}</p>
                <p className="mt-2 text-lg font-bold text-green-600">
                  {formatMoney(product.stripe.priceAmount, product.stripe.currency)}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
            </Link>
          ))}
        </div>

        {/* Dev Info */}
        <div className="mt-12 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6">
          <h3 className="text-sm font-semibold text-gray-700">Development Info</h3>
          <p className="mt-2 text-sm text-gray-600">
            To add products, create new config files in{' '}
            <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs">
              /config/products/
            </code>
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Checkout URL pattern:{' '}
            <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-xs">
              /[product-slug]/checkout
            </code>
          </p>
        </div>
      </main>
    </div>
  )
}
