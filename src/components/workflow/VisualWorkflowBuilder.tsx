
import React, { useState, useCallback } from 'react'
import { useNodesState, useEdgesState, addEdge, Connection, Edge, Node } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Save, Play, Download, Upload, Trash2 } from 'lucide-react'
import { BuilderCanvas } from './BuilderCanvas'
import { NodePanel } from './NodePanel'
import { NodeEditor } from './NodeEditor'
import { WorkflowNode, WorkflowData, NodeTemplate } from '@/types/workflow'
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

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
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

    // Also log to console for development
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
          <div className="mb-4">
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-lg font-semibold"
              placeholder="Workflow name"
            />
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <div className="flex gap-2">
              <Button 
                onClick={handleSaveWorkflow}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              
              <Button 
                onClick={handleExecuteWorkflow}
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={nodes.length === 0}
              >
                <Play className="h-4 w-4 mr-2" />
                Execute
              </Button>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleExportWorkflow}
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={nodes.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button 
                onClick={handleClearWorkflow}
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 hover:text-red-700"
                disabled={nodes.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>

          <NodePanel />
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
