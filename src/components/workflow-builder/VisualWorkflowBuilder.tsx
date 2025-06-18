import React, { useState, useCallback, useEffect } from 'react'
import { useNodesState, useEdgesState, addEdge, Connection, Edge, Node } from '@xyflow/react'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { TopBar } from './TopBar'
import { BuilderCanvas } from './BuilderCanvas'
import { NodePanel } from './NodePanel'
import { NodeEditor } from './NodeEditor'
import { ExecutionPanel } from './ExecutionPanel'
import { WorkflowNode, WorkflowData, WorkflowMeta, NodeTemplate, WorkflowExecution, WorkflowEdge } from '@/types/workflow'

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
  // Workflow state
  const [workflow, setWorkflow] = useState<WorkflowMeta>({
    name: initialWorkflow?.meta.name || 'Untitled Workflow',
    description: initialWorkflow?.meta.description || '',
    version: '1.0.0',
    tags: []
  })

  // React Flow state - use standard Node and Edge types
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    initialWorkflow?.nodes.map(n => ({ ...n, type: n.data.type })) || []
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    initialWorkflow?.edges.map(e => ({ 
      ...e, 
      type: e.type || 'smoothstep', 
      animated: e.animated !== false 
    })) || []
  )

  // UI state
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false)
  const [isExecutionPanelOpen, setIsExecutionPanelOpen] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Execution state
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null)

  // Undo/Redo state (simplified implementation)
  const [history, setHistory] = useState<{ nodes: Node[], edges: Edge[] }[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Track changes for unsaved indicator
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [nodes, edges, workflow])

  // Save current state to history for undo/redo
  const saveToHistory = useCallback(() => {
    const newState = { nodes: [...nodes], edges: [...edges] }
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newState)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [nodes, edges, history, historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1]
      setNodes(previousState.nodes)
      setEdges(previousState.edges)
      setHistoryIndex(historyIndex - 1)
    }
  }, [historyIndex, history, setNodes, setEdges])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setNodes(nextState.nodes)
      setEdges(nextState.edges)
      setHistoryIndex(historyIndex + 1)
    }
  }, [historyIndex, history, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: 'smoothstep',
        animated: true,
      }
      setEdges((eds) => addEdge(newEdge, eds))
      saveToHistory()
    },
    [setEdges, saveToHistory]
  )

  const handleNodeDrop = useCallback(
    (template: NodeTemplate, position: { x: number; y: number }) => {
      const newNode: Node = {
        id: `${template.type}-${Date.now()}`,
        type: template.type,
        position,
        data: {
          type: template.type,
          label: template.label,
          description: template.description,
          config: { ...template.defaultConfig },
          category: template.category,
        },
      }

      setNodes((nds) => nds.concat(newNode))
      saveToHistory()
      toast.success(`Added ${template.label} node`)
    },
    [setNodes, saveToHistory]
  )

  const handleNodeClick = useCallback((node: Node) => {
    setSelectedNode(node as WorkflowNode)
    setIsNodeEditorOpen(true)
  }, [])

  const handleNodeSave = useCallback(
    (updatedNode: WorkflowNode) => {
      setNodes((nds) =>
        nds.map((node) => (node.id === updatedNode.id ? updatedNode : node))
      )
      saveToHistory()
      setIsNodeEditorOpen(false)
      toast.success('Node updated successfully')
    },
    [setNodes, saveToHistory]
  )

  const handleNodeDelete = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId))
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
      saveToHistory()
      toast.success('Node deleted')
    },
    [setNodes, setEdges, saveToHistory]
  )

  const handleSaveWorkflow = useCallback(async () => {
    setIsSaving(true)
    try {
      const workflowData: WorkflowData = {
        meta: {
          ...workflow,
          updatedAt: new Date().toISOString(),
        },
        nodes: nodes as WorkflowNode[],
        edges: edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: e.type || 'smoothstep',
          animated: e.animated !== false,
          sourceHandle: e.sourceHandle || null,
          targetHandle: e.targetHandle || null,
          style: e.style
        })) as WorkflowEdge[],
      }

      if (onSave) {
        await onSave(workflowData)
      }

      setHasUnsavedChanges(false)
      toast.success('Workflow saved successfully')
    } catch (error) {
      toast.error('Failed to save workflow')
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }, [workflow, nodes, edges, onSave])

  const handleRunWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      toast.error('Add some nodes before running the workflow')
      return
    }

    setIsRunning(true)
    setIsExecutionPanelOpen(true)

    // Create execution record
    const executionId = `exec-${Date.now()}`
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId: workflow.name,
      status: 'running',
      startTime: new Date().toISOString(),
      results: [],
    }

    setCurrentExecution(execution)
    setExecutions(prev => [execution, ...prev.slice(0, 4)]) // Keep last 5

    try {
      const workflowData: WorkflowData = {
        meta: workflow,
        nodes: nodes as WorkflowNode[],
        edges: edges.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: e.type || 'smoothstep',
          animated: e.animated !== false,
          sourceHandle: e.sourceHandle || null,
          targetHandle: e.targetHandle || null,
          style: e.style
        })) as WorkflowEdge[],
      }

      if (onExecute) {
        await onExecute(workflowData)
      }

      // Simulate execution results
      const results = nodes.map((node, index) => ({
        nodeId: node.id,
        success: Math.random() > 0.2, // 80% success rate for demo
        output: `Output from ${node.data.label}`,
        duration: Math.floor(Math.random() * 1000) + 100,
        timestamp: new Date().toISOString(),
      }))

      const finalExecution: WorkflowExecution = {
        ...execution,
        status: results.every(r => r.success) ? 'success' : 'error',
        endTime: new Date().toISOString(),
        results,
        totalDuration: results.reduce((sum, r) => sum + (r.duration || 0), 0),
      }

      setCurrentExecution(finalExecution)
      setExecutions(prev => [finalExecution, ...prev.slice(1)])

      toast.success('Workflow executed successfully')
    } catch (error) {
      const errorExecution: WorkflowExecution = {
        ...execution,
        status: 'error',
        endTime: new Date().toISOString(),
        results: [
          {
            nodeId: 'error',
            success: false,
            error: 'Workflow execution failed',
            timestamp: new Date().toISOString(),
          }
        ],
      }

      setCurrentExecution(errorExecution)
      setExecutions(prev => [errorExecution, ...prev.slice(1)])

      toast.error('Workflow execution failed')
      console.error('Execution error:', error)
    } finally {
      setIsRunning(false)
    }
  }, [workflow, nodes, edges, onExecute])

  const handleExportWorkflow = useCallback(() => {
    const workflowData: WorkflowData = {
      meta: workflow,
      nodes: nodes as WorkflowNode[],
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type || 'smoothstep',
        animated: e.animated !== false,
        sourceHandle: e.sourceHandle || null,
        targetHandle: e.targetHandle || null,
        style: e.style
      })) as WorkflowEdge[],
    }

    const blob = new Blob([JSON.stringify(workflowData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflow.name.replace(/\s+/g, '-').toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Workflow exported')
  }, [workflow, nodes, edges])

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <TopBar
        workflow={workflow}
        hasUnsavedChanges={hasUnsavedChanges}
        isRunning={isRunning}
        isSaving={isSaving}
        onWorkflowNameChange={(name) => setWorkflow(prev => ({ ...prev, name }))}
        onSave={handleSaveWorkflow}
        onRun={handleRunWorkflow}
        onExport={handleExportWorkflow}
        onOpenSettings={() => toast('Settings panel coming soon')}
        onOpenLogs={() => setIsExecutionPanelOpen(true)}
        onUndo={undo}
        onRedo={redo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        nodeCount={nodes.length}
        edgeCount={edges.length}
      />

      <div className="flex flex-1 overflow-hidden">
        <NodePanel onAddNode={handleNodeDrop} />

        <div className="flex-1 relative">
          <BuilderCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onDrop={handleNodeDrop}
            onCanvasClick={() => setIsNodeEditorOpen(false)}
          />
        </div>
      </div>

      <NodeEditor
        node={selectedNode}
        isOpen={isNodeEditorOpen}
        onClose={() => setIsNodeEditorOpen(false)}
        onSave={handleNodeSave}
        onDelete={handleNodeDelete}
      />

      <ExecutionPanel
        isOpen={isExecutionPanelOpen}
        onClose={() => setIsExecutionPanelOpen(false)}
        executions={executions}
        currentExecution={currentExecution}
      />

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  )
}
