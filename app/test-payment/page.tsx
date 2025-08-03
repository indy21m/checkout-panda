'use client'

import { PaymentBlock } from '@/components/checkout/blocks/payment-block'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'

export default function TestPaymentPage() {
  // Test data - in production this would come from the database
  const testCheckoutId = '550e8400-e29b-41d4-a716-446655440000' // Sample UUID
  const testProductId = '550e8400-e29b-41d4-a716-446655440001' // Sample UUID
  const testAmount = 9900 // $99.00 in cents

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold">Test Stripe Payment</h1>
          <p className="text-text-secondary">
            This is a test page to demonstrate Stripe integration
          </p>
        </div>

        <GlassmorphicCard variant="light" className="mx-auto mb-8 max-w-2xl p-6">
          <h2 className="mb-4 text-xl font-semibold">Test Details</h2>
          <div className="text-text-secondary space-y-2">
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
          <div className="mt-4 rounded-lg border border-blue-500/20 bg-gradient-to-r from-blue-50 to-blue-100 p-4">
            <p className="text-sm text-blue-600">
              <strong>Test Card:</strong> 4242 4242 4242 4242
            </p>
            <p className="text-sm text-blue-600">Use any future expiry date and any 3-digit CVC</p>
          </div>
        </GlassmorphicCard>

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
