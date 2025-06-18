
import React from 'react'
import { Button } from '@/components/ui/button'
import { Workflow, Plus } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <Workflow className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      <Button onClick={onAction} className="gap-2">
        <Plus className="h-4 w-4" />
        {actionLabel}
      </Button>
    </div>
  )
}
