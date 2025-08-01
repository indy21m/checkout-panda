import { notFound } from 'next/navigation'
import { api } from '@/lib/trpc/server'
import { ThankYouRenderer } from '@/components/checkout/thank-you-renderer'

interface ThankYouPageProps {
  params: Promise<{
    sessionId: string
  }>
}

export default async function ThankYouPage({ params }: ThankYouPageProps) {
  try {
    const { sessionId } = await params
    const session = await api.checkout.getSession({ sessionId })

    if (!session || !session.completedAt) {
      notFound()
    }

    return <ThankYouRenderer session={session} />
  } catch {
    notFound()
  }
}
