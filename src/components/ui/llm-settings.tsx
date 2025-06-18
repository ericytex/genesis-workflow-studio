
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Settings } from 'lucide-react'
import toast from 'react-hot-toast'

interface LLMConfig {
  provider: 'openai' | 'gemini' | 'groq'
  apiKey: string
  model?: string
}

export function LLMSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<LLMConfig>(() => {
    const saved = localStorage.getItem('llm-config')
    return saved ? JSON.parse(saved) : { provider: 'openai', apiKey: '', model: '' }
  })

  const handleSave = () => {
    if (!config.apiKey.trim()) {
      toast.error('API key is required')
      return
    }

    localStorage.setItem('llm-config', JSON.stringify(config))
    toast.success('LLM settings saved')
    setIsOpen(false)
  }

  const modelOptions = {
    openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    gemini: ['gemini-pro', 'gemini-pro-vision'],
    groq: ['mixtral-8x7b-32768', 'llama2-70b-4096']
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
          <Settings className="h-4 w-4" />
          LLM Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>LLM Configuration</DialogTitle>
          <DialogDescription>
            Configure your preferred LLM provider for AI workflow generation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="provider">Provider</Label>
            <Select value={config.provider} onValueChange={(value: any) => setConfig(prev => ({ ...prev, provider: value, model: '' }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="groq">Groq</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="model">Model</Label>
            <Select value={config.model} onValueChange={(value) => setConfig(prev => ({ ...prev, model: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions[config.provider].map(model => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Enter your API key"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
