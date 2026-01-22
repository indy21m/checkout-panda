# Zapier Integration Guide

Checkout Panda sends a webhook to Zapier on every successful purchase. Use this to automatically:

- Tag subscribers in ConvertKit
- Grant access in Circle communities
- Add contacts to your CRM
- Trigger email sequences
- Update spreadsheets

## Setup

### 1. Create a Zapier Webhook Trigger

1. Go to [zapier.com](https://zapier.com) and create a new Zap
2. Choose **Webhooks by Zapier** as the trigger
3. Select **Catch Hook**
4. Copy the webhook URL (looks like `https://hooks.zapier.com/hooks/catch/123456/abcdef/`)

### 2. Add URL to Checkout Panda

**Option A: Global webhook (all products)**

Add to Vercel environment variables:

```
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/123456/abcdef/
```

**Option B: Per-product webhook**

In the product config or database, set:

```typescript
integrations: {
  zapierWebhookUrl: 'https://hooks.zapier.com/hooks/catch/...'
}
```

### 3. Test the Webhook

1. Make a test purchase on your checkout page
2. In Zapier, click "Test trigger" to see the received data
3. Continue building your Zap with the captured data

## Webhook Payload

Every successful payment sends this JSON:

```json
{
  "event": "purchase",
  "paymentIntentId": "pi_1234567890",
  "customerId": "cus_1234567890",
  "paymentMethodId": "pm_1234567890",
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "amount": 69900,
  "currency": "DKK",
  "productSlug": "investing-denmark",
  "productName": "The Ultimate Investing in Denmark Course",
  "purchaseType": "main_purchase",
  "isUpsell": false,
  "isDownsell": false,
  "upsellId": null,
  "includeOrderBump": true,
  "purchasedItems": ["main", "bump"],
  "couponCode": "SAVE20",
  "subtotal": 84800,
  "discount": 16960,
  "tax": 14560,
  "country": "DK",
  "vatNumber": null,
  "convertkitTags": ["purchased-investing-denmark", "customer"],
  "timestamp": "2024-01-15T12:30:00.000Z"
}
```

### Field Reference

| Field              | Type    | Description                                 |
| ------------------ | ------- | ------------------------------------------- |
| `event`            | string  | Always "purchase"                           |
| `email`            | string  | Customer's email                            |
| `firstName`        | string  | Customer's first name                       |
| `lastName`         | string  | Customer's last name                        |
| `amount`           | number  | Total charged in cents/øre                  |
| `currency`         | string  | Currency code (USD, EUR, DKK)               |
| `productSlug`      | string  | Product identifier                          |
| `productName`      | string  | Product display name                        |
| `purchaseType`     | string  | "main_purchase", "upsell", or "downsell"    |
| `isUpsell`         | boolean | True if this is an upsell purchase          |
| `isDownsell`       | boolean | True if this is a downsell purchase         |
| `includeOrderBump` | boolean | True if order bump was added                |
| `purchasedItems`   | array   | List of items: ["main", "bump", "upsell-1"] |
| `couponCode`       | string  | Applied coupon code (if any)                |
| `subtotal`         | number  | Amount before discounts/tax                 |
| `discount`         | number  | Discount amount applied                     |
| `tax`              | number  | Tax amount charged                          |
| `country`          | string  | Customer's country code                     |
| `vatNumber`        | string  | B2B VAT number (if provided)                |
| `convertkitTags`   | array   | Tags to apply in ConvertKit                 |
| `timestamp`        | string  | ISO timestamp of purchase                   |

## Common Zap Recipes

### ConvertKit: Tag Subscriber on Purchase

1. **Trigger:** Webhooks by Zapier → Catch Hook
2. **Action:** ConvertKit → Add Tag to Subscriber
   - Email: `{{email}}`
   - Tag: Use `convertkitTags` or create based on `productSlug`

### Circle: Grant Community Access

1. **Trigger:** Webhooks by Zapier → Catch Hook
2. **Filter:** Only continue if `purchaseType` = "main_purchase"
3. **Action:** Circle → Add Member to Space
   - Email: `{{email}}`
   - Name: `{{firstName}} {{lastName}}`
   - Space ID: Your Circle space ID

### Google Sheets: Log All Purchases

1. **Trigger:** Webhooks by Zapier → Catch Hook
2. **Action:** Google Sheets → Create Spreadsheet Row
   - Map fields: email, productName, amount, timestamp, etc.

### Slack: Notify on Sale

1. **Trigger:** Webhooks by Zapier → Catch Hook
2. **Action:** Slack → Send Channel Message
   - Message: `🎉 New sale! {{productName}} - {{email}} - {{currency}} {{amount/100}}`

## Handling Different Purchase Types

The `purchaseType` field tells you what was purchased:

- `main_purchase` - Initial checkout completed
- `upsell` - Customer accepted an upsell offer
- `downsell` - Customer accepted a downsell offer

Use Zapier's **Filter** step to handle these differently:

```
Only continue if purchaseType equals main_purchase
```

## Handling Order Bumps

Check `includeOrderBump` to see if the customer added the order bump:

```
If includeOrderBump is true → Apply "order-bump-purchased" tag
```

Or check `purchasedItems` array which contains all items:

- `["main"]` - Just the main product
- `["main", "bump"]` - Main product + order bump
- `["main", "bump", "upsell-1"]` - Main + bump + first upsell

## Testing

1. Use Stripe test mode for test purchases
2. Check Zapier's task history to see received webhooks
3. Use Zapier's "Test & Review" to preview actions before enabling

## Troubleshooting

### Webhook not firing

1. Check `ZAPIER_WEBHOOK_URL` is set in Vercel
2. Verify Stripe webhook is configured and active
3. Check Vercel function logs for errors

### Missing data in Zapier

Some fields may be null if not provided during checkout:

- `firstName`/`lastName` - Only if customer entered name
- `couponCode` - Only if coupon was applied
- `vatNumber` - Only if B2B customer entered it

### Duplicate webhooks

Stripe may retry webhooks if your server responds slowly. Zapier handles deduplication, but you can also:

- Use `paymentIntentId` as a unique identifier
- Add a Zapier filter to skip duplicates
