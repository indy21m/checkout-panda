import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="text-center">
        <h1 className="mb-4 text-9xl font-bold text-white">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-300">Page not found</h2>
        <p className="mb-8 text-gray-400">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="from-primary to-secondary inline-flex items-center justify-center rounded-lg bg-gradient-to-r px-8 py-3 text-base font-medium text-white transition-all hover:shadow-lg"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
