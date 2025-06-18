
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Zap, 
  Play, 
  Brain, 
  GitBranch,
  Search,
  Webhook,
  Clock,
  Mail,
  Globe,
  Database,
  MessageSquare
} from 'lucide-react'
import { NodeTemplate } from '@/types/workflow'

const nodeTemplates: NodeTemplate[] = [
  // Triggers
  {
    type: 'trigger',
    category: 'webhook',
    label: 'Webhook',
    description: 'Starts workflow on HTTP request',
    icon: 'webhook',
    defaultConfig: { url: '', method: 'POST' },
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    type: 'trigger',
    category: 'schedule',
    label: 'Schedule',
    description: 'Time-based trigger',
    icon: 'clock',
    defaultConfig: { cron: '0 9 * * *', timezone: 'UTC' },
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  {
    type: 'trigger',
    category: 'email',
    label: 'Email Received',
    description: 'Trigger on email receipt',
    icon: 'mail',
    defaultConfig: { email: '', folder: 'inbox' },
    color: 'bg-green-100 text-green-800 border-green-200',
  },

  // Actions
  {
    type: 'action',
    category: 'email',
    label: 'Send Email',
    description: 'Send email notification',
    icon: 'mail',
    defaultConfig: { to: '', subject: '', body: '' },
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    type: 'action',
    category: 'http',
    label: 'HTTP Request',
    description: 'Make API call',
    icon: 'globe',
    defaultConfig: { url: '', method: 'GET', headers: {} },
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    type: 'action',
    category: 'database',
    label: 'Database Query',
    description: 'Execute database operation',
    icon: 'database',
    defaultConfig: { query: '', connection: '' },
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    type: 'action',
    category: 'slack',
    label: 'Slack Message',
    description: 'Post to Slack channel',
    icon: 'message',
    defaultConfig: { channel: '', message: '' },
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },

  // AI
  {
    type: 'ai',
    category: 'llm',
    label: 'Text Generation',
    description: 'Generate text with AI',
    icon: 'brain',
    defaultConfig: { prompt: '', model: 'gpt-4', maxTokens: 1000 },
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    type: 'ai',
    category: 'analysis',
    label: 'Data Analysis',
    description: 'Analyze data with AI',
    icon: 'brain',
    defaultConfig: { data: '', analysisType: 'summary' },
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },

  // Conditions
  {
    type: 'condition',
    category: 'logic',
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

const iconMap = {
  webhook: Webhook,
  clock: Clock,
  mail: Mail,
  globe: Globe,
  database: Database,
  message: MessageSquare,
  brain: Brain,
  branch: GitBranch,
}

const typeColors = {
  trigger: 'bg-green-100 text-green-800',
  action: 'bg-blue-100 text-blue-800',
  ai: 'bg-purple-100 text-purple-800',
  condition: 'bg-orange-100 text-orange-800',
}

interface NodePanelProps {
  onAddNode?: (template: NodeTemplate) => void
}

export function NodePanel({ onAddNode }: NodePanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const onDragStart = (event: React.DragEvent, template: NodeTemplate) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(template))
    event.dataTransfer.effectAllowed = 'move'
  }

  const filteredTemplates = nodeTemplates.filter(template => {
    const matchesSearch = template.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || template.type === selectedCategory
    return matchesSearch && matchesCategory
  })

  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.type]) acc[template.type] = []
    acc[template.type].push(template)
    return acc
  }, {} as Record<string, NodeTemplate[]>)

  const categories = ['trigger', 'action', 'ai', 'condition']

  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-2">Node Library</h3>
          <p className="text-sm text-gray-600 mb-4">
            Drag nodes onto the canvas to build your workflow.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === null 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((category) => {
            const Icon = typeIcons[category as keyof typeof typeIcons]
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                  selectedCategory === category 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-3 w-3" />
                {category}
              </button>
            )
          })}
        </div>

        {/* Node groups */}
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
                  <span className="text-gray-500">({templates.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {templates.map((template, index) => {
                  const TemplateIcon = iconMap[template.icon as keyof typeof iconMap] || typeIcons[template.type]
                  return (
                    <div
                      key={`${template.type}-${index}`}
                      className="flex items-center gap-3 p-3 rounded-md border border-gray-200 cursor-move hover:bg-gray-50 hover:border-gray-300 transition-all group"
                      draggable
                      onDragStart={(event) => onDragStart(event, template)}
                      onClick={() => onAddNode?.(template)}
                    >
                      <div className={`p-2 rounded ${template.color}`}>
                        <TemplateIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-gray-900">
                          {template.label}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {template.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No nodes found</p>
            <p className="text-xs">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
