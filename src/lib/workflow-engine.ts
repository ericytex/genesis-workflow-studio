
export interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'transform' | 'condition'
  category: string
  name: string
  description: string
  config: Record<string, any>
  position: { x: number; y: number }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  type?: string
}

export interface WorkflowData {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export interface ExecutionResult {
  nodeId: string
  status: 'success' | 'error' | 'skipped'
  output?: any
  error?: string
  timestamp: number
  duration: number
}

export interface ExecutionLog {
  id: string
  workflowId: string
  status: 'running' | 'completed' | 'failed'
  startTime: number
  endTime?: number
  results: ExecutionResult[]
  input: any
}

class WorkflowEngine {
  private executionLogs: Map<string, ExecutionLog> = new Map()

  async executeWorkflow(
    workflowId: string,
    workflowData: WorkflowData,
    triggerInput: any = {}
  ): Promise<ExecutionLog> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = Date.now()

    const executionLog: ExecutionLog = {
      id: executionId,
      workflowId,
      status: 'running',
      startTime,
      results: [],
      input: triggerInput
    }

    this.executionLogs.set(executionId, executionLog)

    try {
      // Find trigger node
      const triggerNode = workflowData.nodes.find(node => node.type === 'trigger')
      if (!triggerNode) {
        throw new Error('No trigger node found in workflow')
      }

      // Execute nodes in topological order
      const executionOrder = this.getExecutionOrder(workflowData)
      let currentData = triggerInput

      for (const nodeId of executionOrder) {
        const node = workflowData.nodes.find(n => n.id === nodeId)
        if (!node) continue

        const nodeStartTime = Date.now()
        
        try {
          const result = await this.executeNode(node, currentData)
          const duration = Date.now() - nodeStartTime

          executionLog.results.push({
            nodeId,
            status: 'success',
            output: result,
            timestamp: nodeStartTime,
            duration
          })

          currentData = result
        } catch (error) {
          const duration = Date.now() - nodeStartTime
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'

          executionLog.results.push({
            nodeId,
            status: 'error',
            error: errorMessage,
            timestamp: nodeStartTime,
            duration
          })

          // Stop execution on error
          executionLog.status = 'failed'
          executionLog.endTime = Date.now()
          return executionLog
        }
      }

      executionLog.status = 'completed'
      executionLog.endTime = Date.now()
      return executionLog

    } catch (error) {
      executionLog.status = 'failed'
      executionLog.endTime = Date.now()
      
      executionLog.results.push({
        nodeId: 'workflow',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown workflow error',
        timestamp: Date.now(),
        duration: 0
      })

      return executionLog
    }
  }

  private getExecutionOrder(workflowData: WorkflowData): string[] {
    // Simple topological sort for now
    const { nodes, edges } = workflowData
    const visited = new Set<string>()
    const order: string[] = []

    // Start with trigger nodes
    const triggerNodes = nodes.filter(n => n.type === 'trigger')
    
    for (const trigger of triggerNodes) {
      this.visitNode(trigger.id, edges, visited, order)
    }

    return order
  }

  private visitNode(
    nodeId: string,
    edges: WorkflowEdge[],
    visited: Set<string>,
    order: string[]
  ) {
    if (visited.has(nodeId)) return

    visited.add(nodeId)
    order.push(nodeId)

    // Visit connected nodes
    const connectedEdges = edges.filter(edge => edge.source === nodeId)
    for (const edge of connectedEdges) {
      this.visitNode(edge.target, edges, visited, order)
    }
  }

  private async executeNode(node: WorkflowNode, input: any): Promise<any> {
    // Mock execution functions for different node types
    switch (node.type) {
      case 'trigger':
        return this.executeTrigger(node, input)
      case 'action':
        return this.executeAction(node, input)
      case 'transform':
        return this.executeTransform(node, input)
      case 'condition':
        return this.executeCondition(node, input)
      default:
        throw new Error(`Unknown node type: ${node.type}`)
    }
  }

  private async executeTrigger(node: WorkflowNode, input: any): Promise<any> {
    // Simulate trigger execution
    await this.delay(100)
    
    switch (node.category) {
      case 'webhook':
        return { triggered: true, data: input, timestamp: Date.now() }
      case 'schedule':
        return { triggered: true, scheduledAt: Date.now() }
      case 'email_received':
        return { triggered: true, email: input.email || 'test@example.com' }
      default:
        return { triggered: true, input }
    }
  }

  private async executeAction(node: WorkflowNode, input: any): Promise<any> {
    await this.delay(200)
    
    switch (node.category) {
      case 'send_email':
        return { 
          sent: true, 
          to: node.config.to || 'recipient@example.com',
          subject: node.config.subject || 'Test Email',
          messageId: `msg_${Date.now()}`
        }
      case 'http_request':
        return {
          status: 200,
          data: { success: true, url: node.config.url },
          method: node.config.method || 'GET'
        }
      case 'slack_message':
        return {
          posted: true,
          channel: node.config.channel || '#general',
          message: node.config.message || 'Hello from workflow!',
          ts: Date.now()
        }
      default:
        return { executed: true, input }
    }
  }

  private async executeTransform(node: WorkflowNode, input: any): Promise<any> {
    await this.delay(50)
    
    switch (node.category) {
      case 'data_mapper':
        const mappings = node.config.mappings || {}
        const mapped = { ...input }
        Object.entries(mappings).forEach(([key, value]) => {
          mapped[key] = input[value as string] || value
        })
        return mapped
      case 'filter':
        const field = node.config.field
        const operator = node.config.operator
        const value = node.config.value
        
        if (field && input[field]) {
          switch (operator) {
            case 'equals':
              return input[field] === value ? input : null
            case 'contains':
              return String(input[field]).includes(value) ? input : null
            default:
              return input
          }
        }
        return input
      default:
        return input
    }
  }

  private async executeCondition(node: WorkflowNode, input: any): Promise<any> {
    await this.delay(50)
    
    switch (node.category) {
      case 'if_else':
        const condition = node.config.condition || false
        return { branch: condition ? 'true' : 'false', input }
      default:
        return input
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getExecutionLog(executionId: string): ExecutionLog | undefined {
    return this.executionLogs.get(executionId)
  }

  getAllExecutionLogs(): ExecutionLog[] {
    return Array.from(this.executionLogs.values())
  }
}

export const workflowEngine = new WorkflowEngine()
