import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc'
import { StripeService } from '@/server/services/stripe-service'
import { db } from '@/server/db'
import { eq, and, sql } from 'drizzle-orm'
import { 
  checkouts, 
  products, 
  users, 
  productPlans, 
  orderBumps, 
  analyticsEvents,
  coupons,
  couponRedemptions 
} from '@/server/db/schema'
import { TRPCError } from '@trpc/server'
import { stripe } from '@/lib/stripe/config'
import type Stripe from 'stripe'

const stripeService = new StripeService()

export const paymentRouter = createTRPCRouter({
  // Create payment intent for one-time or subscription payments
  createCheckoutIntent: publicProcedure
    .input(
      z.object({
        checkoutId: z.string().uuid(),
        email: z.string().email(),
        // Product selection
        productId: z.string().uuid().optional(),
        planId: z.string().uuid().optional(),
        // Order bumps
        orderBumpIds: z.array(z.string().uuid()).optional(),
        // Pricing
        couponCode: z.string().optional(),
        // Customer info
        customerName: z.string().optional(),
        customerPhone: z.string().optional(),
        billingAddress: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          state: z.string(),
          postal_code: z.string(),
          country: z.string(),
        }).optional(),
        // Tax
        vatNumber: z.string().optional(),
        enableTax: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Get checkout
        const checkout = await db.query.checkouts.findFirst({
          where: eq(checkouts.id, input.checkoutId),
        })

        if (!checkout) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Checkout not found',
          })
        }

        // Get product or plan
        let amount = 0
        let description = ''
        let mode: 'payment' | 'subscription' = 'payment'
        let stripePriceId: string | undefined
        let metadata: Record<string, string> = {
          checkoutId: input.checkoutId,
        }

        if (input.planId) {
          const plan = await db.query.productPlans.findFirst({
            where: eq(productPlans.id, input.planId),
            with: { product: true },
          })

          if (!plan) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Plan not found',
            })
          }

          amount = plan.price
          description = `${plan.product.name} - ${plan.name}`
          mode = plan.isRecurring ? 'subscription' : 'payment'
          stripePriceId = plan.stripePriceId || undefined
          metadata.planId = input.planId
          metadata.productId = plan.productId
        } else if (input.productId) {
          const product = await db.query.products.findFirst({
            where: eq(products.id, input.productId),
          })

          if (!product) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Product not found',
            })
          }

          amount = product.price
          description = product.name
          metadata.productId = input.productId
        }

        // Add order bumps to amount
        if (input.orderBumpIds && input.orderBumpIds.length > 0) {
          const bumps = await db.query.orderBumps.findMany({
            where: and(
              eq(orderBumps.checkoutId, input.checkoutId),
            ),
            with: { product: true },
          })

          for (const bump of bumps) {
            if (input.orderBumpIds.includes(bump.id)) {
              amount += bump.product.price
              metadata[`bump_${bump.id}`] = bump.product.name
            }
          }
        }

        // Apply our custom coupon if provided
        let appliedCouponId: string | undefined
        let discountAmount = 0
        
        if (input.couponCode) {
          // First check our custom coupons
          const customCoupon = await db.query.coupons.findFirst({
            where: and(
              eq(coupons.code, input.couponCode.toUpperCase()),
              eq(coupons.isActive, true)
            ),
            with: {
              couponProducts: true,
            },
          })
          
          if (customCoupon) {
            // Validate coupon eligibility
            const now = new Date()
            const isValid = 
              (!customCoupon.redeemableFrom || customCoupon.redeemableFrom <= now) &&
              (!customCoupon.expiresAt || customCoupon.expiresAt >= now) &&
              (!customCoupon.maxRedemptions || (customCoupon.timesRedeemed || 0) < customCoupon.maxRedemptions)
            
            // Check product scope
            let isValidForProduct = customCoupon.productScope === 'all'
            if (customCoupon.productScope === 'specific') {
              const productIdToCheck = input.productId || 
                (input.planId ? (await db.query.productPlans.findFirst({
                  where: eq(productPlans.id, input.planId),
                }))?.productId : undefined)
              
              isValidForProduct = !!productIdToCheck && 
                customCoupon.couponProducts.some(cp => cp.productId === productIdToCheck)
            }
            
            if (isValid && isValidForProduct) {
              // Apply discount
              if (customCoupon.discountType === 'fixed') {
                discountAmount = Math.min(amount, customCoupon.discountValue)
              } else {
                discountAmount = Math.round(amount * (customCoupon.discountValue / 100))
              }
              
              amount = Math.max(0, amount - discountAmount)
              appliedCouponId = customCoupon.id
              metadata.couponCode = customCoupon.code
              metadata.couponId = customCoupon.id
              metadata.discountAmount = discountAmount.toString()
            }
          } else {
            // Fallback to Stripe coupons for backward compatibility
            try {
              const stripeCoupon = await stripe.coupons.retrieve(input.couponCode)
              if (stripeCoupon.amount_off) {
                discountAmount = stripeCoupon.amount_off
                amount = Math.max(0, amount - stripeCoupon.amount_off)
              } else if (stripeCoupon.percent_off) {
                discountAmount = Math.round(amount * (stripeCoupon.percent_off / 100))
                amount = Math.max(0, amount - discountAmount)
              }
              metadata.stripeCouponCode = input.couponCode
            } catch {
              // Invalid coupon, ignore
            }
          }
        }

        // Get or create customer
        let customer = await stripe.customers.list({
          email: input.email,
          limit: 1,
        })

        let customerId: string
        if (customer.data.length > 0) {
          const firstCustomer = customer.data[0]
          if (!firstCustomer) {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Customer data is invalid',
            })
          }
          customerId = firstCustomer.id
          // Update customer info if provided
          if (input.customerName || input.customerPhone || input.billingAddress) {
            await stripe.customers.update(customerId, {
              name: input.customerName,
              phone: input.customerPhone,
              address: input.billingAddress,
              metadata: {
                ...(firstCustomer.metadata || {}),
                checkoutId: input.checkoutId,
              },
            })
          }
        } else {
          // Create new customer
          const newCustomer = await stripe.customers.create({
            email: input.email,
            name: input.customerName,
            phone: input.customerPhone,
            address: input.billingAddress,
            metadata: {
              checkoutId: input.checkoutId,
            },
          })
          customerId = newCustomer.id
        }

        // Add VAT ID if provided
        if (input.vatNumber) {
          await stripe.customers.createTaxId(customerId, {
            type: 'eu_vat',
            value: input.vatNumber,
          })
        }

        // Create appropriate intent based on mode
        let clientSecret: string
        let intentId: string

        if (mode === 'subscription' && stripePriceId) {
          // Create subscription with trial if configured
          const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: stripePriceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: {
              save_default_payment_method: 'on_subscription',
            },
            expand: ['latest_invoice.payment_intent'],
            metadata,
          })

          const invoice = subscription.latest_invoice as Stripe.Invoice
          if (invoice && typeof invoice === 'object' && 'payment_intent' in invoice) {
            const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent
            clientSecret = paymentIntent.client_secret!
            intentId = paymentIntent.id
          } else {
            throw new TRPCError({
              code: 'INTERNAL_SERVER_ERROR',
              message: 'Failed to create subscription payment intent',
            })
          }
        } else {
          // Create payment intent for one-time payment
          const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            customer: customerId,
            description,
            automatic_payment_methods: {
              enabled: true,
            },
            metadata,
            // Enable tax calculation if requested
            ...(input.enableTax && {
              automatic_tax: {
                enabled: true,
              },
            }),
          })

          clientSecret = paymentIntent.client_secret!
          intentId = paymentIntent.id
        }

        // Track intent creation
        await db.insert(analyticsEvents).values({
          checkoutId: input.checkoutId,
          eventType: 'payment_intent_created',
          eventData: {
            intentId,
            amount,
            mode,
            email: input.email,
          },
        })

        return {
          clientSecret,
          intentId,
          amount,
          mode,
          customerId,
          couponId: appliedCouponId,
          discountAmount,
        }
      } catch (error) {
        console.error('Payment intent creation error:', error)
        if (error instanceof TRPCError) throw error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create payment intent',
        })
      }
    }),

  createIntent: publicProcedure
    .input(
      z.object({
        checkoutId: z.string().uuid(),
        productId: z.string().uuid(),
        amount: z.number().positive(),
        customerEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Get checkout and product info
        const [checkout, product] = await Promise.all([
          db.query.checkouts.findFirst({
            where: eq(checkouts.id, input.checkoutId),
          }),
          db.query.products.findFirst({
            where: eq(products.id, input.productId),
          }),
        ])

        if (!checkout || !product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Checkout or product not found',
          })
        }

        // Get or create customer
        let customerId: string | undefined
        // For public procedures, we'll handle customer creation differently
        // This would typically be handled with a customer email input

        // Create payment intent
        const paymentIntent = await stripeService.createPaymentIntent({
          amount: input.amount,
          customerId: customerId || '',
          metadata: {
            checkoutId: input.checkoutId,
            productId: input.productId,
            productName: product.name,
          },
        })

        return {
          clientSecret: paymentIntent.client_secret!,
          paymentIntentId: paymentIntent.id,
        }
      } catch (error) {
        console.error('Payment intent creation error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create payment intent',
        })
      }
    }),

  createCheckoutSession: publicProcedure
    .input(
      z.object({
        checkoutId: z.string().uuid(),
        productId: z.string().uuid(),
        customerEmail: z.string().email(),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Get checkout and product
        const [checkout, product] = await Promise.all([
          db.query.checkouts.findFirst({
            where: eq(checkouts.id, input.checkoutId),
          }),
          db.query.products.findFirst({
            where: eq(products.id, input.productId),
          }),
        ])

        if (!checkout || !product) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Checkout or product not found',
          })
        }

        // Get customer ID if available
        let customerId: string | undefined
        // For public checkouts, customer will be created at payment time

        // Create Stripe checkout session
        const sessionUrl = await stripeService.createCheckoutSession({
          checkoutId: input.checkoutId,
          productName: product.name,
          amount: product.price,
          customerId,
          customerEmail: input.customerEmail,
          successUrl: input.successUrl,
          cancelUrl: input.cancelUrl,
          metadata: {
            productId: input.productId,
          },
        })

        return { url: sessionUrl }
      } catch (error) {
        console.error('Checkout session creation error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create checkout session',
        })
      }
    }),

  getPaymentMethods: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, ctx.userId),
      })

      if (!user?.stripeCustomerId) {
        return { paymentMethods: [] }
      }

      // Get payment methods from Stripe
      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
      })

      return {
        paymentMethods: paymentMethods.data.map((pm) => ({
          id: pm.id,
          brand: pm.card?.brand,
          last4: pm.card?.last4,
          expMonth: pm.card?.exp_month,
          expYear: pm.card?.exp_year,
        })),
      }
    } catch (error) {
      console.error('Get payment methods error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get payment methods',
      })
    }
  }),

  setupIntent: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, ctx.userId),
      })

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        })
      }

      // Get or create customer
      const customerId = await stripeService.getOrCreateCustomer(user.id, user.email)

      // Create setup intent
      const setupIntent = await stripeService.createSetupIntent(customerId)

      return {
        clientSecret: setupIntent.client_secret!,
      }
    } catch (error) {
      console.error('Setup intent creation error:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create setup intent',
      })
    }
  }),

  // Validate coupon code
  validateCoupon: publicProcedure
    .input(
      z.object({
        code: z.string(),
        amount: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const coupon = await stripe.coupons.retrieve(input.code)
        
        if (!coupon.valid) {
          return {
            valid: false,
            message: 'This coupon is no longer valid',
          }
        }

        let discountAmount = 0
        let discountDisplay = ''

        if (coupon.amount_off) {
          discountAmount = coupon.amount_off
          discountDisplay = `$${(coupon.amount_off / 100).toFixed(2)} off`
        } else if (coupon.percent_off) {
          discountAmount = Math.round(input.amount * (coupon.percent_off / 100))
          discountDisplay = `${coupon.percent_off}% off`
        }

        return {
          valid: true,
          discountAmount,
          discountDisplay,
          finalAmount: Math.max(0, input.amount - discountAmount),
        }
      } catch {
        return {
          valid: false,
          message: 'Invalid coupon code',
        }
      }
    }),

  // Calculate tax for a given amount
  calculateTax: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        address: z.object({
          line1: z.string(),
          city: z.string(),
          state: z.string(),
          postal_code: z.string(),
          country: z.string(),
        }),
      })
    )
    .query(async ({ input }) => {
      try {
        // This would integrate with Stripe Tax in production
        // For now, return a simple calculation
        const taxRate = 0.0875 // 8.75% example tax rate
        const taxAmount = Math.round(input.amount * taxRate)

        return {
          taxAmount,
          taxRate,
          totalAmount: input.amount + taxAmount,
        }
      } catch (error) {
        console.error('Tax calculation error:', error)
        return {
          taxAmount: 0,
          taxRate: 0,
          totalAmount: input.amount,
        }
      }
    }),

  // Record coupon redemption after successful payment
  recordCouponRedemption: publicProcedure
    .input(
      z.object({
        couponId: z.string().uuid(),
        stripePaymentIntentId: z.string(),
        customerEmail: z.string().email(),
        customerId: z.string().optional(),
        checkoutSessionId: z.string().uuid().optional(),
        originalAmount: z.number(),
        discountAmount: z.number(),
        finalAmount: z.number(),
        productId: z.string().uuid().optional(),
        productName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Record the redemption
        await db.insert(couponRedemptions).values({
          couponId: input.couponId,
          stripePaymentIntentId: input.stripePaymentIntentId,
          customerEmail: input.customerEmail,
          customerId: input.customerId,
          checkoutSessionId: input.checkoutSessionId,
          originalAmount: input.originalAmount,
          discountApplied: input.discountAmount,
          finalAmount: input.finalAmount,
          productId: input.productId,
          productName: input.productName,
        })

        // Increment the redemption count
        await db
          .update(coupons)
          .set({
            timesRedeemed: sql`${coupons.timesRedeemed} + 1`,
          })
          .where(eq(coupons.id, input.couponId))

        return { success: true }
      } catch (error) {
        console.error('Failed to record coupon redemption:', error)
        // Don't throw - we don't want to fail the payment flow
        return { success: false }
      }
    }),
})
