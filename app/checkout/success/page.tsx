import { Suspense } from 'react'
import { db } from '@/server/db'
import { orders } from '@/server/db/schema'
import { eq, or } from 'drizzle-orm'
import { Check, Clock, Package, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { formatMoney } from '@/lib/currency'

// Loading component for Suspense
function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Processing your order...</h2>
        <p className="text-gray-600">Please wait while we confirm your payment.</p>
      </div>
    </div>
  )
}

// Order confirmation component
async function OrderConfirmation({
  paymentIntent,
  setupIntent,
}: {
  paymentIntent?: string | null
  setupIntent?: string | null
}) {
  // Try to find the order (might not exist yet if webhook hasn't fired)
  let order = null

  if (paymentIntent || setupIntent) {
    const result = await db.query.orders.findFirst({
      where: or(
        paymentIntent ? eq(orders.stripePaymentIntentId, paymentIntent) : undefined,
        setupIntent ? eq(orders.stripeSetupIntentId, setupIntent) : undefined
      ),
      with: {
        product: true,
        plan: true,
      },
    })

    order = result
  }

  // If no order yet, show pending state
  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">Payment Received!</h1>
            <p className="mb-6 text-gray-600">
              We&apos;re processing your order. You&apos;ll receive a confirmation email shortly.
            </p>
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="mt-1 font-mono text-xs text-gray-600">
                {paymentIntent || setupIntent || 'Processing...'}
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show completed order
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="mb-6 text-gray-600">
            Thank you for your purchase. Your order has been successfully processed.
          </p>

          {/* Order Details */}
          <div className="mb-6 rounded-lg bg-gray-50 p-6 text-left">
            <h3 className="mb-4 font-semibold text-gray-900">Order Details</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Package className="mt-0.5 h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {order.product?.name || order.plan?.name || 'Product'}
                  </p>
                  {order.plan && (
                    <p className="text-sm text-gray-500">
                      {order.plan.billingInterval}ly subscription
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="mt-0.5 h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {formatMoney(order.total, order.currency)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Paid via {order.stripeSubscriptionId ? 'Subscription' : 'Card'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <p className="text-xs text-gray-500">Order ID</p>
              <p className="mt-1 font-mono text-xs text-gray-600">{order.id}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>

            <p className="text-xs text-gray-500">
              A confirmation email has been sent to {order.customerEmail}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main page component
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    payment_intent?: string
    payment_intent_client_secret?: string
    setup_intent?: string
    setup_intent_client_secret?: string
  }>
}) {
  const params = await searchParams
  const paymentIntent = params.payment_intent
  const setupIntent = params.setup_intent

  return (
    <Suspense fallback={<LoadingState />}>
      <OrderConfirmation paymentIntent={paymentIntent} setupIntent={setupIntent} />
    </Suspense>
  )
}
