import Link from 'next/link'
import { Twitter, Github, Linkedin, Mail, Sparkles } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Testimonials', href: '#testimonials' },
      { name: 'Changelog', href: '/changelog' },
    ],
    Company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
    ],
    Resources: [
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
      { name: 'Templates', href: '/templates' },
      { name: 'Support', href: '/support' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' },
    ],
  }

  const socialLinks = [
    {
      name: 'Twitter',
      href: 'https://twitter.com/checkoutpanda',
      icon: Twitter,
    },
    {
      name: 'GitHub',
      href: 'https://github.com/checkoutpanda',
      icon: Github,
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/company/checkoutpanda',
      icon: Linkedin,
    },
    {
      name: 'Email',
      href: 'mailto:hello@checkoutpanda.com',
      icon: Mail,
    },
  ]

  return (
    <footer className="bg-background-secondary/50 border-border border-t">
      <div className="container mx-auto px-6 py-12 lg:py-16">
        {/* Main footer content */}
        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center space-x-2">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 opacity-50 blur-lg" />
                <div className="relative rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 p-2">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold">
                Checkout <span className="gradient-text-emerald">Panda</span>
              </span>
            </Link>

            <p className="text-text-secondary mb-6 max-w-xs">
              The elite checkout platform that transforms payment transactions into profitable
              customer journeys.
            </p>

            {/* Social links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-text transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Links sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 font-semibold">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-text-secondary hover:text-text text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter section */}
        <div className="border-border mb-8 border-t pt-8">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">Stay updated</h3>
              <p className="text-text-secondary text-sm">
                Get the latest updates on new features and tips to maximize your conversions.
              </p>
            </div>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="border-border bg-background flex-1 rounded-lg border px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2 text-sm font-medium text-white transition-all duration-200 hover:from-emerald-700 hover:to-teal-700"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-border flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-text-secondary text-sm">
            © {currentYear} Checkout Panda. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-sm">
            <span className="text-text-secondary">Built with 💚 for entrepreneurs</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-text-secondary">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
