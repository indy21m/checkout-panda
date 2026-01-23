import { getProductsWithOffers } from '@/lib/db/products'
import { ProductsTable } from '@/components/admin/ProductsTable'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const allProducts = await getProductsWithOffers()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500">
            Manage your products and pricing. Changes sync to Stripe automatically.
          </p>
        </div>
      </div>

      <ProductsTable products={allProducts} />

      {allProducts.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No products yet.</p>
          <p className="mt-1 text-sm text-gray-400">
            Run the migration script to import products from config files.
          </p>
        </div>
      )}
    </div>
  )
}
