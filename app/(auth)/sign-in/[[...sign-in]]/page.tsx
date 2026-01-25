'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AuthLayout } from '@/components/auth/auth-layout'
import { signIn } from '../../actions'

export default function SignInPage() {
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url')
  const message = searchParams.get('message')

  const [state, formAction, pending] = useActionState(
    async (_prevState: { error: string }, formData: FormData) => {
      const result = await signIn(formData)
      return result || { error: '' }
    },
    { error: '' }
  )

  return (
    <AuthLayout>
      <div className="rounded-xl bg-white p-8 shadow-xl">
        <h2 className="mb-2 text-center text-2xl font-bold">Welcome back</h2>
        <p className="text-text-secondary mb-6 text-center">Sign in to your account</p>

        {message && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-center text-sm text-green-700">
            {message}
          </div>
        )}

        {state.error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirect_url" value={redirectUrl || ''} />

          <div>
            <label htmlFor="email" className="text-text-secondary mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="form-input w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-text-secondary mb-1 block text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="form-input w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
          >
            {pending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-text-secondary mt-6 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="text-emerald-500 hover:text-emerald-600">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
