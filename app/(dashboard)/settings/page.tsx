import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { GlassmorphicCard } from '@/components/ui/glassmorphic-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CreditCard, Bell, Shield, Webhook, Mail } from 'lucide-react'

export default async function SettingsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Settings</h1>
          <p className="text-text-secondary text-lg">
            Manage your account and checkout preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Payment Settings */}
          <GlassmorphicCard className="p-6" variant="light">
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 p-2">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold">Payment Integration</h2>
              </div>
              <p className="text-text-secondary">Connect your payment processor</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-key">Stripe Publishable Key</Label>
                <Input
                  id="stripe-key"
                  type="text"
                  placeholder="pk_test_..."
                  className="glass-morphism"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
                <Input
                  id="stripe-secret"
                  type="password"
                  placeholder="sk_test_..."
                  className="glass-morphism"
                />
              </div>
              <Button variant="primary" className="w-full sm:w-auto">
                Save Payment Settings
              </Button>
            </div>
          </GlassmorphicCard>

          {/* Webhook Settings */}
          <GlassmorphicCard className="p-6" variant="light">
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 p-2">
                  <Webhook className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold">Webhooks</h2>
              </div>
              <p className="text-text-secondary">Configure webhook endpoints for integrations</p>
            </div>
            <div className="space-y-4">
              <div className="text-text-secondary rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-4 font-mono text-sm">
                https://panda.zoostack.com/api/webhooks/stripe
              </div>
              <p className="text-text-tertiary text-sm">
                Add this URL to your Stripe webhook settings to enable post-purchase upsells
              </p>
              <div className="space-y-2">
                <Label htmlFor="webhook-secret">Webhook Signing Secret</Label>
                <Input
                  id="webhook-secret"
                  type="password"
                  placeholder="whsec_..."
                  className="glass-morphism"
                />
              </div>
              <Button variant="primary" className="w-full sm:w-auto">
                Update Webhook Secret
              </Button>
            </div>
          </GlassmorphicCard>

          {/* Email Settings */}
          <GlassmorphicCard className="p-6" variant="light">
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-green-400 to-green-600 p-2">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold">Email Notifications</h2>
              </div>
              <p className="text-text-secondary">Customize email settings and templates</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from-email">From Email</Label>
                <Input
                  id="from-email"
                  type="email"
                  placeholder="noreply@yourdomain.com"
                  className="glass-morphism"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from-name">From Name</Label>
                <Input
                  id="from-name"
                  type="text"
                  placeholder="Your Company"
                  className="glass-morphism"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                <div>
                  <p className="font-medium">Send order confirmations</p>
                  <p className="text-text-secondary text-sm">Email customers after purchase</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button variant="primary" className="w-full sm:w-auto">
                Save Email Settings
              </Button>
            </div>
          </GlassmorphicCard>

          {/* Security Settings */}
          <GlassmorphicCard className="p-6" variant="light">
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 p-2">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold">Security</h2>
              </div>
              <p className="text-text-secondary">Protect your checkouts and customer data</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                <div>
                  <p className="font-medium">Enable reCAPTCHA</p>
                  <p className="text-text-secondary text-sm">Protect checkouts from bots</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                <div>
                  <p className="font-medium">Fraud detection</p>
                  <p className="text-text-secondary text-sm">Block suspicious transactions</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                <div>
                  <p className="font-medium">Two-factor authentication</p>
                  <p className="text-text-secondary text-sm">Extra security for your account</p>
                </div>
                <Switch />
              </div>
            </div>
          </GlassmorphicCard>

          {/* Notification Preferences */}
          <GlassmorphicCard className="p-6" variant="light">
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 p-2">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold">Notifications</h2>
              </div>
              <p className="text-text-secondary">Choose what updates you receive</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                <div>
                  <p className="font-medium">New orders</p>
                  <p className="text-text-secondary text-sm">Get notified for each sale</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                <div>
                  <p className="font-medium">Daily summary</p>
                  <p className="text-text-secondary text-sm">Receive daily performance reports</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                <div>
                  <p className="font-medium">Product updates</p>
                  <p className="text-text-secondary text-sm">New features and improvements</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </GlassmorphicCard>
        </div>
      </div>
    </div>
  )
}
