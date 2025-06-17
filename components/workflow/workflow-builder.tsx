
'use client'

import { useState, useCallback, useRef } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MiniMap,
} from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Save, 
  Play, 
  Download, 
  Upload,
  Zap,
  Plus,
  Trash2
} from 'lucide-react'
import { CustomNode } from './custom-node'
import { NodePalette } from './node-palette'
import { AIGenerationPanel } from './ai-generation-panel'
import { WorkflowData } from '@/lib/workflow'
import toast from 'react-hot-toast'
import { useUser } from '@clerk/nextjs'

const nodeTypes = {
  custom: CustomNode,
}

const initialNodes: Node[] = [
  {
    id: 'start',
    type: 'custom',
    position: { x: 100, y: 100 },
    data: {
      type: 'trigger',
      category: 'webhook',
      name: 'Webhook Trigger',
      description: 'Receives HTTP requests',
      config: { url: '', method: 'POST' },
    },
  },
]

interface WorkflowBuilderProps {
  initialWorkflow?: any
}

export function WorkflowBuilder({ initialWorkflow }: WorkflowBuilderProps) {
  const { user } = useUser()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialWorkflow?.data?.nodes || initialNodes
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialWorkflow?.data?.edges || []
  )
  const [workflowName, setWorkflowName] = useState(initialWorkflow?.name || 'Untitled Workflow')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [savedWorkflowId, setSavedWorkflowId] = useState(initialWorkflow?.id)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')
      if (typeof type === 'undefined' || !type) {
        return
      }

      const position = {
        x: event.clientX - 200,
        y: event.clientY - 100,
      }

      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: 'custom',
        position,
        data: JSON.parse(type),
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [setNodes]
  )

  const handleSaveWorkflow = async () => {
    if (!user) {
      toast.error('Please sign in to save workflows')
      return
    }

    setIsSaving(true)
    try {
      const workflowData = {
        name: workflowName,
        description: `Workflow with ${nodes.length} nodes`,
        data: { nodes, edges },
      }

      const url = savedWorkflowId ? `/api/workflows/${savedWorkflowId}` : '/api/workflows'
      const method = savedWorkflowId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflowData),
      })

      const result = await response.json()
      if (result.success) {
        setSavedWorkflowId(result.workflow.id)
        toast.success('Workflow saved successfully!')
      } else {
        toast.error(result.error || 'Failed to save workflow')
      }
    } catch (error) {
      toast.error('Failed to save workflow')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExecuteWorkflow = async () => {
    if (!savedWorkflowId) {
      toast.error('Please save the workflow first')
      return
    }

    setIsExecuting(true)
    try {
      const response = await fetch(`/api/workflows/${savedWorkflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerInput: {} }),
      })

      const result = await response.json()
      if (result.success) {
        toast.success(`Workflow executed successfully in ${result.duration}ms`)
      } else {
        toast.error(result.error || 'Workflow execution failed')
      }
    } catch (error) {
      toast.error('Failed to execute workflow')
    } finally {
      setIsExecuting(false)
    }
  }

  const handleGenerateWorkflow = async (prompt: string) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const result = await response.json()
      if (result.success) {
        setWorkflowName(result.workflow.name)
        setNodes(result.workflow.nodes.map((node: any) => ({
          ...node,
          type: 'custom',
        })))
        setEdges(result.workflow.edges)
        toast.success('Workflow generated successfully!')
        setShowAIPanel(false)
      } else {
        toast.error(result.error || 'Failed to generate workflow')
      }
    } catch (error) {
      toast.error('Failed to generate workflow')
    } finally {
      setIsGenerating(false)
    }
  }

  const clearWorkflow = () => {
    setNodes([])
    setEdges([])
    setWorkflowName('Untitled Workflow')
    setSavedWorkflowId(undefined)
    toast.success('Workflow cleared')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Node Palette */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <div className="mb-4">
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-lg font-semibold"
              placeholder="Workflow name"
            />
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <Button 
              onClick={() => setShowAIPanel(true)}
              className="w-full"
              disabled={isGenerating}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Button>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSaveWorkflow}
                disabled={isSaving}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              
              <Button 
                onClick={handleExecuteWorkflow}
                disabled={isExecuting || !savedWorkflowId}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                {isExecuting ? 'Running...' : 'Execute'}
              </Button>
            </div>

            <Button 
              onClick={clearWorkflow}
              variant="outline"
              size="sm"
              className="w-full text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          <NodePalette />
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Badge variant="outline" className="bg-white">
            {nodes.length} nodes
          </Badge>
          <Badge variant="outline" className="bg-white">
            {edges.length} connections
          </Badge>
        </div>

        <div ref={reactFlowWrapper} className="w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Controls />
            <MiniMap />
            <Background />
          </ReactFlow>
        </div>
      </div>

      {/* AI Generation Panel */}
      {showAIPanel && (
        <AIGenerationPanel
          onGenerate={handleGenerateWorkflow}
          onClose={() => setShowAIPanel(false)}
          isGenerating={isGenerating}
        />
      )}
    </div>
  )
}
