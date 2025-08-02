import { stripe } from '@/lib/stripe/config'
import { db } from '@/server/db'
import { users, checkoutSessions, analyticsEvents, checkouts } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import type Stripe from 'stripe'

export class StripeService {
  /**
   * Create or retrieve a Stripe customer
   */
  async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    // Check if user already has a Stripe customer ID
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (user?.stripeCustomerId) {
      return user.stripeCustomerId
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    })

    // Update user record with Stripe customer ID
    await db.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.id, userId))

    return customer.id
  }

  /**
   * Create a payment intent for checkout
   */
  async createPaymentIntent({
    amount,
    currency = 'usd',
    customerId,
    metadata = {},
  }: {
    amount: number
    currency?: string
    customerId: string
    metadata?: Record<string, string>
  }): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
    })

    return paymentIntent
  }

  /**
   * Create a checkout session for payments
   */
  async createCheckoutSession({
    checkoutId,
    productName,
    amount,
    customerId,
    customerEmail,
    successUrl,
    cancelUrl,
    metadata = {},
  }: {
    checkoutId: string
    productName: string
    amount: number
    customerId?: string
    customerEmail: string
    successUrl: string
    cancelUrl: string
    metadata?: Record<string, string>
  }): Promise<string> {
    // Create session record in database
    const [session] = await db
      .insert(checkoutSessions)
      .values({
        checkoutId,
        customerId,
        sessionData: {
          productsPurchased: [],
          totalSpent: 0,
          bumpsAccepted: [],
          upsellsAccepted: [],
          customerEmail,
        },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      })
      .returning()

    if (!session) {
      throw new Error('Failed to create checkout session')
    }

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...metadata,
        checkoutId,
        sessionId: session.id,
      },
    })

    // Update session with Stripe payment intent ID
    await db
      .update(checkoutSessions)
      .set({
        stripePaymentIntentId: stripeSession.payment_intent as string,
      })
      .where(eq(checkoutSessions.id, session.id))

    return stripeSession.url!
  }

  /**
   * Process successful payment
   */
  async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    // Get payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    // Find session by payment intent ID
    const session = await db.query.checkoutSessions.findFirst({
      where: eq(checkoutSessions.stripePaymentIntentId, paymentIntentId),
    })

    if (!session) {
      throw new Error('Session not found for payment intent')
    }

    // Update session as completed
    await db
      .update(checkoutSessions)
      .set({
        completedAt: new Date(),
        sessionData: {
          ...session.sessionData,
          totalSpent: paymentIntent.amount,
        },
      })
      .where(eq(checkoutSessions.id, session.id))

    // Track analytics event
    await db.insert(analyticsEvents).values({
      checkoutId: session.checkoutId,
      sessionId: session.id,
      eventType: 'purchase',
      eventData: {
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    })

    // Update checkout revenue
    const checkout = await db.query.checkouts.findFirst({
      where: eq(checkouts.id, session.checkoutId),
    })

    if (checkout) {
      await db
        .update(checkouts)
        .set({
          conversions: (checkout.conversions || 0) + 1,
          revenue: (checkout.revenue || 0) + paymentIntent.amount,
        })
        .where(eq(checkouts.id, session.checkoutId))
    }
  }

  /**
   * Create payment method setup for saved cards
   */
  async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    })

    return setupIntent
  }

  /**
   * Process order bump purchase
   */
  async chargeOrderBump({
    sessionId,
    amount,
    description,
    paymentMethodId,
  }: {
    sessionId: string
    amount: number
    description: string
    paymentMethodId: string
  }): Promise<Stripe.PaymentIntent> {
    const session = await db.query.checkoutSessions.findFirst({
      where: eq(checkoutSessions.id, sessionId),
    })

    if (!session || !session.customerId) {
      throw new Error('Invalid session')
    }

    // Create payment intent for order bump
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: session.customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      description,
      metadata: {
        sessionId,
        type: 'order_bump',
      },
    })

    // Update session data
    await db
      .update(checkoutSessions)
      .set({
        sessionData: {
          ...session.sessionData,
          totalSpent: (session.sessionData.totalSpent || 0) + amount,
          bumpsAccepted: [...(session.sessionData.bumpsAccepted || []), description],
        },
      })
      .where(eq(checkoutSessions.id, sessionId))

    return paymentIntent
  }
}
