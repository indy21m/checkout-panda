import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="from-background via-background-secondary/30 to-background min-h-screen bg-gradient-to-br">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <Link
          href="/"
          className="text-text-secondary hover:text-text mb-8 inline-flex items-center gap-2 transition-colors"
        >
          ← Back to Home
        </Link>

        <h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>

        <div className="prose prose-lg text-text-secondary max-w-none space-y-6">
          <p className="text-lg leading-relaxed">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="space-y-4">
            <h2 className="text-text mt-8 text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using Checkout Panda, you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to abide by the above, please do
              not use this service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-text mt-8 text-2xl font-semibold">2. Use License</h2>
            <p className="leading-relaxed">
              Permission is granted to temporarily use Checkout Panda for personal, non-commercial
              transitory viewing only. This is the grant of a license, not a transfer of title, and
              under this license you may not:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained on Checkout Panda</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-text mt-8 text-2xl font-semibold">3. Disclaimer</h2>
            <p className="leading-relaxed">
              The materials on Checkout Panda are provided &ldquo;as is&rdquo;. Checkout Panda makes
              no warranties, expressed or implied, and hereby disclaims and negates all other
              warranties including, without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or non-infringement of intellectual
              property or other violation of rights.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-text mt-8 text-2xl font-semibold">4. Limitations</h2>
            <p className="leading-relaxed">
              In no event shall Checkout Panda or its suppliers be liable for any damages
              (including, without limitation, damages for loss of data or profit, or due to business
              interruption) arising out of the use or inability to use the materials on Checkout
              Panda, even if Checkout Panda or a Checkout Panda authorized representative has been
              notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-text mt-8 text-2xl font-semibold">5. Privacy Policy</h2>
            <p className="leading-relaxed">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and
              protect your information when you use our service. By using Checkout Panda, you agree
              to the collection and use of information in accordance with our{' '}
              <Link href="/privacy" className="text-primary hover:text-primary-hover underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-text mt-8 text-2xl font-semibold">6. User Accounts</h2>
            <p className="leading-relaxed">
              When you create an account with us, you must provide information that is accurate,
              complete, and current at all times. You are responsible for safeguarding the password
              and for all activities that occur under your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-text mt-8 text-2xl font-semibold">7. Prohibited Uses</h2>
            <p className="leading-relaxed">You may not use our service:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>For any unlawful purpose</li>
              <li>To solicit others to perform unlawful acts</li>
              <li>
                To violate any international, federal, provincial, or state regulations, rules,
                laws, or local ordinances
              </li>
              <li>
                To infringe upon or violate our intellectual property rights or the intellectual
                property rights of others
              </li>
              <li>To submit false or misleading information</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-text mt-8 text-2xl font-semibold">8. Termination</h2>
            <p className="leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice or
              liability, for any reason whatsoever, including without limitation if you breach the
              Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-text mt-8 text-2xl font-semibold">9. Governing Law</h2>
            <p className="leading-relaxed">
              These Terms shall be governed and construed in accordance with the laws of the United
              States, without regard to its conflict of law provisions. Our failure to enforce any
              right or provision of these Terms will not be considered a waiver of those rights.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-text mt-8 text-2xl font-semibold">10. Changes to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any
              time. If a revision is material, we will try to provide at least 30 days notice prior
              to any new terms taking effect.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-text mt-8 text-2xl font-semibold">11. Contact Information</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms, please contact us at
              support@checkoutpanda.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
