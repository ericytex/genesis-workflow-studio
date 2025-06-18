
import React from 'react'
import { VisualWorkflowBuilder } from '@/components/workflow/VisualWorkflowBuilder'
import { WorkflowData } from '@/types/workflow'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import '@xyflow/react/dist/style.css'

export default function WorkflowBuilder() {
  const handleSaveWorkflow = (workflow: WorkflowData) => {
    // In a real app, this would save to a backend
    console.log('Saving workflow:', workflow)
    localStorage.setItem('current-workflow', JSON.stringify(workflow))
  }

  const handleExecuteWorkflow = (workflow: WorkflowData) => {
    // In a real app, this would execute the workflow
    console.log('Executing workflow:', workflow)
  }

  return (
    <div className="h-screen">
      <VisualWorkflowBuilder
        onSave={handleSaveWorkflow}
        onExecute={handleExecuteWorkflow}
      />
    </div>
  )
}
