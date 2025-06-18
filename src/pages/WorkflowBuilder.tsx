
import React from 'react'
import { VisualWorkflowBuilder } from '@/components/workflow-builder/VisualWorkflowBuilder'
import { WorkflowData } from '@/types/workflow'
import '@xyflow/react/dist/style.css'

export default function WorkflowBuilder() {
  const handleSaveWorkflow = async (workflow: WorkflowData) => {
    // In a real app, this would save to a backend
    console.log('Saving workflow:', workflow)
    localStorage.setItem('current-workflow', JSON.stringify(workflow))
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleExecuteWorkflow = async (workflow: WorkflowData) => {
    // In a real app, this would execute the workflow
    console.log('Executing workflow:', workflow)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // Load initial workflow from localStorage if available
  const loadInitialWorkflow = (): WorkflowData | undefined => {
    try {
      const stored = localStorage.getItem('current-workflow')
      return stored ? JSON.parse(stored) : undefined
    } catch {
      return undefined
    }
  }

  return (
    <div className="h-screen">
      <VisualWorkflowBuilder
        initialWorkflow={loadInitialWorkflow()}
        onSave={handleSaveWorkflow}
        onExecute={handleExecuteWorkflow}
      />
    </div>
  )
}
