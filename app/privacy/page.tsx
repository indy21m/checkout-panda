import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary/30 to-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text mb-8 transition-colors"
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none text-text-secondary space-y-6">
          <p className="text-lg leading-relaxed">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text mt-8">1. Information We Collect</h2>
            <p className="leading-relaxed">
              We collect information you provide directly to us, such as when you create an account, use our services, make a purchase, or contact us for support.
            </p>
            <p className="leading-relaxed">
              The types of information we may collect include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name, email address, postal address, phone number</li>
              <li>Payment information (processed securely through our payment partners)</li>
              <li>Company information and business details</li>
              <li>Communication preferences</li>
              <li>Any other information you choose to provide</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text mt-8">2. How We Use Your Information</h2>
            <p className="leading-relaxed">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, security alerts, and support messages</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Communicate with you about products, services, offers, and events</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text mt-8">3. Information Sharing and Disclosure</h2>
            <p className="leading-relaxed">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf</li>
              <li>In response to a request for information if we believe disclosure is required by applicable law, regulation, or legal process</li>
              <li>To protect the rights, property, and safety of Checkout Panda, our users, or others</li>
              <li>With your consent or at your direction</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text mt-8">4. Data Security</h2>
            <p className="leading-relaxed">
              We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. We implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk.
            </p>
            <p className="leading-relaxed">
              However, no Internet or electronic communication is ever fully secure or error-free. Please take special care in deciding what information you send to us.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text mt-8">5. Data Retention</h2>
            <p className="leading-relaxed">
              We retain personal information for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements, or to resolve disputes and enforce our agreements.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text mt-8">6. Your Rights and Choices</h2>
            <p className="leading-relaxed">
              You have certain rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> You can request access to the personal information we hold about you</li>
              <li><strong>Correction:</strong> You can request that we correct inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> You can request that we delete your personal information in certain circumstances</li>
              <li><strong>Portability:</strong> You can request a copy of your personal information in a structured, machine-readable format</li>
              <li><strong>Opt-out:</strong> You can opt out of receiving promotional communications from us</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text mt-8">7. Cookies and Tracking Technologies</h2>
            <p className="leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with small amounts of data which may include an anonymous unique identifier.
            </p>
            <p className="leading-relaxed">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text mt-8">8. International Data Transfers</h2>
            <p className="leading-relaxed">
              Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text mt-8">9. Children&apos;s Privacy</h2>
            <p className="leading-relaxed">
              Our service is not directed to individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text mt-8">10. Changes to This Privacy Policy</h2>
            <p className="leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date at the top of this Privacy Policy.
            </p>
            <p className="leading-relaxed">
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-text mt-8">11. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>By email: privacy@checkoutpanda.com</li>
              <li>By visiting our contact page on our website</li>
              <li>By mail: Checkout Panda, Privacy Department, [Address]</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}