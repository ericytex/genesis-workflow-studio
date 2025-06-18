
import React from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WorkflowCard } from '@/components/workflow/WorkflowCard'
import { EmptyState } from '@/components/ui/empty-state'
import { 
  Workflow, 
  Zap, 
  BarChart3, 
  Activity,
  Plus,
  Sparkles,
  Clock
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  const workflows = [
    {
      id: '1',
      name: 'Email Newsletter Automation',
      description: 'Automatically send newsletters when new blog posts are published',
      status: 'active' as const,
      lastRun: '2 hours ago',
      executions: 142
    },
    {
      id: '2',
      name: 'Lead Qualification Process',
      description: 'Score and route leads based on form submissions',
      status: 'draft' as const,
      lastRun: 'Never',
      executions: 0
    },
    {
      id: '3',
      name: 'Customer Onboarding Sequence',
      description: 'Multi-step onboarding flow for new customers',
      status: 'active' as const,
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-muted-foreground">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Recent Workflows */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Recent Workflows</h2>
              <p className="text-muted-foreground">
                Your latest automation workflows
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Clock className="h-4 w-4" />
              View All
            </Button>
          </div>

          {workflows.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {workflows.map((workflow) => (
                <WorkflowCard key={workflow.id} workflow={workflow} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No workflows yet"
              description="Create your first automation workflow to get started with AI-powered automations."
              actionLabel="Create Workflow"
              onAction={() => console.log('Create workflow')}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
