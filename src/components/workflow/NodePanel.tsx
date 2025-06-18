
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Play, 
  Brain, 
  GitBranch,
  Palette
} from 'lucide-react'
import { NodeTemplate } from '@/types/workflow'

const nodeTemplates: NodeTemplate[] = [
  {
    type: 'trigger',
    label: 'Webhook',
    description: 'Starts workflow on HTTP request',
    icon: 'webhook',
    defaultConfig: { url: '', method: 'POST' },
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    type: 'trigger',
    label: 'Schedule',
    description: 'Time-based trigger',
    icon: 'clock',
    defaultConfig: { cron: '0 9 * * *', timezone: 'UTC' },
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    type: 'action',
    label: 'Send Email',
    description: 'Send email notification',
    icon: 'mail',
    defaultConfig: { to: '', subject: '', body: '' },
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    type: 'action',
    label: 'HTTP Request',
    description: 'Make API call',
    icon: 'globe',
    defaultConfig: { url: '', method: 'GET', headers: {} },
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    type: 'ai',
    label: 'Text Generation',
    description: 'Generate text with AI',
    icon: 'brain',
    defaultConfig: { prompt: '', model: 'gpt-4' },
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    type: 'ai',
    label: 'Data Analysis',
    description: 'Analyze data with AI',
    icon: 'chart',
    defaultConfig: { data: '', analysis_type: 'summary' },
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    type: 'condition',
    label: 'If/Else',
    description: 'Conditional branching',
    icon: 'branch',
    defaultConfig: { condition: '', operator: 'equals', value: '' },
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
]

const typeIcons = {
  trigger: Zap,
  action: Play,
  ai: Brain,
  condition: GitBranch,
}

const typeColors = {
  trigger: 'bg-green-100 text-green-800',
  action: 'bg-blue-100 text-blue-800',
  ai: 'bg-purple-100 text-purple-800',
  condition: 'bg-orange-100 text-orange-800',
}

export function NodePanel() {
  const onDragStart = (event: React.DragEvent, template: NodeTemplate) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(template))
    event.dataTransfer.effectAllowed = 'move'
  }

  const groupedTemplates = nodeTemplates.reduce((acc, template) => {
    if (!acc[template.type]) acc[template.type] = []
    acc[template.type].push(template)
    return acc
  }, {} as Record<string, NodeTemplate[]>)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold">Node Types</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Drag and drop nodes onto the canvas to build your workflow.
      </p>

      {Object.entries(groupedTemplates).map(([type, templates]) => {
        const Icon = typeIcons[type as keyof typeof typeIcons]
        return (
          <Card key={type} className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm capitalize flex items-center gap-2">
                <Badge className={typeColors[type as keyof typeof typeColors]}>
                  <Icon className="h-3 w-3 mr-1" />
                  {type}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {templates.map((template, index) => {
                const TypeIcon = typeIcons[template.type]
                return (
                  <div
                    key={`${template.type}-${index}`}
                    className="flex items-center gap-3 p-2 rounded-md border border-gray-200 cursor-move hover:bg-gray-50 transition-colors"
                    draggable
                    onDragStart={(event) => onDragStart(event, template)}
                  >
                    <div className={`p-1.5 rounded ${template.color}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{template.label}</p>
                      <p className="text-xs text-gray-500 truncate">{template.description}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
