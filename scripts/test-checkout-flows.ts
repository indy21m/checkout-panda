#!/usr/bin/env tsx

/**
 * Test script for verifying checkout flows
 * Run with: npx tsx scripts/test-checkout-flows.ts
 */

import { stripe } from '@/lib/stripe/config'
import { db } from '@/server/db'
import { products, plans, coupons, checkouts, orders } from '@/server/db/schema'
import { eq } from 'drizzle-orm'

// Test configuration
const TEST_CONFIG = {
  // Test Stripe keys (use test mode keys)
  STRIPE_TEST_CUSTOMER: 'cus_test_123',
  
  // Test products
  TEST_PRODUCT_ID: 'test-product-001',
  TEST_PLAN_ID: 'test-plan-001',
  
  // Test checkout
  TEST_CHECKOUT_ID: 'test-checkout-001',
  
  // Test scenarios
  scenarios: [
    'regular_payment',
    'subscription',
    'zero_total_trial',
    'zero_total_coupon',
    'vat_reverse_charge',
    'apple_pay',
    'webhook_fulfillment',
  ],
}

// Test utilities
async function log(message: string, data?: any) {
  console.log(`[TEST] ${new Date().toISOString()} - ${message}`)
  if (data) {
    console.log(JSON.stringify(data, null, 2))
  }
}

async function createTestData() {
  log('Creating test data...')
  
  // Create test product
  await db.insert(products).values({
    id: TEST_CONFIG.TEST_PRODUCT_ID,
    name: 'Test Product',
    description: 'Product for testing checkout flows',
    price: 2999, // $29.99
    currency: 'USD',
    stripeProductId: 'prod_test_123',
    createdBy: 'test-user',
  }).onConflictDoNothing()
  
  // Create test plan (subscription)
  await db.insert(plans).values({
    id: TEST_CONFIG.TEST_PLAN_ID,
    productId: TEST_CONFIG.TEST_PRODUCT_ID,
    name: 'Monthly Plan',
    price: 999, // $9.99/month
    currency: 'USD',
    billingInterval: 'month',
    trialDays: 7,
    stripePriceId: 'price_test_123',
  }).onConflictDoNothing()
  
  // Create test coupons
  await db.insert(coupons).values([
    {
      code: 'TEST100',
      description: '100% off for testing',
      discountType: 'percentage',
      discountValue: 100,
      isActive: true,
    },
    {
      code: 'TEST50',
      description: '50% off for testing',
      discountType: 'percentage',
      discountValue: 50,
      isActive: true,
    },
  ]).onConflictDoNothing()
  
  log('Test data created')
}

// Test scenarios
async function testRegularPayment() {
  log('Testing regular payment flow...')
  
  try {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2999,
      currency: 'usd',
      metadata: {
        checkoutId: TEST_CONFIG.TEST_CHECKOUT_ID,
        productId: TEST_CONFIG.TEST_PRODUCT_ID,
        quoteId: 'quote_test_123',
      },
    })
    
    log('Payment intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
    })
    
    // Simulate payment confirmation
    // In real scenario, this happens on client side
    
    return { success: true, paymentIntentId: paymentIntent.id }
  } catch (error) {
    log('Regular payment test failed:', error)
    return { success: false, error }
  }
}

async function testSubscription() {
  log('Testing subscription flow...')
  
  try {
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: TEST_CONFIG.STRIPE_TEST_CUSTOMER,
      items: [{ price: 'price_test_123' }],
      trial_period_days: 7,
      metadata: {
        checkoutId: TEST_CONFIG.TEST_CHECKOUT_ID,
        planId: TEST_CONFIG.TEST_PLAN_ID,
        quoteId: 'quote_test_sub_123',
      },
    })
    
    log('Subscription created:', {
      id: subscription.id,
      status: subscription.status,
      trial_end: new Date(subscription.trial_end! * 1000).toISOString(),
    })
    
    return { success: true, subscriptionId: subscription.id }
  } catch (error) {
    log('Subscription test failed:', error)
    return { success: false, error }
  }
}

async function testZeroTotalTrial() {
  log('Testing zero-total trial flow...')
  
  try {
    // Create setup intent for trial (no payment required)
    const setupIntent = await stripe.setupIntents.create({
      customer: TEST_CONFIG.STRIPE_TEST_CUSTOMER,
      usage: 'off_session',
      metadata: {
        checkoutId: TEST_CONFIG.TEST_CHECKOUT_ID,
        planId: TEST_CONFIG.TEST_PLAN_ID,
        trialDays: '7',
      },
    })
    
    log('Setup intent created for trial:', {
      id: setupIntent.id,
      status: setupIntent.status,
    })
    
    return { success: true, setupIntentId: setupIntent.id }
  } catch (error) {
    log('Zero-total trial test failed:', error)
    return { success: false, error }
  }
}

async function testZeroTotalCoupon() {
  log('Testing zero-total with 100% coupon...')
  
  try {
    // Create payment intent with zero amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 0,
      currency: 'usd',
      metadata: {
        checkoutId: TEST_CONFIG.TEST_CHECKOUT_ID,
        productId: TEST_CONFIG.TEST_PRODUCT_ID,
        couponCode: 'TEST100',
        originalAmount: '2999',
      },
    })
    
    log('Zero-amount payment intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
    })
    
    // Stripe should auto-confirm zero-amount intents
    
    return { success: true, paymentIntentId: paymentIntent.id }
  } catch (error) {
    log('Zero-total coupon test failed:', error)
    return { success: false, error }
  }
}

async function testVATReverseCharge() {
  log('Testing VAT reverse charge flow...')
  
  try {
    // Simulate EU B2B transaction
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2999, // No VAT added due to reverse charge
      currency: 'eur',
      metadata: {
        checkoutId: TEST_CONFIG.TEST_CHECKOUT_ID,
        productId: TEST_CONFIG.TEST_PRODUCT_ID,
        vatNumber: 'DE123456789',
        reverseCharge: 'true',
        customerCountry: 'DE',
      },
    })
    
    log('VAT reverse charge payment intent created:', {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      metadata: paymentIntent.metadata,
    })
    
    return { success: true, paymentIntentId: paymentIntent.id }
  } catch (error) {
    log('VAT reverse charge test failed:', error)
    return { success: false, error }
  }
}

async function testWebhookFulfillment() {
  log('Testing webhook fulfillment...')
  
  try {
    // Check if orders are created via webhooks
    const recentOrders = await db.query.orders.findMany({
      limit: 5,
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    })
    
    log('Recent orders:', {
      count: recentOrders.length,
      orders: recentOrders.map(o => ({
        id: o.id,
        status: o.status,
        stripePaymentIntentId: o.stripePaymentIntentId,
        createdViaWebhook: !!o.stripePaymentIntentId,
      })),
    })
    
    const webhookOrders = recentOrders.filter(o => o.stripePaymentIntentId)
    
    return { 
      success: webhookOrders.length > 0,
      webhookOrderCount: webhookOrders.length,
      totalOrderCount: recentOrders.length,
    }
  } catch (error) {
    log('Webhook fulfillment test failed:', error)
    return { success: false, error }
  }
}

// Main test runner
async function runTests() {
  console.log('========================================')
  console.log('   CHECKOUT FLOW TEST SUITE')
  console.log('========================================')
  console.log()
  
  // Setup
  await createTestData()
  console.log()
  
  // Run tests
  const results = {
    regularPayment: await testRegularPayment(),
    subscription: await testSubscription(),
    zeroTotalTrial: await testZeroTotalTrial(),
    zeroTotalCoupon: await testZeroTotalCoupon(),
    vatReverseCharge: await testVATReverseCharge(),
    webhookFulfillment: await testWebhookFulfillment(),
  }
  
  // Summary
  console.log()
  console.log('========================================')
  console.log('   TEST RESULTS')
  console.log('========================================')
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} - ${test}`)
    if (!result.success && result.error) {
      console.log(`  Error: ${result.error.message || result.error}`)
    }
  })
  
  const totalTests = Object.keys(results).length
  const passedTests = Object.values(results).filter(r => r.success).length
  
  console.log()
  console.log(`Total: ${passedTests}/${totalTests} tests passed`)
  console.log()
  
  // Cleanup note
  console.log('Note: Test data created with IDs prefixed with "test-"')
  console.log('You may want to clean up test data after verification')
  
  process.exit(passedTests === totalTests ? 0 : 1)
}

// Run tests
runTests().catch((error) => {
  console.error('Test suite failed:', error)
  process.exit(1)
})