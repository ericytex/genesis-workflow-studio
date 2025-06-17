
import OpenAI from 'openai'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Schema for workflow generation
const WorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['trigger', 'action', 'transform', 'condition']),
  category: z.string(),
  name: z.string(),
  description: z.string(),
  config: z.record(z.any()),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
})

const WorkflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string().optional(),
})

const WorkflowSchema = z.object({
  name: z.string(),
  description: z.string(),
  nodes: z.array(WorkflowNodeSchema),
  edges: z.array(WorkflowEdgeSchema),
})

export async function generateWorkflow(prompt: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI workflow builder assistant. Convert user descriptions into structured automation workflows.

Available node types:
- trigger: webhook, schedule, email_received, form_submit
- action: send_email, http_request, database_insert, slack_message
- transform: data_mapper, filter, aggregate, format
- condition: if_else, switch, loop

Generate workflows with proper node positioning (x: 0-800, y: 0-600, spaced 200px apart).
Always start with a trigger node and connect nodes logically.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      functions: [
        {
          name: 'generate_workflow',
          description: 'Generate a workflow based on user description',
          parameters: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Workflow name',
              },
              description: {
                type: 'string',
                description: 'Workflow description',
              },
              nodes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    type: { type: 'string', enum: ['trigger', 'action', 'transform', 'condition'] },
                    category: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    config: { type: 'object' },
                    position: {
                      type: 'object',
                      properties: {
                        x: { type: 'number' },
                        y: { type: 'number' },
                      },
                    },
                  },
                },
              },
              edges: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    source: { type: 'string' },
                    target: { type: 'string' },
                    type: { type: 'string' },
                  },
                },
              },
            },
            required: ['name', 'description', 'nodes', 'edges'],
          },
        },
      ],
      function_call: { name: 'generate_workflow' },
    })

    const functionCall = completion.choices[0]?.message?.function_call
    if (!functionCall?.arguments) {
      throw new Error('No function call response')
    }

    const workflowData = JSON.parse(functionCall.arguments)
    const validatedWorkflow = WorkflowSchema.parse(workflowData)

    return {
      success: true,
      workflow: validatedWorkflow,
      tokensUsed: completion.usage?.total_tokens || 0,
    }
  } catch (error) {
    console.error('OpenAI workflow generation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tokensUsed: 0,
    }
  }
}

export type WorkflowGeneration = Awaited<ReturnType<typeof generateWorkflow>>
