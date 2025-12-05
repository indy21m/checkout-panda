import type { Product } from '@/types'

/**
 * Example product configuration
 *
 * To create a new product:
 * 1. Copy this file and rename to your-product-slug.ts
 * 2. Update all the values
 * 3. Create products/prices in Stripe Dashboard
 * 4. Update the stripe IDs (productId, priceId)
 * 5. Export from ./index.ts
 */
export const exampleCourse: Product = {
  id: 'example-course',
  slug: 'example-course',
  name: 'The Danish Investing Masterclass',

  stripe: {
    productId: 'prod_xxx', // Replace with real Stripe product ID
    priceId: 'price_xxx', // Replace with real Stripe price ID
    priceAmount: 109900, // 1099 DKK
    currency: 'DKK',
  },

  checkout: {
    title: 'The Danish Investing Masterclass',
    subtitle: 'Everything you need to start investing tax-efficiently in Denmark',
    image: '/products/danish-investing.jpg',
    benefits: [
      'Complete guide to ASK, Aktiesparekonto & pension accounts',
      '5+ hours of video lessons (lifetime access)',
      'Portfolio templates & tracking spreadsheets',
      'Private community of Danish investors',
    ],
    testimonial: {
      quote:
        'This course paid for itself in the first month. I had no idea I was losing so much to taxes by using the wrong account types.',
      author: 'Søren M.',
      role: 'Software Engineer, Copenhagen',
    },
    guarantee: 'Full refund within 30 days, no questions asked',
    guaranteeDays: 30,
    faq: [
      {
        question: 'How long do I have access?',
        answer:
          'Lifetime access. Once you purchase, the course is yours forever, including all future updates.',
      },
      {
        question: 'Is this for beginners?',
        answer:
          'Yes! We start from the basics and build up. No prior investing experience required.',
      },
      {
        question: 'Can I get a refund?',
        answer:
          "Absolutely. If you're not satisfied within 30 days, just email us and we'll refund you in full.",
      },
    ],
  },

  orderBump: {
    enabled: true,
    stripe: {
      productId: 'prod_yyy', // Replace with real Stripe product ID
      priceId: 'price_yyy', // Replace with real Stripe price ID
      priceAmount: 34900, // 349 DKK
      currency: 'DKK',
    },
    title: 'Tax Optimization Toolkit',
    description:
      'Get my personal spreadsheets for calculating your exact tax liability, optimizing between account types, and tracking dividend withholding taxes.',
    savingsPercent: 52,
  },

  upsells: [
    {
      id: 'portfolio-review',
      slug: 'upsell-1',
      stripe: {
        productId: 'prod_zzz', // Replace with real Stripe product ID
        priceId: 'price_zzz', // Replace with real Stripe price ID
        priceAmount: 219900, // 2199 DKK
        currency: 'DKK',
      },
      title: 'Personal Portfolio Review',
      subtitle: 'Get 1-on-1 feedback on your specific situation',
      description: '60-minute video call with personalized recommendations for your portfolio',
      benefits: [
        '60-minute 1-on-1 video call',
        'Personal review of your current portfolio',
        'Custom tax optimization recommendations',
        'Specific action plan for your goals',
        'Recording of the call to keep forever',
      ],
      originalPrice: 369900, // 3699 DKK
      urgencyText: 'This exclusive price disappears when you leave this page',
    },
  ],

  downsell: {
    enabled: true,
    slug: 'downsell',
    stripe: {
      productId: 'prod_aaa', // Replace with real Stripe product ID
      priceId: 'price_aaa', // Replace with real Stripe price ID
      priceAmount: 71900, // 719 DKK
      currency: 'DKK',
    },
    title: 'Quick-Start Portfolio Checklist',
    subtitle: 'Not ready for 1-on-1 coaching?',
    description: 'Get the essential checklist to set up your portfolio correctly',
    benefits: [
      'Step-by-step portfolio setup checklist',
      'Account type decision flowchart',
      'Broker comparison spreadsheet (Danish options)',
      'Common mistakes to avoid guide',
    ],
    originalPrice: 109900, // 1099 DKK
  },

  thankYou: {
    headline: "You're In!",
    subheadline: 'Welcome to the Danish Investing Masterclass',
    steps: [
      {
        title: 'Check your email',
        description: "We've sent your login details and receipt",
      },
      {
        title: 'Join the community',
        description: 'Click the link in your email to access Circle',
      },
      {
        title: 'Start Module 1',
        description: 'Begin with "Danish Tax Basics" (15 min)',
      },
    ],
    ctaButton: {
      text: 'Access Your Course',
      url: 'https://community.example.com/login',
    },
  },

  integrations: {
    convertkitTags: ['purchased-danish-masterclass', 'customer'],
    // zapierWebhookUrl: 'https://hooks.zapier.com/hooks/catch/xxx/yyy/', // Optional per-product webhook
  },

  meta: {
    title: 'Danish Investing Masterclass | Learn Tax-Efficient Investing',
    description:
      'Master Danish tax-efficient investing with our comprehensive course. Learn about ASK, Aktiesparekonto, and pension accounts.',
  },
}
