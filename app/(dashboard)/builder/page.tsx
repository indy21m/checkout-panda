import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function BuilderPage() {
  // Redirect to checkouts page
  // Users need to select a checkout to edit
  redirect('/checkouts')
  
  // This code won't run due to redirect, but keeping for type safety
  return (
    <div className="container mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Checkout Builder</h1>
        <p className="mt-2 text-gray-400">
          Select a checkout to customize its design and content
        </p>
      </div>

      <Card variant="glass" className="mx-auto max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20">
            <LayoutDashboard className="h-8 w-8 text-purple-400" />
          </div>
          <CardTitle className="text-2xl">No Checkout Selected</CardTitle>
          <CardDescription className="text-gray-400">
            To use the builder, you need to select a checkout first
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link href="/checkouts">
            <Button variant="primary" size="lg">
              Go to Checkouts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}