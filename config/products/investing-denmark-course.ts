import type { Product } from '@/types'

/**
 * The Ultimate Investing in Denmark Course
 *
 * Stripe Setup Required:
 * 1. Create product in Stripe Dashboard: "The Ultimate Investing in Denmark Course"
 * 2. Create two prices:
 *    - One-time: 699 DKK (prod_xxx, price_onetime_xxx)
 *    - Installment: Recurring price at 266.33 DKK/month (3-month subscription)
 * 3. Create order bump product: "Wealth Deep Dive Extended" at 149 DKK
 * 4. Update the IDs below with real Stripe IDs
 */
export const investingDenmarkCourse: Product = {
  id: 'investing-denmark',
  slug: 'investing-denmark',
  name: 'The Ultimate Investing in Denmark Course',

  stripe: {
    productId: 'prod_InvestingDK', // Replace with real Stripe product ID

    // Default pricing (one-time) - for backward compatibility
    priceId: 'price_1time_699dkk', // Replace with real Stripe price ID
    priceAmount: 69900, // 699 DKK in øre
    currency: 'DKK',

    // Multiple pricing tiers
    pricingTiers: [
      {
        id: 'one-time',
        label: 'Pay in Full',
        priceId: 'price_1time_699dkk', // Replace with real Stripe price ID
        priceAmount: 69900, // 699 DKK
        originalPrice: 99000, // 990 DKK crossed out
        isDefault: true,
        description: 'Save 100 kr compared to installment plan',
      },
      {
        id: 'installment-3',
        label: '3 Monthly Payments',
        priceId: 'price_3month_266dkk', // Replace with Stripe recurring price ID
        priceAmount: 79900, // 799 DKK total (3 × 266.33)
        originalPrice: 99000, // 990 DKK crossed out
        description: 'Spread the cost over 3 months',
        installments: {
          count: 3,
          intervalLabel: 'month',
          amountPerPayment: 26633, // 266.33 DKK in øre
        },
      },
    ],
  },

  checkout: {
    title: 'The Ultimate Investing in Denmark Course',
    subtitle: 'Master Danish tax-efficient investing and build wealth the smart way',
    image: '/products/investing-denmark-course.jpg', // Add product image

    benefits: [
      '50+ Lessons on everything about investing in Denmark',
      '👨‍💼 The Exact Strategies to Maximize Returns and Minimize Taxes',
      '🔎 See Exactly How Much I Have Invested & Where Specifically',
      "🇩🇰 All Danish Rules, Taxes & Regulations You'll Ever Need to Know",
      '📊 The Financial Dashboards: FIRE, Savings Rate, Cashflow + Apps',
      '🍾 Lifetime Access to My Private Online Community',
      '🍀 Bonus: The Denmark 10 Money Mistakes (and How to Avoid Them)',
      '✅ 30-Day Money Back Guarantee',
      '🚨 FREE Limited Time Bonus: Financial Freedom Blueprint Course (Value: 699 kr)',
    ],

    // Multiple testimonials
    testimonials: [
      {
        quote:
          'Great course to get introduced to Investing in DK and gaining confidence in doing so. The personal portfolio and the practical demos were the most useful imo! Thank you Mario :)',
        author: 'Rosy',
      },
      {
        quote:
          'I am new to investing, and this course is the perfect introduction to start understanding the stock market while also becoming familiar with the Danish tax system, brokers, and more. It will help me get inspired by Mario to create my own portfolio, weighing the risks and diversifying my assets.',
        author: 'George Nikolaou',
      },
    ],

    guarantee: 'Full 30-day money-back guarantee - no questions asked',
    guaranteeDays: 30,

    faq: [
      {
        question: 'How long do I have access to the course?',
        answer:
          'Lifetime access! Once you purchase, the course is yours forever, including all future updates and new lessons.',
      },
      {
        question: 'Is this course suitable for beginners?',
        answer:
          'Absolutely! The course starts from the basics and progressively builds your knowledge. No prior investing experience required - just a desire to learn!',
      },
      {
        question: "What if I'm not satisfied?",
        answer:
          "We offer a full 30-day money-back guarantee. If the course doesn't meet your expectations for any reason, simply email us and we'll refund you in full.",
      },
      {
        question: 'Do the payment plans have any extra fees?',
        answer:
          'The 3-month installment plan has a small convenience fee built into the total (799 kr vs 699 kr one-time). You save 100 kr by paying in full.',
      },
      {
        question: "What's included in the Financial Freedom Blueprint bonus?",
        answer:
          "This limited-time bonus (valued at 699 kr) covers goal-setting, budgeting frameworks, and wealth-building strategies that complement the investing knowledge you'll gain in the main course.",
      },
    ],
  },

  orderBump: {
    enabled: true,
    stripe: {
      productId: 'prod_WealthDeepDive', // Replace with real ID
      priceId: 'price_wealth_149dkk', // Replace with real ID
      priceAmount: 14900, // 149 DKK
      currency: 'DKK',
    },
    title: 'Wealth Deep Dive Extended',
    description:
      "Get Mario's personal portfolio review template, advanced tax worksheets, and lifetime quarterly webinar access. Learn what top Danish investors do differently.",
    savingsPercent: 40,
  },

  // Upsell offer - shown after successful checkout
  upsells: [
    {
      id: 'portfolio-coaching',
      slug: 'upsell-1',
      stripe: {
        productId: 'prod_PortfolioCoaching', // Replace with real Stripe ID
        priceId: 'price_coaching_999dkk', // Replace with real Stripe ID
        priceAmount: 99900, // 999 DKK
        currency: 'DKK',
      },
      title: 'Exclusive: 1-on-1 Portfolio Coaching Call',
      subtitle: 'Limited spots available',
      description:
        "Get 45 minutes of personalized guidance on your investment strategy. I'll review your current portfolio and give you specific recommendations tailored to your goals and risk tolerance.",
      benefits: [
        '45-minute private video call with Mario',
        'Personalized portfolio review and feedback',
        'Custom investment recommendations for your situation',
        'Recording of the call to revisit anytime',
        'Priority email support for 30 days after',
      ],
      originalPrice: 199900, // 1999 DKK crossed out
      urgencyText: 'This one-time offer disappears when you leave this page',
    },
  ],

  thankYou: {
    headline: 'Welcome to Your Investing Journey!',
    subheadline: "You're now part of an exclusive community of Danish investors",
    steps: [
      {
        title: 'Check Your Email',
        description: "We've sent your login credentials and course access link to your email",
      },
      {
        title: 'Join the Private Community',
        description:
          'Access the exclusive Circle community where you can ask questions and network with fellow investors',
      },
      {
        title: 'Start Learning',
        description: 'Begin with Module 1: Understanding the Danish Tax System for Investors',
      },
    ],
    ctaButton: {
      text: 'Access Your Course Now',
      url: 'https://your-course-platform.com/login', // Replace with actual course platform URL
    },
  },

  integrations: {
    convertkitTags: ['purchased-investing-denmark', 'customer', 'dk-investor'],
  },

  meta: {
    title: 'The Ultimate Investing in Denmark Course - Master Tax-Efficient Investing',
    description:
      'Learn everything about investing in Denmark with 50+ lessons covering tax optimization, portfolio strategies, and Danish regulations. Join our private community today!',
    ogImage: '/og-images/investing-denmark-course.jpg',
  },
}
