import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { db } from '@/server/db'
import { orders, quotes, couponRedemptions, coupons } from '@/server/db/schema'
import { eq, sql } from 'drizzle-orm'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body, 
      signature, 
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Check if order already exists (idempotency)
        const existingOrder = await db.query.orders.findFirst({
          where: eq(orders.stripePaymentIntentId, paymentIntent.id),
        })
        
        if (existingOrder) {
          console.log('Order already exists for payment intent:', paymentIntent.id)
          return NextResponse.json({ received: true })
        }
        
        // Get quote from metadata
        const quoteId = paymentIntent.metadata.quoteId
        let quote = null
        
        if (quoteId) {
          quote = await db.query.quotes.findFirst({
            where: eq(quotes.id, quoteId),
          })
        }
        
        // Create order
        const [newOrder] = await db.insert(orders).values({
          checkoutId: paymentIntent.metadata.checkoutId ? paymentIntent.metadata.checkoutId : undefined,
          quoteId: quoteId ? quoteId : undefined,
          customerId: paymentIntent.customer as string,
          productId: paymentIntent.metadata.productId ? paymentIntent.metadata.productId : undefined,
          planId: paymentIntent.metadata.planId ? paymentIntent.metadata.planId : undefined,
          stripePaymentIntentId: paymentIntent.id,
          customerEmail: paymentIntent.receipt_email || paymentIntent.metadata.email || '',
          currency: paymentIntent.currency.toUpperCase() as 'USD' | 'EUR' | 'DKK',
          subtotal: quote?.subtotal || paymentIntent.amount,
          discount: quote?.discount || 0,
          tax: quote?.tax || 0,
          total: paymentIntent.amount,
          status: 'completed',
          orderItems: quote?.lineItems ? quote.lineItems
            .filter(item => item.type !== 'discount' && item.type !== 'tax')
            .map(item => ({
              type: item.type as 'product' | 'plan' | 'bump',
              id: paymentIntent.metadata.productId || paymentIntent.metadata.planId || 'unknown',
              name: item.label,
              amount: item.amount,
              quantity: 1
            })) : [],
          metadata: paymentIntent.metadata,
          completedAt: new Date(),
        }).returning()
        
        // Record coupon redemption if applicable
        if (paymentIntent.metadata.couponCode && quote?.meta?.couponCode) {
          const coupon = await db.query.coupons.findFirst({
            where: eq(coupons.code, quote.meta.couponCode),
          })
          
          if (coupon) {
            // Record redemption
            await db.insert(couponRedemptions).values({
              couponId: coupon.id,
              stripePaymentIntentId: paymentIntent.id,
              customerEmail: newOrder?.customerEmail || '',
              customerId: paymentIntent.customer as string,
              originalAmount: quote.subtotal,
              discountApplied: quote.discount || 0,
              finalAmount: paymentIntent.amount,
              productId: paymentIntent.metadata.productId || undefined,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              productName: quote.lineItems?.find((i: any) => i.type === 'product')?.label,
            })
            
            // Increment redemption count
            await db
              .update(coupons)
              .set({
                timesRedeemed: sql`${coupons.timesRedeemed} + 1`,
              })
              .where(eq(coupons.id, coupon.id))
          }
        }
        
        console.log('Order created:', newOrder?.id)
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_intent) {
          // Handle via payment_intent.succeeded webhook instead
          console.log('Checkout session completed, waiting for payment_intent webhook')
        } else if (session.mode === 'subscription') {
          // Handle subscription creation
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          
          // Create order for subscription
          await db.insert(orders).values({
            checkoutId: session.metadata?.checkoutId ? session.metadata.checkoutId : undefined,
            quoteId: session.metadata?.quoteId ? session.metadata.quoteId : undefined,
            customerId: session.customer as string,
            productId: session.metadata?.productId ? session.metadata.productId : undefined,
            planId: session.metadata?.planId ? session.metadata.planId : undefined,
            stripeSubscriptionId: subscription.id,
            stripeInvoiceId: subscription.latest_invoice as string,
            customerEmail: session.customer_email || '',
            currency: subscription.currency.toUpperCase() as 'USD' | 'EUR' | 'DKK',
            subtotal: session.amount_subtotal || 0,
            discount: session.total_details?.amount_discount || 0,
            tax: session.total_details?.amount_tax || 0,
            total: session.amount_total || 0,
            status: 'completed',
            metadata: session.metadata || {},
            completedAt: new Date(),
          })
        }
        break
      }

      case 'invoice.paid': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice = event.data.object as any // Type assertion due to Stripe types
        
        // Check if this is a subscription invoice
        if (invoice.subscription) {
          // Update or create order for subscription invoice
          const existingOrder = await db.query.orders.findFirst({
            where: eq(orders.stripeInvoiceId, invoice.id as string),
          })
          
          if (!existingOrder) {
            await db.insert(orders).values({
              customerId: invoice.customer as string,
              stripeSubscriptionId: invoice.subscription as string,
              stripeInvoiceId: invoice.id,
              stripePaymentIntentId: invoice.payment_intent as string || undefined,
              customerEmail: invoice.customer_email || '',
              currency: invoice.currency.toUpperCase() as 'USD' | 'EUR' | 'DKK',
              subtotal: invoice.subtotal,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              discount: invoice.total_discount_amounts?.reduce((sum: number, d: any) => sum + d.amount, 0) || 0,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              tax: invoice.total_tax_amounts?.reduce((sum: number, t: any) => sum + t.amount, 0) || 0,
              total: invoice.total,
              status: 'completed',
              metadata: invoice.metadata || {},
              completedAt: new Date(),
            })
          }
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        // Update order status if exists
        const existingOrder = await db.query.orders.findFirst({
          where: eq(orders.stripePaymentIntentId, paymentIntent.id),
        })
        
        if (existingOrder) {
          await db
            .update(orders)
            .set({
              status: 'failed',
              failedAt: new Date(),
            })
            .where(eq(orders.id, existingOrder.id))
        }
        
        console.error('Payment failed:', paymentIntent.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Mark subscription orders as cancelled
        await db
          .update(orders)
          .set({
            status: 'cancelled',
          })
          .where(eq(orders.stripeSubscriptionId, subscription.id))
        
        console.log('Subscription cancelled:', subscription.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    // Return success to avoid Stripe retries for processing errors
    return NextResponse.json({ received: true })
  }
}

// Disable body parsing to access raw body
export const config = {
  api: {
    bodyParser: false,
  },
}