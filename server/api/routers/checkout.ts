import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { 
  checkouts, 
  checkoutSessions, 
  funnels, 
  quotes, 
  products, 
  productPlans, 
  orderBumps,
  coupons,
  couponProducts,
  couponRedemptions 
} from '@/server/db/schema'
import { eq, and, desc, or, sql } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { 
  generateQuoteId, 
  cartToKey, 
  isQuoteExpired,
  validateCurrencyConsistency,
  calculateDiscount,
  applyFixedDiscount,
  type CartState 
} from '@/lib/currency'

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
}

export const checkoutRouter = createTRPCRouter({
  // Get all checkouts for current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const userCheckouts = await ctx.db.query.checkouts.findMany({
      where: eq(checkouts.userId, ctx.userId),
      orderBy: [desc(checkouts.updatedAt)],
    })

    return userCheckouts
  }),

  // Get single checkout by ID (for editing)
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const checkout = await ctx.db.query.checkouts.findFirst({
        where: and(eq(checkouts.id, input.id), eq(checkouts.userId, ctx.userId)),
      })

      if (!checkout) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checkout not found',
        })
      }

      return checkout
    }),

  // Get published checkout by slug (public)
  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
    const checkout = await ctx.db.query.checkouts.findFirst({
      where: and(eq(checkouts.slug, input.slug), eq(checkouts.status, 'published')),
    })

    if (!checkout) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Checkout page not found',
      })
    }

    // Increment view count
    await ctx.db
      .update(checkouts)
      .set({ views: (checkout.views || 0) + 1 })
      .where(eq(checkouts.id, checkout.id))

    return checkout
  }),

  // Create new checkout
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Checkout name is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Generate unique slug
      let slug = generateSlug(input.name)
      let slugSuffix = 0

      // Check for existing slugs and make unique
      while (true) {
        const existingSlug = await ctx.db.query.checkouts.findFirst({
          where: eq(checkouts.slug, slug + (slugSuffix ? `-${slugSuffix}` : '')),
        })

        if (!existingSlug) {
          slug = slug + (slugSuffix ? `-${slugSuffix}` : '')
          break
        }
        slugSuffix++
      }

      const [newCheckout] = await ctx.db
        .insert(checkouts)
        .values({
          userId: ctx.userId,
          name: input.name,
          slug,
          pageData: {
            blocks: [],
            settings: {
              theme: 'default',
            },
          },
        })
        .returning()

      return newCheckout
    }),

  // Update checkout metadata
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        status: z.enum(['draft', 'published', 'archived']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Check if checkout exists and belongs to user
      const existingCheckout = await ctx.db.query.checkouts.findFirst({
        where: and(eq(checkouts.id, id), eq(checkouts.userId, ctx.userId)),
      })

      if (!existingCheckout) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checkout not found',
        })
      }

      // If publishing, set publishedAt timestamp
      if (updateData.status === 'published' && existingCheckout.status !== 'published') {
        ;(updateData as any).publishedAt = new Date()
      }

      const [updatedCheckout] = await ctx.db
        .update(checkouts)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(eq(checkouts.id, id), eq(checkouts.userId, ctx.userId)))
        .returning()

      return updatedCheckout
    }),

  // Save checkout page data (for builder)
  savePageData: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        pageData: z.object({
          blocks: z.array(z.any()),
          settings: z.any(),
        }),
        publish: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, pageData, publish } = input

      // Check if checkout exists and belongs to user
      const existingCheckout = await ctx.db.query.checkouts.findFirst({
        where: and(eq(checkouts.id, id), eq(checkouts.userId, ctx.userId)),
      })

      if (!existingCheckout) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checkout not found',
        })
      }

      const updateData: any = {
        pageData,
        updatedAt: new Date(),
      }

      if (publish) {
        updateData.status = 'published'
        updateData.publishedAt = new Date()
      }

      const [updatedCheckout] = await ctx.db
        .update(checkouts)
        .set(updateData)
        .where(and(eq(checkouts.id, id), eq(checkouts.userId, ctx.userId)))
        .returning()

      return updatedCheckout
    }),

  // Delete checkout
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Check if checkout exists and belongs to user
      const existingCheckout = await ctx.db.query.checkouts.findFirst({
        where: and(eq(checkouts.id, input.id), eq(checkouts.userId, ctx.userId)),
      })

      if (!existingCheckout) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checkout not found',
        })
      }

      await ctx.db
        .delete(checkouts)
        .where(and(eq(checkouts.id, input.id), eq(checkouts.userId, ctx.userId)))

      return { success: true }
    }),

  // Duplicate checkout
  duplicate: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1, 'New checkout name is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get original checkout
      const original = await ctx.db.query.checkouts.findFirst({
        where: and(eq(checkouts.id, input.id), eq(checkouts.userId, ctx.userId)),
      })

      if (!original) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Checkout not found',
        })
      }

      // Generate unique slug for duplicate
      let slug = generateSlug(input.name)
      let slugSuffix = 0

      while (true) {
        const existingSlug = await ctx.db.query.checkouts.findFirst({
          where: eq(checkouts.slug, slug + (slugSuffix ? `-${slugSuffix}` : '')),
        })

        if (!existingSlug) {
          slug = slug + (slugSuffix ? `-${slugSuffix}` : '')
          break
        }
        slugSuffix++
      }

      const [duplicatedCheckout] = await ctx.db
        .insert(checkouts)
        .values({
          userId: ctx.userId,
          name: input.name,
          slug,
          pageData: original.pageData,
          status: 'draft', // Always start as draft
        })
        .returning()

      return duplicatedCheckout
    }),

  // Quote API - Single source of truth for pricing
  quote: publicProcedure
    .input(
      z.object({
        checkoutId: z.string().uuid(),
        productId: z.string().uuid().optional(),
        planId: z.string().uuid().optional(),
        orderBumpIds: z.array(z.string().uuid()).default([]),
        couponCode: z.string().optional(),
        customerCountry: z.string().default('US'),
        customerEmail: z.string().email().optional(),
        vatNumber: z.string().optional(),
        collectVAT: z.boolean().default(false),
        enableStripeTax: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      // Generate quote ID
      const cartState: CartState = {
        productId: input.productId,
        planId: input.planId,
        orderBumpIds: input.orderBumpIds,
        couponCode: input.couponCode,
        customerCountry: input.customerCountry,
        customerEmail: input.customerEmail,
        vatNumber: input.vatNumber,
      }
      
      const quoteId = generateQuoteId(cartState)
      const cartHash = cartToKey(cartState)
      
      // Check for existing non-expired quote
      const existingQuote = await ctx.db.query.quotes.findFirst({
        where: and(
          eq(quotes.cartHash, cartHash),
          eq(quotes.checkoutId, input.checkoutId)
        ),
      })
      
      if (existingQuote && !isQuoteExpired(existingQuote.createdAt!)) {
        return existingQuote
      }
      
      // Get product and plan
      let subtotal = 0
      let currency = 'USD'
      let planInterval: 'month' | 'year' | 'week' | 'day' | undefined
      let trialDays = 0
      const lineItems: Array<{ type: string; label: string; amount: number }> = []
      
      if (input.planId) {
        const plan = await ctx.db.query.productPlans.findFirst({
          where: eq(productPlans.id, input.planId),
          with: { product: true },
        })
        
        if (!plan) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Plan not found',
          })
        }
        
        subtotal = plan.price
        currency = plan.currency
        planInterval = plan.billingInterval as typeof planInterval
        trialDays = plan.trialDays || 0
        
        lineItems.push({
          type: 'plan',
          label: `${plan.product.name} - ${plan.name}`,
          amount: plan.price,
        })
      } else if (input.productId) {
        const product = await ctx.db.query.products.findFirst({
          where: eq(products.id, input.productId),
        })
        
        if (!product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Product not found',
          })
        }
        
        subtotal = product.price
        currency = product.currency
        
        lineItems.push({
          type: 'product',
          label: product.name,
          amount: product.price,
        })
      }
      
      // Add order bumps
      if (input.orderBumpIds.length > 0) {
        const bumps = await ctx.db.query.orderBumps.findMany({
          where: and(
            eq(orderBumps.checkoutId, input.checkoutId),
          ),
          with: { product: true },
        })
        
        const currencyItems = []
        for (const bump of bumps) {
          if (input.orderBumpIds.includes(bump.id)) {
            currencyItems.push({
              currency: bump.product.currency,
              amount: bump.product.price,
            })
            
            subtotal += bump.product.price
            lineItems.push({
              type: 'bump',
              label: bump.headline,
              amount: bump.product.price,
            })
          }
        }
        
        // Validate currency consistency
        const validation = validateCurrencyConsistency([
          { currency, amount: subtotal },
          ...currencyItems,
        ])
        
        if (!validation.valid) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: validation.error || 'Mixed currencies not allowed',
          })
        }
      }
      
      // Apply coupon
      let discount = 0
      let couponMeta: { code?: string; id?: string } = {}
      
      if (input.couponCode) {
        const coupon = await ctx.db.query.coupons.findFirst({
          where: and(
            eq(coupons.code, input.couponCode.toUpperCase()),
            eq(coupons.isActive, true)
          ),
          with: {
            couponProducts: true,
          },
        })
        
        if (coupon) {
          // Validate coupon eligibility
          const now = new Date()
          const isValidDate = 
            (!coupon.startAt || coupon.startAt <= now) &&
            (!coupon.expiresAt || coupon.expiresAt >= now)
          
          const isUnderRedemptionLimit = 
            !coupon.maxRedemptions || coupon.timesRedeemed < coupon.maxRedemptions
          
          const meetsMinimum = 
            !coupon.minSubtotal || subtotal >= coupon.minSubtotal
          
          // Check product scope
          let isValidForProduct = coupon.productScope === 'all'
          if (coupon.productScope === 'specific' && coupon.appliesTo) {
            const targetIds = coupon.appliesTo as string[]
            isValidForProduct = 
              (input.productId && targetIds.includes(input.productId)) ||
              (input.planId && targetIds.includes(input.planId)) || false
          }
          
          if (isValidDate && isUnderRedemptionLimit && meetsMinimum && isValidForProduct) {
            // Check currency for fixed discounts
            if (coupon.discountType === 'fixed' && coupon.currency !== currency) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: `Coupon currency (${coupon.currency}) doesn't match cart currency (${currency})`,
              })
            }
            
            // Calculate discount
            if (coupon.discountType === 'percentage') {
              discount = calculateDiscount(subtotal, coupon.discountValue)
            } else {
              discount = Math.min(subtotal, coupon.discountValue)
            }
            
            couponMeta = { code: coupon.code, id: coupon.id }
            
            lineItems.push({
              type: 'discount',
              label: `Coupon: ${coupon.code}`,
              amount: -discount,
            })
          }
        }
      }
      
      // Calculate tax
      let tax = 0
      let reverseCharge = false
      let taxLabel = 'Tax'
      
      if (input.collectVAT || input.enableStripeTax) {
        const { calculateTax, validateVATFormat } = await import('@/lib/vat')
        const taxableAmount = subtotal - discount
        
        // Check if VAT number is provided and valid
        const isB2B = !!input.vatNumber && validateVATFormat(input.vatNumber)
        
        // Calculate tax using VAT library
        const taxResult = calculateTax({
          amount: taxableAmount,
          customerCountry: input.customerCountry,
          businessCountry: 'US', // Or fetch from settings
          vatNumber: input.vatNumber,
          isB2B,
          currency,
        })
        
        tax = taxResult.taxAmount
        reverseCharge = taxResult.reverseCharge
        taxLabel = taxResult.taxLabel
        
        if (tax > 0 || reverseCharge) {
          lineItems.push({
            type: 'tax',
            label: taxLabel,
            amount: tax,
          })
        }
      }
      
      const total = Math.max(0, subtotal - discount + tax)
      
      // Store quote
      const [newQuote] = await ctx.db
        .insert(quotes)
        .values({
          id: quoteId,
          checkoutId: input.checkoutId,
          cartHash,
          customerEmail: input.customerEmail,
          customerCountry: input.customerCountry,
          vatNumber: input.vatNumber,
          productId: input.productId,
          planId: input.planId,
          currency,
          subtotal,
          discount,
          tax,
          total,
          lineItems,
          meta: {
            planInterval,
            trialDays,
            reverseCharge,
            couponCode: couponMeta.code,
            orderBumpIds: input.orderBumpIds,
          },
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        })
        .returning()
      
      return newQuote
    }),

  // Initialize Payment - Manages Stripe intents with idempotency
  initializePayment: publicProcedure
    .input(
      z.object({
        quoteId: z.string(),
        customerEmail: z.string().email(),
        customerName: z.string().optional(),
        // Re-send cart params to verify quote is current
        checkoutId: z.string().uuid(),
        productId: z.string().uuid().optional(),
        planId: z.string().uuid().optional(),
        orderBumpIds: z.array(z.string().uuid()).default([]),
        couponCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { stripe } = await import('@/lib/stripe/config')
      
      // Get the quote
      const quote = await ctx.db.query.quotes.findFirst({
        where: eq(quotes.id, input.quoteId),
      })
      
      if (!quote) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Quote not found',
        })
      }
      
      // Verify quote is current (not expired)
      if (quote.expiresAt && new Date(quote.expiresAt) < new Date()) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Quote has expired, please refresh',
        })
      }
      
      // Generate idempotency key
      const idempotencyKey = `${quote.id}-${input.customerEmail}`
      
      // Get or create Stripe customer
      const existingCustomers = await stripe.customers.list({
        email: input.customerEmail,
        limit: 1,
      })
      
      let stripeCustomerId: string
      if (existingCustomers.data.length > 0) {
        stripeCustomerId = existingCustomers.data[0]!.id
        
        // Update customer info if provided
        if (input.customerName) {
          await stripe.customers.update(stripeCustomerId, {
            name: input.customerName,
            metadata: {
              checkoutId: input.checkoutId,
              quoteId: quote.id,
            },
          })
        }
      } else {
        // Create new customer
        const newCustomer = await stripe.customers.create({
          email: input.customerEmail,
          name: input.customerName,
          metadata: {
            checkoutId: input.checkoutId,
            quoteId: quote.id,
          },
        })
        stripeCustomerId = newCustomer.id
      }
      
      // Check for existing payment intent for this quote
      const existingIntents = await stripe.paymentIntents.search({
        query: `metadata['quoteId']:'${quote.id}' AND customer:'${stripeCustomerId}'`,
        limit: 1,
      })
      
      // Determine payment mode
      const isSubscription = quote.meta && 'planInterval' in quote.meta && quote.meta.planInterval
      
      // Handle zero-total flows (free trials, 100% coupons)
      if (quote.total === 0) {
        if (isSubscription) {
          // For subscriptions, we can create without payment method
          // This would be handled by a separate subscription creation flow
          return {
            mode: 'subscription' as const,
            clientSecret: null,
            amount: 0,
            currency: quote.currency,
            customerId: stripeCustomerId,
            requiresPayment: false,
          }
        } else {
          // For one-time zero-total, no payment needed
          return {
            mode: 'payment' as const,
            clientSecret: null,
            amount: 0,
            currency: quote.currency,
            customerId: stripeCustomerId,
            requiresPayment: false,
          }
        }
      }
      
      // Handle subscriptions (using deferred Elements mode)
      if (isSubscription) {
        // For subscriptions, we'll use deferred Elements mode
        // The actual subscription is created after payment method collection
        return {
          mode: 'subscription' as const,
          clientSecret: null, // Deferred mode
          amount: quote.total,
          currency: quote.currency,
          customerId: stripeCustomerId,
          requiresPayment: true,
          // Include price ID if we have it (would need to fetch from plan)
          stripePriceId: quote.planId || undefined,
        }
      }
      
      // Handle one-time payments
      if (existingIntents.data.length > 0) {
        const existingIntent = existingIntents.data[0]!
        
        // Check if intent needs updating
        const needsUpdate = 
          existingIntent.amount !== quote.total ||
          existingIntent.currency !== quote.currency.toLowerCase()
        
        if (needsUpdate) {
          // Update existing intent
          const updatedIntent = await stripe.paymentIntents.update(
            existingIntent.id,
            {
              amount: quote.total,
              currency: quote.currency.toLowerCase(),
              metadata: {
                checkoutId: input.checkoutId,
                quoteId: quote.id,
                productId: input.productId || '',
                planId: input.planId || '',
                couponCode: input.couponCode || '',
              },
            },
            { idempotencyKey }
          )
          
          return {
            mode: 'payment' as const,
            clientSecret: updatedIntent.client_secret!,
            amount: updatedIntent.amount,
            currency: updatedIntent.currency.toUpperCase(),
            customerId: stripeCustomerId,
            requiresPayment: true,
          }
        } else {
          // Return existing intent unchanged
          return {
            mode: 'payment' as const,
            clientSecret: existingIntent.client_secret!,
            amount: existingIntent.amount,
            currency: existingIntent.currency.toUpperCase(),
            customerId: stripeCustomerId,
            requiresPayment: true,
          }
        }
      }
      
      // Create new payment intent
      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: quote.total,
          currency: quote.currency.toLowerCase(),
          customer: stripeCustomerId,
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            checkoutId: input.checkoutId,
            quoteId: quote.id,
            productId: input.productId || '',
            planId: input.planId || '',
            couponCode: input.couponCode || '',
            orderBumpIds: JSON.stringify(input.orderBumpIds),
          },
          // Enable tax if it was calculated
          ...(quote.tax > 0 && {
            automatic_tax: {
              enabled: true,
            },
          }),
        },
        { idempotencyKey }
      )
      
      return {
        mode: 'payment' as const,
        clientSecret: paymentIntent.client_secret!,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase(),
        customerId: stripeCustomerId,
        requiresPayment: true,
      }
    }),

  // Get session for upsell/thank you pages
  getSession: publicProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.query.checkoutSessions.findFirst({
        where: eq(checkoutSessions.id, input.sessionId),
        with: {
          checkout: true,
        },
      })

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      }

      // Get funnel data if in upsell flow
      let funnelData = null
      if (session.currentStep !== 'checkout' && session.currentStep !== 'thank-you') {
        const funnel = await ctx.db.query.funnels.findFirst({
          where: eq(funnels.checkoutId, session.checkoutId),
        })

        if (funnel && funnel.flowData) {
          // Extract current offer from funnel flow
          const currentNode = funnel.flowData.nodes.find((n) => n.id === session.currentStep)
          if (currentNode) {
            funnelData = {
              currentOffer: currentNode.data,
              acceptPath: funnel.flowData.edges.find(
                (e) => e.source === currentNode.id && e.data?.condition === 'accept'
              )?.target,
              declinePath: funnel.flowData.edges.find(
                (e) => e.source === currentNode.id && e.data?.condition === 'decline'
              )?.target,
            }
          }
        }
      }

      // Get product details
      const productIds = [
        ...session.sessionData.productsPurchased,
        ...session.sessionData.bumpsAccepted,
        ...session.sessionData.upsellsAccepted,
      ]

      const productsData =
        productIds.length > 0
          ? await ctx.db.query.products.findMany({
              where: (products, { inArray }) => inArray(products.id, productIds),
            })
          : []

      return {
        ...session,
        funnelData,
        products: productsData,
      }
    }),

  // Accept upsell offer
  acceptUpsell: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        offerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.query.checkoutSessions.findFirst({
        where: eq(checkoutSessions.id, input.sessionId),
      })

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      }

      // Update session data
      const updatedSessionData = {
        ...session.sessionData,
        upsellsAccepted: [...session.sessionData.upsellsAccepted, input.offerId],
        // In real implementation, would calculate actual price
        totalSpent: session.sessionData.totalSpent + 2900, // Example price
      }

      // Get next step from funnel
      const funnel = await ctx.db.query.funnels.findFirst({
        where: eq(funnels.checkoutId, session.checkoutId),
      })

      let nextPath = null
      if (funnel && funnel.flowData) {
        const edge = funnel.flowData.edges.find(
          (e) => e.source === session.currentStep && e.data?.condition === 'accept'
        )
        if (edge) {
          const nextNode = funnel.flowData.nodes.find((n) => n.id === edge.target)
          if (nextNode?.type === 'thankYou') {
            nextPath = `/thank-you/${session.id}`
          } else if (nextNode) {
            nextPath = `/upsell/${session.id}`
            // Update current step
            await ctx.db
              .update(checkoutSessions)
              .set({
                currentStep: nextNode.id,
                sessionData: updatedSessionData,
              })
              .where(eq(checkoutSessions.id, input.sessionId))
          }
        }
      }

      if (!nextPath) {
        // Default to thank you if no next step
        await ctx.db
          .update(checkoutSessions)
          .set({
            currentStep: 'thank-you',
            sessionData: updatedSessionData,
            completedAt: new Date(),
          })
          .where(eq(checkoutSessions.id, input.sessionId))

        nextPath = `/thank-you/${session.id}`
      }

      return { nextPath }
    }),

  // Decline upsell offer
  declineUpsell: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        offerId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const session = await ctx.db.query.checkoutSessions.findFirst({
        where: eq(checkoutSessions.id, input.sessionId),
      })

      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Session not found',
        })
      }

      // Get next step from funnel
      const funnel = await ctx.db.query.funnels.findFirst({
        where: eq(funnels.checkoutId, session.checkoutId),
      })

      let nextPath = null
      if (funnel && funnel.flowData) {
        const edge = funnel.flowData.edges.find(
          (e) => e.source === session.currentStep && e.data?.condition === 'decline'
        )
        if (edge) {
          const nextNode = funnel.flowData.nodes.find((n) => n.id === edge.target)
          if (nextNode?.type === 'thankYou') {
            nextPath = `/thank-you/${session.id}`
          } else if (nextNode?.type === 'downsell') {
            nextPath = `/upsell/${session.id}`
            // Update current step
            await ctx.db
              .update(checkoutSessions)
              .set({
                currentStep: nextNode.id,
              })
              .where(eq(checkoutSessions.id, input.sessionId))
          }
        }
      }

      if (!nextPath) {
        // Default to thank you if no next step
        await ctx.db
          .update(checkoutSessions)
          .set({
            currentStep: 'thank-you',
            completedAt: new Date(),
          })
          .where(eq(checkoutSessions.id, input.sessionId))

        nextPath = `/thank-you/${session.id}`
      }

      return { nextPath }
    }),
    
  // VAT number validation endpoint
  validateVAT: publicProcedure
    .input(
      z.object({
        vatNumber: z.string().min(8).max(20),
        countryCode: z.string().length(2).optional(),
      })
    )
    .query(async ({ input }) => {
      const { validateVATNumber } = await import('@/lib/vat')
      
      const result = await validateVATNumber(input.vatNumber)
      
      return {
        valid: result.valid,
        vatNumber: result.vatNumber,
        countryCode: result.countryCode,
        companyName: result.companyName,
        companyAddress: result.companyAddress,
        reverseCharge: result.reverseCharge,
        error: result.error,
      }
    }),
    
  // Calculate tax for checkout
  calculateTax: publicProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        customerCountry: z.string().length(2),
        businessCountry: z.string().length(2).optional(),
        vatNumber: z.string().optional().nullable(),
        isB2B: z.boolean().optional(),
        currency: z.string().length(3).optional(),
      })
    )
    .query(async ({ input }) => {
      const { calculateTax } = await import('@/lib/vat')
      
      return calculateTax({
        amount: input.amount,
        customerCountry: input.customerCountry,
        businessCountry: input.businessCountry,
        vatNumber: input.vatNumber,
        isB2B: input.isB2B,
        currency: input.currency,
      })
    }),
})
