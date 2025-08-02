import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">Settings</h1>
          <p className="text-gray-300">Manage your account and checkout preferences</p>
        </div>

        <div className="space-y-6">
          {/* Payment Settings */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-400" />
                <CardTitle>Payment Integration</CardTitle>
              </div>
              <CardDescription>Connect your payment processor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stripe-key">Stripe Publishable Key</Label>
                <Input
                  id="stripe-key"
                  type="text"
                  placeholder="pk_test_..."
                  className="bg-gray-800/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
                <Input
                  id="stripe-secret"
                  type="password"
                  placeholder="sk_test_..."
                  className="bg-gray-800/50"
                />
              </div>
              <Button variant="primary" className="w-full sm:w-auto">
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>

          {/* Webhook Settings */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-blue-400" />
                <CardTitle>Webhooks</CardTitle>
              </div>
              <CardDescription>Configure webhook endpoints for integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-gray-800/50 p-4 font-mono text-sm text-gray-300">
                https://panda.zoostack.com/api/webhooks/stripe
              </div>
              <p className="text-sm text-gray-400">
                Add this URL to your Stripe webhook settings to enable post-purchase upsells
              </p>
              <div className="space-y-2">
                <Label htmlFor="webhook-secret">Webhook Signing Secret</Label>
                <Input
                  id="webhook-secret"
                  type="password"
                  placeholder="whsec_..."
                  className="bg-gray-800/50"
                />
              </div>
              <Button variant="primary" className="w-full sm:w-auto">
                Update Webhook Secret
              </Button>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-400" />
                <CardTitle>Email Notifications</CardTitle>
              </div>
              <CardDescription>Customize email settings and templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from-email">From Email</Label>
                <Input
                  id="from-email"
                  type="email"
                  placeholder="noreply@yourdomain.com"
                  className="bg-gray-800/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="from-name">From Name</Label>
                <Input
                  id="from-name"
                  type="text"
                  placeholder="Your Company"
                  className="bg-gray-800/50"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Send order confirmations</p>
                  <p className="text-sm text-gray-400">Email customers after purchase</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button variant="primary" className="w-full sm:w-auto">
                Save Email Settings
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-400" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>Protect your checkouts and customer data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Enable reCAPTCHA</p>
                  <p className="text-sm text-gray-400">Protect checkouts from bots</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Fraud detection</p>
                  <p className="text-sm text-gray-400">Block suspicious transactions</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Two-factor authentication</p>
                  <p className="text-sm text-gray-400">Extra security for your account</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card variant="glass">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-400" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Choose what updates you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">New orders</p>
                  <p className="text-sm text-gray-400">Get notified for each sale</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Daily summary</p>
                  <p className="text-sm text-gray-400">Receive daily performance reports</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Product updates</p>
                  <p className="text-sm text-gray-400">New features and improvements</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
