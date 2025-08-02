import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Checkout Panda" className="mb-6 h-24 w-24 object-contain md:h-32 md:w-32" />
          <h1 className="mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-5xl font-bold text-transparent md:text-7xl">
            Checkout Panda
          </h1>
          <p className="mb-8 max-w-2xl text-xl text-gray-300 md:text-2xl">
            Elite checkout platform that transforms payment transactions into visually stunning,
            highly profitable customer journeys
          </p>
          <div className="flex gap-4">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-secondary px-8 py-3 text-base font-medium text-white transition-all hover:shadow-lg hover:shadow-[rgba(10,132,255,0.25)]"
            >
              Get Started
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-[rgba(10,132,255,0.2)] bg-[rgba(255,255,255,0.1)] px-8 py-3 text-base font-medium text-primary backdrop-blur-md transition-all hover:border-[rgba(10,132,255,0.3)] hover:bg-[rgba(255,255,255,0.2)]"
            >
              View Demo
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
