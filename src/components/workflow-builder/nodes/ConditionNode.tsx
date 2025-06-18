
import React, { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  GitBranch, 
  Copy, 
  Trash2,
  MoreHorizontal 
} from 'lucide-react'

export const ConditionNode = memo(({ data, selected, id }: NodeProps) => {
  const nodeLabel = String(data.label || 'Condition')
  const nodeDescription = String(data.description || '')

  return (
    <Card className={`min-w-[220px] transition-all duration-200 ${
      selected ? 'ring-2 ring-orange-500 shadow-lg' : 'shadow-sm hover:shadow-md'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded bg-orange-100 text-orange-800">
              <GitBranch className="h-4 w-4" />
            </div>
            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
              Condition
            </Badge>
          </div>
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Copy className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <CardTitle className="text-sm font-medium leading-tight">
          {nodeLabel}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-xs text-gray-600 mb-2">{nodeDescription}</p>
        
        {data.config && Object.keys(data.config).length > 0 && (
          <div className="text-xs text-gray-500 space-y-1">
            {Object.entries(data.config).slice(0, 2).map(([key, value]) => (
              <div key={key} className="truncate">
                <span className="font-medium">{key}:</span> {String(value)}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />
      
      {/* Multiple source handles for true/false branches */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{ left: '30%' }}
      />
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="w-3 h-3 bg-red-500 border-2 border-white"
        style={{ left: '70%' }}
      />
    </Card>
  )
})

ConditionNode.displayName = 'ConditionNode'
