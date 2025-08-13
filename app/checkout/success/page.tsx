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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing your order...</h2>
        <p className="text-gray-600">Please wait while we confirm your payment.</p>
      </div>
    </div>
  )
}

// Order confirmation component
async function OrderConfirmation({ 
  paymentIntent, 
  setupIntent 
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Received!
            </h1>
            <p className="text-gray-600 mb-6">
              We're processing your order. You'll receive a confirmation email shortly.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-mono text-xs text-gray-600 mt-1">
                {paymentIntent || setupIntent || 'Processing...'}
              </p>
            </div>
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order has been successfully processed.
          </p>
          
          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-gray-400 mt-0.5" />
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
                <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
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
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">Order ID</p>
              <p className="font-mono text-xs text-gray-600 mt-1">
                {order.id}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
export default function SuccessPage({
  searchParams,
}: {
  searchParams: { 
    payment_intent?: string
    payment_intent_client_secret?: string
    setup_intent?: string
    setup_intent_client_secret?: string
  }
}) {
  const paymentIntent = searchParams.payment_intent
  const setupIntent = searchParams.setup_intent
  
  return (
    <Suspense fallback={<LoadingState />}>
      <OrderConfirmation 
        paymentIntent={paymentIntent} 
        setupIntent={setupIntent} 
      />
    </Suspense>
  )
}