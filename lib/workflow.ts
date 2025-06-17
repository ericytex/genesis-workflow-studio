
import { prisma } from './prisma'

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

// Mock execution functions for different node types
const nodeExecutors = {
  trigger: {
    webhook: async (config: any, input: any) => {
      // Mock webhook trigger
      return { triggered: true, data: input }
    },
    schedule: async (config: any) => {
      // Mock scheduled trigger
      return { triggered: true, timestamp: Date.now() }
    },
  },
  action: {
    send_email: async (config: any, input: any) => {
      // Mock email sending
      console.log(`Sending email to ${config.to}: ${config.subject}`)
      return { sent: true, messageId: 'mock-id-' + Date.now() }
    },
    http_request: async (config: any, input: any) => {
      // Mock HTTP request
      console.log(`Making ${config.method} request to ${config.url}`)
      return { status: 200, data: { success: true } }
    },
    slack_message: async (config: any, input: any) => {
      // Mock Slack message
      console.log(`Posting to Slack: ${config.message}`)
      return { posted: true, ts: Date.now() }
    },
  },
  transform: {
    data_mapper: async (config: any, input: any) => {
      // Mock data transformation
      const mapped = { ...input }
      if (config.mappings) {
        Object.entries(config.mappings).forEach(([key, value]: [string, any]) => {
          mapped[key] = input[value] || value
        })
      }
      return mapped
    },
    filter: async (config: any, input: any) => {
      // Mock data filtering
      if (config.condition && input[config.field]) {
        const value = input[config.field]
        switch (config.operator) {
          case 'equals':
            return config.value === value ? input : null
          case 'contains':
            return String(value).includes(config.value) ? input : null
          default:
            return input
        }
      }
      return input
    },
  },
  condition: {
    if_else: async (config: any, input: any) => {
      // Mock conditional logic
      const condition = config.condition || false
      return { branch: condition ? 'true' : 'false', input }
    },
  },
}

export async function executeWorkflow(
  workflowId: string,
  userId: string,
  triggerInput: any = {}
) {
  const startTime = Date.now()
  
  try {
    // Get workflow data
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    })

    if (!workflow) {
      throw new Error('Workflow not found')
    }

    const workflowData = workflow.data as WorkflowData
    const executionResults: Record<string, any> = {}
    
    // Find trigger node
    const triggerNode = workflowData.nodes.find(node => node.type === 'trigger')
    if (!triggerNode) {
      throw new Error('No trigger node found')
    }

    // Execute trigger
    const triggerExecutor = nodeExecutors.trigger[triggerNode.category as keyof typeof nodeExecutors.trigger]
    if (!triggerExecutor) {
      throw new Error(`Unknown trigger type: ${triggerNode.category}`)
    }

    let currentData = await triggerExecutor(triggerNode.config, triggerInput)
    executionResults[triggerNode.id] = currentData

    // Execute connected nodes in sequence (simplified execution)
    const executeNode = async (nodeId: string, input: any): Promise<any> => {
      const node = workflowData.nodes.find(n => n.id === nodeId)
      if (!node || executionResults[nodeId]) return input

      const executor = nodeExecutors[node.type as keyof typeof nodeExecutors]?.[node.category as any]
      if (!executor) {
        console.warn(`No executor for ${node.type}:${node.category}`)
        return input
      }

      const result = await executor(node.config, input)
      executionResults[nodeId] = result
      
      // Execute connected nodes
      const connectedEdges = workflowData.edges.filter(edge => edge.source === nodeId)
      for (const edge of connectedEdges) {
        await executeNode(edge.target, result)
      }
      
      return result
    }

    // Execute nodes connected to trigger
    const triggerEdges = workflowData.edges.filter(edge => edge.source === triggerNode.id)
    for (const edge of triggerEdges) {
      await executeNode(edge.target, currentData)
    }

    const duration = Date.now() - startTime

    // Log execution
    const executionLog = await prisma.executionLog.create({
      data: {
        workflowId,
        userId,
        status: 'success',
        input: triggerInput,
        output: executionResults,
        duration,
      },
    })

    return {
      success: true,
      executionId: executionLog.id,
      results: executionResults,
      duration,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Log failed execution
    await prisma.executionLog.create({
      data: {
        workflowId,
        userId,
        status: 'error',
        input: triggerInput,
        error: errorMessage,
        duration,
      },
    })

    return {
      success: false,
      error: errorMessage,
      duration,
    }
  }
}
