
export interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'ai' | 'condition'
  position: { x: number; y: number }
  data: {
    type: 'trigger' | 'action' | 'ai' | 'condition'
    label: string
    config: Record<string, any>
    category?: string
    description?: string
  }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  type?: string
  animated?: boolean
  style?: Record<string, any>
}

export interface WorkflowData {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  name: string
  description?: string
}

export interface NodeTemplate {
  type: 'trigger' | 'action' | 'ai' | 'condition'
  label: string
  description: string
  icon: string
  defaultConfig: Record<string, any>
  color: string
  category: string
}
