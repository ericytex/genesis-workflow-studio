
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Workflow, 
  Zap, 
  BarChart3, 
  Clock, 
  ArrowRight,
  Sparkles,
  Activity,
  Settings,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()

  const workflows = [
    {
      id: '1',
      name: 'Email Newsletter Automation',
      description: 'Automatically send newsletters when new blog posts are published',
      status: 'active',
      lastRun: '2 hours ago',
      executions: 142
    },
    {
      id: '2',
      name: 'Lead Qualification Process',
      description: 'Score and route leads based on form submissions',
      status: 'draft',
      lastRun: 'Never',
      executions: 0
    },
    {
      id: '3',
      name: 'Customer Onboarding Sequence',
      description: 'Multi-step onboarding flow for new customers',
      status: 'active',
      lastRun: '1 day ago',
      executions: 28
    }
  ]

  const stats = {
    totalWorkflows: 12,
    totalExecutions: 1547,
    successRate: 98.2,
    tokensUsed: 45230
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Workflow className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Workflow AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user?.firstName}!</span>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your automation workflows.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Workflow
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkflows}</div>
              <p className="text-xs text-muted-foreground">
                Active automation workflows
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Executions</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExecutions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Workflow runs this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                Successful executions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Tokens</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tokensUsed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                OpenAI tokens used
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Workflows Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Workflows
              </CardTitle>
              <CardDescription>
                Your latest automation workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{workflow.name}</h4>
                        <Badge className={statusColors[workflow.status as keyof typeof statusColors]}>
                          {workflow.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{workflow.description}</p>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>Last run: {workflow.lastRun}</span>
                        <span>{workflow.executions} executions</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to help you get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Create New Workflow</h4>
                  <p className="text-sm text-gray-500">Build a custom automation from scratch</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Generate with AI</h4>
                  <p className="text-sm text-gray-500">Describe your workflow in plain English</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Workflow className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Browse Templates</h4>
                  <p className="text-sm text-gray-500">Start with pre-built workflow templates</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium">View Analytics</h4>
                  <p className="text-sm text-gray-500">Track performance and usage metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
