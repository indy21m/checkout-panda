'use client'

import React from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import type { StripeElementsOptions, Appearance } from '@stripe/stripe-js'

// Initialize Stripe instance (singleton)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface StripeProviderProps {
  children: React.ReactNode
  clientSecret?: string
  amount?: number
  currency?: string
  mode?: 'payment' | 'subscription' | 'setup'
  country?: string
  quoteId?: string
}

// Circle-inspired appearance theme
const appearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#3b82f6', // blue-500
    colorBackground: '#ffffff',
    colorText: '#1f2937', // gray-800
    colorDanger: '#ef4444', // red-500
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSizeBase: '16px',
    spacingUnit: '4px',
    borderRadius: '12px',
    colorTextSecondary: '#6b7280', // gray-500
    colorTextPlaceholder: '#9ca3af', // gray-400
    colorIconCardError: '#ef4444',
  },
  rules: {
    '.Input': {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb', // gray-200
      boxShadow: 'none',
      padding: '12px 16px',
      fontSize: '16px',
      transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    },
    '.Input:hover': {
      borderColor: '#d1d5db', // gray-300
    },
    '.Input:focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
    '.Input--invalid': {
      borderColor: '#ef4444',
      color: '#1f2937',
    },
    '.Label': {
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '8px',
      color: '#1f2937',
    },
    '.Error': {
      fontSize: '14px',
      marginTop: '4px',
      color: '#ef4444',
    },
    '.CheckboxInput': {
      borderColor: '#d1d5db',
    },
    // Remove :checked pseudo-class - not supported by Stripe
    // Tab styles for payment method selection
    '.Tab': {
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      backgroundColor: '#ffffff',
      color: '#6b7280',
      fontWeight: '500',
      transition: 'all 0.15s ease',
    },
    '.Tab:hover': {
      borderColor: '#d1d5db',
      backgroundColor: '#f9fafb',
    },
    '.Tab--selected': {
      backgroundColor: '#eff6ff',
      borderColor: '#3b82f6',
      color: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
    '.TabIcon': {
      color: 'inherit',
    },
    '.TabLabel': {
      fontWeight: '500',
    },
    // Accordion for additional fields
    '.AccordionItem': {
      borderTop: '1px solid #e5e7eb',
      paddingTop: '16px',
      paddingBottom: '16px',
    },
  },
}

export function StripeProvider({
  children,
  clientSecret,
  amount,
  currency = 'USD',
  mode = 'payment',
  country = 'US',
  quoteId,
}: StripeProviderProps) {
  // Create a unique key for the Elements provider to force remount
  const elementsKey = React.useMemo(() => {
    return [
      clientSecret || 'deferred',
      amount || 0,
      currency,
      mode,
      country,
      quoteId || 'no-quote',
    ].join(':')
  }, [clientSecret, amount, currency, mode, country, quoteId])

  const options: StripeElementsOptions = React.useMemo(() => {
    const baseOptions = {
      appearance,
      loader: 'auto' as const,
    }

    // If we have a client secret, use it (for PaymentIntent/SetupIntent)
    if (clientSecret) {
      return {
        ...baseOptions,
        clientSecret,
      } as StripeElementsOptions
    }

    // For deferred mode (subscriptions or dynamic amounts)
    if (mode === 'subscription' || mode === 'setup') {
      return {
        ...baseOptions,
        mode: mode as 'subscription' | 'setup',
        currency: currency.toLowerCase(),
        amount: amount || undefined,
        setup_future_usage: mode === 'subscription' ? 'off_session' : undefined,
      } as StripeElementsOptions
    }

    // Payment mode with amount
    if (amount && amount > 0) {
      return {
        ...baseOptions,
        mode: 'payment' as const,
        amount,
        currency: currency.toLowerCase(),
      } as StripeElementsOptions
    }

    // Default to deferred payment mode
    return {
      ...baseOptions,
      mode: 'payment' as const,
      amount: 1000, // $10.00 placeholder
      currency: currency.toLowerCase(),
    } as StripeElementsOptions
  }, [clientSecret, amount, currency, mode])

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.error('Stripe publishable key is not configured')
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-red-800">Payment system is not configured. Please contact support.</p>
      </div>
    )
  }

  return (
    <Elements key={elementsKey} stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
}
