
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Webhook, 
  Clock, 
  Mail, 
  FileText,
  Send,
  Globe,
  Database,
  MessageSquare,
  Filter,
  Settings,
  GitBranch,
  Zap
} from 'lucide-react'

const nodeTemplates = [
  // Triggers
  {
    type: 'trigger',
    category: 'webhook',
    name: 'Webhook',
    description: 'Triggered by HTTP requests',
    icon: Webhook,
    config: { url: '', method: 'POST' },
  },
  {
    type: 'trigger',
    category: 'schedule',
    name: 'Schedule',
    description: 'Time-based trigger',
    icon: Clock,
    config: { cron: '0 9 * * *', timezone: 'UTC' },
  },
  {
    type: 'trigger',
    category: 'email_received',
    name: 'Email Received',
    description: 'Triggered when email arrives',
    icon: Mail,
    config: { email: '', folder: 'inbox' },
  },

  // Actions
  {
    type: 'action',
    category: 'send_email',
    name: 'Send Email',
    description: 'Send an email message',
    icon: Send,
    config: { to: '', subject: '', body: '' },
  },
  {
    type: 'action',
    category: 'http_request',
    name: 'HTTP Request',
    description: 'Make API calls',
    icon: Globe,
    config: { url: '', method: 'GET', headers: {} },
  },
  {
    type: 'action',
    category: 'database_insert',
    name: 'Database Insert',
    description: 'Insert data into database',
    icon: Database,
    config: { table: '', data: {} },
  },
  {
    type: 'action',
    category: 'slack_message',
    name: 'Slack Message',
    description: 'Post to Slack channel',
    icon: MessageSquare,
    config: { channel: '', message: '' },
  },

  // Transforms
  {
    type: 'transform',
    category: 'data_mapper',
    name: 'Data Mapper',
    description: 'Transform data structure',
    icon: Settings,
    config: { mappings: {} },
  },
  {
    type: 'transform',
    category: 'filter',
    name: 'Filter',
    description: 'Filter data based on conditions',
    icon: Filter,
    config: { field: '', operator: 'equals', value: '' },
  },

  // Conditions
  {
    type: 'condition',
    category: 'if_else',
    name: 'If/Else',
    description: 'Conditional branching',
    icon: GitBranch,
    config: { condition: '', trueBranch: '', falseBranch: '' },
  },
]

const typeColors = {
  trigger: 'bg-green-100 text-green-800',
  action: 'bg-blue-100 text-blue-800',
  transform: 'bg-purple-100 text-purple-800',
  condition: 'bg-orange-100 text-orange-800',
}

export function NodePalette() {
  const onDragStart = (event: React.DragEvent, nodeType: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType))
    event.dataTransfer.effectAllowed = 'move'
  }

  const groupedNodes = nodeTemplates.reduce((acc, node) => {
    if (!acc[node.type]) acc[node.type] = []
    acc[node.type].push(node)
    return acc
  }, {} as Record<string, typeof nodeTemplates>)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold">Node Palette</h3>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Drag and drop nodes onto the canvas to build your workflow.
      </p>

      {Object.entries(groupedNodes).map(([type, nodes]) => (
        <Card key={type} className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm capitalize flex items-center gap-2">
              <Badge className={typeColors[type as keyof typeof typeColors]}>
                {type}
              </Badge>
              <span>{type}s</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {nodes.map((node) => {
              const Icon = node.icon
              return (
                <div
                  key={`${node.type}-${node.category}`}
                  className="flex items-center gap-3 p-2 rounded-md border border-gray-200 cursor-move hover:bg-gray-50 transition-colors"
                  draggable
                  onDragStart={(event) => onDragStart(event, node)}
                >
                  <div className={`p-1.5 rounded ${typeColors[node.type as keyof typeof typeColors]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{node.name}</p>
                    <p className="text-xs text-gray-500 truncate">{node.description}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
