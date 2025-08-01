import { notFound } from 'next/navigation'
import { createApi } from '@/lib/trpc/server'
import { UpsellRenderer } from '@/components/upsell/upsell-renderer'

interface UpsellPageProps {
  params: Promise<{
    sessionId: string
  }>
}

export default async function UpsellPage({ params }: UpsellPageProps) {
  try {
    const { sessionId } = await params
    // Create API instance
    const api = await createApi()
    // Fetch session and funnel data
    const session = await api.checkout.getSession({ sessionId })

    if (!session || !session.funnelData) {
      notFound()
    }

    return <UpsellRenderer session={session} />
  } catch {
    notFound()
  }
}
