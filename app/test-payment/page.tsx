'use client'

import { PaymentBlock } from '@/components/checkout/blocks/payment-block'
import { Card } from '@/components/ui/card'

export default function TestPaymentPage() {
  // Test data - in production this would come from the database
  const testCheckoutId = '550e8400-e29b-41d4-a716-446655440000' // Sample UUID
  const testProductId = '550e8400-e29b-41d4-a716-446655440001' // Sample UUID
  const testAmount = 9900 // $99.00 in cents

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">Test Stripe Payment</h1>
          <p className="text-gray-300">This is a test page to demonstrate Stripe integration</p>
        </div>

        <Card variant="glass" className="mx-auto mb-8 max-w-2xl p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Test Details</h2>
          <div className="space-y-2 text-gray-300">
            <p>
              <strong>Checkout ID:</strong> {testCheckoutId}
            </p>
            <p>
              <strong>Product ID:</strong> {testProductId}
            </p>
            <p>
              <strong>Amount:</strong> ${(testAmount / 100).toFixed(2)}
            </p>
          </div>
          <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <p className="text-sm text-blue-300">
              <strong>Test Card:</strong> 4242 4242 4242 4242
            </p>
            <p className="text-sm text-blue-300">Use any future expiry date and any 3-digit CVC</p>
          </div>
        </Card>

        <PaymentBlock
          data={{
            showExpressCheckout: true,
            fields: ['email', 'name', 'card'],
            buttonText: 'Pay $99.00',
            securityBadges: true,
          }}
          styles={{
            padding: '2rem',
            className: 'max-w-2xl mx-auto',
          }}
          checkoutId={testCheckoutId}
          productId={testProductId}
          amount={testAmount}
        />
      </div>
    </div>
  )
}
