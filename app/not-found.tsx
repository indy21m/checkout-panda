import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="text-center">
        <h1 className="from-primary to-secondary mb-4 bg-gradient-to-r bg-clip-text text-9xl font-bold text-transparent">
          404
        </h1>
        <h2 className="mb-4 text-2xl font-semibold">Page not found</h2>
        <p className="text-text-secondary mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
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
