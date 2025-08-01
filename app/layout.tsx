import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { TRPCReactProvider } from '@/components/providers/trpc-provider'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Checkout Panda - Elite Checkout Platform',
  description:
    'Transform payment transactions into visually stunning, highly profitable customer journeys',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <TRPCReactProvider>
            {children}
            <Toaster />
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
