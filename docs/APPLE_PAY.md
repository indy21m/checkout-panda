# Apple Pay setup

Apple Pay is already enabled in the Stripe Payment Element. To make it show up for real
customers, you still need to enable Apple Pay in Stripe and verify your domain.

## Stripe dashboard steps

1. In Stripe, go to Settings -> Payments -> Wallets and enable Apple Pay.
2. Add your checkout domain in Settings -> Payments -> Apple Pay -> Domains.
3. Download the domain association file from Stripe.

## Host the domain association file

Place the downloaded file at this exact path in the repo:

`public/.well-known/apple-developer-merchantid-domain-association`

Deploy the app, then click "Verify" in Stripe.

## Notes

- Apple Pay only shows on Safari (macOS/iOS) and when a user has a valid wallet set up.
- Localhost will not pass Apple Pay domain verification.
