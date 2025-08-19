// Test script to create a sample coupon
// Run with: node test-coupon.mjs

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'

const client = createTRPCProxyClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
      headers: {
        // Add your auth token here if needed
      },
    }),
  ],
})

async function testCouponSystem() {
  try {
    console.log('Testing coupon validation...')

    // Test validating a coupon (this will test both custom and Stripe coupons)
    const validation = await client.coupon.validate.query({
      code: 'TESTCODE',
      amount: 10000, // $100.00
    })

    console.log('Validation result:', validation)

    if (validation.valid) {
      console.log(`✅ Coupon is valid: ${validation.discountDisplay}`)
      console.log(`   Final amount: $${(validation.finalAmount / 100).toFixed(2)}`)
    } else {
      console.log(`❌ Coupon is invalid: ${validation.message}`)
    }
  } catch (error) {
    console.error('Error testing coupon system:', error)
  }
}

testCouponSystem()
