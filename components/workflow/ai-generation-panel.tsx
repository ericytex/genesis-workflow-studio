
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Sparkles, Lightbulb } from 'lucide-react'

interface AIGenerationPanelProps {
  onGenerate: (prompt: string) => void
  onClose: () => void
  isGenerating: boolean
}

const examplePrompts = [
  "Send a welcome email when a new user signs up via webhook",
  "Process payment confirmations and update database records",
  "Monitor RSS feeds and post new articles to Slack",
  "Analyze customer feedback and categorize by sentiment",
  "Backup database daily and send status reports",
  "Sync contacts between CRM and email marketing platform"
]

export function AIGenerationPanel({ onGenerate, onClose, isGenerating }: AIGenerationPanelProps) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      onGenerate(prompt.trim())
    }
  }

  const handleExampleClick = (example: string) => {
    setPrompt(example)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <CardTitle>Generate Workflow with AI</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Describe your automation workflow in plain English. Our AI will generate the complete workflow with all necessary nodes and connections.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your workflow... For example: 'When someone fills out a contact form, send them a welcome email and add them to our CRM'"
                rows={4}
                className="resize-none"
              />
              
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={!prompt.trim() || isGenerating}
                  className="flex-1"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Workflow'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h4 className="font-medium text-sm">Example Ideas</h4>
            </div>
            <div className="grid gap-2">
              {examplePrompts.map((example, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-50 p-2 h-auto text-left justify-start"
                  onClick={() => handleExampleClick(example)}
                >
                  {example}
                </Badge>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-sm text-blue-900 mb-2">Tips for better results:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be specific about triggers (webhook, schedule, email, etc.)</li>
              <li>• Mention the actions you want to perform</li>
              <li>• Include any data transformations needed</li>
              <li>• Specify conditions or branching logic if applicable</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
