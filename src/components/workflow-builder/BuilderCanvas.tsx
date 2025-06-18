
import React, { useCallback, useRef, useState } from 'react'
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
  BackgroundVariant,
  Panel,
} from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Map, Grid3X3 } from 'lucide-react'
import { TriggerNode } from './nodes/TriggerNode'
import { ActionNode } from './nodes/ActionNode'
import { AiNode } from './nodes/AiNode'
import { ConditionNode } from './nodes/ConditionNode'
import { NodeTemplate } from '@/types/workflow'

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  ai: AiNode,
  condition: ConditionNode,
}

interface BuilderCanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  onNodeClick?: (node: Node) => void
  onDrop?: (template: NodeTemplate, position: { x: number; y: number }) => void
  onCanvasClick?: () => void
}

export function BuilderCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onDrop,
  onCanvasClick,
}: BuilderCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [showMiniMap, setShowMiniMap] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(false)

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDropHandler = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const templateData = event.dataTransfer.getData('application/reactflow')
      if (!templateData) return

      try {
        const template: NodeTemplate = JSON.parse(templateData)
        const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()

        if (!reactFlowBounds) return

        const position = {
          x: event.clientX - reactFlowBounds.left - 110,
          y: event.clientY - reactFlowBounds.top - 50,
        }

        if (onDrop) {
          onDrop(template, position)
        }
      } catch (error) {
        console.error('Failed to parse drop data:', error)
      }
    },
    [onDrop]
  )

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.stopPropagation()
      if (onNodeClick) {
        onNodeClick(node)
      }
    },
    [onNodeClick]
  )

  const handlePaneClick = useCallback(() => {
    if (onCanvasClick) {
      onCanvasClick()
    }
  }, [onCanvasClick])

  const autoArrange = useCallback(() => {
    console.log('Auto-arrange feature - would implement dagre/elk layout here')
  }, [])

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onDrop={onDropHandler}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid={snapToGrid}
        snapGrid={[20, 20]}
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { 
            strokeWidth: 2,
            stroke: '#6366f1'
          },
        }}
        connectionLineStyle={{
          strokeWidth: 2,
          stroke: '#6366f1',
        }}
        proOptions={{
          hideAttribution: true
        }}
      >
        <Controls 
          position="bottom-right"
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            color: '#374151'
          }}
        />
        
        {showMiniMap && (
          <MiniMap 
            position="bottom-left"
            style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb'
            }}
            nodeStrokeWidth={3}
            nodeColor={(node) => {
              switch (node.type) {
                case 'trigger':
                  return '#10b981'
                case 'action':
                  return '#3b82f6'
                case 'ai':
                  return '#8b5cf6'
                case 'condition':
                  return '#f59e0b'
                default:
                  return '#6b7280'
              }
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        )}
        
        <Background 
          variant={showGrid ? BackgroundVariant.Dots : BackgroundVariant.Lines}
          gap={20}
          size={1}
          color="#e5e7eb"
        />

        <Panel position="top-right" className="bg-white border rounded-lg p-3 shadow-sm">
          <div className="space-y-3 min-w-[200px]">
            <div className="flex items-center justify-between">
              <Label htmlFor="minimap" className="text-sm font-medium">Mini Map</Label>
              <Switch
                id="minimap"
                checked={showMiniMap}
                onCheckedChange={setShowMiniMap}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="grid" className="text-sm font-medium">Show Grid</Label>
              <Switch
                id="grid"
                checked={showGrid}
                onCheckedChange={setShowGrid}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="snap" className="text-sm font-medium">Snap to Grid</Label>
              <Switch
                id="snap"
                checked={snapToGrid}
                onCheckedChange={setSnapToGrid}
              />
            </div>

            <div className="pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={autoArrange}
                className="w-full text-xs"
                disabled={nodes.length === 0}
              >
                <Grid3X3 className="h-3 w-3 mr-2" />
                Auto Arrange
              </Button>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Nodes: {nodes.length}</span>
                <span>Edges: {edges.length}</span>
              </div>
            </div>
          </div>
        </Panel>

        {nodes.length === 0 && (
          <Panel position="top-center" className="pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm border rounded-lg p-6 text-center shadow-sm">
              <div className="text-gray-500 mb-2">
                <Map className="h-12 w-12 mx-auto mb-3 opacity-50" />
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Start Building Your Workflow</h3>
              <p className="text-sm text-gray-600 mb-3">
                Drag nodes from the sidebar to create your automation
              </p>
              <Badge variant="outline" className="text-xs">
                Tip: Click nodes to configure them
              </Badge>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}
