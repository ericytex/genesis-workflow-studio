
import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Play, 
  Brain, 
  GitBranch,
  Settings
} from 'lucide-react'

const nodeIcons = {
  trigger: Zap,
  action: Play,
  ai: Brain,
  condition: GitBranch,
}

const nodeColors = {
  trigger: 'bg-green-100 text-green-800 border-green-200',
  action: 'bg-blue-100 text-blue-800 border-blue-200',
  ai: 'bg-purple-100 text-purple-800 border-purple-200',
  condition: 'bg-orange-100 text-orange-800 border-orange-200',
}

export default function WorkflowNode({ data, selected }: NodeProps) {
  const Icon = nodeIcons[data.type as keyof typeof nodeIcons] || Settings
  const colorClass = nodeColors[data.type as keyof typeof nodeColors] || nodeColors.action

  // Safely convert data properties to strings for rendering
  const nodeLabel = String(data.label || 'Untitled')
  const nodeDescription = String(data.description || '')

  return (
    <Card className={`min-w-[200px] transition-all duration-200 ${
      selected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-sm hover:shadow-md'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            <Badge variant="outline" className="text-xs">
              {String(data.type)}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-sm font-medium leading-tight">
          {nodeLabel}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-xs text-gray-600 mb-2">{nodeDescription}</p>
        
        {/* Configuration preview */}
        {data.config && Object.keys(data.config).length > 0 && (
          <div className="text-xs text-gray-500">
            {Object.entries(data.config).slice(0, 2).map(([key, value]) => (
              <div key={key} className="truncate">
                <span className="font-medium">{key}:</span> {String(value)}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Connection Handles */}
      {data.type !== 'trigger' && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-gray-400 border-2 border-white"
        />
      )}
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
    </Card>
  )
}
