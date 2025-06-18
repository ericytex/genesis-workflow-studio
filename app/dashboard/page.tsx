
'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
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
  Activity
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalWorkflows: number
  totalExecutions: number
  tokensUsed: number
  successRate: number
}

interface RecentWorkflow {
  id: string
  name: string
  description: string
  updatedAt: string
  status: 'active' | 'draft' | 'error'
}

export default function DashboardPage() {
  const { user } = useUser()
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkflows: 0,
    totalExecutions: 0,
    tokensUsed: 0,
    successRate: 0,
  })
  const [recentWorkflows, setRecentWorkflows] = useState<RecentWorkflow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [workflowsRes] = await Promise.all([
        fetch('/api/workflows'),
      ])

      if (workflowsRes.ok) {
        const workflowsData = await workflowsRes.json()
        const workflows = workflowsData.workflows || []
        
        // Calculate stats from workflows
        const totalExecutions = workflows.reduce((sum: number, w: any) => 
          sum + (w.executionLogs?.length || 0), 0
        )
        
        const successfulExecutions = workflows.reduce((sum: number, w: any) => {
          const logs = w.executionLogs || []
          return sum + logs.filter((log: any) => log.status === 'success').length
        }, 0)

        setStats({
          totalWorkflows: workflows.length,
          totalExecutions,
          tokensUsed: Math.floor(Math.random() * 5000), // Mock data
          successRate: totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 100,
        })

        // Set recent workflows
        setRecentWorkflows(workflows.slice(0, 5).map((w: any) => ({
          id: w.id,
          name: w.name,
          description: w.description || 'No description',
          updatedAt: w.updatedAt,
          status: w.executionLogs?.some((log: any) => log.status === 'error') ? 'error' : 
                  w.executionLogs?.length > 0 ? 'active' : 'draft'
        })))
      }
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800',
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'there'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your automation workflows.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/builder?ai=true">
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </Button>
          </Link>
          <Link href="/builder">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Workflow
            </Button>
          </Link>
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
            <div className="text-2xl font-bold">{stats.totalExecutions}</div>
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
            {recentWorkflows.length === 0 ? (
              <div className="text-center py-8">
                <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first automation workflow to get started.
                </p>
                <Link href="/builder">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Workflow
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentWorkflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{workflow.name}</h4>
                        <Badge className={statusColors[workflow.status]}>
                          {workflow.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{workflow.description}</p>
                      <p className="text-xs text-gray-400">
                        Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href={`/builder?workflow=${workflow.id}`}>
                      <Button variant="ghost" size="sm">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
                
                <Link href="/dashboard/workflows">
                  <Button variant="outline" className="w-full">
                    View All Workflows
                  </Button>
                </Link>
              </div>
            )}
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
            <Link href="/builder" className="block">
              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Create New Workflow</h4>
                  <p className="text-sm text-gray-500">Build a custom automation from scratch</p>
                </div>
              </div>
            </Link>

            <Link href="/builder?ai=true" className="block">
              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">Generate with AI</h4>
                  <p className="text-sm text-gray-500">Describe your workflow in plain English</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/workflows" className="block">
              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Workflow className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Browse Templates</h4>
                  <p className="text-sm text-gray-500">Start with pre-built workflow templates</p>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/settings" className="block">
              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-medium">View Analytics</h4>
                  <p className="text-sm text-gray-500">Track performance and usage metrics</p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
