
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  CreditCard, 
  Bell, 
  Shield, 
  Key, 
  Trash2,
  Crown,
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    browser: false,
    executions: true,
    marketing: false,
  })

  const [apiKeys, setApiKeys] = useState([
    { id: '1', name: 'Production API', key: 'wf_*********************abc123', created: '2024-01-15' },
    { id: '2', name: 'Development API', key: 'wf_*********************def456', created: '2024-01-10' },
  ])

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
    toast.success('Notification settings updated')
  }

  const generateApiKey = () => {
    const newKey = {
      id: Date.now().toString(),
      name: 'New API Key',
      key: `wf_*********************${Math.random().toString(36).substr(2, 6)}`,
      created: new Date().toISOString().split('T')[0],
    }
    setApiKeys(prev => [...prev, newKey])
    toast.success('API key generated successfully')
  }

  const deleteApiKey = (id: string) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      setApiKeys(prev => prev.filter(key => key.id !== id))
      toast.success('API key deleted')
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and configurations</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your account profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="Tell us about yourself" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <div className="space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Current Plan
                </CardTitle>
                <CardDescription>
                  Manage your subscription and billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Free Plan</h3>
                    <p className="text-gray-600">5 workflows, 100 executions/month</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Workflows used:</span>
                    <span>2 / 5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Executions this month:</span>
                    <span>45 / 100</span>
                  </div>
                  <Separator />
                  <Button>
                    <Zap className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">156</div>
                    <div className="text-sm text-gray-600">Total Executions</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">2,340</div>
                    <div className="text-sm text-gray-600">AI Tokens Used</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Browser Notifications</h4>
                  <p className="text-sm text-gray-600">Receive push notifications in your browser</p>
                </div>
                <Switch
                  checked={notifications.browser}
                  onCheckedChange={(checked) => handleNotificationChange('browser', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Workflow Executions</h4>
                  <p className="text-sm text-gray-600">Get notified when workflows complete</p>
                </div>
                <Switch
                  checked={notifications.executions}
                  onCheckedChange={(checked) => handleNotificationChange('executions', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Marketing Updates</h4>
                  <p className="text-sm text-gray-600">Receive product updates and tips</p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage your API keys for external integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Your API Keys</h4>
                <Button onClick={generateApiKey} size="sm">
                  Generate New Key
                </Button>
              </div>
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h5 className="font-medium">{key.name}</h5>
                      <p className="text-sm text-gray-600 font-mono">{key.key}</p>
                      <p className="text-xs text-gray-500">Created: {key.created}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteApiKey(key.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-600 mb-2">Delete Account</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
