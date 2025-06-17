
import { currentUser } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Workflow, Zap, BarChart3, Clock } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const user = await currentUser()
  
  if (!user) return null

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      workflows: {
        orderBy: { updatedAt: 'desc' },
        take: 5,
      },
      executionLogs: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  const stats = {
    totalWorkflows: dbUser?.workflows.length || 0,
    totalExecutions: dbUser?.executionLogs.length || 0,
    successfulExecutions: dbUser?.executionLogs.filter(log => log.status === 'success').length || 0,
    tokensUsed: dbUser?.tokensUsed || 0,
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.firstName}! Here's what's happening with your workflows.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkflows}</div>
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
              {stats.successfulExecutions} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalExecutions > 0 
                ? Math.round((stats.successfulExecutions / stats.totalExecutions) * 100)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Tokens Used</CardTitle>
            <div className="w-4 h-4 bg-purple-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tokensUsed.toLocaleString()}</div>
            <Badge variant={dbUser?.tier === 'pro' ? 'default' : 'secondary'} className="text-xs">
              {dbUser?.tier || 'free'} plan
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Workflows */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Workflows</CardTitle>
                <CardDescription>Your latest automation workflows</CardDescription>
              </div>
              <Button asChild>
                <Link href="/builder">
                  <Plus className="h-4 w-4 mr-2" />
                  New Workflow
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {dbUser?.workflows.length === 0 ? (
              <div className="text-center py-8">
                <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No workflows yet</p>
                <Button asChild variant="outline">
                  <Link href="/builder">Create your first workflow</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {dbUser?.workflows.map((workflow) => (
                  <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{workflow.name}</h4>
                      <p className="text-sm text-gray-500">{workflow.description}</p>
                      <p className="text-xs text-gray-400">
                        Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" asChild>
                      <Link href={`/builder?workflow=${workflow.id}`}>Edit</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Executions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Executions</CardTitle>
            <CardDescription>Latest workflow runs and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {dbUser?.executionLogs.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No executions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dbUser?.executionLogs.slice(0, 5).map((log) => {
                  const workflow = dbUser.workflows.find(w => w.id === log.workflowId)
                  return (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h5 className="text-sm font-medium">{workflow?.name || 'Unknown Workflow'}</h5>
                        <p className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={log.status === 'success' ? 'default' : log.status === 'error' ? 'destructive' : 'secondary'}
                        >
                          {log.status}
                        </Badge>
                        {log.duration && (
                          <span className="text-xs text-gray-500">{log.duration}ms</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
