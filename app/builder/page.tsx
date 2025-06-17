
'use client'

import { WorkflowBuilder } from '@/components/workflow/workflow-builder'
import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

export default function BuilderPage() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const workflowId = searchParams.get('workflow')
  const [workflow, setWorkflow] = useState(null)
  const [isLoading, setIsLoading] = useState(!!workflowId)

  useEffect(() => {
    if (workflowId) {
      // Load existing workflow
      fetch(`/api/workflows/${workflowId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setWorkflow(data.workflow)
          } else {
            toast.error('Failed to load workflow')
          }
        })
        .catch(() => toast.error('Failed to load workflow'))
        .finally(() => setIsLoading(false))
    }
  }, [workflowId])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access the workflow builder.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <WorkflowBuilder initialWorkflow={workflow} />
    </div>
  )
}
