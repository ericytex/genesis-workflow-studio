
interface LLMConfig {
  provider: 'openai' | 'gemini' | 'groq'
  apiKey: string
  model?: string
}

interface LLMResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class DynamicLLM {
  private config: LLMConfig

  constructor(config: LLMConfig) {
    this.config = config
  }

  async generateWorkflow(prompt: string): Promise<{ success: boolean; workflow?: any; error?: string; tokensUsed?: number }> {
    try {
      const response = await this.makeRequest([
        {
          role: 'system',
          content: `You are an AI workflow builder. Convert user descriptions into structured automation workflows.

Available node types:
- trigger: webhook, schedule, email_received, form_submit
- action: send_email, http_request, database_insert, slack_message  
- transform: data_mapper, filter, aggregate, format
- condition: if_else, switch, loop

Return a JSON object with this structure:
{
  "name": "workflow name",
  "description": "workflow description", 
  "nodes": [
    {
      "id": "unique_id",
      "type": "trigger|action|transform|condition",
      "category": "specific_category",
      "name": "display_name",
      "description": "node_description",
      "config": {},
      "position": { "x": 100, "y": 100 }
    }
  ],
  "edges": [
    {
      "id": "edge_id",
      "source": "source_node_id", 
      "target": "target_node_id"
    }
  ]
}`
        },
        {
          role: 'user',
          content: prompt
        }
      ])

      const workflow = JSON.parse(response.content)
      
      return {
        success: true,
        workflow,
        tokensUsed: response.usage?.total_tokens || 0
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async makeRequest(messages: Array<{ role: string; content: string }>): Promise<LLMResponse> {
    switch (this.config.provider) {
      case 'openai':
        return this.makeOpenAIRequest(messages)
      case 'gemini':
        return this.makeGeminiRequest(messages)
      case 'groq':
        return this.makeGroqRequest(messages)
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`)
    }
  }

  private async makeOpenAIRequest(messages: Array<{ role: string; content: string }>): Promise<LLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0].message.content,
      usage: data.usage
    }
  }

  private async makeGeminiRequest(messages: Array<{ role: string; content: string }>): Promise<LLMResponse> {
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n')
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.config.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.candidates[0].content.parts[0].text,
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: data.usageMetadata?.totalTokenCount || 0
      }
    }
  }

  private async makeGroqRequest(messages: Array<{ role: string; content: string }>): Promise<LLMResponse> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'mixtral-8x7b-32768',
        messages,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0].message.content,
      usage: data.usage
    }
  }
}
