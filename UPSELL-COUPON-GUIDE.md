# Upsell Chains & Coupon Management Guide

## Upsell Chain Flow

### How Upsell Chains Work

The checkout system supports sequential upsell chains after the initial purchase:

```
Main Checkout → Upsell 1 → Upsell 2 → ... → Downsell → Thank You
```

### Configuration

Define upsells in your product config file (`/config/products/your-product.ts`):

```typescript
upsells: [
  {
    id: 'portfolio-review',
    slug: 'upsell-1',  // Maps to route /[product]/upsell-1
    stripe: {
      productId: 'prod_zzz',
      priceId: 'price_zzz',
      priceAmount: 219900, // 2199 DKK
      currency: 'DKK',
    },
    title: 'Personal Portfolio Review',
    description: '60-minute video call with personalized recommendations',
    benefits: [
      '60-minute 1-on-1 video call',
      'Personal portfolio review',
      'Custom tax optimization recommendations',
    ],
    originalPrice: 369900, // Show strikethrough price
    urgencyText: 'This exclusive price disappears when you leave this page',
  },
  // Add more upsells here for longer chains
],
```

### Upsell Flow Logic

1. **After Main Checkout Success:**
   - Customer completes payment on `/[product]/checkout`
   - System saves payment method for one-click upsells
   - Redirects to `/[product]/upsell-1?customer_id=xxx&payment_method=xxx&purchases=main`

2. **On Upsell Page:**
   - Customer sees "Order Confirmed" banner
   - Presented with special offer
   - Two options:
     - **"Yes, Add This!"** → Charges saved payment method, redirects to next upsell (or thank you)
     - **"No Thanks"** → Goes to downsell (if enabled) or thank you page

3. **Multiple Upsells:**
   To create a chain, add multiple upsells and create matching routes:

   ```typescript
   // In your product config
   upsells: [
     { id: 'upsell-1', slug: 'upsell-1', ... },
     { id: 'upsell-2', slug: 'upsell-2', ... },
     { id: 'upsell-3', slug: 'upsell-3', ... },
   ]
   ```

   Then create the routes:
   - `/app/[product]/upsell-1/page.tsx` (already exists)
   - `/app/[product]/upsell-2/page.tsx` (copy upsell-1, update index)
   - `/app/[product]/upsell-3/page.tsx` (copy upsell-1, update index)

4. **Downsell (Optional):**
   - Shown when customer declines an upsell
   - Lower price point to recover the sale
   - Configured via `downsell` property in product config

### Creating Additional Upsell Pages

Copy the existing upsell page template:

```bash
cp app/[product]/upsell-1/page.tsx app/[product]/upsell-2/page.tsx
```

Update the page to reference the correct upsell index:

```typescript
const upsell = product.upsells?.[1] // Change from [0] to [1] for upsell-2
```

### One-Click Charging

Upsells use Stripe's saved payment method for frictionless purchases:

1. Initial checkout creates PaymentIntent with `setup_future_usage: 'off_session'`
2. Payment method is saved to customer
3. Upsells charge via `/api/charge-upsell` endpoint
4. No need to re-enter card details

---

## Coupon Management

### How Coupons Work

Coupons are managed entirely in **Stripe Dashboard** - no database required.

### Creating Coupons in Stripe

1. Go to [Stripe Dashboard → Coupons](https://dashboard.stripe.com/coupons)
2. Click "Create coupon"
3. Configure:
   - **Name**: Internal name (e.g., "Early Bird Discount")
   - **ID**: Code customers enter (e.g., `EARLYBIRD20`)
   - **Type**: Percentage off or Fixed amount
   - **Value**: Discount amount
   - **Duration**: Once, forever, or repeating
   - **Max redemptions**: Limit total uses (optional)
   - **Redeem by**: Expiration date (optional)

### Using Coupons in Checkout

Customers enter coupon codes on the checkout page via the `CouponInput` component.

**Validation Flow:**

1. Customer enters code (e.g., `EARLYBIRD20`)
2. Frontend calls `/api/validate-coupon`
3. API retrieves coupon from Stripe
4. Checks:
   - ✅ Coupon exists
   - ✅ Is valid (not expired)
   - ✅ Under max redemption limit
   - ✅ Not past redeem-by date
5. Returns discount details to frontend
6. Frontend recalculates total and displays savings
7. Coupon ID is passed to `/api/create-payment-intent`
8. Stripe applies discount automatically

### Coupon Types

**Percentage Off:**

```typescript
// Stripe: 20% off
discount = subtotal * 0.2
```

**Fixed Amount:**

```typescript
// Stripe: 100 DKK off
discount = min(10000, subtotal) // 100 DKK in cents
```

### Coupon Limitations

- **Single use per checkout** - applied to main product + order bump only
- **Not applied to upsells** - upsells are separate transactions
- **Currency-specific** - Fixed amount coupons are in the coupon's currency

### Example Coupon Configurations

**Limited Time Offer:**

```
Name: Black Friday 2024
ID: BLACKFRIDAY2024
Type: Percentage
Value: 30%
Duration: Once
Redeem by: 2024-11-30
Max redemptions: 100
```

**Influencer Discount:**

```
Name: Affiliate Partner - John
ID: JOHN15
Type: Percentage
Value: 15%
Duration: Once
Max redemptions: (unlimited)
```

**First-Time Customer:**

```
Name: Welcome Discount
ID: WELCOME50
Type: Fixed amount
Value: 50 DKK
Duration: Once
Max redemptions: 1000
```

### Tracking Coupon Usage

Coupon usage is automatically tracked in:

1. **Stripe Dashboard** → Coupons → Click coupon → View "Times redeemed"
2. **Payment Intent metadata** - includes `couponCode` and `couponId`
3. **Webhook events** - sent to Zapier with coupon details

### Best Practices

✅ **Use memorable, short codes:** `SAVE20` not `discount-twenty-percent-2024`
✅ **Set expiration dates** for time-sensitive offers
✅ **Limit redemptions** to prevent abuse
✅ **Use percentage for scalability** - works across all products
✅ **Include codes in Stripe metadata** - shows in payment details

❌ **Don't hardcode coupons** in your code - use Stripe only
❌ **Don't share unlimited coupons publicly** - set max redemptions
❌ **Don't use fixed amounts** across multiple currencies

---

## Advanced: Coupon + Upsell Strategies

### Strategy 1: Main Product Discount

```typescript
// Product: 1099 DKK
// Coupon: SAVE20 (20% off)
// Customer pays: 879 DKK

// Then offer full-price upsells (no discount applied)
```

### Strategy 2: Downsell-Only Coupons

Create separate "recovery" coupons for downsell pages by sending customers to a specific URL:

```
/[product]/checkout?coupon=COMEBACK10
```

Pre-fill the coupon input and auto-validate.

### Strategy 3: Order Bump Incentives

Coupons apply to order bump too:

```typescript
// Main: 1099 DKK
// Order Bump: 349 DKK
// Subtotal: 1448 DKK
// Coupon SAVE20: -290 DKK
// Total: 1158 DKK
```

This incentivizes adding the order bump.

---

## Summary

**Upsell Chains:**

- Define in product config file
- Create matching route files for each upsell
- Use one-click charging with saved payment methods
- Chain as many upsells as you want (just add more routes)

**Coupons:**

- Managed entirely in Stripe Dashboard
- No code changes needed to add/remove coupons
- Validated via API on checkout
- Applied to main product + order bump only
- Tracked automatically in Stripe

**Key Difference:**

- Upsells = Additional products in the funnel
- Coupons = Discounts on the initial purchase
