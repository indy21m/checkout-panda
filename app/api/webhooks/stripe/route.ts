import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { getProduct } from '@/config/products'
import type Stripe from 'stripe'

/**
 * Stripe webhook handler
 *
 * Handles payment events and sends purchase data to Zapier
 * for ConvertKit tagging and Circle community access.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || '')
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        console.log('Payment succeeded:', paymentIntent.id)

        // Extract metadata
        const productSlug = paymentIntent.metadata.productSlug
        const email = paymentIntent.metadata.email || paymentIntent.receipt_email
        const product = productSlug ? getProduct(productSlug) : null

        // Get payment method for upsell flow
        let paymentMethodId: string | undefined
        if (paymentIntent.payment_method) {
          paymentMethodId =
            typeof paymentIntent.payment_method === 'string'
              ? paymentIntent.payment_method
              : paymentIntent.payment_method.id
        }

        // Determine purchase type
        const purchaseType = paymentIntent.metadata.type || 'main_purchase'
        const isUpsell = purchaseType === 'upsell'
        const isDownsell = purchaseType === 'downsell'

        // Build purchased items list
        const purchasedItems: string[] = ['main']
        if (paymentIntent.metadata.includeOrderBump === 'true') {
          purchasedItems.push('bump')
        }
        if (paymentIntent.metadata.upsellId) {
          purchasedItems.push(paymentIntent.metadata.upsellId)
        }

        // Send to Zapier webhook
        const zapierUrl = product?.integrations?.zapierWebhookUrl || process.env.ZAPIER_WEBHOOK_URL

        if (zapierUrl) {
          try {
            const zapierPayload = {
              event: 'purchase',
              paymentIntentId: paymentIntent.id,
              customerId: paymentIntent.customer,
              paymentMethodId,
              email,
              firstName: paymentIntent.metadata.firstName,
              lastName: paymentIntent.metadata.lastName,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency.toUpperCase(),
              productSlug,
              productName: paymentIntent.metadata.productName || product?.name,
              purchaseType,
              isUpsell,
              isDownsell,
              upsellId: paymentIntent.metadata.upsellId,
              includeOrderBump: paymentIntent.metadata.includeOrderBump === 'true',
              purchasedItems,
              couponCode: paymentIntent.metadata.couponCode,
              subtotal: paymentIntent.metadata.subtotal
                ? parseInt(paymentIntent.metadata.subtotal)
                : undefined,
              discount: paymentIntent.metadata.discount
                ? parseInt(paymentIntent.metadata.discount)
                : undefined,
              tax: paymentIntent.metadata.tax ? parseInt(paymentIntent.metadata.tax) : undefined,
              country: paymentIntent.metadata.country,
              vatNumber: paymentIntent.metadata.vatNumber,
              convertkitTags: product?.integrations?.convertkitTags || [],
              timestamp: new Date().toISOString(),
            }

            await fetch(zapierUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(zapierPayload),
            })

            console.log('Zapier webhook sent successfully for:', paymentIntent.id)
          } catch (zapierError) {
            console.error('Zapier webhook failed:', zapierError)
            // Don't fail the webhook response - Zapier failure shouldn't block Stripe
          }
        } else {
          console.log('No Zapier webhook URL configured')
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error(
          'Payment failed:',
          paymentIntent.id,
          paymentIntent.last_payment_error?.message
        )
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as { subscription?: string | Stripe.Subscription }
        const subscriptionId =
          typeof invoice.subscription === 'string' ? invoice.subscription : null

        // Only process if subscription has auto-cancel metadata
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          if (subscription.metadata.autoCancel === 'true') {
            const paymentsProcessed = parseInt(subscription.metadata.paymentsProcessed || '0') + 1
            const installmentCount = parseInt(subscription.metadata.installmentCount || '3')

            if (paymentsProcessed >= installmentCount) {
              // Cancel subscription after final payment
              await stripe.subscriptions.cancel(subscriptionId)
              console.log(
                `Auto-cancelled subscription ${subscriptionId} after ${paymentsProcessed} payments`
              )
            } else {
              // Update payment counter
              await stripe.subscriptions.update(subscriptionId, {
                metadata: {
                  ...subscription.metadata,
                  paymentsProcessed: String(paymentsProcessed),
                },
              })
              console.log(
                `Updated subscription ${subscriptionId} - payment ${paymentsProcessed}/${installmentCount}`
              )
            }
          }
        }
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

// Disable body parsing to access raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
}
