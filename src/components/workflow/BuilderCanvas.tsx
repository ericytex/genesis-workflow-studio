
import React, { useCallback, useRef } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  Node,
  Edge,
} from '@xyflow/react'
import WorkflowNode from './WorkflowNode'
import { NodeTemplate } from '@/types/workflow'

const nodeTypes = {
  workflow: WorkflowNode,
}

interface BuilderCanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  onNodeClick?: (node: Node) => void
  onDrop?: (template: NodeTemplate, position: { x: number; y: number }) => void
}

export function BuilderCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onDrop,
}: BuilderCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDropHandler = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const templateData = event.dataTransfer.getData('application/reactflow')
      if (!templateData) return

      const template: NodeTemplate = JSON.parse(templateData)
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()

      if (!reactFlowBounds) return

      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      }

      if (onDrop) {
        onDrop(template, position)
      }
    },
    [onDrop]
  )

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node)
      }
    },
    [onNodeClick]
  )

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onDrop={onDropHandler}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { strokeWidth: 2 },
        }}
      >
        <Controls />
        <MiniMap />
        <Background />
      </ReactFlow>
    </div>
  )
}
