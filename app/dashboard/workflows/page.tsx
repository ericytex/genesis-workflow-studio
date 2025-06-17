
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Copy,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface Workflow {
  id: string
  name: string
  description: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  executionLogs: Array<{
    id: string
    status: string
    createdAt: string
    duration?: number
  }>
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows')
      if (response.ok) {
        const data = await response.json()
        setWorkflows(data.workflows || [])
      }
    } catch (error) {
      console.error('Error fetching workflows:', error)
      toast.error('Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }

  const executeWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST',
      })
      
      if (response.ok) {
        toast.success('Workflow executed successfully')
        fetchWorkflows() // Refresh to show new execution
      } else {
        toast.error('Failed to execute workflow')
      }
    } catch (error) {
      console.error('Error executing workflow:', error)
      toast.error('Failed to execute workflow')
    }
  }

  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        toast.success('Workflow deleted successfully')
        fetchWorkflows()
      } else {
        toast.error('Failed to delete workflow')
      }
    } catch (error) {
      console.error('Error deleting workflow:', error)
      toast.error('Failed to delete workflow')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variant = status === 'success' ? 'default' : 
                   status === 'error' ? 'destructive' : 'secondary'
    return <Badge variant={variant}>{status}</Badge>
  }

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filterStatus === 'all') return matchesSearch
    
    const lastExecution = workflow.executionLogs[0]
    const matchesStatus = lastExecution?.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
            <p className="text-gray-600">Manage and monitor your automation workflows</p>
          </div>
          <Button asChild>
            <Link href="/builder">
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
              size="sm"
            >
              All
            </Button>
            <Button 
              variant={filterStatus === 'success' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('success')}
              size="sm"
            >
              Success
            </Button>
            <Button 
              variant={filterStatus === 'error' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('error')}
              size="sm"
            >
              Error
            </Button>
          </div>
        </div>
      </div>

      {/* Workflows Grid */}
      {filteredWorkflows.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first workflow'}
            </p>
            <Button asChild>
              <Link href="/builder">
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredWorkflows.map((workflow) => {
            const lastExecution = workflow.executionLogs[0]
            const totalExecutions = workflow.executionLogs.length
            
            return (
              <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                        {workflow.isPublic && (
                          <Badge variant="secondary">Public</Badge>
                        )}
                        {lastExecution && getStatusBadge(lastExecution.status)}
                      </div>
                      
                      <p className="text-gray-600 mb-4">{workflow.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Created {new Date(workflow.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Updated {new Date(workflow.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Play className="h-4 w-4" />
                          {totalExecutions} runs
                        </div>
                        {lastExecution && (
                          <div className="flex items-center gap-1">
                            {getStatusIcon(lastExecution.status)}
                            Last run: {lastExecution.status}
                            {lastExecution.duration && ` (${lastExecution.duration}ms)`}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => executeWorkflow(workflow.id)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/builder?workflow=${workflow.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteWorkflow(workflow.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
