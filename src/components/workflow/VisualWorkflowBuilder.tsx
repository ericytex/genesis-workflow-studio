
import React, { useState, useCallback } from 'react'
import { useNodesState, useEdgesState, addEdge, Connection, Edge, Node } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Save, Play, Download, Upload, Trash2, Circle } from 'lucide-react'
import { BuilderCanvas } from './BuilderCanvas'
import { NodePanel } from './NodePanel'
import { NodeEditor } from './NodeEditor'
import { WorkflowNode, WorkflowData, WorkflowEdge, NodeTemplate } from '@/types/workflow'
import toast from 'react-hot-toast'

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

interface VisualWorkflowBuilderProps {
  initialWorkflow?: WorkflowData
  onSave?: (workflow: WorkflowData) => void
  onExecute?: (workflow: WorkflowData) => void
}

export function VisualWorkflowBuilder({ 
  initialWorkflow, 
  onSave, 
  onExecute 
}: VisualWorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialWorkflow?.nodes.map(n => ({ ...n, type: 'workflow' })) || initialNodes
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialWorkflow?.edges || initialEdges
  )
  const [workflowName, setWorkflowName] = useState(initialWorkflow?.name || 'Untitled Workflow')
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds))
      setHasUnsavedChanges(true)
    },
    [setEdges]
  )

  const handleNodeDrop = useCallback(
    (template: NodeTemplate, position: { x: number; y: number }) => {
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: 'workflow',
        position,
        data: {
          type: template.type,
          label: template.label,
          description: template.description,
          config: template.defaultConfig,
        },
      }

      setNodes((nds) => nds.concat(newNode))
      setHasUnsavedChanges(true)
      toast.success(`Added ${template.label} node`)
    },
    [setNodes]
  )

  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNode(node as WorkflowNode)
    setIsEditorOpen(true)
  }, [])

  const handleNodeSave = useCallback(
    (updatedNode: WorkflowNode) => {
      setNodes((nds) =>
        nds.map((node) => (node.id === updatedNode.id ? updatedNode : node))
      )
      setHasUnsavedChanges(true)
      toast.success('Node updated successfully')
    },
    [setNodes]
  )

  const handleSaveWorkflow = useCallback(() => {
    const workflowData: WorkflowData = {
      name: workflowName,
      description: `Workflow with ${nodes.length} nodes`,
      nodes: nodes as WorkflowNode[],
      edges: edges as WorkflowEdge[],
    }

    if (onSave) {
      onSave(workflowData)
    }

    setHasUnsavedChanges(false)
    console.log('Saved workflow:', workflowData)
    toast.success('Workflow saved successfully')
  }, [workflowName, nodes, edges, onSave])

  const handleExecuteWorkflow = useCallback(() => {
    const workflowData: WorkflowData = {
      name: workflowName,
      description: `Workflow with ${nodes.length} nodes`,
      nodes: nodes as WorkflowNode[],
      edges: edges as WorkflowEdge[],
    }

    if (onExecute) {
      onExecute(workflowData)
    } else {
      console.log('Executing workflow:', workflowData)
      toast.success('Workflow execution started')
    }
  }, [workflowName, nodes, edges, onExecute])

  const handleClearWorkflow = useCallback(() => {
    setNodes([])
    setEdges([])
    setWorkflowName('Untitled Workflow')
    setHasUnsavedChanges(false)
    toast.success('Workflow cleared')
  }, [setNodes, setEdges])

  const handleExportWorkflow = useCallback(() => {
    const workflowData: WorkflowData = {
      name: workflowName,
      description: `Workflow with ${nodes.length} nodes`,
      nodes: nodes as WorkflowNode[],
      edges: edges as WorkflowEdge[],
    }

    const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflowName.replace(/\s+/g, '-').toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Workflow exported')
  }, [workflowName, nodes, edges])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Node Panel */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4">
          <NodePanel />
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - n8n style */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              value={workflowName}
              onChange={(e) => {
                setWorkflowName(e.target.value)
                setHasUnsavedChanges(true)
              }}
              className="text-lg font-semibold border-none bg-transparent px-0 focus-visible:ring-0"
              placeholder="Workflow name"
            />
            
            <div className="flex items-center gap-2">
              <Circle className={`h-2 w-2 fill-current ${hasUnsavedChanges ? 'text-orange-500' : 'text-green-500'}`} />
              <span className="text-sm text-gray-600">
                {hasUnsavedChanges ? 'Unsaved changes' : 'Saved'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-gray-50">
              {nodes.length} nodes
            </Badge>
            <Badge variant="outline" className="bg-gray-50">
              {edges.length} connections
            </Badge>
            
            <div className="flex gap-2 ml-4">
              <Button 
                onClick={handleSaveWorkflow}
                variant="outline"
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              
              <Button 
                onClick={handleExecuteWorkflow}
                size="sm"
                disabled={nodes.length === 0}
              >
                <Play className="h-4 w-4 mr-2" />
                Execute
              </Button>

              <Button 
                onClick={handleExportWorkflow}
                variant="outline"
                size="sm"
                disabled={nodes.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button 
                onClick={handleClearWorkflow}
                variant="outline"
                size="sm"
                disabled={nodes.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative">
          <BuilderCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onDrop={handleNodeDrop}
          />
        </div>
      </div>

      {/* Node Editor Modal */}
      <NodeEditor
        node={selectedNode}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleNodeSave}
      />
    </div>
  )
}
