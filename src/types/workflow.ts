
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
  sourceHandle?: string
  targetHandle?: string
}

export interface WorkflowMeta {
  id?: string
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
  version?: string
  tags?: string[]
}

export interface WorkflowData {
  meta: WorkflowMeta
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export interface NodeTemplate {
  type: 'trigger' | 'action' | 'ai' | 'condition'
  category: string
  label: string
  description: string
  icon: string
  defaultConfig: Record<string, any>
  color: string
  requiredFields?: string[]
}

export interface ExecutionResult {
  nodeId: string
  success: boolean
  output?: any
  error?: string
  duration?: number
  timestamp: string
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'running' | 'success' | 'error' | 'cancelled'
  startTime: string
  endTime?: string
  results: ExecutionResult[]
  totalDuration?: number
}
