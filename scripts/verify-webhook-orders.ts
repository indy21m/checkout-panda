#!/usr/bin/env tsx

/**
 * Script to verify that orders are created via webhooks, not client callbacks
 * Run with: npx tsx scripts/verify-webhook-orders.ts
 */

import { db } from '@/server/db'
import { orders, checkoutSessions } from '@/server/db/schema'
import { desc } from 'drizzle-orm'

async function verifyWebhookOrders() {
  console.log('========================================')
  console.log('   WEBHOOK ORDER VERIFICATION')
  console.log('========================================')
  console.log()

  // Get recent orders
  const recentOrders = await db.query.orders.findMany({
    limit: 20,
    orderBy: [desc(orders.createdAt)],
    with: {
      product: true,
      plan: true,
    },
  })

  console.log(`Found ${recentOrders.length} recent orders`)
  console.log()

  // Analyze order creation patterns
  const webhookOrders = recentOrders.filter(
    (o) => o.stripePaymentIntentId || o.stripeSubscriptionId
  )
  const clientOrders = recentOrders.filter(
    (o) => !o.stripePaymentIntentId && !o.stripeSubscriptionId
  )

  console.log('Order Creation Analysis:')
  console.log('------------------------')
  console.log(`✅ Created via webhook: ${webhookOrders.length} orders`)
  console.log(`⚠️  Created via client: ${clientOrders.length} orders`)
  console.log()

  // Check for proper webhook metadata
  console.log('Webhook Metadata Check:')
  console.log('------------------------')

  webhookOrders.forEach((order, index) => {
    console.log(`\nOrder ${index + 1}:`)
    console.log(`  ID: ${order.id}`)
    console.log(`  Status: ${order.status}`)
    console.log(`  Payment Intent: ${order.stripePaymentIntentId || 'N/A'}`)
    console.log(`  Subscription: ${order.stripeSubscriptionId || 'N/A'}`)
    console.log(`  Quote ID: ${order.quoteId || 'N/A'}`)
    console.log(`  Created: ${order.createdAt}`)

    // Check for proper webhook fields
    const hasProperWebhookData = !!(order.stripePaymentIntentId || order.stripeSubscriptionId)

    const hasQuoteTracking = !!order.quoteId
    const hasCustomerInfo = !!(order.customerEmail && order.customerId)

    console.log(`  ✓ Webhook data: ${hasProperWebhookData ? 'YES' : 'NO'}`)
    console.log(`  ✓ Quote tracking: ${hasQuoteTracking ? 'YES' : 'NO'}`)
    console.log(`  ✓ Customer info: ${hasCustomerInfo ? 'YES' : 'NO'}`)
  })

  // Check for duplicate prevention
  console.log('\n\nDuplicate Prevention Check:')
  console.log('---------------------------')

  const paymentIntentIds = webhookOrders.map((o) => o.stripePaymentIntentId).filter(Boolean)

  const uniqueIntentIds = new Set(paymentIntentIds)

  if (paymentIntentIds.length === uniqueIntentIds.size) {
    console.log('✅ No duplicate payment intents found')
  } else {
    console.log('⚠️  WARNING: Duplicate payment intents detected!')
    console.log(`   Total intents: ${paymentIntentIds.length}`)
    console.log(`   Unique intents: ${uniqueIntentIds.size}`)
  }

  // Check checkout sessions
  console.log('\n\nCheckout Session Analysis:')
  console.log('--------------------------')

  const sessions = await db.query.checkoutSessions.findMany({
    limit: 10,
    orderBy: [desc(checkoutSessions.createdAt)],
  })

  const completedSessions = sessions.filter((s) => s.completedAt)
  const abandonedSessions = sessions.filter(
    (s) => !s.completedAt && s.createdAt && s.createdAt < new Date(Date.now() - 24 * 60 * 60 * 1000)
  )

  console.log(`Total sessions: ${sessions.length}`)
  console.log(`Completed: ${completedSessions.length}`)
  console.log(`Abandoned (>24h): ${abandonedSessions.length}`)

  // Summary and recommendations
  console.log('\n\n========================================')
  console.log('   SUMMARY & RECOMMENDATIONS')
  console.log('========================================')

  const webhookPercentage = (webhookOrders.length / Math.max(recentOrders.length, 1)) * 100

  if (webhookPercentage >= 90) {
    console.log('✅ EXCELLENT: Most orders are created via webhooks')
  } else if (webhookPercentage >= 50) {
    console.log('⚠️  GOOD: Majority of orders via webhooks, but room for improvement')
  } else {
    console.log('❌ NEEDS ATTENTION: Most orders are NOT created via webhooks')
  }

  console.log(`\nWebhook coverage: ${webhookPercentage.toFixed(1)}%`)

  if (clientOrders.length > 0) {
    console.log('\n⚠️  Action Required:')
    console.log('  - Review client-side order creation code')
    console.log('  - Ensure all payments go through webhook handlers')
    console.log('  - Remove any client-side order creation after payment')
  }

  console.log('\n✅ Best Practices Checklist:')
  console.log('  [ ] Orders created only in webhook handlers')
  console.log('  [ ] Idempotency keys prevent duplicates')
  console.log('  [ ] Quote IDs tracked for reconciliation')
  console.log('  [ ] Customer info properly stored')
  console.log('  [ ] Payment intent IDs always recorded')

  process.exit(webhookPercentage >= 50 ? 0 : 1)
}

// Run verification
verifyWebhookOrders().catch((error) => {
  console.error('Verification failed:', error)
  process.exit(1)
})
