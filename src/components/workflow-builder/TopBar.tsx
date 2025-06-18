
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Save, 
  Download, 
  Settings, 
  FileText, 
  Circle,
  User,
  HelpCircle,
  Undo,
  Redo
} from 'lucide-react'
import { WorkflowMeta } from '@/types/workflow'

interface TopBarProps {
  workflow: WorkflowMeta
  hasUnsavedChanges: boolean
  isRunning: boolean
  isSaving: boolean
  onWorkflowNameChange: (name: string) => void
  onSave: () => void
  onRun: () => void
  onExport: () => void
  onOpenSettings: () => void
  onOpenLogs: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  nodeCount: number
  edgeCount: number
}

export function TopBar({
  workflow,
  hasUnsavedChanges,
  isRunning,
  isSaving,
  onWorkflowNameChange,
  onSave,
  onRun,
  onExport,
  onOpenSettings,
  onOpenLogs,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  nodeCount,
  edgeCount
}: TopBarProps) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left section - Workflow info */}
        <div className="flex items-center gap-4">
          <Input
            value={workflow.name}
            onChange={(e) => onWorkflowNameChange(e.target.value)}
            className="text-lg font-semibold border-none bg-transparent px-0 focus-visible:ring-0 min-w-[200px]"
            placeholder="Untitled Workflow"
          />
          
          <div className="flex items-center gap-2">
            <Circle className={`h-2 w-2 fill-current ${
              hasUnsavedChanges ? 'text-orange-500' : 'text-green-500'
            }`} />
            <span className="text-sm text-gray-600">
              {hasUnsavedChanges ? 'Unsaved changes' : 'Saved'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-gray-50">
              {nodeCount} nodes
            </Badge>
            <Badge variant="outline" className="bg-gray-50">
              {edgeCount} connections
            </Badge>
          </div>
        </div>

        {/* Center section - Undo/Redo */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-8 w-8 p-0"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-8 w-8 p-0"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          <Button 
            onClick={onRun}
            size="sm"
            disabled={isRunning || nodeCount === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Running...' : 'Run'}
          </Button>
          
          <Button 
            onClick={onSave}
            variant="outline"
            size="sm"
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>

          <Button 
            onClick={onExport}
            variant="outline"
            size="sm"
            disabled={nodeCount === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenLogs}
            className="h-8 w-8 p-0"
          >
            <FileText className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
