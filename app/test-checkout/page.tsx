'use client'

import { HeroBlock } from '@/components/checkout/blocks/hero-block'
import { ProductBlock } from '@/components/checkout/blocks/product-block'
import { BumpBlock } from '@/components/checkout/blocks/bump-block'
import { PaymentBlock } from '@/components/checkout/blocks/payment-block'
import { useCheckoutStore } from '@/stores/checkout-store'
import { Card } from '@/components/ui/card'

export default function TestCheckoutPage() {
  const { total, selectedBumps } = useCheckoutStore()

  // Test data
  const testCheckoutId = '550e8400-e29b-41d4-a716-446655440000'
  const testProductId = '550e8400-e29b-41d4-a716-446655440001'
  const mainProductPrice = 9900 // $99.00

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Hero Section */}
      <HeroBlock
        data={{
          headline: 'Complete Checkout Experience',
          subheadline: 'Test the full checkout flow with order bumps and Stripe payment',
          backgroundType: 'gradient',
          gradient: { type: 'aurora', animate: true },
        }}
      />

      {/* Product Section */}
      <ProductBlock
        data={{
          productName: 'Premium Course Bundle',
          productDescription:
            'Get lifetime access to our comprehensive course with all future updates included.',
          price: mainProductPrice,
          currency: 'USD',
          features: [
            '10+ hours of video content',
            'Downloadable resources',
            'Private community access',
            'Certificate of completion',
          ],
          layout: 'side-by-side',
          badge: 'BEST SELLER',
        }}
        styles={{
          padding: '4rem 1rem',
        }}
      />

      {/* Order Bumps */}
      <div className="space-y-6 py-8">
        <BumpBlock
          data={{
            productId: 'bump-001',
            headline: 'Add 1-on-1 Coaching Session',
            description: 'Get personalized guidance with a 60-minute coaching call',
            badge: 'LIMITED OFFER',
            originalPrice: 29900, // $299
            discountedPrice: 14900, // $149
            discountPercent: 50,
            features: [
              '60-minute video call',
              'Personalized action plan',
              'Recording of the session',
            ],
            urgencyText: 'Only available at checkout!',
            checkboxText: 'Yes! Add coaching for 50% off',
          }}
          bumpId="coaching-bump"
        />

        <BumpBlock
          data={{
            productId: 'bump-002',
            headline: 'Exclusive Templates Pack',
            description: 'Save hours with our done-for-you templates',
            badge: 'POPULAR',
            originalPrice: 9900, // $99
            discountedPrice: 3900, // $39
            discountPercent: 60,
            features: [
              '50+ professional templates',
              'Fully customizable',
              'Commercial license included',
            ],
            urgencyText: 'One-time offer!',
            checkboxText: 'Add templates for just $39',
          }}
          bumpId="templates-bump"
        />
      </div>

      {/* Order Summary */}
      <div className="container mx-auto max-w-2xl px-6 py-8">
        <Card variant="glass" className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Order Summary</h3>
          <div className="space-y-2 text-gray-300">
            <div className="flex justify-between">
              <span>Premium Course Bundle</span>
              <span>${(mainProductPrice / 100).toFixed(2)}</span>
            </div>
            {selectedBumps.length > 0 && (
              <>
                <div className="my-2 border-t border-gray-700" />
                {selectedBumps.includes('coaching-bump') && (
                  <div className="flex justify-between text-green-400">
                    <span>✓ 1-on-1 Coaching Session</span>
                    <span>$149.00</span>
                  </div>
                )}
                {selectedBumps.includes('templates-bump') && (
                  <div className="flex justify-between text-green-400">
                    <span>✓ Exclusive Templates Pack</span>
                    <span>$39.00</span>
                  </div>
                )}
              </>
            )}
            <div className="mt-4 border-t border-gray-700 pt-2">
              <div className="flex justify-between text-lg font-bold text-white">
                <span>Total</span>
                <span>${(total / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Section */}
      <PaymentBlock
        data={{
          showExpressCheckout: true,
          fields: ['email', 'name', 'card'],
          buttonText: `Pay $${(total / 100).toFixed(2)}`,
          securityBadges: true,
        }}
        styles={{
          padding: '2rem',
        }}
        checkoutId={testCheckoutId}
        productId={testProductId}
        amount={mainProductPrice}
      />
    </div>
  )
}
