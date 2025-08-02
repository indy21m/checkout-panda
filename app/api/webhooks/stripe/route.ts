import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'
import { StripeService } from '@/server/services/stripe-service'
import type Stripe from 'stripe'

const stripeService = new StripeService()

export async function POST(req: Request) {
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
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await stripeService.handlePaymentSuccess(paymentIntent.id)
        break

      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        if (session.payment_intent) {
          await stripeService.handlePaymentSuccess(session.payment_intent as string)
        }
        break

      case 'payment_intent.payment_failed':
        // Handle failed payment
        console.error('Payment failed:', event.data.object)
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

// Stripe webhooks need the raw body
export const runtime = 'edge'
