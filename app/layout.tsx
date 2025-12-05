import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

// System font stack - works without network access
const fontClassName = 'font-sans'

export const viewport: Viewport = {
  themeColor: '#8b5cf6',
}

export const metadata: Metadata = {
  title: 'Checkout Panda - High-Converting Checkout Pages',
  description: 'Simple, high-converting checkout pages with upsells for digital products',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
    other: [{ rel: 'mask-icon', url: '/logo.png' }],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={fontClassName}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
